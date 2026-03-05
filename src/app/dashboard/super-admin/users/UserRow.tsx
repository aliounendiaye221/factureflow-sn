'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { deleteUserAction, changeUserRoleAction } from '@/app/actions/superAdminActions'
import type { PlatformUser } from '@/services/superAdminService'

const ROLES = ['super_admin', 'admin', 'user', 'viewer'] as const
const ROLE_LABELS: Record<string, string> = {
    super_admin: 'Super Admin',
    admin: 'Admin',
    user: 'Utilisateur',
    viewer: 'Viewer',
}
const ROLE_COLORS: Record<string, string> = {
    super_admin: 'bg-red-100 text-red-800',
    admin: 'bg-blue-100 text-blue-800',
    user: 'bg-green-100 text-green-800',
    viewer: 'bg-gray-100 text-gray-700',
}

function formatDate(iso: string | null) {
    if (!iso) return 'Jamais'
    return new Date(iso).toLocaleDateString('fr-SN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function UserRow({ user }: { user: PlatformUser }) {
    const [loading, setLoading] = useState(false)
    const [msg, setMsg] = useState<string | null>(null)

    async function handleRoleChange(newRole: string) {
        if (newRole === user.role) return
        if (!confirm(`Changer le rôle de ${user.email} en "${ROLE_LABELS[newRole]}" ?`)) return
        setLoading(true)
        setMsg(null)
        const fd = new FormData()
        fd.set('userId', user.id)
        fd.set('role', newRole)
        const result = await changeUserRoleAction({ success: false, message: '' }, fd)
        setMsg(result.message)
        if (result.success) window.location.reload()
        setLoading(false)
    }

    async function handleDelete() {
        if (!confirm(`SUPPRIMER l'utilisateur ${user.email} ? Cette action est irréversible.`)) return
        setLoading(true)
        const result = await deleteUserAction(user.id)
        setMsg(result.message)
        if (result.success) window.location.reload()
        setLoading(false)
    }

    return (
        <tr className="hover:bg-gray-50/50 transition-colors">
            <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                <p className="font-medium text-gray-900 text-xs sm:text-sm">{user.email}</p>
                <p className="text-[10px] text-gray-400 font-mono sm:hidden">{user.agency_name ?? 'Sans agence'}</p>
            </td>
            <td className="px-4 sm:px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                <p className="text-sm text-gray-700">{user.agency_name ?? <span className="text-gray-400 italic">Sans agence</span>}</p>
            </td>
            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-center">
                <select
                    value={user.role}
                    onChange={e => handleRoleChange(e.target.value)}
                    disabled={loading}
                    className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer ${ROLE_COLORS[user.role] ?? 'bg-gray-100'} disabled:opacity-50`}
                >
                    {ROLES.map(r => (
                        <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                    ))}
                </select>
            </td>
            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-xs text-gray-500 hidden md:table-cell">
                {formatDate(user.last_sign_in_at)}
            </td>
            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right">
                <div className="flex items-center justify-end gap-2">
                    {msg && <span className="text-[10px] text-gray-500">{msg}</span>}
                    <button
                        onClick={handleDelete}
                        disabled={loading}
                        className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50 transition-colors"
                        title="Supprimer"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </td>
        </tr>
    )
}
