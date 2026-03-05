import { createClient } from '@/lib/supabase/server'

export const PaymentService = {
  /**
   * Génère un lien de paiement Mobile Money.
   * Utilise le numéro Wave configuré par l'agence (pas de variable d'env globale).
   */
  async generatePaymentLink(
    invoiceId: string,
    provider: 'wave' | 'orange_money'
  ): Promise<string> {
    const supabase = createClient()

    const { data: invoice, error } = await supabase
      .from('invoices')
      .select('id, invoice_number, total_amount, status, agency_id')
      .eq('id', invoiceId)
      .single()

    if (error || !invoice) throw new Error('Facture introuvable ou accès non autorisé')
    if (invoice.status === 'paid') throw new Error('Cette facture est déjà payée')

    // Récupérer les infos de paiement de l'agence
    const { data: agency } = await supabase
      .from('agencies')
      .select('wave_number, payment_link')
      .eq('id', invoice.agency_id)
      .single()

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://factureflow-sn.vercel.app'
    const printUrl = `${baseUrl}/print/invoice/${invoice.id}`

    // Priorité : lien de paiement personnalisé > Wave > fallback page print
    if (agency?.payment_link) {
      return agency.payment_link
    }

    if (provider === 'wave' && agency?.wave_number) {
      const cleanPhone = agency.wave_number.replace(/\s/g, '')
      return (
        `https://wave.com/send?phone=${cleanPhone}` +
        `&amount=${invoice.total_amount}` +
        `&note=${encodeURIComponent((invoice as any).invoice_number ?? invoiceId.slice(0, 8))}` +
        `&reference_url=${encodeURIComponent(printUrl)}`
      )
    }

    // Fallback : page d'impression de la facture
    return printUrl
  },
}

