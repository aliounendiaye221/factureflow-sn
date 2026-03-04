'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { CatalogService } from '@/services/catalogService'
import { RbacService } from '@/services/rbacService'

// ─── Schémas Zod ──────────────────────────────────────────────────────────────

const CatalogItemSchema = z.object({
  name: z.string().min(1, 'Nom requis').max(150),
  description: z.string().max(500).optional(),
  unit_price: z.coerce.number().nonnegative('Le prix doit être ≥ 0'),
  tax_rate: z.coerce.number().min(0).max(100).default(0),
  type: z.enum(['product', 'service']).default('service'),
})

// ─── Types de retour ─────────────────────────────────────────────────────────

export type CatalogActionState = {
  success: boolean
  message: string
  errors?: {
    name?: string
    unit_price?: string
    description?: string
  }
}

// ─── Créer un article ────────────────────────────────────────────────────────

export async function createCatalogItemAction(
  _prev: CatalogActionState,
  formData: FormData
): Promise<CatalogActionState> {
  const canEdit = await RbacService.checkRole(['super_admin', 'admin', 'user'])
  if (!canEdit) return { success: false, message: "Droits insuffisants" }

  const raw = {
    name: formData.get('name') as string,
    description: (formData.get('description') as string) || undefined,
    unit_price: formData.get('unit_price') as string,
    tax_rate: formData.get('tax_rate') || '0',
    type: (formData.get('type') as string) || 'service',
  }

  const parsed = CatalogItemSchema.safeParse(raw)
  if (!parsed.success) {
    const errors: CatalogActionState['errors'] = {}
    for (const issue of parsed.error.issues) {
      if (issue.path[0] === 'name') errors.name = issue.message
      if (issue.path[0] === 'unit_price') errors.unit_price = issue.message
      if (issue.path[0] === 'description') errors.description = issue.message
    }
    return { success: false, message: 'Données invalides', errors }
  }

  try {
    await CatalogService.createCatalogItem(parsed.data)
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : 'Erreur serveur' }
  }

  revalidatePath('/dashboard/catalogue')
  return { success: true, message: 'Article ajouté au catalogue' }
}

// ─── Modifier un article ─────────────────────────────────────────────────────

export async function updateCatalogItemAction(
  _prev: CatalogActionState,
  formData: FormData
): Promise<CatalogActionState> {
  const canEdit = await RbacService.checkRole(['super_admin', 'admin', 'user'])
  if (!canEdit) return { success: false, message: "Droits insuffisants" }

  const id = formData.get('id') as string
  if (!id) return { success: false, message: 'ID manquant' }

  const raw = {
    name: formData.get('name') as string,
    description: (formData.get('description') as string) || undefined,
    unit_price: formData.get('unit_price') as string,
    tax_rate: formData.get('tax_rate') || '0',
    type: (formData.get('type') as string) || 'service',
  }

  const parsed = CatalogItemSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, message: 'Données invalides' }
  }

  try {
    await CatalogService.updateCatalogItem(id, parsed.data)
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : 'Erreur serveur' }
  }

  revalidatePath('/dashboard/catalogue')
  return { success: true, message: 'Article mis à jour' }
}

// ─── Supprimer un article ─────────────────────────────────────────────────────

export async function deleteCatalogItemAction(
  _prev: CatalogActionState,
  formData: FormData
): Promise<CatalogActionState> {
  const canDelete = await RbacService.checkRole(['super_admin', 'admin'])
  if (!canDelete) return { success: false, message: "Droits insuffisants" }

  const id = formData.get('id') as string
  if (!id) return { success: false, message: 'ID manquant' }

  try {
    await CatalogService.deleteCatalogItem(id)
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : 'Erreur serveur' }
  }

  revalidatePath('/dashboard/catalogue')
  return { success: true, message: 'Article supprimé' }
}

// ─── Archiver/réactiver ──────────────────────────────────────────────────────

export async function toggleCatalogItemAction(id: string, isActive: boolean): Promise<void> {
  await RbacService.requireRole(['super_admin', 'admin', 'user'])
  await CatalogService.updateCatalogItem(id, { is_active: isActive })
  revalidatePath('/dashboard/catalogue')
}
