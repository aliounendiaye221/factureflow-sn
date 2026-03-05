'use server'

import { SuperAdminService } from '@/services/superAdminService'
import { RbacService } from '@/services/rbacService'
import { revalidatePath } from 'next/cache'
import { isRedirectError } from 'next/dist/client/components/redirect'
import type { AppRole } from '@/lib/roles'

export type AdminActionState = {
    success: boolean
    message: string
}

// ── Suspension / Réactivation d'agence ────────────────────────────────────

export async function suspendAgencyAction(agencyId: string): Promise<AdminActionState> {
    const isSuperAdmin = await RbacService.isSuperAdmin()
    if (!isSuperAdmin) return { success: false, message: 'Accès refusé.' }

    try {
        await SuperAdminService.suspendAgency(agencyId)
        revalidatePath('/dashboard/super-admin')
        return { success: true, message: 'Agence suspendue avec succès.' }
    } catch (err: unknown) {
        if (isRedirectError(err)) throw err
        return { success: false, message: err instanceof Error ? err.message : 'Erreur inconnue' }
    }
}

export async function reactivateAgencyAction(agencyId: string): Promise<AdminActionState> {
    const isSuperAdmin = await RbacService.isSuperAdmin()
    if (!isSuperAdmin) return { success: false, message: 'Accès refusé.' }

    try {
        await SuperAdminService.reactivateAgency(agencyId)
        revalidatePath('/dashboard/super-admin')
        return { success: true, message: 'Agence réactivée avec succès.' }
    } catch (err: unknown) {
        if (isRedirectError(err)) throw err
        return { success: false, message: err instanceof Error ? err.message : 'Erreur inconnue' }
    }
}

export async function deleteAgencyAction(agencyId: string): Promise<AdminActionState> {
    const isSuperAdmin = await RbacService.isSuperAdmin()
    if (!isSuperAdmin) return { success: false, message: 'Accès refusé.' }

    try {
        await SuperAdminService.deleteAgency(agencyId)
        revalidatePath('/dashboard/super-admin')
        return { success: true, message: 'Agence supprimée définitivement.' }
    } catch (err: unknown) {
        if (isRedirectError(err)) throw err
        return { success: false, message: err instanceof Error ? err.message : 'Erreur inconnue' }
    }
}

// ── Gestion des utilisateurs ──────────────────────────────────────────────

export async function deleteUserAction(userId: string): Promise<AdminActionState> {
    const isSuperAdmin = await RbacService.isSuperAdmin()
    if (!isSuperAdmin) return { success: false, message: 'Accès refusé.' }

    try {
        await SuperAdminService.deleteUser(userId)
        revalidatePath('/dashboard/super-admin/users')
        return { success: true, message: 'Utilisateur supprimé.' }
    } catch (err: unknown) {
        if (isRedirectError(err)) throw err
        return { success: false, message: err instanceof Error ? err.message : 'Erreur inconnue' }
    }
}

export async function changeUserRoleAction(
    _prev: AdminActionState,
    formData: FormData
): Promise<AdminActionState> {
    const isSuperAdmin = await RbacService.isSuperAdmin()
    if (!isSuperAdmin) return { success: false, message: 'Accès refusé.' }

    const userId = formData.get('userId') as string
    const newRole = formData.get('role') as AppRole

    if (!userId || !newRole) return { success: false, message: 'Données manquantes.' }

    const validRoles: AppRole[] = ['viewer', 'user', 'admin', 'super_admin']
    if (!validRoles.includes(newRole)) return { success: false, message: 'Rôle invalide.' }

    try {
        await SuperAdminService.changeUserRole(userId, newRole)
        revalidatePath('/dashboard/super-admin/users')
        return { success: true, message: `Rôle changé en "${newRole}".` }
    } catch (err: unknown) {
        if (isRedirectError(err)) throw err
        return { success: false, message: err instanceof Error ? err.message : 'Erreur inconnue' }
    }
}

// ── Support technique ─────────────────────────────────────────────────────

export async function updateTicketAction(
    _prev: AdminActionState,
    formData: FormData
): Promise<AdminActionState> {
    const isSuperAdmin = await RbacService.isSuperAdmin()
    if (!isSuperAdmin) return { success: false, message: 'Accès refusé.' }

    const ticketId = formData.get('ticketId') as string
    const status = formData.get('status') as string
    const adminNotes = formData.get('adminNotes') as string | undefined

    if (!ticketId || !status) return { success: false, message: 'Données manquantes.' }

    try {
        await SuperAdminService.updateTicketStatus(ticketId, status, adminNotes)
        revalidatePath('/dashboard/super-admin/support')
        return { success: true, message: 'Ticket mis à jour.' }
    } catch (err: unknown) {
        if (isRedirectError(err)) throw err
        return { success: false, message: err instanceof Error ? err.message : 'Erreur inconnue' }
    }
}
