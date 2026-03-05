import Link from 'next/link'
import {
  ArrowRight, CheckCircle2, Shield, Smartphone, Zap, TrendingUp,
  FileText, Clock, AlertTriangle, Star, ChevronRight, Users, BarChart3, Lock
} from 'lucide-react'
import { Button } from '@/components/ui/Button'

const FEATURES = [
  {
    icon: Smartphone,
    color: 'text-blue-600', bg: 'bg-blue-50',
    title: 'Wave & Orange Money',
    desc: 'Intégrez des liens de paiement structurés. Vos clients paient directement depuis leur mobile en un clic.'
  },
  {
    icon: Zap,
    color: 'text-orange-500', bg: 'bg-orange-50',
    title: 'Relances WhatsApp',
    desc: 'Automatisez vos relances. Un message personnalisé est généré selon le retard de la facture.'
  },
  {
    icon: Shield,
    color: 'text-emerald-600', bg: 'bg-emerald-50',
    title: 'Conformité DGI Sénégal',
    desc: 'TVA 18%, NINEA, RCCM et mentons légales obligatoires. Facturez en toute sérénité.'
  },
  {
    icon: FileText,
    color: 'text-blue-600', bg: 'bg-blue-50',
    title: 'Templates Professionnels',
    desc: 'Choisissez parmi nos designs Classique, Moderne ou Élite pour refléter le prestige de votre PME.'
  },
  {
    icon: BarChart3,
    color: 'text-purple-600', bg: 'bg-purple-50',
    title: "Livre d'Inventaire",
    desc: 'Suivez vos encaissements réels et vos engagements acceptés en temps réel pour une comptabilité limpide.'
  },
  {
    icon: CheckCircle2,
    color: 'text-blue-600', bg: 'bg-blue-50',
    title: 'Édition Flexible',
    desc: 'Une erreur de saisie ? Modifiez vos factures même après paiement pour garder des registres exacts.'
  },
]

const TESTIMONIALS = [
  {
    name: 'Mamadou Diallo',
    role: 'Gérant, Quincaillerie Diallo & Frères',
    avatar: 'MD',
    color: 'bg-blue-600',
    text: 'Avant FactureFlow, je relançais mes clients B2B par WhatsApp sans succès. Maintenant, le lien de paiement Wave est directement sur la facture avec la TVA. Mon taux de paiement dans les 48h a doublé.'
  },
  {
    name: 'Aïssatou Ndiaye',
    role: 'Directrice, Ndiaye Consulting',
    avatar: 'AN',
    color: 'bg-blue-600',
    text: "J'ai créé mon premier devis en 3 minutes sur mon téléphone. Le client l'a signé le jour même et payé par Orange Money. C'est exactement ce dont ma PME avait besoin."
  },
  {
    name: 'Ibrahima Sow',
    role: 'Fondateur, Auto-École Dakar',
    avatar: 'IS',
    color: 'bg-blue-600',
    text: 'Le dashboard me montre en temps réel mon montant exact à encaisser et ce qui est en retard. Je ne perds plus de temps à chercher dans mes dossiers. Indispensable pour notre trésorerie.'
  }
]

const PLANS = [
  {
    name: 'Gratuit',
    price: '0',
    period: '/mois',
    desc: 'Pour démarrer et tester',
    cta: 'Commencer gratuitement',
    href: '/login',
    highlight: false,
    features: [
      '5 factures par mois',
      '10 clients maximum',
      '1 utilisateur',
      'Lien de paiement Mobile Money',
      'PDF NINEA/RCCM',
    ]
  },
  {
    name: 'PME',
    price: '9 900',
    period: ' FCFA/mois',
    desc: 'Pour les PME qui grandissent',
    cta: 'Choisir le plan PME',
    href: '/login',
    highlight: true,
    badge: '🔥 Le plus populaire',
    features: [
      'Factures & devis illimités',
      'Clients illimités',
      '3 utilisateurs',
      'PDF professionnel à votre image',
      'Conversion rapide devis → facture',
      'Badge ✓ Conforme DGI Sénégal',
    ]
  },
  {
    name: 'Pro',
    price: '19 900',
    period: ' FCFA/mois',
    desc: 'Pour les équipes structurées',
    cta: 'Choisir le plan Pro',
    href: '/login',
    highlight: false,
    features: [
      'Tout ce qui est dans PME',
      '20 utilisateurs',
      'Rapports avancés & exports',
      'Gestion des rôles de l\'équipe',
      'Gestion multi-accès sécurisée',
      'Support dédié',
    ]
  }
]

export default function Home() {
  return (
    <div className="min-h-screen bg-white font-sans selection:bg-blue-100">

      {/* ── Navbar ── */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-lg z-50 border-b border-gray-100/80 shadow-sm shadow-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-18 flex items-center justify-between py-3 sm:py-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-black text-base sm:text-lg shadow-lg shadow-blue-500/30">F</div>
            <span className="text-lg sm:text-xl font-bold tracking-tight text-gray-900">FactureFlow <span className="text-blue-600">SN</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-500">
            <a href="#features" className="hover:text-gray-900 transition-colors">Fonctionnalités</a>
            <a href="#pricing" className="hover:text-gray-900 transition-colors">Tarifs</a>
            <a href="#testimonials" className="hover:text-gray-900 transition-colors">Témoignages</a>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/login">
              <Button variant="ghost" className="hidden sm:inline-flex text-gray-600 font-medium">Connexion</Button>
            </Link>
            <Link href="/login">
              <Button className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/25 font-semibold text-xs sm:text-sm px-3 sm:px-5">
                <span className="hidden sm:inline">Démarrer gratuitement</span>
                <span className="sm:hidden">Démarrer</span>
                <ArrowRight className="ml-1 sm:ml-1.5 w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <main>

        {/* ── Hero ── */}
        <section className="relative pt-28 pb-16 sm:pt-36 sm:pb-24 md:pt-48 md:pb-32 overflow-hidden px-4 sm:px-6">
          <div className="absolute inset-0 bg-slate-50" />
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-orange-50/50 rounded-full blur-3xl" />

          <div className="relative max-w-5xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-sm font-semibold mb-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600" />
              </span>
              Le logiciel de facturation pour les PME Sénégalaises
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black text-gray-900 tracking-tight leading-[1.08]">
              De la commande au paiement <br className="hidden sm:inline" />
              <span className="text-blue-600">
                sans perdre de temps.
              </span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-500 max-w-3xl mx-auto leading-relaxed font-medium">
              FactureFlow SN aide les PME Sénégalaises à se faire payer à temps.<br className="hidden md:block" />
              Devis en 2 min, relances WhatsApp et <strong className="text-gray-800">Conformité DGI.</strong>
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/login" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-base sm:text-lg px-6 sm:px-10 h-12 sm:h-14 md:h-16 rounded-2xl shadow-2xl shadow-blue-500/30 hover:scale-105 transition-transform font-bold">
                  Créer un compte gratuit
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <a href="#features" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto h-12 sm:h-14 md:h-16 rounded-2xl text-base sm:text-lg font-semibold border-gray-200 hover:bg-gray-50">
                  Voir comment ça marche
                  <ChevronRight className="ml-1 w-5 h-5" />
                </Button>
              </a>
            </div>

            <p className="text-sm text-gray-400 font-medium">Gratuit pour toujours · Aucune carte bancaire requise</p>
          </div>
        </section>

        {/* ── Pain Points ── */}
        <section className="py-16 sm:py-20 bg-gray-950 px-4 sm:px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">
                Vous en avez assez… ?
              </h2>
              <p className="text-gray-400 text-lg">Ces situations vous parlent certainement.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {[
                { icon: Clock, text: 'De relancer vos clients par WhatsApp pour qu\'ils paient votre facture' },
                { icon: AlertTriangle, text: 'De perdre des heures à créer vos devis sur Word ou Excel' },
                { icon: BarChart3, text: 'De ne pas savoir combien d\'argent vous devez encore encaisser' },
              ].map((item, i) => (
                <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-7 flex flex-col gap-4">
                  <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center">
                    <item.icon className="w-6 h-6 text-red-400" />
                  </div>
                  <p className="text-gray-300 text-lg font-medium leading-snug">"{item.text}"</p>
                </div>
              ))}
            </div>
            <p className="text-center mt-10 text-blue-400 font-bold text-xl">FactureFlow SN résout tout ça.</p>
          </div>
        </section>

        {/* ── How It Works ── */}
        <section id="features" className="py-16 sm:py-24 px-4 sm:px-6 bg-white">
          <div className="max-w-5xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-4">
              De la prospection à l'encaissement en 3 étapes
            </h2>
            <p className="text-gray-500 text-lg">Un flux pensé pour les entreprises africaines.</p>
          </div>
          <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 relative">
            <div className="hidden md:block absolute top-10 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-blue-200 to-blue-200" />
            {[
              { step: '01', icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50', title: 'Créez un Devis', desc: 'En 2 minutes. Choisissez le client, ajoutez les prestations, envoyez le lien.' },
              { step: '02', icon: CheckCircle2, color: 'text-blue-600', bg: 'bg-blue-50', title: 'Le client accepte', desc: 'Il reçoit un lien, signe en ligne, vous convertissez en facture en 1 clic.' },
              { step: '03', icon: Smartphone, color: 'text-emerald-600', bg: 'bg-emerald-50', title: 'Paiement & Inventaire', desc: 'Wave ou Orange Money directement. Votre Livre d’Inventaire se met à jour automatiquement.' },
            ].map((s) => (
              <div key={s.step} className="relative bg-white border border-gray-100 rounded-3xl p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className={`w-14 h-14 ${s.bg} ${s.color} rounded-2xl flex items-center justify-center mb-6`}>
                  <s.icon className="w-7 h-7" />
                </div>
                <span className="text-5xl font-black text-gray-100 absolute top-6 right-8">{s.step}</span>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{s.title}</h3>
                <p className="text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Features Grid ── */}
        <section className="py-16 sm:py-24 bg-gray-50 px-4 sm:px-6 border-y border-gray-100">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-4">Tout ce dont votre entreprise a besoin</h2>
              <p className="text-gray-500 text-lg max-w-xl mx-auto">Une plateforme complète. Conforme aux exigences de la DGI.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {FEATURES.map((f, i) => (
                <div key={i} className="bg-white p-7 rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                  <div className={`w-12 h-12 ${f.bg} ${f.color} rounded-xl flex items-center justify-center mb-5`}>
                    <f.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{f.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Testimonials ── */}
        <section id="testimonials" className="py-16 sm:py-24 px-4 sm:px-6 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-4">Ce qu'en disent les PME locales</h2>
              <div className="flex items-center justify-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-amber-400" />)}
                <span className="text-gray-500 text-sm font-medium ml-2">4.9 / 5 basé sur les premiers utilisateurs</span>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {TESTIMONIALS.map((t, i) => (
                <div key={i} className="bg-gray-50 border border-gray-100 rounded-3xl p-7 flex flex-col gap-5">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-amber-400" />)}
                  </div>
                  <p className="text-gray-700 leading-relaxed font-medium text-sm flex-1">"{t.text}"</p>
                  <div className="flex items-center gap-3 pt-3 border-t border-gray-200">
                    <div className={`w-10 h-10 rounded-full ${t.color} flex items-center justify-center text-white font-bold text-sm`}>{t.avatar}</div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{t.name}</p>
                      <p className="text-gray-500 text-xs">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Pricing ── */}
        <section id="pricing" className="py-16 sm:py-24 px-4 sm:px-6 bg-slate-50">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-4">Des tarifs simples et accessibles</h2>
              <p className="text-slate-500 text-lg">Commencez gratuitement. Évoluez quand vous êtes prêt.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 items-center">
              {PLANS.map((plan) => (
                <div
                  key={plan.name}
                  className={`relative rounded-3xl p-6 sm:p-8 flex flex-col gap-6 bg-white transition-all ${plan.highlight
                    ? 'border-2 border-blue-600 shadow-xl shadow-blue-500/10 md:scale-105 z-10'
                    : 'border border-gray-200 shadow-sm'
                    }`}
                >
                  {plan.badge && (
                    <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold px-4 py-1.5 rounded-full">
                      {plan.badge}
                    </span>
                  )}
                  <div>
                    <h3 className="text-lg font-bold mb-1 text-slate-900">{plan.name}</h3>
                    <p className="text-sm text-slate-500">{plan.desc}</p>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-slate-900">{plan.price}</span>
                    <span className="text-sm font-medium text-slate-500">{plan.period}</span>
                  </div>
                  <ul className="space-y-3 flex-1">
                    {plan.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-blue-600" />
                        <span className="text-sm text-slate-600 font-medium">{feat}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href={plan.href} className="block">
                    <Button
                      className={`w-full h-12 rounded-xl font-bold ${plan.highlight
                        ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/25'
                        : 'bg-white text-slate-700 hover:bg-slate-50 border border-gray-200'
                        }`}
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
            <p className="text-center mt-10 text-slate-500 text-sm flex items-center justify-center gap-2 font-medium">
              <Lock className="w-4 h-4" /> Paiement 100% sécurisé via Mobile Money · Sans engagement
            </p>
          </div>
        </section>

        {/* ── CTA Final ── */}
        <section className="py-16 sm:py-20 md:py-28 px-4 sm:px-6 bg-white">
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl p-8 sm:p-12 md:p-20 text-center relative overflow-hidden shadow-2xl shadow-blue-500/30">
            <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-white mb-6 relative z-10 tracking-tight">
              Commencez à encaisser<br className="hidden sm:inline" /> plus vite dès aujourd'hui
            </h2>
            <p className="text-blue-100 text-lg md:text-xl mb-10 max-w-xl mx-auto relative z-10 font-medium">
              Rejoignez les PME qui utilisent FactureFlow SN pour diviser par deux leurs délais de paiement.
            </p>
            <Link href="/login" className="relative z-10 inline-block">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-50 h-12 sm:h-14 md:h-16 px-8 sm:px-12 rounded-2xl text-base sm:text-lg font-bold shadow-xl hover:scale-105 transition-transform">
                Créer mon compte gratuit
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <p className="text-blue-200 text-sm mt-6 relative z-10">Aucune carte bancaire requise</p>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="bg-gray-950 border-t border-gray-800 py-10 sm:py-14 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-lg">F</div>
              <span className="text-lg font-bold text-white">FactureFlow <span className="text-blue-400">SN</span></span>
            </div>
            <p className="text-gray-500 text-sm">La facturation B2B à l'africaine.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-sm font-medium text-gray-500">
            <a href="#" className="hover:text-white transition-colors">Mentions Légales</a>
            <a href="#" className="hover:text-white transition-colors">Confidentialité</a>
            <a href="#features" className="hover:text-white transition-colors">Fonctionnalités</a>
            <a href="#pricing" className="hover:text-white transition-colors">Tarifs</a>
            <a href="mailto:contact@factureflow.sn" className="hover:text-white transition-colors">Contact</a>
          </div>
          <p className="text-gray-600 text-sm">© 2026 FactureFlow SN</p>
        </div>
      </footer>
    </div>
  )
}