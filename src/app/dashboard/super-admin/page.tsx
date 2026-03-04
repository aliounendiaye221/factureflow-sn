import { SuperAdminService } from '@/services/superAdminService'
import { RbacService } from '@/services/rbacService'
import { ShieldAlert, TrendingUp, Users, Building2, AlertTriangle, CheckCircle2, Clock } from 'lucide-react'
import PlanSelector from './PlanSelector'

export const dynamic = 'force-dynamic'

function formatXOF(amount: number) {
    return new Intl.NumberFormat('fr-SN', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(amount)
}

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('fr-SN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default async function SuperAdminPage() {
    await RbacService.requireRole(['super_admin'])

    const [kpis, agencies, logs] = await Promise.all([
        SuperAdminService.getGlobalKPIs(),
        SuperAdminService.getAgenciesStats(),
        SuperAdminService.getEventLogs(50) // On limite aux 50 derniers pour l'affichage
    ])

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-slate-900 text-white rounded-lg">
                    <ShieldAlert className="w-8 h-8" />
                </div>
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Super Administration</h2>
                    <p className="text-gray-500">Vue globale de la plateforme FactureFlow SN</p>
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">Total Agences</p>
                            <h3 className="text-3xl font-bold text-gray-900">{kpis.totalAgencies}</h3>
                        </div>
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                            <Building2 className="w-6 h-6" />
                        </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-4 flex items-center gap-1.5 font-medium">
                        <span className="text-blue-600">+{kpis.recentSignups}</span> cette semaine
                    </p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">Volume Traité (CA Global)</p>
                            <h3 className="text-3xl font-bold text-gray-900">{formatXOF(kpis.totalRevenue)}</h3>
                        </div>
                        <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-4">Toutes factures payées confondues</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Liste des Agences (Prend 2 colonnes sur grand écran) */}
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-gray-400" />
                        Agences Inscrites
                    </h3>
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 text-sm">
                                <thead className="bg-gray-50/50">
                                    <tr>
                                        <th className="px-6 py-4 text-left font-semibold text-gray-600">Nom de l'agence</th>
                                        <th className="px-6 py-4 text-left font-semibold text-gray-600">Date d'inscription</th>
                                        <th className="px-6 py-4 text-left font-semibold text-gray-600">Plan</th>
                                        <th className="px-6 py-4 text-center font-semibold text-gray-600">Utilisateurs</th>
                                        <th className="px-6 py-4 text-right font-semibold text-gray-600">CA Facturé</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {agencies.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-8 text-center text-gray-500">Aucune agence trouvée.</td>
                                        </tr>
                                    ) : (
                                        agencies.map(agency => (
                                            <tr key={agency.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <p className="font-bold text-gray-900">{agency.name}</p>
                                                    <p className="text-xs text-gray-500 font-mono mt-0.5">ID: {agency.id.substring(0, 8)}...</p>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                                                    {new Date(agency.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <PlanSelector agencyId={agency.id} currentPlan={agency.plan} />
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 font-medium text-xs">
                                                        {agency.user_count}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-gray-900">
                                                    {formatXOF(agency.total_revenue)}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Logs d'activité récents */}
                <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-gray-400" />
                        Derniers Événements
                    </h3>
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden h-[600px] flex flex-col">
                        <div className="overflow-y-auto p-2">
                            {logs.length === 0 ? (
                                <div className="p-8 text-center text-gray-500 text-sm">Aucun événement récent.</div>
                            ) : (
                                <div className="space-y-1">
                                    {logs.map(log => {
                                        const isError = log.status === 'error' || log.status === 'failed'
                                        const isSuccess = log.status === 'success'
                                        return (
                                            <div key={log.id} className="p-4 rounded-xl hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 border-transparent">
                                                <div className="flex items-start gap-3">
                                                    <div className={`mt-0.5 p-1.5 rounded-full shrink-0 ${isError ? 'bg-red-100 text-red-600' : isSuccess ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                                                        {isError ? <AlertTriangle className="w-3.5 h-3.5" /> : isSuccess ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex justify-between items-baseline gap-2 mb-1">
                                                            <p className="text-sm font-semibold text-gray-900 truncate">
                                                                {log.entity_type} / {log.action}
                                                            </p>
                                                            <span className="text-[10px] text-gray-400 font-mono whitespace-nowrap">
                                                                {formatDate(log.created_at)}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-gray-500 truncate mb-1">
                                                            {log.agencies?.name ? <span className="font-medium text-gray-700">{log.agencies.name}</span> : 'Système'}
                                                        </p>
                                                        {isError && (
                                                            <p className="text-xs text-red-600 bg-red-50 p-2 rounded-md font-mono mt-1 break-all line-clamp-2">
                                                                {JSON.stringify(log.payload)}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}
