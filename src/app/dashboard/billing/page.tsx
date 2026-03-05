import { createClient } from '@/lib/supabase/server'
import { PLANS, formatPlanPrice, type PlanId } from '@/lib/plans'
import { CheckCircle2, Crown, Zap, ShieldCheck } from 'lucide-react'
import UpgradeButton from './UpgradeButton'

export const dynamic = 'force-dynamic'

const WAVE_NUMBER = process.env.NEXT_PUBLIC_WAVE_NUMBER ?? '+221 77 000 00 00'
const SUPPORT_WHATSAPP = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP ?? '221770000000'

export default async function BillingPage() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // get_user_agency_id() gère les membres invités (leur user.id ≠ agency.id)
    const { data: resolvedAgencyId } = await supabase.rpc('get_user_agency_id')
    const agencyId = (resolvedAgencyId as string | null) ?? user?.id ?? ''

    const { data: agency } = await supabase
        .from('agencies')
        .select('name, plan, id')
        .eq('id', agencyId)
        .maybeSingle()

    const currentPlanId: PlanId = (agency?.plan as PlanId | null) ?? 'free'
    const currentPlan = PLANS[currentPlanId]

    // Compter l'usage actuel
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { count: invoiceCount } = await supabase
        .from('invoices')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfMonth.toISOString())

    const { count: clientCount } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true })

    return (
        <div className="max-w-4xl mx-auto space-y-10">
            {/* Header */}
            <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Abonnement & Facturation</h2>
                <p className="text-gray-500 mt-1">Gérez votre plan et suivez votre utilisation.</p>
            </div>

            {/* Plan actuel */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Crown className={`w-5 h-5 ${currentPlanId === 'free' ? 'text-gray-400' : 'text-amber-500'}`} />
                            <h3 className="text-lg font-bold text-gray-900">Plan {currentPlan.name}</h3>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${currentPlanId === 'free'
                                ? 'bg-gray-100 text-gray-600'
                                : currentPlanId === 'pro'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-amber-100 text-amber-700'
                                }`}>
                                ACTUEL
                            </span>
                        </div>
                        <p className="text-2xl font-black text-gray-900">{formatPlanPrice(currentPlanId)}</p>
                    </div>
                    {currentPlanId === 'free' && (
                        <a href="#upgrade">
                            <button className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg shadow-blue-500/20">
                                <Zap className="w-4 h-4" />
                                Passer au plan PME
                            </button>
                        </a>
                    )}
                </div>

                {/* Usage */}
                <div className="p-6 grid grid-cols-2 gap-4">
                    <UsageMeter
                        label="Factures ce mois"
                        used={invoiceCount ?? 0}
                        limit={currentPlan.limits.invoices}
                    />
                    <UsageMeter
                        label="Clients"
                        used={clientCount ?? 0}
                        limit={currentPlan.limits.clients}
                    />
                </div>
            </div>

            {/* Badge DGI inclus */}
            <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <p className="text-sm text-emerald-800 font-medium">
                    Toutes vos factures sont <strong>conformes DGI Sénégal</strong> — NINEA, RCCM et numérotation séquentielle inclus.
                </p>
            </div>

            {/* Plans disponibles */}
            {currentPlanId === 'free' && (
                <div id="upgrade" className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-900">Passer à un plan supérieur</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                        {(['pro', 'agency'] as PlanId[]).map(planId => {
                            const plan = PLANS[planId]
                            const isHighlighted = planId === 'pro'
                            return (
                                <div key={planId} className={`rounded-2xl border p-7 flex flex-col gap-5 ${isHighlighted ? 'bg-blue-600 border-blue-500 text-white' : 'bg-white border-gray-200'
                                    }`}>
                                    {/* Badge populaire */}
                                    {plan.highlight && (
                                        <div className={`inline-flex w-fit text-xs font-bold px-3 py-1 rounded-full ${isHighlighted ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-700'}`}>
                                            ⭐ {plan.highlight}
                                        </div>
                                    )}
                                    <div>
                                        <h4 className={`text-xl font-bold mb-1 ${isHighlighted ? 'text-white' : 'text-gray-900'}`}>{plan.name}</h4>
                                        <p className={`text-3xl font-black ${isHighlighted ? 'text-white' : 'text-gray-900'}`}>
                                            {plan.price.toLocaleString('fr-SN')} <span className={`text-sm font-medium ${isHighlighted ? 'text-blue-200' : 'text-gray-400'}`}>FCFA/mois</span>
                                        </p>
                                    </div>
                                    <ul className="space-y-2.5 flex-1">
                                        {plan.features.map((feat, i) => (
                                            <li key={i} className="flex items-start gap-2">
                                                <CheckCircle2 className={`w-4 h-4 mt-0.5 shrink-0 ${isHighlighted ? 'text-blue-200' : 'text-emerald-500'}`} />
                                                <span className={`text-sm ${isHighlighted ? 'text-blue-100' : 'text-gray-600'}`}>{feat}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    {/* Nouveau flux abonnement */}
                                    <UpgradeButton
                                        planName={plan.name}
                                        planPrice={plan.price}
                                        agencyId={agencyId}
                                        supportWhatsapp={SUPPORT_WHATSAPP}
                                        waveNumber={WAVE_NUMBER}
                                    />
                                </div>
                            )
                        })}
                    </div>
                    <p className="text-sm text-gray-400 text-center mt-4">
                        Paiement par Wave ou Orange Money · Activation dans les 2h · Sans engagement
                    </p>
                </div>
            )}
        </div>
    )
}

function UsageMeter({ label, used, limit }: { label: string; used: number; limit: number }) {
    const isUnlimited = limit === -1
    const pct = isUnlimited ? 0 : Math.min((used / limit) * 100, 100)
    const isNearLimit = !isUnlimited && pct >= 80

    return (
        <div className="space-y-2">
            <div className="flex justify-between items-baseline">
                <span className="text-sm font-medium text-gray-600">{label}</span>
                <span className={`text-sm font-bold ${isNearLimit ? 'text-amber-600' : 'text-gray-900'}`}>
                    {used}{isUnlimited ? '' : ` / ${limit}`}
                    {isUnlimited && <span className="text-emerald-600 ml-1 text-xs">illimité</span>}
                </span>
            </div>
            {!isUnlimited && (
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all ${isNearLimit ? 'bg-amber-500' : 'bg-blue-500'}`}
                        style={{ width: `${pct}%` }}
                    />
                </div>
            )}
            {isNearLimit && (
                <p className="text-xs text-amber-600 font-medium">Limite bientôt atteinte — Passez au plan PME</p>
            )}
        </div>
    )
}
