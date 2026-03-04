import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '../types/database.types'

type ClientRow = Database['public']['Tables']['clients']['Row']

// Ce service s'occupe à 100% de la gestion de base de données pour les clients B2B

export class ClientService {
  private static getSupabase() {
    const cookieStore = cookies()
    return createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll() { /* Server Component – lecture seule */ },
        },
      }
    )
  }

  /**
   * Retourne { userId, agencyId } pour l'utilisateur courant.
   * Pour les membres invités, agencyId ≠ userId : on utilise
   * get_user_agency_id() (SECURITY DEFINER) pour obtenir la bonne valeur.
   */
  private static async getAuthContext(): Promise<{ userId: string; agencyId: string }> {
    const supabase = this.getSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Non authentifié')
    const { data: agencyId } = await supabase.rpc('get_user_agency_id')
    return { userId: user.id, agencyId: agencyId ?? user.id }
  }

  /**
   * Ping léger pour maintenir la connexion active (plans Pro, pas de mise en pause).
   * Silencieux en production — ne loggue rien.
   */
  static async keepSupabaseAwake() {
    const supabase = this.getSupabase()
    await supabase.from('agencies').select('id').limit(1)
  }

  static async getClients(): Promise<ClientRow[]> {
    const supabase = this.getSupabase()
    const { agencyId } = await this.getAuthContext()

    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('agency_id', agencyId)
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return data || []
  }

  /** Statistiques de facturation par client */
  static async getClientStats(): Promise<Map<string, { total_billed: number; invoice_count: number; unpaid_total: number }>> {
    const supabase = this.getSupabase()
    const { agencyId } = await this.getAuthContext()

    const { data } = await supabase
      .from('invoices')
      .select('client_id, total_amount, status')
      .eq('agency_id', agencyId)
      .neq('status', 'cancelled')

    const stats = new Map<string, { total_billed: number; invoice_count: number; unpaid_total: number }>()
    for (const inv of data ?? []) {
      if (!inv.client_id) continue
      const s = stats.get(inv.client_id) ?? { total_billed: 0, invoice_count: 0, unpaid_total: 0 }
      s.total_billed += inv.total_amount ?? 0
      s.invoice_count += 1
      if (inv.status === 'unpaid' || inv.status === 'overdue') {
        s.unpaid_total += inv.total_amount ?? 0
      }
      stats.set(inv.client_id, s)
    }
    return stats
  }

  static async createClient(clientData: {
    name: string
    email?: string | null
    phone?: string | null
    address?: string | null
    tax_id?: string | null
  }): Promise<ClientRow> {
    const supabase = this.getSupabase()
    const { agencyId } = await this.getAuthContext()

    const payload: Database['public']['Tables']['clients']['Insert'] = {
      agency_id: agencyId,
      name: clientData.name,
      email: clientData.email ?? null,
      phone: clientData.phone ?? null,
      address: clientData.address ?? null,
      tax_id: clientData.tax_id ?? null,
    }

    const { data, error } = await supabase
      .from('clients')
      .insert(payload)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data as ClientRow
  }

  static async updateClient(
    clientId: string,
    clientData: {
      name: string
      email?: string | null
      phone?: string | null
      address?: string | null
      tax_id?: string | null
    }
  ): Promise<ClientRow> {
    const supabase = this.getSupabase()
    const { agencyId } = await this.getAuthContext()

    const payload: Database['public']['Tables']['clients']['Update'] = {
      name: clientData.name,
      email: clientData.email ?? null,
      phone: clientData.phone ?? null,
      address: clientData.address ?? null,
      tax_id: clientData.tax_id ?? null,
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('clients')
      .update(payload)
      .eq('id', clientId)
      .eq('agency_id', agencyId)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data as ClientRow
  }

  static async deleteClient(clientId: string): Promise<void> {
    const supabase = this.getSupabase()
    const { agencyId } = await this.getAuthContext()

    // Vérifier qu'il n'y a pas de factures/devis liés (intégrité référentielle)
    const [{ count: invoiceCount }, { count: quoteCount }] = await Promise.all([
      supabase
        .from('invoices')
        .select('id', { count: 'exact', head: true })
        .eq('client_id', clientId)
        .eq('agency_id', agencyId),
      supabase
        .from('quotes')
        .select('id', { count: 'exact', head: true })
        .eq('client_id', clientId)
        .eq('agency_id', agencyId),
    ])

    if ((invoiceCount ?? 0) > 0) {
      throw new Error('Impossible de supprimer ce client : il possède des factures liées.')
    }
    if ((quoteCount ?? 0) > 0) {
      throw new Error('Impossible de supprimer ce client : il possède des devis liés.')
    }

    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', clientId)
      .eq('agency_id', agencyId)

    if (error) throw new Error(error.message)
  }
}
