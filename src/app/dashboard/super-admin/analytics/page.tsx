import { SuperAdminService } from '@/services/superAdminService'
import { BarChart3, Eye, Globe, TrendingUp, Building2, FileText } from 'lucide-react'

export const dynamic = 'force-dynamic'

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('fr-SN', { day: '2-digit', month: 'short' })
}

export default async function AnalyticsPage() {
    const [viewStats, platformStats, agencies] = await Promise.all([
        SuperAdminService.getPageViewStats(),
        SuperAdminService.getPlatformStats(),
        SuperAdminService.getAgenciesStats(),
    ])

    const { daily, topPages, activeAgencies, totalViews } = viewStats
    const maxViews = Math.max(...daily.map(d => d.count), 1)

    // Top agencies by revenue
    const topAgencies = [...agencies].sort((a, b) => b.total_revenue - a.total_revenue).slice(0, 10)

    // Invoices status summary
    const statusLabels: Record<string, string> = {
        draft: 'Brouillon',
        sent: 'Envoyée',
        paid: 'Payée',
        overdue: 'En retard',
        cancelled: 'Annulée',
    }
    const statusColors: Record<string, string> = {
        draft: 'bg-gray-200',
        sent: 'bg-blue-400',
        paid: 'bg-green-500',
        overdue: 'bg-red-500',
        cancelled: 'bg-gray-400',
    }

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-xl font-bold text-gray-900">Analytiques Plateforme</h3>
                <p className="text-sm text-gray-500">Aperçu de l&apos;activité sur les 30 derniers jours</p>
            </div>

            {/* ═══ OVERVIEW CARDS ═══ */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                    <div className="flex items-center gap-2 text-gray-500 mb-2"><Eye className="w-4 h-4" /><span className="text-xs font-medium">Visites (30j)</span></div>
                    <p className="text-2xl font-bold text-gray-900">{totalViews.toLocaleString('fr-SN')}</p>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                    <div className="flex items-center gap-2 text-gray-500 mb-2"><FileText className="w-4 h-4" /><span className="text-xs font-medium">Factures</span></div>
                    <p className="text-2xl font-bold text-gray-900">{platformStats.totalInvoices.toLocaleString('fr-SN')}</p>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                    <div className="flex items-center gap-2 text-gray-500 mb-2"><Building2 className="w-4 h-4" /><span className="text-xs font-medium">Agences</span></div>
                    <p className="text-2xl font-bold text-gray-900">{agencies.length}</p>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                    <div className="flex items-center gap-2 text-gray-500 mb-2"><TrendingUp className="w-4 h-4" /><span className="text-xs font-medium">Nvx clients/mois</span></div>
                    <p className="text-2xl font-bold text-gray-900">{platformStats.newClientsThisMonth}</p>
                </div>
            </div>

            {/* ═══ GRAPHIQUE DE VISITES ═══ */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-gray-900 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-blue-600" /> Visites Quotidiennes</h4>
                    <span className="text-xs text-gray-400">{daily.length} jours</span>
                </div>
                {daily.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-8">Aucune donnée de visite disponible.</p>
                ) : (
                    <div className="flex items-end gap-[2px] sm:gap-1 h-48 overflow-x-auto pb-8 relative">
                        {daily.map((day, i) => {
                            const height = Math.max((day.count / maxViews) * 100, 2)
                            return (
                                <div key={i} className="flex flex-col items-center flex-1 min-w-[12px] max-w-[30px] group relative">
                                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                        {day.count} visite{day.count > 1 ? 's' : ''}
                                    </div>
                                    <div
                                        className="w-full bg-blue-500 hover:bg-blue-600 rounded-t-sm transition-all cursor-pointer"
                                        style={{ height: `${height}%` }}
                                    />
                                    {i % 7 === 0 && (
                                        <span className="text-[9px] text-gray-400 mt-1 absolute -bottom-6 whitespace-nowrap">
                                            {formatDate(day.date)}
                                        </span>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* ═══ TOP PAGES ═══ */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <h4 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
                        <Globe className="w-5 h-5 text-purple-600" /> Pages les Plus Visitées
                    </h4>
                    {topPages.length === 0 ? (
                        <p className="text-gray-500 text-sm text-center py-6">Aucune donnée.</p>
                    ) : (
                        <div className="space-y-2">
                            {topPages.map((tp, i) => {
                                const pct = totalViews > 0 ? Math.round((tp.count / totalViews) * 100) : 0
                                return (
                                    <div key={i} className="flex items-center gap-3">
                                        <span className="text-xs font-bold text-gray-400 w-5 text-right">{i + 1}</span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-gray-800 truncate font-medium">{tp.path}</p>
                                            <div className="h-1.5 bg-gray-100 rounded-full mt-1">
                                                <div className="h-full bg-purple-400 rounded-full" style={{ width: `${pct}%` }} />
                                            </div>
                                        </div>
                                        <span className="text-xs font-bold text-gray-600 whitespace-nowrap">{tp.count}</span>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>

                {/* ═══ TOP AGENCES PAR CA ═══ */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <h4 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
                        <Building2 className="w-5 h-5 text-amber-600" /> Top Agences par CA
                    </h4>
                    {topAgencies.length === 0 ? (
                        <p className="text-gray-500 text-sm text-center py-6">Aucune agence.</p>
                    ) : (
                        <div className="space-y-2">
                            {topAgencies.map((agency, i) => {
                                const maxRev = topAgencies[0]?.total_revenue || 1
                                const pct = Math.round((agency.total_revenue / maxRev) * 100)
                                return (
                                    <div key={agency.id} className="flex items-center gap-3">
                                        <span className="text-xs font-bold text-gray-400 w-5 text-right">{i + 1}</span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-gray-800 truncate font-medium">{agency.name}</p>
                                            <div className="h-1.5 bg-gray-100 rounded-full mt-1">
                                                <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                                            </div>
                                        </div>
                                        <span className="text-xs font-bold text-gray-600 whitespace-nowrap">
                                            {new Intl.NumberFormat('fr-SN', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(agency.total_revenue)}
                                        </span>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* ═══ RÉPARTITION FACTURES PAR STATUT ═══ */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h4 className="font-bold text-gray-900 mb-4">Répartition des Factures par Statut</h4>
                <div className="flex flex-wrap gap-3">
                    {Object.entries(platformStats.invoicesByStatus).map(([status, count]) => (
                        <div key={status} className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-2.5">
                            <div className={`w-3 h-3 rounded-full ${statusColors[status] ?? 'bg-gray-300'}`} />
                            <span className="text-sm font-bold text-gray-900">{count}</span>
                            <span className="text-xs text-gray-500">{statusLabels[status] ?? status}</span>
                        </div>
                    ))}
                </div>
                {platformStats.totalInvoices > 0 && (
                    <div className="mt-4 h-3 flex rounded-full overflow-hidden bg-gray-100">
                        {Object.entries(platformStats.invoicesByStatus).map(([status, count]) => {
                            const pct = (count / platformStats.totalInvoices) * 100
                            if (pct < 0.5) return null
                            return (
                                <div
                                    key={status}
                                    className={`${statusColors[status] ?? 'bg-gray-300'} transition-all`}
                                    style={{ width: `${pct}%` }}
                                    title={`${statusLabels[status] ?? status}: ${count}`}
                                />
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
