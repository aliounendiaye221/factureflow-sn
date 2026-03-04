'use client'

import { useFormState } from 'react-dom'
import { inviteTeamMemberAction, type TeamActionState } from '@/app/actions/teamActions'
import SubmitButton from '@/components/SubmitButton'
import { ROLE_DEFINITIONS, type AppRole } from '@/lib/roles'

const INVITABLE_ROLES: AppRole[] = ['admin', 'user', 'viewer']

const initial: TeamActionState = {}

export default function InviteForm() {
  const [state, action] = useFormState(inviteTeamMemberAction, initial)

  return (
    <form action={action} className="space-y-4">
      {state.success && (
        <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
          {state.message}
        </div>
      )}
      {state.message && !state.success && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {state.message}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        {/* Email */}
        <input
          name="email"
          type="email"
          placeholder="collaborateur@email.com"
          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-800 text-sm"
          required
        />

        {/* Rôle */}
        <select
          name="role"
          defaultValue="user"
          className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-800 text-sm bg-white"
        >
          {INVITABLE_ROLES.map(r => (
            <option key={r} value={r}>{ROLE_DEFINITIONS[r].label}</option>
          ))}
        </select>

        <SubmitButton
          label="Inviter"
          pendingLabel="Envoi…"
          className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium text-sm transition-colors whitespace-nowrap"
        />
      </div>
    </form>
  )
}
