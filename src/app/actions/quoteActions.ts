'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { QuoteService } from '@/services/quoteService'
import { RbacService } from '@/services/rbacService'
import { AgencyService } from '@/services/agencyService'
import { checkLimit } from '@/lib/plans'
import { createClient } from '@/lib/supabase/server'

// ─── Schémas Zod ──────────────────────────────────────────────────────────────

const QuoteItemSchema = z.object({
  description: z.string().min(1, 'Description requise'),
  quantity: z.coerce.number().positive('Quantité doit être > 0'),
  unit_price: z.coerce.number().nonnegative('Prix doit être ≥ 0'),
  tax_rate: z.coerce.number().nonnegative('TVA doit être ≥ 0').max(100),
})

const CreateQuoteSchema = z.object({
  client_id: z.string().uuid('Sélectionnez un client'),
  items: z.array(QuoteItemSchema).min(1, 'Ajoutez au moins une ligne'),
  notes: z.string().max(1000).optional(),
})

// ─── Type de retour ───────────────────────────────────────────────────────────

export type CreateQuoteState = {
  success: boolean
  message: string
  errors?: {
    client_id?: string
    items?: string
  }
}

// ─── Créer un devis ───────────────────────────────────────────────────────────

export async function createQuoteAction(
  _prevState: CreateQuoteState,
  formData: FormData
): Promise<CreateQuoteState> {
  const userRole = await RbacService.getUserRole()
  if (!userRole || userRole.role === 'viewer') {
    return { success: false, message: "Vous n'avez pas les droits nécessaires" }
  }

  // Vérification limite de plan (compte direct en DB, sans charger tous les devis)
  const agency = await AgencyService.getAgency()
  if (agency) {
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)
    const supabase = createClient()
    const { count: thisMonthCount } = await supabase
      .from('quotes')
      .select('*', { count: 'exact', head: true })
      .eq('agency_id', agency.id)
      .gte('created_at', startOfMonth.toISOString())
    const { allowed, limit } = checkLimit(agency.plan, 'invoices', thisMonthCount ?? 0)
    if (!allowed) {
      return {
        success: false,
        message: `Limite atteinte : votre plan ${agency.plan} autorise ${limit} document(s) par mois. Passez au plan Pro.`,
      }
    }
  }

  // Reconstituer les lignes depuis FormData
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
    notes: (formData.get('notes') as string) || undefined,
  }

  const parsed = CreateQuoteSchema.safeParse(raw)

  if (!parsed.success) {
    const errors: CreateQuoteState['errors'] = {}
    for (const issue of parsed.error.issues) {
      if (issue.path[0] === 'client_id') errors.client_id = issue.message
      if (issue.path[0] === 'items') errors.items = issue.message
    }
    return { success: false, message: 'Données invalides', errors }
  }

  try {
    await QuoteService.createQuote(parsed.data)
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : 'Erreur serveur',
    }
  }

  revalidatePath('/dashboard/quotes')
  return { success: true, message: 'Devis créé avec succès' }
}

// ─── Modifier un devis ────────────────────────────────────────────────────────

export async function updateQuoteAction(
  quoteId: string,
  _prevState: CreateQuoteState,
  formData: FormData
): Promise<CreateQuoteState> {
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
  }

  const parsed = CreateQuoteSchema.safeParse(raw)

  if (!parsed.success) {
    const errors: CreateQuoteState['errors'] = {}
    for (const issue of parsed.error.issues) {
      if (issue.path[0] === 'client_id') errors.client_id = issue.message
      if (issue.path[0] === 'items') errors.items = issue.message
    }
    return { success: false, message: 'Données invalides', errors }
  }

  try {
    await QuoteService.updateQuote(quoteId, parsed.data)
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : 'Erreur serveur' }
  }

  revalidatePath('/dashboard/quotes')
  return { success: true, message: 'Devis mis à jour avec succès' }
}

// ─── Changer le statut d'un devis ─────────────────────────────────────────────

const QuoteStatusSchema = z.object({
  id: z.string().uuid('ID invalide'),
  status: z.enum(['sent', 'accepted', 'rejected']),
})

export type QuoteStatusState = { success: boolean; message: string }

export async function updateQuoteStatusAction(
  _prev: QuoteStatusState,
  formData: FormData
): Promise<QuoteStatusState> {
  const userRole = await RbacService.getUserRole()
  if (!userRole || userRole.role === 'viewer') {
    return { success: false, message: "Vous n'avez pas les droits nécessaires" }
  }
  const parsed = QuoteStatusSchema.safeParse({
    id: formData.get('id'),
    status: formData.get('status'),
  })
  if (!parsed.success) {
    return { success: false, message: 'Paramètres invalides' }
  }
  try {
    await QuoteService.updateStatus(parsed.data.id, parsed.data.status)
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : 'Erreur serveur' }
  }
  revalidatePath('/dashboard/quotes')
  revalidatePath('/dashboard/invoices')
  return { success: true, message: 'Statut mis à jour' }
}

// ─── Supprimer un devis ────────────────────────────────────────────────────────

export type DeleteQuoteState = { success: boolean; message: string }

export async function deleteQuoteAction(
  _prev: DeleteQuoteState,
  formData: FormData
): Promise<DeleteQuoteState> {
  const userRole = await RbacService.getUserRole()
  if (!userRole || !['admin', 'super_admin'].includes(userRole.role)) {
    return { success: false, message: "Seul un administrateur peut supprimer un devis" }
  }
  const id = formData.get('id') as string | null
  if (!id) return { success: false, message: 'ID manquant' }

  try {
    await QuoteService.deleteQuote(id)
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : 'Erreur serveur' }
  }

  revalidatePath('/dashboard/quotes')
  return { success: true, message: 'Devis supprimé' }
}
