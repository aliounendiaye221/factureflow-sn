'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { InvoiceService } from '@/services/invoiceService'
import { RbacService } from '@/services/rbacService'
import { AgencyService } from '@/services/agencyService'
import { checkLimit } from '@/lib/plans'
import { createClient } from '@/lib/supabase/server'

// ─── Schémas Zod ──────────────────────────────────────────────────────────────

const InvoiceItemSchema = z.object({
  description: z.string().min(1, 'Description requise'),
  quantity: z.coerce.number().positive('Quantité doit être > 0'),
  unit_price: z.coerce.number().nonnegative('Prix doit être ≥ 0'),
  tax_rate: z.coerce.number().nonnegative('TVA doit être ≥ 0').max(100),
})

const CreateInvoiceSchema = z.object({
  client_id: z.string().uuid('Sélectionnez un client'),
  items: z.array(InvoiceItemSchema).min(1, 'Ajoutez au moins une ligne'),
  due_date: z.string().optional(),
  notes: z.string().max(1000).optional(),
})

const ConvertQuoteSchema = z.object({
  quote_id: z.string().uuid('Sélectionnez un devis'),
  due_date: z.string().optional(),
})

// ─── Types de retour ─────────────────────────────────────────────────────────

export type InvoiceActionState = {
  success: boolean
  message: string
  errors?: {
    client_id?: string
    quote_id?: string
    items?: string
    due_date?: string
  }
}

// ─── Créer une facture libre ──────────────────────────────────────────────────

export async function createInvoiceAction(
  _prev: InvoiceActionState,
  formData: FormData
): Promise<InvoiceActionState> {
  // Seuls les viewers ne peuvent pas créer de factures
  const userRole = await RbacService.getUserRole()
  if (!userRole || userRole.role === 'viewer') {
    return { success: false, message: "Vous n'avez pas les droits nécessaires" }
  }

  // Vérification limite de plan (compte direct en DB, sans charger toutes les factures)
  const agency = await AgencyService.getAgency()
  if (agency) {
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)
    const supabase = createClient()
    const { count: thisMonthCount } = await supabase
      .from('invoices')
      .select('*', { count: 'exact', head: true })
      .eq('agency_id', agency.id)
      .gte('created_at', startOfMonth.toISOString())
    const { allowed, limit } = checkLimit(agency.plan, 'invoices', thisMonthCount ?? 0)
    if (!allowed) {
      return {
        success: false,
        message: `Limite atteinte : votre plan ${agency.plan} autorise ${limit} facture(s) par mois. Passez au plan Pro.`,
      }
    }
  }
  const itemsRaw: { description: string; quantity: string; unit_price: string; tax_rate: string }[] = []
  let i = 0
  while (formData.has(`items[${i}][description]`)) {
    itemsRaw.push({
      description: formData.get(`items[${i}][description]`) as string,
      quantity: formData.get(`items[${i}][quantity]`) as string,
      unit_price: formData.get(`items[${i}][unit_price]`) as string,
      tax_rate: formData.get(`items[${i}][tax_rate]`) as string || '0',
    })
    i++
  }

  const raw = {
    client_id: formData.get('client_id') as string,
    items: itemsRaw,
    due_date: (formData.get('due_date') as string) || undefined,
    notes: (formData.get('notes') as string) || undefined,
  }

  const parsed = CreateInvoiceSchema.safeParse(raw)
  if (!parsed.success) {
    const errors: InvoiceActionState['errors'] = {}
    for (const issue of parsed.error.issues) {
      if (issue.path[0] === 'client_id') errors.client_id = issue.message
      if (issue.path[0] === 'items') errors.items = issue.message
    }
    return { success: false, message: 'Données invalides', errors }
  }

  try {
    await InvoiceService.createInvoice(parsed.data)
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : 'Erreur serveur' }
  }

  revalidatePath('/dashboard/invoices')
  return { success: true, message: 'Facture créée avec succès' }
}

// ─── Convertir un devis en facture ───────────────────────────────────────────

export async function convertQuoteToInvoiceAction(
  _prev: InvoiceActionState,
  formData: FormData
): Promise<InvoiceActionState> {
  const userRole = await RbacService.getUserRole()
  if (!userRole || userRole.role === 'viewer') {
    return { success: false, message: "Vous n'avez pas les droits nécessaires" }
  }
  const raw = {
    quote_id: formData.get('quote_id') as string,
    due_date: (formData.get('due_date') as string) || undefined,
  }

  const parsed = ConvertQuoteSchema.safeParse(raw)
  if (!parsed.success) {
    const errors: InvoiceActionState['errors'] = {}
    for (const issue of parsed.error.issues) {
      if (issue.path[0] === 'quote_id') errors.quote_id = issue.message
    }
    return { success: false, message: 'Données invalides', errors }
  }

  try {
    await InvoiceService.convertQuoteToInvoice(parsed.data)
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : 'Erreur serveur' }
  }

  revalidatePath('/dashboard/invoices')
  revalidatePath('/dashboard/quotes')
  return { success: true, message: 'Devis converti en facture' }
}

// ─── Marquer une facture comme payée manuellement ───────────────────────────

export type MarkPaidState = { success: boolean; message: string }

export async function markInvoicePaidAction(
  _prev: MarkPaidState,
  formData: FormData
): Promise<MarkPaidState> {
  const userRole = await RbacService.getUserRole()
  if (!userRole || userRole.role === 'viewer') {
    return { success: false, message: "Vous n'avez pas les droits nécessaires" }
  }
  const id = formData.get('id') as string | null
  if (!id) return { success: false, message: 'ID de facture manquant' }

  try {
    await InvoiceService.markAsPaid(id)
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : 'Erreur serveur' }
  }

  revalidatePath('/dashboard/invoices')
  revalidatePath('/dashboard')
  return { success: true, message: 'Facture marquée comme payée' }
}

// ─── Update Invoice Action ──────────────────────────────────────────────────

export async function updateInvoiceAction(
  invoiceId: string,
  _prev: InvoiceActionState,
  formData: FormData
): Promise<InvoiceActionState> {
  const userRole = await RbacService.getUserRole()
  if (!userRole || userRole.role === 'viewer') {
    return { success: false, message: "Vous n'avez pas les droits nécessaires" }
  }
  const itemsRaw: { description: string; quantity: string; unit_price: string; tax_rate: string }[] = []
  let i = 0
  while (formData.has(`items[${i}][description]`)) {
    itemsRaw.push({
      description: formData.get(`items[${i}][description]`) as string,
      quantity: formData.get(`items[${i}][quantity]`) as string,
      unit_price: formData.get(`items[${i}][unit_price]`) as string,
      tax_rate: formData.get(`items[${i}][tax_rate]`) as string || '0',
    })
    i++
  }

  const raw = {
    client_id: formData.get('client_id') as string,
    items: itemsRaw,
    due_date: (formData.get('due_date') as string) || undefined,
  }

  const parsed = CreateInvoiceSchema.safeParse(raw)
  if (!parsed.success) {
    const errors: InvoiceActionState['errors'] = {}
    for (const issue of parsed.error.issues) {
      if (issue.path[0] === 'client_id') errors.client_id = issue.message
      if (issue.path[0] === 'items') errors.items = issue.message
    }
    return { success: false, message: 'Données invalides', errors }
  }

  try {
    await InvoiceService.updateInvoice(invoiceId, parsed.data)
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : 'Erreur serveur' }
  }

  revalidatePath('/dashboard/invoices')
  return { success: true, message: 'Facture modifiée avec succès' }
}

// ─── Supprimer une facture ──────────────────────────────────────────────────

export type DeleteInvoiceState = { success: boolean; message: string }

export async function deleteInvoiceAction(
  _prev: DeleteInvoiceState,
  formData: FormData
): Promise<DeleteInvoiceState> {
  const userRole = await RbacService.getUserRole()
  if (!userRole || !['admin', 'super_admin'].includes(userRole.role)) {
    return { success: false, message: "Seul un administrateur peut supprimer une facture" }
  }
  const id = formData.get('id') as string | null
  if (!id) return { success: false, message: 'ID de facture manquant' }

  try {
    await InvoiceService.deleteInvoice(id)
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : 'Erreur serveur' }
  }

  revalidatePath('/dashboard/invoices')
  revalidatePath('/dashboard')
  return { success: true, message: 'Facture supprimée' }
}
