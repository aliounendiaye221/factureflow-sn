import { SuperAdminService } from '@/services/superAdminService'
import {
    TrendingUp, Building2, CreditCard, Crown, FileSpreadsheet, FileText,
    Users, AlertTriangle, CheckCircle2, Clock, UserPlus
} from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

function formatXOF(amount: number) {
    return new Intl.NumberFormat('fr-SN', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(amount)
}

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('fr-SN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default async function SuperAdminOverview() {
    const [kpis, subStats, platformStats, logs] = await Promise.all([
        SuperAdminService.getGlobalKPIs(),
        SuperAdminService.getSubscriptionStats(),
        SuperAdminService.getPlatformStats(),
        SuperAdminService.getEventLogs(20),
    ])

    return (
        <div className="space-y-8">
            {/* ═══ KPIs PRINCIPAUX ═══ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard label="Agences" value={String(kpis.totalAgencies)} sub={<><span className="text-blue-600">+{kpis.recentSignups}</span> cette semaine</>} icon={<Building2 className="w-5 h-5" />} iconBg="bg-blue-50 text-blue-600" />
                <KpiCard label="CA Global" value={formatXOF(kpis.totalRevenue)} sub="Toutes factures payées" icon={<TrendingUp className="w-5 h-5" />} iconBg="bg-green-50 text-green-600" />
                <KpiCard label="Abonnés Payants" value={String(subStats.activeSubscriptions)} sub={subStats.expiringSoon > 0 ? <><span className="text-amber-600">{subStats.expiringSoon}</span> expirent bientôt</> : 'Pro + Agency'} icon={<Crown className="w-5 h-5" />} iconBg="bg-amber-50 text-amber-600" />
                <KpiCard label="MRR" value={formatXOF(subStats.mrr)} sub="Revenu mensuel récurrent" icon={<CreditCard className="w-5 h-5" />} iconBg="bg-purple-50 text-purple-600" />
            </div>

            {/* ═══ STATS PLATEFORME ═══ */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <StatMini label="Factures" value={platformStats.totalInvoices} icon={<FileSpreadsheet className="w-4 h-4" />} />
                <StatMini label="Devis" value={platformStats.totalQuotes} icon={<FileText className="w-4 h-4" />} />
                <StatMini label="Clients" value={platformStats.totalClients} icon={<Users className="w-4 h-4" />} />
                <StatMini label="Nvx clients/mois" value={platformStats.newClientsThisMonth} icon={<UserPlus className="w-4 h-4" />} />
                <StatMini label="Payées" value={platformStats.invoicesByStatus['paid'] ?? 0} icon={<CheckCircle2 className="w-4 h-4 text-green-500" />} />
                <StatMini label="En attente" value={platformStats.invoicesByStatus['sent'] ?? 0} icon={<Clock className="w-4 h-4 text-amber-500" />} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* ═══ RACCOURCIS RAPIDES ═══ */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
                    <h3 className="font-bold text-gray-900">Accès Rapide</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <QuickLink href="/dashboard/super-admin/agencies" label="Gérer les Agences" desc="Voir, suspendre, supprimer" icon={<Building2 className="w-5 h-5" />} color="bg-blue-50 text-blue-600" />
                        <QuickLink href="/dashboard/super-admin/users" label="Utilisateurs" desc="Rôles et comptes" icon={<Users className="w-5 h-5" />} color="bg-purple-50 text-purple-600" />
                        <QuickLink href="/dashboard/super-admin/subscriptions" label="Abonnements" desc="Plans et paiements" icon={<CreditCard className="w-5 h-5" />} color="bg-amber-50 text-amber-600" />
                        <QuickLink href="/dashboard/super-admin/support" label="Support Technique" desc="Tickets et assistance" icon={<AlertTriangle className="w-5 h-5" />} color="bg-red-50 text-red-600" />
                    </div>
                </div>

                {/* ═══ DERNIERS ÉVÉNEMENTS ═══ */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="font-bold text-gray-900">Derniers Événements</h3>
                        <span className="text-xs text-gray-400">20 derniers</span>
                    </div>
                    <div className="space-y-1 max-h-[340px] overflow-y-auto">
                        {logs.length === 0 ? (
                            <p className="text-gray-500 text-sm text-center py-6">Aucun événement.</p>
                        ) : logs.map(log => {
                            const isError = log.status === 'error' || log.status === 'failed'
                            const isSuccess = log.status === 'success'
                            return (
                                <div key={log.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 text-sm">
                                    <div className={`p-1 rounded-full shrink-0 ${isError ? 'bg-red-100 text-red-600' : isSuccess ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                                        {isError ? <AlertTriangle className="w-3 h-3" /> : isSuccess ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-semibold text-gray-900 truncate">{log.entity_type} / {log.action}</p>
                                        <p className="text-[10px] text-gray-500 truncate">{log.agencies?.name ?? 'Système'}</p>
                                    </div>
                                    <span className="text-[10px] text-gray-400 font-mono whitespace-nowrap">{formatDate(log.created_at)}</span>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}

function KpiCard({ label, value, sub, icon, iconBg }: { label: string; value: string; sub: React.ReactNode; icon: React.ReactNode; iconBg: string }) {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col justify-between">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900">{value}</h3>
                </div>
                <div className={`p-2.5 rounded-xl ${iconBg}`}>{icon}</div>
            </div>
            <p className="text-xs text-gray-500 mt-3 font-medium">{sub}</p>
        </div>
    )
}

function StatMini({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
    return (
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 text-gray-400 mb-1">{icon}</div>
            <p className="text-xl font-bold text-gray-900">{value}</p>
            <p className="text-[10px] text-gray-500 font-medium mt-0.5">{label}</p>
        </div>
    )
}

function QuickLink({ href, label, desc, icon, color }: { href: string; label: string; desc: string; icon: React.ReactNode; color: string }) {
    return (
        <Link href={href} className="p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all group">
            <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center mb-3 group-hover:scale-105 transition-transform`}>{icon}</div>
            <p className="text-sm font-bold text-gray-900">{label}</p>
            <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
        </Link>
    )
}
