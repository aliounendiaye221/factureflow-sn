import { createAdminClient } from '@/lib/supabase/admin'
import { RbacService } from './rbacService'

export type AgencyStats = {
    id: string
    name: string
    plan: string
    created_at: string
    ninea: string | null
    rccm: string | null
    user_count: number
    total_revenue: number
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
                total_revenue: agencyRevenue
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
     * Change le plan d'abonnement d'une agence (après validation paiement Wave)
     */
    async updateAgencyPlan(agencyId: string, newPlan: string): Promise<void> {
        await RbacService.requireRole(['super_admin'])
        const supabase = createAdminClient()

        const { error } = await supabase
            .from('agencies')
            .update({ plan: newPlan })
            .eq('id', agencyId)

        if (error) throw new Error(error.message)

        // Journaliser l'activation
        await supabase.from('event_logs').insert({
            entity_type: 'subscription',
            entity_id: agencyId,
            action: 'plan_activated',
            status: 'success',
            payload: { agencyId, newPlan },
        })
    }
}
