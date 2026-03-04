'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { AgencyService } from '@/services/agencyService'
import { RbacService } from '@/services/rbacService'

const AgencySchema = z.object({
  name: z.string().min(1, 'Le nom est obligatoire').max(100),
  ninea: z.string().max(20).optional(),
  rccm: z.string().max(30).optional(),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  phone: z.string().max(20).optional().or(z.literal('')),
  address: z.string().max(300).optional().or(z.literal('')),
  invoice_template: z.enum(['classic', 'modern', 'elite']).optional(),
  is_vat_enabled: z.preprocess((val) => val === 'on', z.boolean()).optional(),
})

export type SettingsState = {
  errors?: Partial<Record<'name' | 'ninea' | 'rccm' | 'email' | 'phone' | 'address' | 'invoice_template' | 'is_vat_enabled', string[]>>
  success?: boolean
  message?: string
}

export async function updateAgencyAction(
  prevState: SettingsState,
  formData: FormData
): Promise<SettingsState> {
  const isAdmin = await RbacService.isAdmin()
  if (!isAdmin) {
    return { message: "Vous n'avez pas les droits nécessaires pour modifier ces paramètres." }
  }

  const raw = {
    name: formData.get('name') as string,
    ninea: formData.get('ninea') as string,
    rccm: formData.get('rccm') as string,
    email: formData.get('email') as string,
    phone: formData.get('phone') as string,
    address: formData.get('address') as string,
    invoice_template: formData.get('invoice_template') as string,
    is_vat_enabled: formData.get('is_vat_enabled') as string,
  }

  const parsed = AgencySchema.safeParse(raw)
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  try {
    await AgencyService.updateAgency({
      name: parsed.data.name,
      ninea: parsed.data.ninea,
      rccm: parsed.data.rccm,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      address: parsed.data.address || null,
      invoice_template: parsed.data.invoice_template || 'classic',
      is_vat_enabled: parsed.data.is_vat_enabled ?? true,
    })
    revalidatePath('/dashboard/settings')
    return { success: true, message: 'Paramètres enregistrés avec succès.' }
  } catch (e) {
    return { message: (e as Error).message }
  }
}

/**
 * Met à jour uniquement le logo de l'agence.
 * L'URL vient de Supabase Storage (upload direct côté client).
 */
export async function updateAgencyLogoAction(logoUrl: string): Promise<{ error?: string }> {
  const isAdmin = await RbacService.isAdmin()
  if (!isAdmin) return { error: "Droits insuffisants." }

  const supabase = await import('@/lib/supabase/server').then(m => m.createClient())
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié.' }

  const { data: agencyId } = await supabase.rpc('get_user_agency_id')
  const id = agencyId ?? user.id

  const { error } = await supabase
    .from('agencies')
    .update({ logo_url: logoUrl || null, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/dashboard/settings')
  return {}
}
