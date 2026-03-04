import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { unstable_noStore as noStore } from 'next/cache'
import { Database } from '../types/database.types'
import { createAdminClient } from '@/lib/supabase/admin'

type InvoiceRow = Database['public']['Tables']['invoices']['Row']
type ClientRow = Database['public']['Tables']['clients']['Row']
type QuoteRow = Database['public']['Tables']['quotes']['Row']

export type InvoiceItem = {
  description: string
  quantity: number
  unit_price: number
  tax_rate: number
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function calcTotals(items: InvoiceItem[]) {
  const subtotal = items.reduce((s, i) => s + i.quantity * i.unit_price, 0)
  const tax_amount = items.reduce((s, i) => s + (i.quantity * i.unit_price * (i.tax_rate / 100)), 0)
  const total_amount = Math.round((subtotal + tax_amount) * 100) / 100
  return { subtotal: Math.round(subtotal * 100) / 100, tax_amount: Math.round(tax_amount * 100) / 100, total_amount }
}

function getSupabase() {
  const cookieStore = cookies()
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll() { },
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

async function generateInvoiceNumber(agencyId: string): Promise<string> {
  const supabase = getSupabase()
  const { data, error } = await supabase.rpc('next_invoice_number', { p_agency_id: agencyId })
  if (error || !data) throw new Error(`Impossible de générer le numéro de facture : ${error?.message}`)
  return data as string
}

// ─── Types enrichis ─────────────────────────────────────────────────────────

export type InvoiceWithRelations = InvoiceRow & {
  client: Pick<ClientRow, 'name' | 'phone' | 'email'> | null
  quote: Pick<QuoteRow, 'quote_number'> | null
}

export type QuoteForConversion = Pick<
  QuoteRow,
  'id' | 'quote_number' | 'client_id' | 'items' | 'subtotal' | 'tax_amount' | 'total_amount'
> & { client: Pick<ClientRow, 'name'> | null }

// ─── Service ──────────────────────────────────────────────────────────────────

export class InvoiceService {

  static async getInvoices(): Promise<InvoiceWithRelations[]> {
    noStore()
    const supabase = getSupabase()
    const { agencyId } = await getAuthContext()

    const { data, error } = await supabase
      .from('invoices')
      .select('*, client:clients(name, phone, email), quote:quotes(quote_number)')
      .eq('agency_id', agencyId)
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)

    // Auto-détecter les factures en retard (due_date dépassée et statut 'unpaid')
    const now = new Date()
    const rows = (data ?? []) as unknown as InvoiceWithRelations[]
    return rows.map((inv) => {
      if (inv.status === 'unpaid' && inv.due_date && new Date(inv.due_date) < now) {
        return { ...inv, status: 'overdue' as const }
      }
      return inv
    })
  }

  /** Devis acceptés pas encore facturés */
  static async getAcceptedQuotes(): Promise<QuoteForConversion[]> {
    const supabase = getSupabase()
    const { agencyId } = await getAuthContext()

    // Récupérer les IDs de devis déjà facturés
    const { data: billed } = await supabase
      .from('invoices')
      .select('quote_id')
      .eq('agency_id', agencyId)
      .not('quote_id', 'is', null)

    const billedIds = (billed ?? []).map(r => r.quote_id).filter(Boolean) as string[]

    let query = supabase
      .from('quotes')
      .select('id, quote_number, client_id, items, subtotal, tax_amount, total_amount, client:clients(name)')
      .eq('agency_id', agencyId)
      .in('status', ['accepted', 'sent', 'draft'])

    if (billedIds.length > 0) {
      query = query.not('id', 'in', `(${billedIds.join(',')})`)
    }

    const { data, error } = await query.order('created_at', { ascending: false })
    if (error) throw new Error(error.message)
    return (data ?? []) as unknown as QuoteForConversion[]
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

  /** Créer une facture libre (sans devis) */
  static async createInvoice(input: {
    client_id: string
    items: InvoiceItem[]
    due_date?: string | null
    notes?: string | null
  }): Promise<InvoiceRow> {
    const supabase = getSupabase()
    const { agencyId } = await getAuthContext()

    const { subtotal, tax_amount, total_amount } = calcTotals(input.items)
    const invoice_number = await generateInvoiceNumber(agencyId)

    const payload: Database['public']['Tables']['invoices']['Insert'] = {
      agency_id: agencyId,
      client_id: input.client_id,
      invoice_number,
      items: input.items as unknown as Database['public']['Tables']['invoices']['Insert']['items'],
      subtotal,
      tax_amount,
      total_amount,
      due_date: input.due_date ?? null,
      notes: input.notes ?? null,
      status: 'unpaid',
    }

    const { data, error } = await supabase
      .from('invoices')
      .insert(payload)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data as InvoiceRow
  }

  static async updateInvoice(id: string, input: {
    client_id: string
    items: InvoiceItem[]
    due_date?: string | null
  }): Promise<InvoiceRow> {
    const supabase = getSupabase()
    const { agencyId } = await getAuthContext()

    const { subtotal, tax_amount, total_amount } = calcTotals(input.items)

    const payload = {
      client_id: input.client_id,
      items: input.items as unknown as Database['public']['Tables']['invoices']['Update']['items'],
      subtotal,
      tax_amount,
      total_amount,
      due_date: input.due_date ?? null,
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('invoices')
      .update(payload)
      .eq('id', id)
      .eq('agency_id', agencyId)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data as InvoiceRow
  }

  /** Convertir un devis en facture */
  static async convertQuoteToInvoice(input: {
    quote_id: string
    due_date?: string | null
  }): Promise<InvoiceRow> {
    const supabase = getSupabase()
    const { agencyId } = await getAuthContext()

    const { data: quote, error: qErr } = await supabase
      .from('quotes')
      .select('*')
      .eq('id', input.quote_id)
      .eq('agency_id', agencyId)
      .single()

    if (qErr || !quote) throw new Error('Devis introuvable')

    const invoice_number = await generateInvoiceNumber(agencyId)

    const payload: Database['public']['Tables']['invoices']['Insert'] = {
      agency_id: agencyId,
      client_id: quote.client_id,
      quote_id: quote.id,
      invoice_number,
      items: quote.items,
      subtotal: quote.subtotal,
      tax_amount: quote.tax_amount,
      total_amount: quote.total_amount,
      due_date: input.due_date ?? null,
      status: 'unpaid',
    }

    const { data, error } = await supabase
      .from('invoices')
      .insert(payload)
      .select()
      .single()

    if (error) throw new Error(error.message)

    // Marquer le devis comme accepté s'il est encore brouillon/envoyé
    await supabase
      .from('quotes')
      .update({ status: 'accepted' })
      .eq('id', quote.id)
      .in('status', ['draft', 'sent'])

    return data as InvoiceRow
  }

  static async getInvoiceById(id: string): Promise<(InvoiceRow & {
    client: Pick<ClientRow, 'id' | 'name' | 'email' | 'phone' | 'address' | 'tax_id'> | null
    quote: Pick<QuoteRow, 'quote_number'> | null
  }) | null> {
    const supabase = getSupabase()
    try {
      const { agencyId } = await getAuthContext()
      const { data, error } = await supabase
        .from('invoices')
        .select('*, client:clients(id, name, email, phone, address, tax_id), quote:quotes(quote_number)')
        .eq('id', id)
        .eq('agency_id', agencyId)
        .single()

      if (error) return null
      return data as unknown as (InvoiceRow & {
        client: Pick<ClientRow, 'id' | 'name' | 'email' | 'phone' | 'address' | 'tax_id'> | null
        quote: Pick<QuoteRow, 'quote_number'> | null
      })
    } catch {
      return null
    }
  }

  static async markAsPaid(id: string): Promise<void> {
    const supabase = getSupabase()
    const { agencyId } = await getAuthContext()

    const { error, data } = await supabase
      .from('invoices')
      .update({ status: 'paid', paid_at: new Date().toISOString() })
      .eq('id', id)
      .eq('agency_id', agencyId)
      .in('status', ['unpaid', 'overdue'])
      .select()

    if (error) {
      throw new Error(error.message)
    }
    if (!data?.length) {
      throw new Error('Mise à jour échouée : facture introuvable, déjà payée ou agence incorrecte.')
    }
  }

  /** Supprimer une facture (uniquement si non payée) */
  static async deleteInvoice(id: string): Promise<void> {
    const supabase = getSupabase()
    const { agencyId } = await getAuthContext()

    const { data: invoice } = await supabase
      .from('invoices')
      .select('status')
      .eq('id', id)
      .eq('agency_id', agencyId)
      .single()

    if (!invoice) throw new Error('Facture introuvable')
    if (invoice.status === 'paid') {
      throw new Error('Impossible de supprimer une facture déjà payée.')
    }

    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', id)
      .eq('agency_id', agencyId)

    if (error) throw new Error(error.message)
  }

  /**
   * Lecture publique d'une facture (sans authentification) — utilisée sur les pages
   * d'impression partagées avec les clients. Utilise la clé service_role.
   */
  static async getPublicInvoiceById(id: string): Promise<(InvoiceRow & {
    client: Pick<ClientRow, 'id' | 'name' | 'email' | 'phone' | 'address' | 'tax_id'> | null
    quote: Pick<QuoteRow, 'quote_number'> | null
  }) | null> {
    const admin = createAdminClient()
    const { data, error } = await admin
      .from('invoices')
      .select('*, client:clients(id, name, email, phone, address, tax_id), quote:quotes(quote_number)')
      .eq('id', id)
      .single()

    if (error) return null

    // Auto-détecter si en retard
    const row = data as unknown as (InvoiceRow & {
      client: Pick<ClientRow, 'id' | 'name' | 'email' | 'phone' | 'address' | 'tax_id'> | null
      quote: Pick<QuoteRow, 'quote_number'> | null
    })
    if (row.status === 'unpaid' && row.due_date && new Date(row.due_date) < new Date()) {
      return { ...row, status: 'overdue' as const }
    }
    return row
  }
}
