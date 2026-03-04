import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createHmac, timingSafeEqual } from 'crypto'

// ── Types de payload attendus ─────────────────────────────────────────────────

type WavePayload = {
  id: string
  type: string
  data: {
    id: string
    amount: string | number
    status: string
    client_reference?: string
    checkout_status?: string
  }
}

type OrangeMoneyPayload = {
  txnid: string
  status: string
  amount: string | number
  notifCode: string
  reference?: string
}

type GenericPayload = Record<string, unknown>

// ── Vérification de signature HMAC ───────────────────────────────────────────

function verifyHmac(
  secret: string | undefined,
  signature: string | null,
  rawBody: string
): boolean {
  // En production, le secret est obligatoire — rejeter si absent
  if (!secret) {
    if (process.env.NODE_ENV === 'production') return false
    return true  // dev uniquement : skip si non configuré
  }
  if (!signature) return false

  const hash = signature.startsWith('sha256=') ? signature.slice(7) : signature
  const expected = createHmac('sha256', secret).update(rawBody, 'utf8').digest('hex')

  try {
    return timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(expected, 'hex'))
  } catch {
    return false
  }
}

// ── Normalisation du payload ──────────────────────────────────────────────────

function normalise(
  body: WavePayload | OrangeMoneyPayload | GenericPayload,
  headers: Headers
): {
  provider: string
  externalRef: string
  invoiceId: string | null
  amount: number
  isSuccess: boolean
} {
  if ('data' in body && 'type' in body) {
    const w = body as WavePayload
    return {
      provider: 'wave',
      externalRef: w.data.id,
      invoiceId: w.data.client_reference ?? null,
      amount: Number(w.data.amount),
      isSuccess: w.data.status === 'succeeded' || w.data.checkout_status === 'complete',
    }
  }

  if ('txnid' in body) {
    const o = body as OrangeMoneyPayload
    return {
      provider: 'orange_money',
      externalRef: o.txnid,
      invoiceId: o.reference ?? null,
      amount: Number(o.amount),
      isSuccess: o.status === '200' || o.notifCode === '200',
    }
  }

  const g = body as GenericPayload
  return {
    provider: headers.get('x-provider') ?? 'unknown',
    externalRef: String(g.id ?? g.transaction_id ?? g.reference ?? Date.now()),
    invoiceId: (g.invoice_id as string) ?? null,
    amount: Number(g.amount ?? 0),
    isSuccess: String(g.status) === 'success' || String(g.status) === 'completed',
  }
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // 1. Lire le corps brut pour la vérification HMAC ──────────────────────────
  let rawBody: string
  try {
    rawBody = await req.text()
  } catch {
    return NextResponse.json({ error: 'Corps de la requête illisible' }, { status: 400 })
  }

  let body: GenericPayload
  try {
    body = JSON.parse(rawBody) as GenericPayload
  } catch {
    return NextResponse.json({ error: 'Corps JSON invalide' }, { status: 400 })
  }

  // 2. Vérification des signatures HMAC ──────────────────────────────────────
  const waveSignature = req.headers.get('x-wave-signature')
  if (waveSignature !== null) {
    if (!verifyHmac(process.env.WAVE_WEBHOOK_SECRET, waveSignature, rawBody)) {
      return NextResponse.json({ error: 'Signature Wave invalide' }, { status: 401 })
    }
  }

  const omSignature = req.headers.get('x-orangemoney-signature')
  if (omSignature !== null) {
    if (!verifyHmac(process.env.ORANGE_MONEY_WEBHOOK_SECRET, omSignature, rawBody)) {
      return NextResponse.json({ error: 'Signature Orange Money invalide' }, { status: 401 })
    }
  }

  // 3. Normalisation ─────────────────────────────────────────────────────────
  const { provider, externalRef, invoiceId, amount, isSuccess } =
    normalise(body as WavePayload | OrangeMoneyPayload | GenericPayload, req.headers)

  if (!externalRef) {
    return NextResponse.json({ error: 'Référence externe manquante' }, { status: 400 })
  }

  const idempotencyKey = `${provider}-${externalRef}`
  const supabase = createAdminClient()

  // 4. Vérification idempotence ───────────────────────────────────────────────
  const { data: existing } = await supabase
    .from('payments')
    .select('id')
    .eq('idempotency_key', idempotencyKey)
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ status: 'already_processed' }, { status: 200 })
  }

  // 5. Récupérer agency_id depuis la facture ─────────────────────────────────
  let agencyId: string | null = null
  if (invoiceId) {
    const { data: invoice } = await supabase
      .from('invoices')
      .select('agency_id')
      .eq('id', invoiceId)
      .single()
    agencyId = invoice?.agency_id ?? null
  }

  // Si la référence de facture est introuvable → log sans bloquer les retries
  if (!invoiceId || !agencyId) {
    await supabase.from('event_logs').insert({
      entity_type: 'payment',
      action: 'webhook_missing_reference',
      status: 'warning',
      payload: { provider, externalRef, amount, isSuccess },
    })
    return NextResponse.json({ status: 'ignored', reason: 'invoice_id_missing' }, { status: 200 })
  }

  // 6. Enregistrer le paiement ────────────────────────────────────────────────
  const { error: paymentError } = await supabase.from('payments').insert({
    agency_id: agencyId,
    invoice_id: invoiceId,
    amount,
    provider,
    status: isSuccess ? 'success' : 'failed',
    external_reference: externalRef,
    idempotency_key: idempotencyKey,
    webhook_payload: body as unknown as any,
  })

  if (paymentError) {
    await supabase.from('event_logs').insert({
      agency_id: agencyId,
      entity_type: 'payment',
      action: 'webhook_insert_error',
      status: 'error',
      payload: { error: paymentError.message, idempotency_key: idempotencyKey },
    })
    return NextResponse.json({ error: paymentError.message }, { status: 500 })
  }

  // 7. Marquer la facture comme payée si succès ──────────────────────────────
  if (isSuccess) {
    const { error: updateError } = await supabase
      .from('invoices')
      .update({ status: 'paid', paid_at: new Date().toISOString() })
      .eq('id', invoiceId)
      .in('status', ['unpaid', 'overdue'])

    if (updateError) {
      console.error('[Webhook] Erreur mise à jour statut facture:', updateError.message)
    }
  }

  // 8. Log événement ──────────────────────────────────────────────────────────
  await supabase.from('event_logs').insert({
    agency_id: agencyId,
    entity_type: 'payment',
    entity_id: invoiceId,
    action: 'webhook_received',
    status: isSuccess ? 'success' : 'failed',
    payload: { provider, externalRef, amount, isSuccess },
  })

  return NextResponse.json({ status: 'ok' })
}
