import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '../types/database.types'
import { createAdminClient } from '@/lib/supabase/admin'

type QuoteRow = Database['public']['Tables']['quotes']['Row']
type ClientRow = Database['public']['Tables']['clients']['Row']

export type QuoteItem = {
  description: string
  quantity: number
  unit_price: number
  tax_rate: number
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function calcTotals(items: QuoteItem[]) {
  const subtotal = items.reduce((sum, i) => sum + i.quantity * i.unit_price, 0)
  const tax_amount = items.reduce((sum, i) => sum + (i.quantity * i.unit_price * (i.tax_rate / 100)), 0)
  const total_amount = Math.round((subtotal + tax_amount) * 100) / 100
  return { subtotal: Math.round(subtotal * 100) / 100, tax_amount: Math.round(tax_amount * 100) / 100, total_amount }
}

async function generateQuoteNumber(agencyId: string): Promise<string> {
  const supabase = getSupabase()
  const { data, error } = await supabase.rpc('next_quote_number', { p_agency_id: agencyId })
  if (error || !data) throw new Error(`Impossible de générer le numéro de devis : ${error?.message}`)
  return data as string
}

function getSupabase() {
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
 * Pour les membres invités, agencyId ≠ userId.
 */
async function getAuthContext(): Promise<{ userId: string; agencyId: string }> {
  const supabase = getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Non authentifié')
  const { data: agencyId } = await supabase.rpc('get_user_agency_id')
  return { userId: user.id, agencyId: agencyId ?? user.id }
}

// ─── Service ──────────────────────────────────────────────────────────────────

export type QuoteWithRelations = QuoteRow & {
  client: Pick<ClientRow, 'name' | 'phone' | 'email'> | null
  invoices: { id: string }[] | null
}

export class QuoteService {
  static async getQuotes(): Promise<QuoteWithRelations[]> {
    const supabase = getSupabase()
    const { agencyId } = await getAuthContext()

    const { data, error } = await supabase
      .from('quotes')
      .select('*, client:clients(name, phone, email), invoices!invoices_quote_id_fkey(id)')
      .eq('agency_id', agencyId)
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return (data ?? []) as unknown as QuoteWithRelations[]
  }

  static async getClients(): Promise<Pick<ClientRow, 'id' | 'name'>[]> {
    const supabase = getSupabase()
    const { agencyId } = await getAuthContext()

    const { data, error } = await supabase
      .from('clients')
      .select('id, name')
      .eq('agency_id', agencyId)
      .order('name')

    if (error) throw new Error(error.message)
    return data ?? []
  }

  static async createQuote(input: {
    client_id: string
    items: QuoteItem[]
    notes?: string | null
  }): Promise<QuoteRow> {
    const supabase = getSupabase()
    const { agencyId } = await getAuthContext()

    const { subtotal, tax_amount, total_amount } = calcTotals(input.items)
    const quote_number = await generateQuoteNumber(agencyId)

    const payload: Database['public']['Tables']['quotes']['Insert'] = {
      agency_id: agencyId,
      client_id: input.client_id,
      quote_number,
      items: input.items as unknown as Database['public']['Tables']['quotes']['Insert']['items'],
      subtotal,
      tax_amount,
      total_amount,
      status: 'draft',
      notes: input.notes ?? null,
    }

    const { data, error } = await supabase
      .from('quotes')
      .insert(payload)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data as QuoteRow
  }

  static async getQuoteById(id: string): Promise<(QuoteRow & {
    client: Pick<ClientRow, 'id' | 'name' | 'email' | 'phone' | 'address' | 'tax_id'> | null
  }) | null> {
    const supabase = getSupabase()
    try {
      const { agencyId } = await getAuthContext()
      const { data, error } = await supabase
        .from('quotes')
        .select('*, client:clients(id, name, email, phone, address, tax_id)')
        .eq('id', id)
        .eq('agency_id', agencyId)
        .single()

      if (error) return null
      return data as unknown as (QuoteRow & {
        client: Pick<ClientRow, 'id' | 'name' | 'email' | 'phone' | 'address' | 'tax_id'> | null
      })
    } catch {
      return null
    }
  }

  static async updateStatus(
    id: string,
    status: 'sent' | 'accepted' | 'rejected'
  ): Promise<void> {
    const supabase = getSupabase()
    const { agencyId } = await getAuthContext()

    const { error } = await supabase
      .from('quotes')
      .update({ status })
      .eq('id', id)
      .eq('agency_id', agencyId)

    if (error) throw new Error(error.message)
  }

  static async updateQuote(id: string, input: {
    client_id: string
    items: QuoteItem[]
  }): Promise<QuoteRow> {
    const supabase = getSupabase()
    const { agencyId } = await getAuthContext()

    const { subtotal, tax_amount, total_amount } = calcTotals(input.items)

    const { data, error } = await supabase
      .from('quotes')
      .update({
        client_id: input.client_id,
        items: input.items as unknown as Database['public']['Tables']['quotes']['Update']['items'],
        subtotal,
        tax_amount,
        total_amount,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('agency_id', agencyId)
      .in('status', ['draft', 'sent'])
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data as QuoteRow
  }

  static async deleteQuote(id: string): Promise<void> {
    const supabase = getSupabase()
    const { agencyId } = await getAuthContext()

    // Vérifier que le devis n'est pas déjà facturé
    const { data: invoice } = await supabase
      .from('invoices')
      .select('id')
      .eq('quote_id', id)
      .eq('agency_id', agencyId)
      .maybeSingle()

    if (invoice) {
      throw new Error('Impossible de supprimer ce devis : une facture lui est associée.')
    }

    const { error } = await supabase
      .from('quotes')
      .delete()
      .eq('id', id)
      .eq('agency_id', agencyId)

    if (error) throw new Error(error.message)
  }

  /**
   * Lecture publique d'un devis (sans authentification) — utilisée sur les pages
   * d'impression partagées avec les clients. Utilise la clé service_role.
   */
  static async getPublicQuoteById(id: string): Promise<(QuoteRow & {
    client: Pick<ClientRow, 'id' | 'name' | 'email' | 'phone' | 'address' | 'tax_id'> | null
  }) | null> {
    const admin = createAdminClient()
    const { data, error } = await admin
      .from('quotes')
      .select('*, client:clients(id, name, email, phone, address, tax_id)')
      .eq('id', id)
      .single()

    if (error) return null
    return data as unknown as (QuoteRow & {
      client: Pick<ClientRow, 'id' | 'name' | 'email' | 'phone' | 'address' | 'tax_id'> | null
    })
  }
}
