import { createClient } from '@/lib/supabase/server'
import { AgencyService } from '@/services/agencyService'
import { CheckCircle2, Circle, Users, FileText, Briefcase, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function OnboardingPage() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const agency = user ? await AgencyService.getAgency() : null

    // Vérifier l'état du compte
    const { count: clientCount } = await supabase.from('clients').select('*', { count: 'exact', head: true })
    const { count: quoteCount } = await supabase.from('quotes').select('*', { count: 'exact', head: true })

    const steps = [
        {
            id: 'account',
            title: 'Compte créé',
            desc: 'Votre espace FactureFlow SN est prêt.',
            done: true,
            href: null,
            icon: Briefcase,
        },
        {
            id: 'agency',
            title: 'Configurer votre entreprise',
            desc: 'Ajoutez votre logo, NINEA et coordonnées — ils apparaissent sur chaque facture.',
            done: !!(agency?.name),
            href: '/dashboard/settings',
            icon: Briefcase,
        },
        {
            id: 'client',
            title: 'Ajouter votre premier client',
            desc: 'Enregistrez un client pour lui envoyer un devis ou une facture.',
            done: (clientCount ?? 0) > 0,
            href: '/dashboard/clients',
            icon: Users,
        },
        {
            id: 'quote',
            title: 'Envoyer votre premier devis',
            desc: 'Créez un devis, votre client l\'accepte en ligne — convertissez-le en facture DGI en 1 clic.',
            done: (quoteCount ?? 0) > 0,
            href: '/dashboard/quotes',
            icon: FileText,
        },
    ]

    const completedCount = steps.filter(s => s.done).length
    const progress = Math.round((completedCount / steps.length) * 100)
    const allDone = completedCount === steps.length

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            {/* Header */}
            <div>
                <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
                    Bienvenue sur FactureFlow SN 🎉
                </h2>
                <p className="text-gray-500 mt-1">Suivez ces étapes pour facturer vos clients en moins de 5 minutes.</p>
            </div>

            {/* Progress */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-600">{completedCount} / {steps.length} étapes complétées</span>
                    <span className="text-sm font-bold text-blue-600">{progress}%</span>
                </div>
                <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Steps */}
            <div className="space-y-3">
                {steps.map((step, i) => (
                    <div
                        key={step.id}
                        className={`bg-white rounded-2xl border shadow-sm p-6 flex items-start gap-5 transition-all ${step.done ? 'border-green-100 opacity-75' : 'border-gray-200 hover:border-blue-200 hover:shadow-md'
                            }`}
                    >
                        <div className={`mt-0.5 shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${step.done ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                            }`}>
                            {step.done
                                ? <CheckCircle2 className="w-5 h-5" />
                                : <span className="text-sm font-bold">{i + 1}</span>
                            }
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className={`font-bold ${step.done ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                                {step.title}
                            </h3>
                            <p className="text-sm text-gray-500 mt-0.5">{step.desc}</p>
                        </div>
                        {!step.done && step.href && (
                            <Link
                                href={step.href}
                                className="shrink-0 flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
                            >
                                Commencer
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        )}
                    </div>
                ))}
            </div>

            {/* CTA Final si tout complété */}
            {allDone && (
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-center text-white shadow-xl shadow-blue-500/20">
                    <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-blue-200" />
                    <h3 className="text-2xl font-bold mb-2">Vous êtes prêt ! 🎉</h3>
                    <p className="text-blue-100 mb-6">Votre espace est configuré. Commencez à facturer professionnellement.</p>
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                    >
                        Aller au tableau de bord
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            )}
        </div>
    )
}
