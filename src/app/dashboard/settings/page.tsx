import { AgencyService } from '@/services/agencyService'
import { RbacService } from '@/services/rbacService'
import SettingsForm from './SettingsForm'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Users } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  await RbacService.requireRole(['admin', 'super_admin'])
  const agency = await AgencyService.getAgency()
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div>
      <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-gray-800">Paramètres de l'agence</h2>
      <p className="text-gray-500 text-sm mb-8">
        Ces informations apparaîtront sur vos devis et factures.
      </p>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 sm:p-8 max-w-2xl">
        {agency && user ? (
          <SettingsForm
            userId={user.id}
            defaultValues={{
              name: agency.name,
              ninea: agency.ninea,
              rccm: agency.rccm,
              email: agency.email,
              phone: agency.phone,
              address: agency.address,
              logo_url: agency.logo_url ?? null,
              invoice_template: (agency as any).invoice_template ?? 'classic',
              is_vat_enabled: (agency as any).is_vat_enabled ?? true,
            }}
          />
        ) : (
          <p className="text-red-500 text-sm">
            Impossible de charger les informations de l'agence.
          </p>
        )}
      </div>

      {/* Gestion de l'équipe */}
      <div className="max-w-2xl mt-6">
        <Link
          href="/dashboard/settings/team"
          className="flex items-center justify-between gap-4 bg-white border border-gray-200 rounded-xl px-6 py-4 hover:border-blue-300 hover:shadow-sm transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Gérer l'équipe</p>
              <p className="text-sm text-gray-500">Inviter des collaborateurs et gérer leurs rôles.</p>
            </div>
          </div>
          <span className="text-gray-400 group-hover:text-blue-500 transition-colors">›</span>
        </Link>
      </div>
    </div>
  )
}
