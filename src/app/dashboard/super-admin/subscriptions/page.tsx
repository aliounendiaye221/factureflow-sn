import { SuperAdminService } from '@/services/superAdminService'
import { PLANS, type PlanId } from '@/lib/plans'
import {
    CreditCard, Crown, TrendingUp, Smartphone, CheckCircle2,
    Clock, AlertTriangle
} from 'lucide-react'
import PlanSelector from '../PlanSelector'

export const dynamic = 'force-dynamic'

function formatXOF(amount: number) {
    return new Intl.NumberFormat('fr-SN', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(amount)
}

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('fr-SN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default async function SubscriptionsPage() {
    const [subStats, agencies, logs] = await Promise.all([
        SuperAdminService.getSubscriptionStats(),
        SuperAdminService.getAgenciesStats(),
        SuperAdminService.getEventLogs(50),
    ])

    const subscriptionLogs = logs.filter(l =>
        l.entity_type === 'subscription' || l.action?.toLowerCase().includes('plan') || l.action?.toLowerCase().includes('abonn')
    )

    const planDistribution = agencies.reduce((acc, a) => {
        acc[a.plan] = (acc[a.plan] || 0) + 1
        return acc
    }, {} as Record<string, number>)

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-xl font-bold text-gray-900">Gestion des Abonnements</h3>
                <p className="text-sm text-gray-500">Suivi des plans, paiements et revenus récurrents</p>
            </div>

            {/* ═══ STATS D'ABONNEMENT ═══ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs font-medium text-gray-500 mb-1">Abonnés Payants</p>
                            <h3 className="text-2xl font-bold text-gray-900">{subStats.activeSubscriptions}</h3>
                        </div>
                        <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600"><Crown className="w-5 h-5" /></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-3">Pro + Agency</p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs font-medium text-gray-500 mb-1">MRR</p>
                            <h3 className="text-2xl font-bold text-gray-900">{formatXOF(subStats.mrr)}</h3>
                        </div>
                        <div className="p-2.5 rounded-xl bg-green-50 text-green-600"><TrendingUp className="w-5 h-5" /></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-3">Revenu mensuel récurrent</p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs font-medium text-gray-500 mb-1">Expirent bientôt</p>
                            <h3 className="text-2xl font-bold text-amber-600">{subStats.expiringSoon}</h3>
                        </div>
                        <div className="p-2.5 rounded-xl bg-red-50 text-red-600"><AlertTriangle className="w-5 h-5" /></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-3">Dans les 7 prochains jours</p>
                </div>

                <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl shadow-sm p-5 text-white">
                    <div className="flex items-center gap-3 mb-3">
                        <Smartphone className="w-5 h-5" />
                        <p className="text-xs font-bold opacity-90">DÉPÔT POUR ABONNEMENT</p>
                    </div>
                    <p className="text-2xl font-black tracking-wider">70 583 91 55</p>
                    <p className="text-xs opacity-75 mt-2">Orange Money / Wave / Free Money</p>
                </div>
            </div>

            {/* ═══ DISTRIBUTION DES PLANS ═══ */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h4 className="font-bold text-gray-900 mb-4">Distribution des Plans</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {Object.entries(PLANS).map(([key, plan]) => {
                        const count = planDistribution[key] ?? 0
                        const pct = agencies.length > 0 ? Math.round((count / agencies.length) * 100) : 0
                        const colors: Record<string, string> = {
                            free: 'bg-gray-50 border-gray-200',
                            pro: 'bg-blue-50 border-blue-200',
                            agency: 'bg-amber-50 border-amber-200',
                        }
                        const barColors: Record<string, string> = {
                            free: 'bg-gray-400',
                            pro: 'bg-blue-500',
                            agency: 'bg-amber-500',
                        }
                        return (
                            <div key={key} className={`rounded-xl border p-4 ${colors[key] ?? 'bg-gray-50 border-gray-200'}`}>
                                <div className="flex justify-between items-center mb-2">
                                    <p className="font-bold text-sm">{plan.name}</p>
                                    <span className="text-xs text-gray-500">{plan.price > 0 ? formatXOF(plan.price) + '/mois' : 'Gratuit'}</span>
                                </div>
                                <p className="text-3xl font-black">{count}</p>
                                <div className="mt-2 h-2 bg-white/60 rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full transition-all ${barColors[key] ?? 'bg-gray-400'}`} style={{ width: `${pct}%` }} />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">{pct}% des agences</p>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* ═══ TOUTES LES AGENCES AVEC PLAN SELECTOR ═══ */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h4 className="font-bold text-gray-900">Abonnements par Agence</h4>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-4 sm:px-6 py-3 text-left font-semibold text-gray-600">Agence</th>
                                <th className="px-4 sm:px-6 py-3 text-left font-semibold text-gray-600">Plan Actuel</th>
                                <th className="px-4 sm:px-6 py-3 text-right font-semibold text-gray-600 hidden sm:table-cell">CA</th>
                                <th className="px-4 sm:px-6 py-3 text-center font-semibold text-gray-600 hidden md:table-cell">Users</th>
                                <th className="px-4 sm:px-6 py-3 text-left font-semibold text-gray-600 hidden lg:table-cell">Inscrit le</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {agencies.map(agency => (
                                <tr key={agency.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-4 sm:px-6 py-3 font-medium text-gray-900">{agency.name}</td>
                                    <td className="px-4 sm:px-6 py-3">
                                        <PlanSelector agencyId={agency.id} currentPlan={agency.plan} />
                                    </td>
                                    <td className="px-4 sm:px-6 py-3 text-right font-bold text-gray-900 hidden sm:table-cell">
                                        {formatXOF(agency.total_revenue)}
                                    </td>
                                    <td className="px-4 sm:px-6 py-3 text-center hidden md:table-cell">
                                        <span className="px-2 py-0.5 bg-gray-100 rounded-full text-xs font-medium">{agency.user_count}</span>
                                    </td>
                                    <td className="px-4 sm:px-6 py-3 text-xs text-gray-500 hidden lg:table-cell">
                                        {formatDate(agency.created_at)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ═══ HISTORIQUE DES ACTIVATIONS ═══ */}
            {subscriptionLogs.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <h4 className="font-bold text-gray-900 mb-4">Historique des Activations</h4>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                        {subscriptionLogs.map(log => (
                            <div key={log.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 text-sm">
                                <div className={`p-1 rounded-full shrink-0 ${log.status === 'success' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                                    {log.status === 'success' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold text-gray-900 truncate">{log.action}</p>
                                    <p className="text-[10px] text-gray-500">{log.agencies?.name ?? 'Système'}</p>
                                </div>
                                <span className="text-[10px] text-gray-400 font-mono whitespace-nowrap">{formatDate(log.created_at)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
