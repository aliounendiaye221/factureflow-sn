'use client'

import { useState, useTransition } from 'react'
import { removeTeamMemberAction, changeTeamMemberRoleAction } from '@/app/actions/teamActions'
import type { TeamMember } from '@/app/actions/teamActions'
import { ROLE_DEFINITIONS, type AppRole } from '@/lib/roles'
import { Trash2, BadgeCheck } from 'lucide-react'

const EDITABLE_ROLES: AppRole[] = ['admin', 'user', 'viewer']

export default function TeamMemberRow({ member }: { member: TeamMember }) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const roleDef = ROLE_DEFINITIONS[member.role]

  const handleRoleChange = (newRole: AppRole) => {
    setError(null)
    startTransition(async () => {
      const res = await changeTeamMemberRoleAction(member.user_id, newRole)
      if (res.error) setError(res.error)
    })
  }

  const handleRemove = () => {
    if (!confirm(`Retirer ${member.email} de l'équipe ?`)) return
    setError(null)
    startTransition(async () => {
      const res = await removeTeamMemberAction(member.user_id)
      if (res.error) setError(res.error)
    })
  }

  return (
    <li className="px-6 py-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        {/* Avatar initiales */}
        <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-600 shrink-0">
          {member.email.slice(0, 2).toUpperCase()}
        </div>

        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {member.email}
            {member.is_self && (
              <span className="ml-2 text-xs text-gray-400 font-normal">(vous)</span>
            )}
          </p>
          {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {/* Sélecteur de rôle (désactivé pour soi-même) */}
        {member.is_self ? (
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${roleDef.color}`}>
            <BadgeCheck className="w-3 h-3" />
            {roleDef.badge}
          </span>
        ) : (
          <select
            value={member.role}
            onChange={e => handleRoleChange(e.target.value as AppRole)}
            disabled={isPending}
            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50"
          >
            {EDITABLE_ROLES.map(r => (
              <option key={r} value={r}>{ROLE_DEFINITIONS[r].label}</option>
            ))}
          </select>
        )}

        {/* Bouton supprimer (désactivé pour soi-même) */}
        {!member.is_self && (
          <button
            type="button"
            onClick={handleRemove}
            disabled={isPending}
            title="Retirer de l'équipe"
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </li>
  )
}
