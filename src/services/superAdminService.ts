import { createAdminClient } from '@/lib/supabase/admin'
import { RbacService } from './rbacService'
import type { AppRole } from '@/lib/roles'

export type AgencyStats = {
    id: string
    name: string
    plan: string
    created_at: string
    ninea: string | null
    rccm: string | null
    user_count: number
    total_revenue: number
    plan_started_at: string | null
    plan_expires_at: string | null
    email: string | null
    phone: string | null
    is_suspended: boolean
}

export type EventLog = {
    id: string
    created_at: string
    agency_id: string | null
    entity_type: string
    entity_id: string | null
    action: string
    status: string
    payload: any
    user_id: string | null
    agencies?: { name: string } | null
}

export type PageViewStats = {
    date: string
    count: number
}

export type TopPage = {
    path: string
    count: number
}

export type ActiveAgency = {
    agency_id: string
    agency_name: string
    visit_count: number
}

export type PlatformUser = {
    id: string
    email: string
    created_at: string
    last_sign_in_at: string | null
    agency_id: string | null
    agency_name: string | null
    role: AppRole
}

export type AgencyDetail = {
    id: string
    name: string
    plan: string
    created_at: string
    ninea: string | null
    rccm: string | null
    email: string | null
    phone: string | null
    address: string | null
    plan_started_at: string | null
    plan_expires_at: string | null
    is_suspended: boolean
    users: { user_id: string; email: string; role: AppRole; created_at: string }[]
    invoiceCount: number
    quoteCount: number
    clientCount: number
    totalRevenue: number
}

export type SupportTicket = {
    id: string
    created_at: string
    agency_id: string | null
    agency_name: string | null
    user_email: string | null
    subject: string
    message: string
    status: 'open' | 'in_progress' | 'resolved' | 'closed'
    priority: 'low' | 'medium' | 'high' | 'urgent'
    admin_notes: string | null
}

export const SuperAdminService = {
    /**
     * Récupère la liste de toutes les agences avec des statistiques basiques
     */
    async getAgenciesStats(): Promise<AgencyStats[]> {
        await RbacService.requireRole(['super_admin'])
        const supabase = createAdminClient()

        // On récupère toutes les agences
        const { data: agencies, error: agenciesError } = await supabase
            .from('agencies')
            .select('*')
            .order('created_at', { ascending: false })

        if (agenciesError) throw new Error(agenciesError.message)

        // On récupère le nombre d'utilisateurs par agence
        const { data: userRoles, error: rolesError } = await supabase
            .from('user_roles')
            .select('agency_id')

        if (rolesError) throw new Error(rolesError.message)

        // On récupère les factures payées pour le CA total
        const { data: invoices, error: invError } = await supabase
            .from('invoices')
            .select('agency_id, total_amount')
            .eq('status', 'paid')

        if (invError) throw new Error(invError.message)

        // Agrégation manuelle simple
        return agencies.map(agency => {
            const usersInAgency = userRoles.filter(r => r.agency_id === agency.id).length

            const agencyRevenue = invoices
                .filter(i => i.agency_id === agency.id)
                .reduce((sum, inv) => sum + Number(inv.total_amount), 0)

            return {
                id: agency.id,
                name: agency.name,
                plan: agency.plan ?? 'free',
                created_at: agency.created_at,
                ninea: agency.ninea,
                rccm: agency.rccm,
                user_count: usersInAgency,
                total_revenue: agencyRevenue,
                plan_started_at: agency.plan_started_at ?? null,
                plan_expires_at: agency.plan_expires_at ?? null,
                email: agency.email ?? null,
                phone: agency.phone ?? null,
                is_suspended: agency.is_suspended ?? false,
            }
        })
    },

    /**
     * Récupère les logs du système ou des erreurs
     */
    async getEventLogs(limit = 100): Promise<EventLog[]> {
        await RbacService.requireRole(['super_admin'])
        const supabase = createAdminClient()

        const { data, error } = await supabase
            .from('event_logs')
            .select('*, agencies(name)')
            .order('created_at', { ascending: false })
            .limit(limit)

        if (error) throw new Error(error.message)
        return data as EventLog[]
    },

    /**
     * Calcule les KPIs globaux
     */
    async getGlobalKPIs() {
        await RbacService.requireRole(['super_admin'])
        const supabase = createAdminClient()

        // Total agences
        const { count: agenciesCount } = await supabase
            .from('agencies')
            .select('*', { count: 'exact', head: true })

        // Total CA traité par la plateforme (toutes agences confondues)
        const { data: invoices } = await supabase
            .from('invoices')
            .select('total_amount')
            .eq('status', 'paid')

        const totalPlatformRevenue = (invoices || []).reduce((sum, inv) => sum + Number(inv.total_amount), 0)

        // Inscriptions cette semaine
        const oneWeekAgo = new Date()
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

        const { count: recentSignups } = await supabase
            .from('agencies')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', oneWeekAgo.toISOString())

        return {
            totalAgencies: agenciesCount || 0,
            totalRevenue: totalPlatformRevenue,
            recentSignups: recentSignups || 0
        }
    },

    /**
     * Stats abonnements : nombre d'abonnés par plan, MRR, abonnements expirant bientôt
     */
    async getSubscriptionStats() {
        await RbacService.requireRole(['super_admin'])
        const supabase = createAdminClient()

        const { data: agencies } = await supabase
            .from('agencies')
            .select('plan, plan_started_at, plan_expires_at')

        const byPlan: Record<string, number> = { free: 0, pro: 0, agency: 0 }
        let activeSubscriptions = 0
        let expiringSoon = 0
        const now = new Date()
        const in7Days = new Date()
        in7Days.setDate(in7Days.getDate() + 7)

        for (const a of agencies ?? []) {
            const plan = a.plan ?? 'free'
            byPlan[plan] = (byPlan[plan] ?? 0) + 1
            if (plan !== 'free') {
                activeSubscriptions++
                if (a.plan_expires_at && new Date(a.plan_expires_at) <= in7Days && new Date(a.plan_expires_at) >= now) {
                    expiringSoon++
                }
            }
        }

        // MRR approximatif basé sur les plans
        const PLAN_PRICES: Record<string, number> = { free: 0, pro: 9900, agency: 19900 }
        const mrr = Object.entries(byPlan).reduce((sum, [plan, count]) => sum + (PLAN_PRICES[plan] ?? 0) * count, 0)

        return { byPlan, activeSubscriptions, expiringSoon, mrr }
    },

    /**
     * Historique des visites : stats journalières (7 derniers jours), pages les plus visitées, agences actives
     */
    async getPageViewStats(): Promise<{ daily: PageViewStats[]; topPages: TopPage[]; activeAgencies: ActiveAgency[]; totalViews: number }> {
        await RbacService.requireRole(['super_admin'])
        const supabase = createAdminClient()

        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

        const { data: views } = await supabase
            .from('page_views')
            .select('path, agency_id, created_at')
            .gte('created_at', sevenDaysAgo.toISOString())
            .order('created_at', { ascending: false })

        const allViews = views ?? []

        // Stats journalières
        const dailyMap = new Map<string, number>()
        for (const v of allViews) {
            const day = new Date(v.created_at).toISOString().slice(0, 10)
            dailyMap.set(day, (dailyMap.get(day) ?? 0) + 1)
        }
        const daily: PageViewStats[] = Array.from(dailyMap.entries())
            .map(([date, count]) => ({ date, count }))
            .sort((a, b) => a.date.localeCompare(b.date))

        // Top pages
        const pathMap = new Map<string, number>()
        for (const v of allViews) {
            pathMap.set(v.path, (pathMap.get(v.path) ?? 0) + 1)
        }
        const topPages: TopPage[] = Array.from(pathMap.entries())
            .map(([path, count]) => ({ path, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10)

        // Agences les plus actives
        const agencyMap = new Map<string, number>()
        for (const v of allViews) {
            if (v.agency_id) agencyMap.set(v.agency_id, (agencyMap.get(v.agency_id) ?? 0) + 1)
        }

        // Récupérer les noms d'agences
        const agencyIds = Array.from(agencyMap.keys())
        let agencyNames = new Map<string, string>()
        if (agencyIds.length > 0) {
            const { data: agencyData } = await supabase
                .from('agencies')
                .select('id, name')
                .in('id', agencyIds)
            for (const a of agencyData ?? []) {
                agencyNames.set(a.id, a.name)
            }
        }

        const activeAgencies: ActiveAgency[] = Array.from(agencyMap.entries())
            .map(([agency_id, visit_count]) => ({
                agency_id,
                agency_name: agencyNames.get(agency_id) ?? 'Inconnu',
                visit_count,
            }))
            .sort((a, b) => b.visit_count - a.visit_count)
            .slice(0, 10)

        return { daily, topPages, activeAgencies, totalViews: allViews.length }
    },

    /**
     * Enregistrer une visite de page
     */
    async trackPageView(userId: string | null, agencyId: string | null, path: string): Promise<void> {
        const supabase = createAdminClient()
        await supabase.from('page_views').insert({
            user_id: userId,
            agency_id: agencyId,
            path,
        })
    },

    /**
     * Change le plan d'abonnement d'une agence (après validation paiement Wave)
     */
    async updateAgencyPlan(agencyId: string, newPlan: string): Promise<void> {
        await RbacService.requireRole(['super_admin'])
        const supabase = createAdminClient()

        const now = new Date()
        const expiresAt = new Date()
        expiresAt.setMonth(expiresAt.getMonth() + 1)

        const updatePayload: Record<string, any> = { plan: newPlan }
        if (newPlan !== 'free') {
            updatePayload.plan_started_at = now.toISOString()
            updatePayload.plan_expires_at = expiresAt.toISOString()
        } else {
            updatePayload.plan_started_at = null
            updatePayload.plan_expires_at = null
        }

        const { error } = await supabase
            .from('agencies')
            .update(updatePayload)
            .eq('id', agencyId)

        if (error) throw new Error(error.message)

        // Journaliser l'activation
        await supabase.from('event_logs').insert({
            entity_type: 'subscription',
            entity_id: agencyId,
            action: 'plan_activated',
            status: 'success',
            payload: { agencyId, newPlan, started_at: updatePayload.plan_started_at, expires_at: updatePayload.plan_expires_at },
        })
    },

    // ═══════════════════════════════════════════════════════════════════
    // GESTION DES UTILISATEURS PLATEFORME
    // ═══════════════════════════════════════════════════════════════════

    async getAllUsers(): Promise<PlatformUser[]> {
        await RbacService.requireRole(['super_admin'])
        const supabase = createAdminClient()

        const { data: { users } } = await supabase.auth.admin.listUsers()
        const { data: roles } = await supabase.from('user_roles').select('user_id, agency_id, role')
        const { data: agencies } = await supabase.from('agencies').select('id, name')

        const agencyMap = new Map((agencies ?? []).map(a => [a.id, a.name]))
        const roleMap = new Map((roles ?? []).map(r => [r.user_id, r]))

        return users.map(u => {
            const r = roleMap.get(u.id)
            return {
                id: u.id,
                email: u.email ?? '',
                created_at: u.created_at,
                last_sign_in_at: u.last_sign_in_at ?? null,
                agency_id: r?.agency_id ?? null,
                agency_name: r?.agency_id ? agencyMap.get(r.agency_id) ?? null : null,
                role: (r?.role as AppRole) ?? 'user',
            }
        }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    },

    async deleteUser(userId: string): Promise<void> {
        await RbacService.requireRole(['super_admin'])
        const supabase = createAdminClient()

        // Supprimer le rôle
        await supabase.from('user_roles').delete().eq('user_id', userId)
        // Supprimer l'utilisateur auth
        const { error } = await supabase.auth.admin.deleteUser(userId)
        if (error) throw new Error(error.message)

        await supabase.from('event_logs').insert({
            entity_type: 'user',
            entity_id: userId,
            action: 'deleted_by_super_admin',
            status: 'success',
            payload: { userId },
        })
    },

    async changeUserRole(userId: string, newRole: AppRole): Promise<void> {
        await RbacService.requireRole(['super_admin'])
        const supabase = createAdminClient()

        const { error } = await supabase
            .from('user_roles')
            .update({ role: newRole })
            .eq('user_id', userId)

        if (error) throw new Error(error.message)

        await supabase.from('event_logs').insert({
            entity_type: 'user',
            entity_id: userId,
            action: 'role_changed',
            status: 'success',
            payload: { userId, newRole },
        })
    },

    // ═══════════════════════════════════════════════════════════════════
    // DÉTAIL D'UNE AGENCE
    // ═══════════════════════════════════════════════════════════════════

    async getAgencyDetail(agencyId: string): Promise<AgencyDetail | null> {
        await RbacService.requireRole(['super_admin'])
        const supabase = createAdminClient()

        const { data: agency } = await supabase
            .from('agencies')
            .select('*')
            .eq('id', agencyId)
            .maybeSingle()

        if (!agency) return null

        // Utilisateurs
        const { data: roles } = await supabase
            .from('user_roles')
            .select('user_id, role, created_at')
            .eq('agency_id', agencyId)

        const { data: { users: authUsers } } = await supabase.auth.admin.listUsers()
        const emailMap = new Map(authUsers.map(u => [u.id, u.email ?? '']))

        const users = (roles ?? []).map(r => ({
            user_id: r.user_id,
            email: emailMap.get(r.user_id) ?? 'Inconnu',
            role: r.role as AppRole,
            created_at: r.created_at,
        }))

        // Compteurs
        const [invoiceRes, quoteRes, clientRes, revenueRes] = await Promise.all([
            supabase.from('invoices').select('*', { count: 'exact', head: true }).eq('agency_id', agencyId),
            supabase.from('quotes').select('*', { count: 'exact', head: true }).eq('agency_id', agencyId),
            supabase.from('clients').select('*', { count: 'exact', head: true }).eq('agency_id', agencyId),
            supabase.from('invoices').select('total_amount').eq('agency_id', agencyId).eq('status', 'paid'),
        ])

        const totalRevenue = (revenueRes.data ?? []).reduce((s, i) => s + Number(i.total_amount), 0)

        return {
            id: agency.id,
            name: agency.name,
            plan: agency.plan ?? 'free',
            created_at: agency.created_at,
            ninea: agency.ninea ?? null,
            rccm: agency.rccm ?? null,
            email: agency.email ?? null,
            phone: agency.phone ?? null,
            address: agency.address ?? null,
            plan_started_at: agency.plan_started_at ?? null,
            plan_expires_at: agency.plan_expires_at ?? null,
            is_suspended: agency.is_suspended ?? false,
            users,
            invoiceCount: invoiceRes.count ?? 0,
            quoteCount: quoteRes.count ?? 0,
            clientCount: clientRes.count ?? 0,
            totalRevenue,
        }
    },

    // ═══════════════════════════════════════════════════════════════════
    // SUSPENSION / RÉACTIVATION D'AGENCE
    // ═══════════════════════════════════════════════════════════════════

    async suspendAgency(agencyId: string): Promise<void> {
        await RbacService.requireRole(['super_admin'])
        const supabase = createAdminClient()

        const { error } = await supabase
            .from('agencies')
            .update({ is_suspended: true, plan: 'free', plan_started_at: null, plan_expires_at: null })
            .eq('id', agencyId)

        if (error) throw new Error(error.message)

        await supabase.from('event_logs').insert({
            entity_type: 'agency',
            entity_id: agencyId,
            action: 'suspended',
            status: 'success',
            payload: { agencyId },
        })
    },

    async reactivateAgency(agencyId: string): Promise<void> {
        await RbacService.requireRole(['super_admin'])
        const supabase = createAdminClient()

        const { error } = await supabase
            .from('agencies')
            .update({ is_suspended: false })
            .eq('id', agencyId)

        if (error) throw new Error(error.message)

        await supabase.from('event_logs').insert({
            entity_type: 'agency',
            entity_id: agencyId,
            action: 'reactivated',
            status: 'success',
            payload: { agencyId },
        })
    },

    async deleteAgency(agencyId: string): Promise<void> {
        await RbacService.requireRole(['super_admin'])
        const supabase = createAdminClient()

        // Supprimer dans l'ordre des dépendances
        await supabase.from('page_views').delete().eq('agency_id', agencyId)
        await supabase.from('event_logs').delete().eq('agency_id', agencyId)
        await supabase.from('payments').delete().eq('agency_id', agencyId)
        await supabase.from('invoices').delete().eq('agency_id', agencyId)
        await supabase.from('quotes').delete().eq('agency_id', agencyId)
        await supabase.from('clients').delete().eq('agency_id', agencyId)

        // Supprimer les users de l'agence
        const { data: roles } = await supabase
            .from('user_roles')
            .select('user_id')
            .eq('agency_id', agencyId)

        await supabase.from('user_roles').delete().eq('agency_id', agencyId)

        for (const r of roles ?? []) {
            // Seulement si l'user n'est pas le super admin lui-même
            const { data: otherRoles } = await supabase
                .from('user_roles')
                .select('user_id')
                .eq('user_id', r.user_id)
            if (!otherRoles?.length) {
                await supabase.auth.admin.deleteUser(r.user_id)
            }
        }

        await supabase.from('agencies').delete().eq('id', agencyId)
    },

    // ═══════════════════════════════════════════════════════════════════
    // SUPPORT TECHNIQUE
    // ═══════════════════════════════════════════════════════════════════

    async getSupportTickets(): Promise<SupportTicket[]> {
        await RbacService.requireRole(['super_admin'])
        const supabase = createAdminClient()

        const { data, error } = await supabase
            .from('support_tickets')
            .select('*, agencies(name)')
            .order('created_at', { ascending: false })

        if (error) {
            // Table n'existe peut-être pas encore
            console.error('support_tickets error:', error.message)
            return []
        }

        return (data ?? []).map(t => ({
            id: t.id,
            created_at: t.created_at,
            agency_id: t.agency_id,
            agency_name: t.agencies?.name ?? null,
            user_email: t.user_email ?? null,
            subject: t.subject,
            message: t.message,
            status: t.status ?? 'open',
            priority: t.priority ?? 'medium',
            admin_notes: t.admin_notes ?? null,
        }))
    },

    async updateTicketStatus(ticketId: string, status: string, adminNotes?: string): Promise<void> {
        await RbacService.requireRole(['super_admin'])
        const supabase = createAdminClient()

        const payload: Record<string, any> = { status }
        if (adminNotes !== undefined) payload.admin_notes = adminNotes

        const { error } = await supabase
            .from('support_tickets')
            .update(payload)
            .eq('id', ticketId)

        if (error) throw new Error(error.message)
    },

    // ═══════════════════════════════════════════════════════════════════
    // STATISTIQUES AVANCÉES 
    // ═══════════════════════════════════════════════════════════════════

    async getPlatformStats() {
        await RbacService.requireRole(['super_admin'])
        const supabase = createAdminClient()

        const [invoices, quotes, clients, payments] = await Promise.all([
            supabase.from('invoices').select('status, total_amount, created_at'),
            supabase.from('quotes').select('status, created_at'),
            supabase.from('clients').select('created_at'),
            supabase.from('payments').select('status, amount, created_at'),
        ])

        const allInvoices = invoices.data ?? []
        const allQuotes = quotes.data ?? []
        const allClients = clients.data ?? []
        const allPayments = payments.data ?? []

        // Stats factures
        const invoicesByStatus: Record<string, number> = {}
        for (const inv of allInvoices) {
            const s = inv.status ?? 'draft'
            invoicesByStatus[s] = (invoicesByStatus[s] ?? 0) + 1
        }

        // Stats devis
        const quotesByStatus: Record<string, number> = {}
        for (const q of allQuotes) {
            const s = q.status ?? 'draft'
            quotesByStatus[s] = (quotesByStatus[s] ?? 0) + 1
        }

        // Volume de paiement traité
        const successfulPayments = allPayments
            .filter(p => p.status === 'success' || p.status === 'completed')
            .reduce((sum, p) => sum + Number(p.amount ?? 0), 0)

        // Croissance clients sur 30 jours
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        const newClientsThisMonth = allClients.filter(c => new Date(c.created_at) >= thirtyDaysAgo).length

        return {
            totalInvoices: allInvoices.length,
            invoicesByStatus,
            totalQuotes: allQuotes.length,
            quotesByStatus,
            totalClients: allClients.length,
            newClientsThisMonth,
            totalPaymentVolume: successfulPayments,
            totalPayments: allPayments.length,
        }
    },
}
