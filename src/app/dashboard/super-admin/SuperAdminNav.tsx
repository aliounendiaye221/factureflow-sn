'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    ShieldAlert, Building2, Users, HeadphonesIcon, BarChart3, Eye, CreditCard
} from 'lucide-react'

const TABS = [
    { href: '/dashboard/super-admin', label: 'Vue Générale', icon: ShieldAlert, exact: true },
    { href: '/dashboard/super-admin/agencies', label: 'Agences', icon: Building2 },
    { href: '/dashboard/super-admin/users', label: 'Utilisateurs', icon: Users },
    { href: '/dashboard/super-admin/subscriptions', label: 'Abonnements', icon: CreditCard },
    { href: '/dashboard/super-admin/analytics', label: 'Analytiques', icon: Eye },
    { href: '/dashboard/super-admin/support', label: 'Support', icon: HeadphonesIcon },
]

export default function SuperAdminNav() {
    const pathname = usePathname()

    return (
        <div>
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-slate-900 text-white rounded-lg">
                    <ShieldAlert className="w-7 h-7" />
                </div>
                <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Super Administration</h2>
                    <p className="text-gray-500 text-sm">Contrôle total de la plateforme FactureFlow SN</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                <nav className="flex gap-1 bg-white rounded-xl border border-gray-200 p-1 min-w-max">
                    {TABS.map(({ href, label, icon: Icon, exact }) => {
                        const isActive = exact
                            ? pathname === href
                            : pathname.startsWith(href)

                        return (
                            <Link
                                key={href}
                                href={href}
                                className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${isActive
                                    ? 'bg-slate-900 text-white shadow-sm'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                <span className="hidden sm:inline">{label}</span>
                            </Link>
                        )
                    })}
                </nav>
            </div>
        </div>
    )
}
