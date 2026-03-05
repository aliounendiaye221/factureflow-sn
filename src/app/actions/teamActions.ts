'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { RbacService } from '@/services/rbacService'
import type { AppRole } from '@/lib/roles'

// ── Types ─────────────────────────────────────────────────────────────────────

export type TeamMember = {
  user_id: string
  email: string
  role: AppRole
  created_at: string
  is_self: boolean
}

export type TeamActionState = {
  success?: boolean
  message?: string
}

// ── Lister les membres de l'agence ────────────────────────────────────────────

export async function listTeamMembersAction(): Promise<TeamMember[]> {
  const isAdmin = await RbacService.isAdmin()
  if (!isAdmin) return []

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const roleData = await RbacService.getUserRole()
  if (!roleData?.agency_id) return []

  const supabaseAdmin = createAdminClient()

  // Récupérer tous les user_roles de l'agence
  const { data: roles } = await supabaseAdmin
    .from('user_roles')
    .select('user_id, role, created_at')
    .eq('agency_id', roleData.agency_id as string)

  if (!roles?.length) return []

  // Récupérer les emails via l'API admin
  const { data: { users } } = await supabaseAdmin.auth.admin.listUsers()

  const userMap = new Map(users.map(u => [u.id, u.email ?? '']))

  return roles.map(r => ({
    user_id:    r.user_id,
    email:      userMap.get(r.user_id) ?? 'Email inconnu',
    role:       r.role as AppRole,
    created_at: r.created_at,
    is_self:    r.user_id === user.id,
  })).sort((a, b) => a.created_at.localeCompare(b.created_at))
}

// ── Inviter un membre ─────────────────────────────────────────────────────────

export async function inviteTeamMemberAction(
  prevState: TeamActionState,
  formData: FormData
): Promise<TeamActionState> {
  const isAdmin = await RbacService.isAdmin()
  if (!isAdmin) return { message: "Droits insuffisants." }

  const email = (formData.get('email') as string | null)?.toLowerCase().trim()
  const role  = formData.get('role') as AppRole | null

  if (!email || !/^[^@]+@[^@]+\.[^@]+$/.test(email)) {
    return { message: "Email invalide." }
  }

  const validRoles: AppRole[] = ['user', 'viewer', 'admin']
  if (!role || !validRoles.includes(role)) {
    return { message: "Rôle invalide." }
  }

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { message: "Non authentifié." }

  const roleData = await RbacService.getUserRole()
  if (!roleData?.agency_id) return { message: "Agence introuvable." }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://factureflow-sn.vercel.app'
  const supabaseAdmin = createAdminClient()

  const { error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${siteUrl}/auth/callback?next=/auth/update-password`,
    data: {
      agency_id:     roleData.agency_id,
      assigned_role: role,
    },
  })

  if (error) {
    // Si l'utilisateur existe déjà mais n'est pas membre, on peut juste l'ajouter
    if (error.message.includes('already been registered')) {
      return { message: "Cet email est déjà enregistré. Demandez à l'utilisateur de vous contacter pour rejoindre votre agence." }
    }
    return { message: `Erreur : ${error.message}` }
  }

  revalidatePath('/dashboard/settings/team')
  return { success: true, message: `Invitation envoyée à ${email}.` }
}

// ── Modifier le rôle d'un membre ──────────────────────────────────────────────

export async function changeTeamMemberRoleAction(
  userId: string,
  newRole: AppRole
): Promise<{ error?: string }> {
  const isAdmin = await RbacService.isAdmin()
  if (!isAdmin) return { error: "Droits insuffisants." }

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || userId === user.id) return { error: "Vous ne pouvez pas modifier votre propre rôle." }

  const supabaseAdmin = createAdminClient()
  const { error } = await supabaseAdmin
    .from('user_roles')
    .update({ role: newRole })
    .eq('user_id', userId)

  if (error) return { error: error.message }
  revalidatePath('/dashboard/settings/team')
  return {}
}

// ── Retirer un membre ─────────────────────────────────────────────────────────

export async function removeTeamMemberAction(userId: string): Promise<{ error?: string }> {
  const isAdmin = await RbacService.isAdmin()
  if (!isAdmin) return { error: "Droits insuffisants." }

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || userId === user.id) return { error: "Vous ne pouvez pas vous retirer vous-même." }

  const roleData = await RbacService.getUserRole()
  if (!roleData?.agency_id) return { error: 'Agence introuvable.' }
  const supabaseAdmin = createAdminClient()

  // Supprimer uniquement le rôle (ne pas supprimer le compte auth)
  const { error } = await supabaseAdmin
    .from('user_roles')
    .delete()
    .eq('user_id', userId)
    .eq('agency_id', roleData.agency_id as string)

  if (error) return { error: error.message }
  revalidatePath('/dashboard/settings/team')
  return {}
}
