import { SuperAdminService } from '@/services/superAdminService'
import { Users, ShieldCheck, ShieldAlert, UserCog } from 'lucide-react'
import UserRow from './UserRow'

export const dynamic = 'force-dynamic'

export default async function UsersPage() {
    const users = await SuperAdminService.getAllUsers()

    const roleCounts = users.reduce((acc, u) => {
        acc[u.role] = (acc[u.role] || 0) + 1
        return acc
    }, {} as Record<string, number>)

    const roleCards = [
        { label: 'Super Admin', key: 'super_admin', icon: ShieldAlert, color: 'text-red-600 bg-red-50' },
        { label: 'Admin', key: 'admin', icon: ShieldCheck, color: 'text-blue-600 bg-blue-50' },
        { label: 'Utilisateur', key: 'user', icon: Users, color: 'text-green-600 bg-green-50' },
        { label: 'Viewer', key: 'viewer', icon: UserCog, color: 'text-gray-600 bg-gray-50' },
    ]

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-xl font-bold text-gray-900">Gestion des Utilisateurs</h3>
                <p className="text-sm text-gray-500">{users.length} utilisateur{users.length > 1 ? 's' : ''} inscrits sur la plateforme</p>
            </div>

            {/* Role counters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {roleCards.map(r => (
                    <div key={r.key} className={`rounded-xl p-3 flex items-center gap-3 ${r.color}`}>
                        <r.icon className="w-5 h-5" />
                        <div>
                            <p className="text-lg font-bold">{roleCounts[r.key] ?? 0}</p>
                            <p className="text-[11px] font-medium opacity-80">{r.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-4 sm:px-6 py-4 text-left font-semibold text-gray-600">Email</th>
                                <th className="px-4 sm:px-6 py-4 text-left font-semibold text-gray-600">Agence</th>
                                <th className="px-4 sm:px-6 py-4 text-center font-semibold text-gray-600">Rôle</th>
                                <th className="px-4 sm:px-6 py-4 text-left font-semibold text-gray-600 hidden md:table-cell">Dernière connexion</th>
                                <th className="px-4 sm:px-6 py-4 text-right font-semibold text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {users.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">Aucun utilisateur.</td>
                                </tr>
                            ) : users.map(user => (
                                <UserRow key={user.id} user={user} />
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
