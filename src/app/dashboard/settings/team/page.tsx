import { RbacService } from '@/services/rbacService'
import { listTeamMembersAction } from '@/app/actions/teamActions'
import { ROLE_DEFINITIONS, type AppRole } from '@/lib/roles'
import { Users, Mail, ShieldCheck, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import InviteForm from './InviteForm'
import TeamMemberRow from './TeamMemberRow'

export const dynamic = 'force-dynamic'

export default async function TeamPage() {
  await RbacService.requireRole(['admin', 'super_admin'])
  const members = await listTeamMembersAction()

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <Link
          href="/dashboard/settings"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Paramètres
        </Link>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Gestion de l'équipe</h2>
            <p className="text-gray-500 text-sm">Invitez des collaborateurs et gérez leurs permissions.</p>
          </div>
        </div>
      </div>

      {/* Invitation */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-1 flex items-center gap-2">
          <Mail className="w-4 h-4 text-gray-400" />
          Inviter un collaborateur
        </h3>
        <p className="text-sm text-gray-500 mb-5">
          Un email d'invitation sera envoyé. Le collaborateur choisira son mot de passe.
        </p>
        <InviteForm />
      </div>

      {/* Légende des rôles */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
        <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-3 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4" /> Rappel des rôles
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(['viewer', 'user', 'admin'] as AppRole[]).map(r => (
            <div key={r} className="text-sm">
              <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full mb-1 ${ROLE_DEFINITIONS[r].color}`}>
                {ROLE_DEFINITIONS[r].label}
              </span>
              <p className="text-gray-600 text-xs">{ROLE_DEFINITIONS[r].description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Liste des membres */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-semibold text-gray-900">
            Membres de l'équipe
            <span className="ml-2 text-sm font-normal text-gray-400">({members.length})</span>
          </h3>
        </div>
        {members.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">
            Aucun membre. Invitez votre premier collaborateur ci-dessus.
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {members.map(member => (
              <TeamMemberRow key={member.user_id} member={member} />
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
