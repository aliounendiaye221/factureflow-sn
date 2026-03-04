import { createClient } from '@/lib/supabase/server'

const WAVE_NUMBER = process.env.NEXT_PUBLIC_WAVE_NUMBER ?? ''

export const PaymentService = {
  /**
   * Génère un lien de paiement Mobile Money.
   * Retourne un lien Wave direct (ouvre l'app Wave avec numéro + montant pré-remplis).
   * Pour une intégration checkout complète, brancher l'API Wave Business ici.
   */
  async generatePaymentLink(
    invoiceId: string,
    provider: 'wave' | 'orange_money'
  ): Promise<string> {
    const supabase = createClient()

    const { data: invoice, error } = await supabase
      .from('invoices')
      .select('id, invoice_number, total_amount, status')
      .eq('id', invoiceId)
      .single()

    if (error || !invoice) throw new Error('Facture introuvable ou accès non autorisé')
    if (invoice.status === 'paid') throw new Error('Cette facture est déjà payée')

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.factureflow.sn'
    const printUrl = `${baseUrl}/print/invoice/${invoice.id}`

    if (provider === 'wave' && WAVE_NUMBER) {
      const cleanPhone = WAVE_NUMBER.replace(/\s/g, '')
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

