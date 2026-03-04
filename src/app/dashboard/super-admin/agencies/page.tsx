import { SuperAdminService } from '@/services/superAdminService'
import { PLANS, type PlanId } from '@/lib/plans'
import { Building2, Ban, RotateCcw, Trash2, ExternalLink } from 'lucide-react'
import PlanSelector from '../PlanSelector'
import AgencyActions from './AgencyActions'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

function formatXOF(amount: number) {
    return new Intl.NumberFormat('fr-SN', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(amount)
}

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('fr-SN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default async function AgenciesPage() {
    const agencies = await SuperAdminService.getAgenciesStats()

    const suspended = agencies.filter(a => a.is_suspended)
    const active = agencies.filter(a => !a.is_suspended)

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h3 className="text-xl font-bold text-gray-900">Gestion des Agences</h3>
                    <p className="text-sm text-gray-500">{agencies.length} agence{agencies.length > 1 ? 's' : ''} inscrites — {suspended.length} suspendue{suspended.length > 1 ? 's' : ''}</p>
                </div>
            </div>

            {/* Agences suspendues en premier */}
            {suspended.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 space-y-3">
                    <h4 className="font-bold text-red-800 flex items-center gap-2">
                        <Ban className="w-4 h-4" />
                        Agences Suspendues ({suspended.length})
                    </h4>
                    {suspended.map(agency => (
                        <div key={agency.id} className="bg-white rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3 border border-red-100">
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-gray-900">{agency.name}</p>
                                <p className="text-xs text-gray-500 font-mono">ID: {agency.id.substring(0, 12)}...</p>
                            </div>
                            <AgencyActions agencyId={agency.id} isSuspended={true} agencyName={agency.name} />
                        </div>
                    ))}
                </div>
            )}

            {/* Tableau principal des agences actives */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-4 sm:px-6 py-4 text-left font-semibold text-gray-600">Agence</th>
                                <th className="px-4 sm:px-6 py-4 text-left font-semibold text-gray-600">Plan</th>
                                <th className="px-4 sm:px-6 py-4 text-left font-semibold text-gray-600 hidden md:table-cell">Contact</th>
                                <th className="px-4 sm:px-6 py-4 text-center font-semibold text-gray-600">Users</th>
                                <th className="px-4 sm:px-6 py-4 text-right font-semibold text-gray-600 hidden sm:table-cell">CA</th>
                                <th className="px-4 sm:px-6 py-4 text-right font-semibold text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {active.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">Aucune agence active.</td>
                                </tr>
                            ) : active.map(agency => (
                                <tr key={agency.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                        <Link href={`/dashboard/super-admin/agencies/${agency.id}`} className="group">
                                            <p className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors flex items-center gap-1">
                                                {agency.name}
                                                <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </p>
                                            <p className="text-xs text-gray-500 mt-0.5">Depuis {formatDate(agency.created_at)}</p>
                                        </Link>
                                    </td>
                                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                        <PlanSelector agencyId={agency.id} currentPlan={agency.plan} />
                                    </td>
                                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap hidden md:table-cell">
                                        <p className="text-xs text-gray-600">{agency.email ?? '—'}</p>
                                        <p className="text-xs text-gray-500">{agency.phone ?? ''}</p>
                                    </td>
                                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-center">
                                        <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 font-medium text-xs">
                                            {agency.user_count}
                                        </span>
                                    </td>
                                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right font-bold text-gray-900 hidden sm:table-cell">
                                        {formatXOF(agency.total_revenue)}
                                    </td>
                                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right">
                                        <AgencyActions agencyId={agency.id} isSuspended={false} agencyName={agency.name} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
