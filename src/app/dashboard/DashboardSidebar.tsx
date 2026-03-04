'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { LucideProps } from 'lucide-react'
import {
  LayoutDashboard, Users, FileText, FileSpreadsheet, Settings, LogOut,
  CheckCircle, ShieldAlert, CreditCard, PlayCircle, Package,
  ChevronRight, Book
} from 'lucide-react'
import { getRoleBadge, getRoleColor } from '@/lib/roles'

type NavItem = {
  href: string
  label: string
  icon: React.ComponentType<LucideProps>
  roles?: string[]
  group?: string
}

const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Tableau de Bord', icon: LayoutDashboard, group: 'main' },
  { href: '/dashboard/onboarding', label: 'Démarrage', icon: PlayCircle, group: 'main' },
  { href: '/dashboard/clients', label: 'Clients', icon: Users, group: 'core' },
  { href: '/dashboard/quotes', label: 'Devis', icon: FileText, group: 'core' },
  { href: '/dashboard/invoices', label: 'Factures', icon: FileSpreadsheet, group: 'core' },
  { href: '/dashboard/inventory', label: 'Inventaire', icon: Book, group: 'core' },
  { href: '/dashboard/catalogue', label: 'Catalogue', icon: Package, group: 'core' },
  { href: '/dashboard/billing', label: 'Abonnement', icon: CreditCard, roles: ['admin', 'super_admin'], group: 'settings' },
  { href: '/dashboard/settings', label: 'Paramètres', icon: Settings, roles: ['admin', 'super_admin'], group: 'settings' },
  { href: '/dashboard/super-admin', label: 'Super Admin', icon: ShieldAlert, roles: ['super_admin'], group: 'admin' },
]

const GROUP_LABELS: Record<string, string> = {
  main: '',
  core: 'Gestion',
  settings: 'Compte',
  admin: 'Administration',
}

export default function DashboardSidebar({ agencyName, userRole }: { agencyName: string; userRole: string }) {
  const pathname = usePathname()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  const visibleNavItems = NAV_ITEMS.filter(item => {
    if (!item.roles) return true
    return item.roles.includes(userRole)
  })

  const groups = ['main', 'core', 'settings', 'admin']
  const grouped = groups.map(g => ({
    key: g,
    label: GROUP_LABELS[g],
    items: visibleNavItems.filter(i => i.group === g),
  })).filter(g => g.items.length > 0)

  return (
    <aside className="w-72 bg-white flex flex-col border-r border-gray-200 min-h-screen overflow-y-auto">

      {/* ── Logo / Brand ── */}
      <div className="px-5 pt-6 pb-4">
        <Link href="/" className="flex items-center gap-2.5 mb-1 hover:opacity-80 transition-opacity">
          <div className="bg-primary text-white p-1.5 rounded-lg shadow-sm">
            <CheckCircle className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">FactureFlow</h1>
        </Link>

        {agencyName && (
          <div className="mt-3 flex items-center justify-between gap-2 bg-gray-50 px-3 py-2 rounded-xl border border-gray-100">
            <p className="text-sm text-gray-600 font-medium truncate">{agencyName}</p>
            <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full flex-shrink-0 ${getRoleColor(userRole)}`}>
              {getRoleBadge(userRole)}
            </span>
          </div>
        )}
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 px-3 pb-4 space-y-5">
        {grouped.map(({ key, label, items }) => (
          <div key={key}>
            {label && (
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400 px-3 mb-1.5">
                {label}
              </p>
            )}
            <div className="space-y-0.5">
              {items.map(({ href, label: itemLabel, icon: Icon }) => {
                const isActive =
                  href === '/dashboard'
                    ? pathname === '/dashboard'
                    : pathname.startsWith(href)

                return (
                  <Link
                    key={href}
                    href={href}
                    className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative ${isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-r-full" />
                    )}
                    <Icon className={`w-4 h-4 flex-shrink-0 transition-colors ${isActive ? 'text-primary' : 'text-gray-400 group-hover:text-gray-600'
                      }`} />
                    <span className="flex-1">{itemLabel}</span>
                    {isActive && <ChevronRight className="w-3 h-3 text-primary/50" />}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* ── Logout ── */}
      <div className="p-3 border-t border-gray-100">
        <button
          type="button"
          onClick={handleSignOut}
          className="group flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 font-medium"
        >
          <LogOut className="w-4 h-4 text-gray-400 group-hover:text-red-500 transition-colors" />
          Déconnexion
        </button>
      </div>
    </aside>
  )
}
