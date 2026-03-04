import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * POST /api/quotes/:id/accept
 *
 * Route publique (sans authentification) permettant à un client d'accepter un devis
 * via sa page d'impression. Utilise la clé service_role pour contourner la RLS.
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id
  if (!id) {
    return NextResponse.json({ error: 'ID de devis manquant.' }, { status: 400 })
  }

  const admin = createAdminClient()

  // Vérifier que le devis existe et qu'il n'est pas déjà résolu
  const { data: quote, error: fetchError } = await admin
    .from('quotes')
    .select('id, status')
    .eq('id', id)
    .single()

  if (fetchError || !quote) {
    return NextResponse.json({ error: 'Devis introuvable.' }, { status: 404 })
  }

  if (quote.status === 'accepted') {
    return NextResponse.json({ message: 'Ce devis est déjà accepté.' }, { status: 200 })
  }

  if (quote.status === 'rejected') {
    return NextResponse.json({ error: 'Ce devis a été refusé et ne peut plus être accepté.' }, { status: 409 })
  }

  // Accepter le devis
  const { error: updateError } = await admin
    .from('quotes')
    .update({ status: 'accepted' })
    .eq('id', id)
    .in('status', ['draft', 'sent'])

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, message: 'Devis accepté avec succès.' })
}
