import { createClient } from '@/lib/supabase/server'
import { AgencyService } from '@/services/agencyService'
import Link from 'next/link'
import {
  PlusCircle, FileText, FileSpreadsheet,
  AlertCircle, CheckCircle2, TrendingUp, BarChart2,
  Trophy, ArrowRight, Activity, AlertTriangle
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import RevenueChart from '@/components/RevenueChart'

export const dynamic = 'force-dynamic'

function formatXOF(n: number) {
  return new Intl.NumberFormat('fr-SN', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(n)
}

function getGreeting() {
  const h = new Date().getUTCHours() + 0
  const hour = (h + 1) % 24
  if (hour < 6) return 'Bonne nuit'
  if (hour < 12) return 'Bonjour'
  if (hour < 18) return 'Bon après-midi'
  return 'Bonsoir'
}

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [stats, agency, monthlyRevenue, topClients] = await Promise.all([
    user ? AgencyService.getDashboardStats(user.id) : Promise.resolve({ pendingQuotes: 0, unpaidTotal: 0, paidThisMonth: 0, overdueTotal: 0, overdueCount: 0 }),
    user ? AgencyService.getAgency() : Promise.resolve(null),
    user ? AgencyService.getMonthlyRevenue() : Promise.resolve([] as any[]),
    user ? AgencyService.getTopClients(5) : Promise.resolve([] as any[]),
  ])

  const totalRevenue6m = monthlyRevenue.reduce((sum: number, m: any) => sum + (m?.revenue || 0), 0)
  const greeting = getGreeting()

  return (
    <div className="space-y-8 animate-fade-in-up">

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Activity className="w-4 h-4 text-blue-500" />
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Tableau de bord</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            {greeting}{agency?.name ? `, ${agency.name}` : ''} 👋
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            {new Intl.DateTimeFormat('fr-SN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())}
          </p>
        </div>
        <div className="flex gap-3">
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/quotes">
              <FileText className="mr-2 h-4 w-4" />
              Nouveau Devis
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/dashboard/invoices">
              <PlusCircle className="mr-2 h-4 w-4" />
              Nouvelle Facture
            </Link>
          </Button>
        </div>
      </div>

      {/* ── BANDEAU ALERTE OVERDUE ── */}
      {stats.overdueCount > 0 && (
        <Link
          href="/dashboard/invoices"
          className="group flex items-center justify-between gap-4 bg-red-50 border border-red-200 rounded-2xl px-6 py-4 hover:bg-red-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="font-bold text-red-800 text-sm">
                {stats.overdueCount} facture{stats.overdueCount > 1 ? 's' : ''} en retard — {formatXOF(stats.overdueTotal)} à récupérer
              </p>
              <p className="text-red-600 text-xs mt-0.5">Relancez vos clients maintenant pour encaisser plus vite</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-red-700 font-semibold text-sm group-hover:gap-2.5 transition-all">
            Voir et relancer <ArrowRight className="w-4 h-4" />
          </div>
        </Link>
      )}

      {/* ── HERO KPI — Montant à encaisser ── */}
      <div className="relative bg-white border border-gray-200 rounded-3xl p-8 overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3 pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center border border-blue-100">
              <AlertCircle className="w-5 h-5" />
            </div>
            <span className="text-slate-500 text-sm font-semibold uppercase tracking-wider">Montant total à encaisser</span>
          </div>
          <p className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight tabular-nums">
            {formatXOF(stats.unpaidTotal)}
          </p>
          <p className="text-slate-500 text-sm mt-3 font-medium">
            Le montant des factures envoyées qui n'ont pas encore été réglées.
          </p>
          <Link href="/dashboard/invoices" className="inline-flex items-center gap-1.5 mt-5 text-blue-600 text-sm font-bold hover:text-blue-700 transition-colors">
            Voir les factures en attente <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* ── SECONDARY KPIs ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

        {/* Devis en attente */}
        <Link href="/dashboard/quotes" className="group relative bg-white rounded-2xl border border-gray-200 p-6 hover:border-blue-300 hover:shadow-card-md transition-all duration-300 overflow-hidden card-hover">
          <div className="relative z-10">
            <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center mb-4">
              <FileSpreadsheet className="w-5 h-5 text-slate-600" />
            </div>
            <p className="text-slate-500 text-sm font-medium mb-1">Devis en attente</p>
            <p className="text-3xl font-black text-slate-900 tabular-nums">{stats.pendingQuotes}</p>
            <p className="text-slate-400 text-xs mt-2 group-hover:text-blue-600 transition-colors">À convertir en facture</p>
          </div>
        </Link>

        {/* Encaissé ce mois */}
        <div className="relative bg-white rounded-2xl border border-gray-200 p-6 overflow-hidden card-hover hover:border-emerald-300 transition-all">
          <div className="relative z-10">
            <div className="w-10 h-10 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center mb-4">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-slate-500 text-sm font-medium mb-1">Encaissé ce mois</p>
            <p className="text-3xl font-black text-emerald-600 tabular-nums">{formatXOF(stats.paidThisMonth)}</p>
            <p className="text-slate-400 text-xs mt-2 capitalize">
              {new Date().toLocaleDateString('fr-SN', { month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* En retard — cliquable */}
        <Link href="/dashboard/invoices" className="group relative bg-white rounded-2xl border border-gray-200 p-6 overflow-hidden card-hover sm:col-span-2 lg:col-span-1 hover:border-red-300 transition-all duration-300">
          <div className="relative z-10">
            <div className="w-10 h-10 bg-red-50 border border-red-100 rounded-xl flex items-center justify-center mb-4">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <p className="text-slate-500 text-sm font-medium mb-1">Factures en retard</p>
            <p className="text-3xl font-black text-red-600 tabular-nums">{formatXOF(stats.overdueTotal)}</p>
            <p className="text-slate-400 text-xs mt-2 group-hover:text-red-500 transition-colors">Cliquez pour relancer</p>
          </div>
        </Link>
      </div>

      {/* ── CHART ── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100">
              <BarChart2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-sm">Chiffre d&apos;affaires</h2>
              <p className="text-slate-400 text-xs">6 derniers mois</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-sm font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {formatXOF(totalRevenue6m)}
          </div>
        </div>
        <RevenueChart data={monthlyRevenue} />
      </div>

      {/* ── TOP CLIENTS ── */}
      {topClients.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100">
              <Trophy className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-sm">Meilleurs clients</h2>
              <p className="text-slate-400 text-xs">Par chiffre d&apos;affaires généré</p>
            </div>
          </div>
          <div className="space-y-4">
            {topClients.map((client: any, idx: number) => {
              const maxBilled = topClients[0].total_billed
              const pct = maxBilled > 0 ? (client.total_billed / maxBilled) * 100 : 0
              const rankColors = [
                'from-amber-400 to-yellow-300 text-amber-900',
                'from-slate-400 to-slate-300 text-slate-700',
                'from-orange-400 to-amber-300 text-orange-900',
              ]
              return (
                <div key={client.client_id} className="flex items-center gap-4">
                  <div className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-black flex-shrink-0 bg-gradient-to-br ${rankColors[idx] ?? 'bg-slate-100 text-slate-500'}`}>
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="font-semibold text-slate-800 text-sm truncate">{client.client_name}</span>
                      <span className="text-sm font-bold text-slate-900 ml-2 whitespace-nowrap tabular-nums">
                        {formatXOF(client.total_billed)}
                      </span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      {client.invoice_count} facture{client.invoice_count > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
