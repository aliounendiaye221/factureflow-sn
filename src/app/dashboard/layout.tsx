import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardSidebar from './DashboardSidebar'
import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import { AlertTriangle, X } from 'lucide-react'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const supabaseAdmin = createAdminClient()
  const { data: existingRole } = await supabaseAdmin
    .from('user_roles')
    .select('role, agency_id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!existingRole) {
    await supabaseAdmin.from('user_roles').insert({
      user_id: user.id,
      agency_id: user.id,
      role: 'admin',
    })
  }

  const agencyIdForLookup = existingRole?.agency_id ?? user.id

  if (!existingRole || existingRole.agency_id === user.id) {
    const { data: agency } = await supabaseAdmin
      .from('agencies')
      .select('id')
      .eq('id', user.id)
      .maybeSingle()

    if (!agency) {
      await supabaseAdmin.from('agencies').upsert({
        id: user.id,
        name: user.user_metadata?.agency_name || user.email?.split('@')[0] || 'Mon Agence',
      })
    }
  }

  const { data: agency } = await supabase
    .from('agencies')
    .select('id, name')
    .eq('id', agencyIdForLookup)
    .maybeSingle()

  const role = existingRole?.role ?? 'user'

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">

      {/* pt-14 sur mobile pour compenser la top bar fixe de la sidebar */}
      <div className="flex-1 flex overflow-hidden pt-14 lg:pt-0">
        <DashboardSidebar agencyName={agency?.name ?? ''} userRole={role} />

        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-slate-50/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}