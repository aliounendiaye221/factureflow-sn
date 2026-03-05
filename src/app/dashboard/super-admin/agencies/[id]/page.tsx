import { SuperAdminService } from '@/services/superAdminService'
import { notFound } from 'next/navigation'
import { Building2, Users, FileSpreadsheet, FileText, UserPlus, CreditCard, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

function formatXOF(amount: number) {
    return new Intl.NumberFormat('fr-SN', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(amount)
}

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('fr-SN', { day: '2-digit', month: 'short', year: 'numeric' })
}

const ROLE_LABELS: Record<string, string> = {
    super_admin: 'Super Admin',
    admin: 'Admin',
    user: 'Utilisateur',
    viewer: 'Viewer',
}

export default async function AgencyDetailPage({ params }: { params: { id: string } }) {
    const agency = await SuperAdminService.getAgencyDetail(params.id)

    if (!agency) notFound()

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Link
                    href="/dashboard/super-admin/agencies"
                    className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                </Link>
                <div>
                    <h3 className="text-xl font-bold text-gray-900">{agency.name}</h3>
                    <p className="text-sm text-gray-500">
                        Inscrite le {formatDate(agency.created_at)} — Plan {agency.plan}
                        {agency.is_suspended && <span className="ml-2 text-red-600 font-semibold">⛔ Suspendue</span>}
                    </p>
                </div>
            </div>

            {/* ═══ INFOS GÉNÉRALES ═══ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Factures" value={agency.invoiceCount} icon={<FileSpreadsheet className="w-4 h-4" />} />
                <StatCard label="Devis" value={agency.quoteCount} icon={<FileText className="w-4 h-4" />} />
                <StatCard label="Clients" value={agency.clientCount} icon={<UserPlus className="w-4 h-4" />} />
                <StatCard label="CA Total" value={formatXOF(agency.totalRevenue)} icon={<CreditCard className="w-4 h-4" />} />
            </div>

            {/* ═══ COORDONNÉES ═══ */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-3">
                <h4 className="font-bold text-gray-900 flex items-center gap-2"><Building2 className="w-5 h-5 text-blue-600" /> Coordonnées</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <Info label="Email" value={agency.email} />
                    <Info label="Téléphone" value={agency.phone} />
                    <Info label="Adresse" value={agency.address} />
                    <Info label="NINEA" value={agency.ninea} />
                    <Info label="RCCM" value={agency.rccm} />
                    <Info label="Plan expire le" value={agency.plan_expires_at ? formatDate(agency.plan_expires_at) : null} />
                </div>
            </div>

            {/* ═══ MEMBRES ═══ */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
                <h4 className="font-bold text-gray-900 flex items-center gap-2"><Users className="w-5 h-5 text-purple-600" /> Membres ({agency.users.length})</h4>
                {agency.users.length === 0 ? (
                    <p className="text-gray-500 text-sm">Aucun membre.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm divide-y divide-gray-100">
                            <thead className="bg-gray-50/50">
                                <tr>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Email</th>
                                    <th className="px-4 py-3 text-center font-semibold text-gray-600">Rôle</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Depuis</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {agency.users.map(u => (
                                    <tr key={u.user_id} className="hover:bg-gray-50/50">
                                        <td className="px-4 py-3 text-gray-900">{u.email}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100">
                                                {ROLE_LABELS[u.role] ?? u.role}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-500">{formatDate(u.created_at)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}

function StatCard({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center gap-2 text-gray-500 mb-2">{icon}<span className="text-xs font-medium">{label}</span></div>
            <p className="text-2xl font-bold text-gray-900">{typeof value === 'number' ? value.toLocaleString('fr-SN') : value}</p>
        </div>
    )
}

function Info({ label, value }: { label: string; value: string | null }) {
    return (
        <div>
            <p className="text-xs text-gray-500">{label}</p>
            <p className="font-medium text-gray-900">{value ?? <span className="text-gray-400 italic">—</span>}</p>
        </div>
    )
}
