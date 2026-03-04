// ============================================================
// RbacService — Contrôle d'accès basé sur les rôles (RBAC)
// ============================================================
// 4 rôles par ordre croissant de privilèges :
//
//  viewer (0) — Lecture seule : consultation sans modification
//  user   (1) — Utilisateur   : créer/modifier, sans suppression ni settings
//  admin  (2) — Administrateur: accès complet à son agence (supression, settings, billing)
//  super_admin (3) — Administrateur plateforme : accès global à toutes les agences
//
// Règle fondamentale : super_admin passe TOUS les checkRole().
// En cas d'erreur DB, le fallback est 'user' (principe du moindre privilège).
// ============================================================
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import type { AppRole } from '@/lib/roles'

/** Alias local pour la lisibilité */
type Role = AppRole

export const RbacService = {
    /**
     * Récupère le rôle de l'utilisateur actuel.
     * Utilise le client Admin pour contourner la récursion RLS de Supabase.
     *
     * @returns { role, agency_id } ou null si non authentifié.
     */
    async getUserRole(): Promise<{ role: Role; agency_id: string | null } | null> {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return null

        // On utilise l'admin client pour contourner une récursion infinie dans les politiques RLS Supabase
        const supabaseAdmin = createAdminClient()
        const { data, error } = await supabaseAdmin
            .from('user_roles')
            .select('role, agency_id')
            .eq('user_id', user.id)
            .single()

        // console.log('DEBUG RBAC getUserRole:', { userId: user.id, data, error })

        if (error || !data) {
            return null
        }

        return { role: data.role as Role, agency_id: data.agency_id }
    },

    /**
     * Vérifie si l'utilisateur a au moins un des rôles requis.
     * Par définition, un 'super_admin' passe toujours.
     */
    async checkRole(allowedRoles: Role[]): Promise<boolean> {
        const userRole = await this.getUserRole()
        if (!userRole) return false

        if (userRole.role === 'super_admin') return true

        return allowedRoles.includes(userRole.role)
    },

    /**
     * A appeler dans les Server Components ou les Server Actions
     * Redirige l'utilisateur s'il n'a pas les droits.
     */
    async requireRole(allowedRoles: Role[], redirectTo: string = '/dashboard'): Promise<void> {
        const hasRole = await this.checkRole(allowedRoles)
        if (!hasRole) {
            redirect(redirectTo)
        }
    },

    /**
     * Helpers sémantiques
     */
    /** Retourne true si l'utilisateur est super_admin */
    async isSuperAdmin(): Promise<boolean> {
        return this.checkRole(['super_admin'])
    },

    /** Retourne true si l'utilisateur est admin OU super_admin */
    async isAdmin(): Promise<boolean> {
        // Un admin est soit 'admin' soit 'super_admin'
        return this.checkRole(['admin'])
    },

    /** Retourne true si l'utilisateur est user, admin ou super_admin (= pas un simple visiteur) */
    async isUser(): Promise<boolean> {
        return this.checkRole(['user', 'admin'])
    },

    /** Retourne true si l'utilisateur est au minimum un visiteur authentifié */
    async isViewer(): Promise<boolean> {
        return this.checkRole(['viewer', 'user', 'admin'])
    },
}
