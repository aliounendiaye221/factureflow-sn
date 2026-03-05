import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { unstable_noStore as noStore } from 'next/cache'
import type { Database } from '@/types/database.types'

type AgencyRow = Database['public']['Tables']['agencies']['Row']
type AgencyUpdate = Database['public']['Tables']['agencies']['Update']

export const AgencyService = {

  // ─── Lecture ────────────────────────────────────────────────────────────────
  // Utilise le client standard (RLS filtre par auth.uid() = id)
  async getAgency(): Promise<AgencyRow | null> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    // get_user_agency_id() (SECURITY DEFINER) renvoie le bon agency_id
    // même pour les membres invités (user.id ≠ agency.id)
    const { data: agencyId } = await supabase.rpc('get_user_agency_id')
    const id = agencyId ?? user.id

    const { data } = await supabase
      .from('agencies')
      .select('*')
      .eq('id', id)
      .single()

    return data
  },

  /**
   * Lecture publique d'une agence par son ID (sans authentification).
   * Utilisée sur les pages d'impression partagées avec les clients.
   */
  async getPublicAgency(agencyId: string): Promise<AgencyRow | null> {
    const admin = createAdminClient()
    const { data } = await admin
      .from('agencies')
      .select('*')
      .eq('id', agencyId)
      .single()
    return data
  },

  // ─── Mise à jour (profil complet de l'agence) ────────────────────────────
  async updateAgency(
    payload: Pick<AgencyUpdate, 'name' | 'ninea' | 'rccm' | 'email' | 'phone' | 'address' | 'invoice_template' | 'is_vat_enabled' | 'wave_number' | 'om_number' | 'whatsapp_number' | 'bank_name' | 'bank_iban' | 'payment_link'>
  ): Promise<void> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Non authentifié')

    const { data: agencyId } = await supabase.rpc('get_user_agency_id')
    const id = agencyId ?? user.id

    const { error } = await supabase
      .from('agencies')
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) throw new Error(error.message)
  },

  // ─── Statistiques tableau de bord ─────────────────────────────────────────
  async getDashboardStats(userId: string): Promise<{
    pendingQuotes: number
    unpaidTotal: number
    paidThisMonth: number
    overdueTotal: number
    overdueCount: number
  }> {
    noStore()
    const supabase = createClient()

    // Récupérer le vrai agency_id (différent de userId pour les membres invités)
    const { data: agencyId } = await supabase.rpc('get_user_agency_id')
    const id = agencyId ?? userId

    const firstOfMonth = new Date()
    firstOfMonth.setDate(1)
    firstOfMonth.setHours(0, 0, 0, 0)
    const now = new Date()

    const [sentQuotesRes, unpaidRes, paidRes, overdueRes] = await Promise.all([
      supabase
        .from('quotes')
        .select('*', { count: 'exact', head: true })
        .eq('agency_id', id)
        .eq('status', 'sent'),

      // On compte 'unpaid' ET 'overdue' (si le statut existe en DB)
      supabase
        .from('invoices')
        .select('total_amount')
        .eq('agency_id', id)
        .in('status', ['unpaid', 'overdue']),

      supabase
        .from('invoices')
        .select('total_amount')
        .eq('agency_id', id)
        .eq('status', 'paid')
        .gte('paid_at', firstOfMonth.toISOString()),

      // overdue = factures non payées avec due_date dépassée
      supabase
        .from('invoices')
        .select('total_amount, id')
        .eq('agency_id', id)
        .in('status', ['unpaid', 'overdue'])
        .lt('due_date', now.toISOString())
        .not('due_date', 'is', null),
    ])

    const unpaidTotal = (unpaidRes.data ?? []).reduce(
      (sum, inv) => sum + (inv.total_amount ?? 0), 0
    )
    const paidThisMonth = (paidRes.data ?? []).reduce(
      (sum, inv) => sum + (inv.total_amount ?? 0), 0
    )
    const overdueTotal = (overdueRes.data ?? []).reduce(
      (sum, inv) => sum + (inv.total_amount ?? 0), 0
    )
    const overdueCount = overdueRes.data?.length ?? 0

    return {
      pendingQuotes: sentQuotesRes.count ?? 0,
      unpaidTotal,
      paidThisMonth,
      overdueTotal,
      overdueCount,
    }
  },

  // ─── CA mensuel (6 derniers mois) ─────────────────────────────────────────
  async getMonthlyRevenue(): Promise<Array<{ month: string; revenue: number }>> {
    const supabase = createClient()
    const { data: agencyId } = await supabase.rpc('get_user_agency_id')
    if (!agencyId) return []

    const { data, error } = await supabase.rpc('get_monthly_revenue', {
      p_agency_id: agencyId,
    })
    if (error || !data) return []

    return (data as Array<{ month: string; revenue: number }>).map(row => ({
      month: row.month,
      revenue: Number(row.revenue),
    }))
  },

  // ─── Top clients ──────────────────────────────────────────────────────────
  async getTopClients(limit = 5): Promise<Array<{
    client_id: string
    client_name: string
    total_billed: number
    invoice_count: number
  }>> {
    const supabase = createClient()
    const { data: agencyId } = await supabase.rpc('get_user_agency_id')
    if (!agencyId) return []

    const { data, error } = await supabase.rpc('get_top_clients', {
      p_agency_id: agencyId,
      p_limit: limit,
    })
    if (error || !data) return []

    return (data as Array<{ client_id: string; client_name: string; total_billed: number; invoice_count: number }>).map(row => ({
      client_id: row.client_id,
      client_name: row.client_name,
      total_billed: Number(row.total_billed),
      invoice_count: Number(row.invoice_count),
    }))
  },
}
