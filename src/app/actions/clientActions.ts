'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { ClientService } from '@/services/clientService'
import { RbacService } from '@/services/rbacService'
import { AgencyService } from '@/services/agencyService'
import { checkLimit } from '@/lib/plans'

// ─── Schéma de validation Zod ────────────────────────────────────────────────
const CreateClientSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').max(100),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  phone: z.string().max(20).optional().or(z.literal('')),
  address: z.string().max(200).optional().or(z.literal('')),
  tax_id: z.string().max(50).optional().or(z.literal('')),
})

// ─── Type de retour ───────────────────────────────────────────────────────────
export type CreateClientState = {
  success: boolean
  message: string
  errors?: Partial<Record<keyof z.infer<typeof CreateClientSchema>, string>>
}

// ─── Server Action : Créer un client ─────────────────────────────────────────
export async function createClientAction(
  _prevState: CreateClientState,
  formData: FormData
): Promise<CreateClientState> {
  const userRole = await RbacService.getUserRole()
  if (!userRole || userRole.role === 'viewer') {
    return { success: false, message: "Vous n'avez pas les droits nécessaires" }
  }

  // Vérification de la limite du plan
  const agency = await AgencyService.getAgency()
  if (agency) {
    const clients = await ClientService.getClients()
    const { allowed, limit } = checkLimit(agency.plan, 'clients', clients.length)
    if (!allowed) {
      return {
        success: false,
        message: `Limite atteinte : votre plan ${agency.plan} autorise ${limit} client(s). Passez au plan Pro pour continuer.`,
      }
    }
  }

  const raw = {
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    phone: formData.get('phone') as string,
    address: formData.get('address') as string,
    tax_id: formData.get('tax_id') as string,
  }

  // 1. Validation Zod
  const parsed = CreateClientSchema.safeParse(raw)

  if (!parsed.success) {
    const errors: CreateClientState['errors'] = {}
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as keyof typeof errors
      errors[field] = issue.message
    }
    return { success: false, message: 'Données invalides', errors }
  }

  // 2. Persistance via le service
  try {
    await ClientService.createClient({
      name: parsed.data.name,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      address: parsed.data.address || null,
      tax_id: parsed.data.tax_id || null,
    })
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : 'Erreur serveur',
    }
  }

  revalidatePath('/dashboard/clients')
  return { success: true, message: 'Client créé avec succès' }
}

// ─── Server Action : Modifier un client ──────────────────────────────────────
export async function updateClientAction(
  clientId: string,
  _prevState: CreateClientState,
  formData: FormData
): Promise<CreateClientState> {
  const userRole = await RbacService.getUserRole()
  if (!userRole || userRole.role === 'viewer') {
    return { success: false, message: "Vous n'avez pas les droits nécessaires" }
  }

  const raw = {
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    phone: formData.get('phone') as string,
    address: formData.get('address') as string,
    tax_id: formData.get('tax_id') as string,
  }

  const parsed = CreateClientSchema.safeParse(raw)

  if (!parsed.success) {
    const errors: CreateClientState['errors'] = {}
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as keyof typeof errors
      errors[field] = issue.message
    }
    return { success: false, message: 'Données invalides', errors }
  }

  try {
    await ClientService.updateClient(clientId, {
      name: parsed.data.name,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      address: parsed.data.address || null,
      tax_id: parsed.data.tax_id || null,
    })
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : 'Erreur serveur',
    }
  }

  revalidatePath('/dashboard/clients')
  return { success: true, message: 'Client mis à jour avec succès' }
}

// ─── Server Action : Supprimer un client ─────────────────────────────────────
export type DeleteState = { success: boolean; message: string }

export async function deleteClientAction(
  _prev: DeleteState,
  formData: FormData
): Promise<DeleteState> {
  const userRole = await RbacService.getUserRole()
  if (!userRole || !['admin', 'super_admin'].includes(userRole.role)) {
    return { success: false, message: "Seul un administrateur peut supprimer un client" }
  }
  const id = formData.get('id') as string | null
  if (!id) return { success: false, message: 'ID manquant' }

  try {
    await ClientService.deleteClient(id)
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : 'Erreur serveur' }
  }

  revalidatePath('/dashboard/clients')
  return { success: true, message: 'Client supprimé' }
}

