'use server'

import { Resend } from 'resend'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? 'noreply@factureflow.sn'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://www.factureflow.sn'

function fmt(n: number) {
  return new Intl.NumberFormat('fr-SN', {
    style: 'currency',
    currency: 'XOF',
    maximumFractionDigits: 0,
  }).format(n)
}

// ─── Facture ──────────────────────────────────────────────────────────────────

export async function sendInvoiceEmailAction(invoiceId: string): Promise<{
  success: boolean
  message: string
}> {
  try {
    const admin = createAdminClient()

    // Récupérer la facture avec client + agence
    const { data: invoice, error } = await admin
      .from('invoices')
      .select('*, client:clients(name, email), agency:agencies(name, email)')
      .eq('id', invoiceId)
      .single()

    if (error || !invoice) {
      return { success: false, message: 'Facture introuvable.' }
    }

    const clientEmail = (invoice.client as { name: string; email: string | null } | null)?.email
    if (!clientEmail) {
      return { success: false, message: 'Ce client n\'a pas d\'adresse email enregistrée.' }
    }

    const clientName = (invoice.client as { name: string } | null)?.name ?? 'Client'
    const agencyName = (invoice.agency as { name: string } | null)?.name ?? 'Votre prestataire'
    const printUrl = `${SITE_URL}/print/invoice/${invoiceId}`

    const { error: sendError } = await resend.emails.send({
      from: `${agencyName} <${FROM_EMAIL}>`,
      to: [clientEmail],
      subject: `Facture ${invoice.invoice_number} — ${fmt(invoice.total_amount)} à régler`,
      html: `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f9fafb; margin: 0; padding: 0;">
  <div style="max-width: 560px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <div style="height: 6px; background: #4F46E5;"></div>
    <div style="padding: 40px 40px 32px;">
      <h1 style="font-size: 22px; font-weight: 800; color: #111827; margin: 0 0 8px;">Facture ${invoice.invoice_number}</h1>
      <p style="color: #6b7280; font-size: 15px; margin: 0 0 32px;">Bonjour ${clientName},</p>
      <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
        Veuillez trouver ci-dessous votre facture <strong>${invoice.invoice_number}</strong> d'un montant de
        <strong style="color: #4F46E5;">${fmt(invoice.total_amount)}</strong>.
      </p>
      <div style="background: #f3f4f6; border-radius: 12px; padding: 20px; margin-bottom: 32px;">
        <p style="margin: 0 0 8px; font-size: 13px; color: #9ca3af; text-transform: uppercase; font-weight: 600; letter-spacing: 0.05em;">Détails</p>
        <p style="margin: 0; font-size: 24px; font-weight: 900; color: #111827;">${fmt(invoice.total_amount)}</p>
        ${invoice.due_date ? `<p style="margin: 8px 0 0; font-size: 13px; color: #ef4444;">À régler avant le ${new Date(invoice.due_date).toLocaleDateString('fr-SN', { day: '2-digit', month: 'long', year: 'numeric' })}</p>` : ''}
      </div>
      <a href="${printUrl}" style="display: inline-block; background: #4F46E5; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 600; padding: 14px 28px; border-radius: 10px; margin-bottom: 32px;">
        Voir et payer la facture →
      </a>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 0 0 24px;" />
      <p style="color: #9ca3af; font-size: 13px; margin: 0;">
        Envoyé par <strong style="color: #374151;">${agencyName}</strong> via FactureFlow SN.
        Si vous avez des questions, répondez à cet email.
      </p>
    </div>
  </div>
</body>
</html>`,
    })

    if (sendError) {
      console.error('[sendInvoiceEmailAction] Resend error:', sendError)
      return { success: false, message: `Erreur d'envoi : ${sendError.message}` }
    }

    revalidatePath('/dashboard/invoices')
    return { success: true, message: `Email envoyé à ${clientEmail}` }
  } catch (err) {
    console.error('[sendInvoiceEmailAction]', err)
    return { success: false, message: 'Une erreur inattendue est survenue.' }
  }
}

// ─── Devis ────────────────────────────────────────────────────────────────────

export async function sendQuoteEmailAction(quoteId: string): Promise<{
  success: boolean
  message: string
}> {
  try {
    const admin = createAdminClient()

    const { data: quote, error } = await admin
      .from('quotes')
      .select('*, client:clients(name, email), agency:agencies(name, email)')
      .eq('id', quoteId)
      .single()

    if (error || !quote) {
      return { success: false, message: 'Devis introuvable.' }
    }

    const clientEmail = (quote.client as { name: string; email: string | null } | null)?.email
    if (!clientEmail) {
      return { success: false, message: 'Ce client n\'a pas d\'adresse email enregistrée.' }
    }

    const clientName = (quote.client as { name: string } | null)?.name ?? 'Client'
    const agencyName = (quote.agency as { name: string } | null)?.name ?? 'Votre prestataire'
    const printUrl = `${SITE_URL}/print/quote/${quoteId}`

    const { error: sendError } = await resend.emails.send({
      from: `${agencyName} <${FROM_EMAIL}>`,
      to: [clientEmail],
      subject: `Devis ${quote.quote_number} — ${fmt(quote.total_amount)} (en attente de validation)`,
      html: `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f9fafb; margin: 0; padding: 0;">
  <div style="max-width: 560px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <div style="height: 6px; background: #4F46E5;"></div>
    <div style="padding: 40px 40px 32px;">
      <h1 style="font-size: 22px; font-weight: 800; color: #111827; margin: 0 0 8px;">Devis ${quote.quote_number}</h1>
      <p style="color: #6b7280; font-size: 15px; margin: 0 0 32px;">Bonjour ${clientName},</p>
      <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
        Nous vous adressons le devis <strong>${quote.quote_number}</strong> d'un montant de
        <strong style="color: #4F46E5;">${fmt(quote.total_amount)}</strong>.
        Vous pouvez le consulter et l'accepter directement en ligne.
      </p>
      <div style="background: #f3f4f6; border-radius: 12px; padding: 20px; margin-bottom: 32px;">
        <p style="margin: 0 0 8px; font-size: 13px; color: #9ca3af; text-transform: uppercase; font-weight: 600; letter-spacing: 0.05em;">Montant total TTC</p>
        <p style="margin: 0; font-size: 24px; font-weight: 900; color: #111827;">${fmt(quote.total_amount)}</p>
        <p style="margin: 8px 0 0; font-size: 13px; color: #6b7280;">Ce devis est valable 30 jours à compter de sa date d'émission.</p>
      </div>
      <a href="${printUrl}" style="display: inline-block; background: #4F46E5; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 600; padding: 14px 28px; border-radius: 10px; margin-bottom: 32px;">
        Consulter et accepter le devis →
      </a>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 0 0 24px;" />
      <p style="color: #9ca3af; font-size: 13px; margin: 0;">
        Envoyé par <strong style="color: #374151;">${agencyName}</strong> via FactureFlow SN.
        Si vous avez des questions, répondez à cet email.
      </p>
    </div>
  </div>
</body>
</html>`,
    })

    if (sendError) {
      console.error('[sendQuoteEmailAction] Resend error:', sendError)
      return { success: false, message: `Erreur d'envoi : ${sendError.message}` }
    }

    revalidatePath('/dashboard/quotes')
    return { success: true, message: `Email envoyé à ${clientEmail}` }
  } catch (err) {
    console.error('[sendQuoteEmailAction]', err)
    return { success: false, message: 'Une erreur inattendue est survenue.' }
  }
}
