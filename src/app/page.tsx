import Link from 'next/link'
import {
  ArrowRight, CheckCircle2, Shield, Smartphone, Zap, TrendingUp,
  FileText, Clock, AlertTriangle, Star, ChevronRight, Users, BarChart3, Lock,
  Palette, Package, Send, MessageSquare, Download, Eye, UserPlus, Settings,
  BookOpen, Receipt, ChevronDown, ShieldCheck, Layers, RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/Button'

/* ── Données ───────────────────────────────────────────────────────────────── */

const FEATURES = [
  {
    icon: Smartphone,
    color: 'text-blue-600', bg: 'bg-blue-50',
    title: 'Paiement Wave & Orange Money',
    desc: 'Un lien Wave pré-rempli (montant + référence) est généré sur chaque facture. Votre client ouvre son téléphone, scanne, paie. Vous êtes notifié.'
  },
  {
    icon: MessageSquare,
    color: 'text-emerald-600', bg: 'bg-emerald-50',
    title: 'Relances WhatsApp intelligentes',
    desc: 'Message WhatsApp personnalisé généré en 1 clic pour chaque facture impayée. Le ton s\'adapte : courtois si c\'est récent, ferme si c\'est en retard.'
  },
  {
    icon: Shield,
    color: 'text-orange-500', bg: 'bg-orange-50',
    title: 'Conformité DGID Sénégal',
    desc: 'TVA 18% calculée par ligne, NINEA, RCCM, NIF client, numérotation séquentielle obligatoire et mentions légales DGID. Zéro risque fiscal.'
  },
  {
    icon: Palette,
    color: 'text-purple-600', bg: 'bg-purple-50',
    title: '3 Templates professionnels',
    desc: 'Classique, Moderne ou Élite — chaque design est optimisé A4, imprimable en 1 page avec votre logo, vos couleurs et le badge conformité DGID.'
  },
  {
    icon: RefreshCw,
    color: 'text-blue-600', bg: 'bg-blue-50',
    title: 'Devis → Facture en 1 clic',
    desc: 'Votre client accepte le devis ? Convertissez-le en facture instantanément. Montants, lignes et TVA sont repris automatiquement.'
  },
  {
    icon: BarChart3,
    color: 'text-emerald-600', bg: 'bg-emerald-50',
    title: 'Livre d\'Inventaire en temps réel',
    desc: 'Encaissements réels, engagements acceptés, factures en retard — tout est calculé automatiquement. Votre trésorerie est claire et à jour.'
  },
  {
    icon: Send,
    color: 'text-orange-500', bg: 'bg-orange-50',
    title: 'Envoi par email professionnel',
    desc: 'Envoyez factures et devis par email au nom de votre entreprise. Votre client reçoit un email HTML soigné avec un bouton pour consulter et payer.'
  },
  {
    icon: Package,
    color: 'text-purple-600', bg: 'bg-purple-50',
    title: 'Catalogue produits & services',
    desc: 'Créez votre bibliothèque d\'articles avec prix et TVA pré-configurés. Insérez-les en 1 clic dans vos devis et factures. Fini la saisie répétitive.'
  },
  {
    icon: Users,
    color: 'text-blue-600', bg: 'bg-blue-50',
    title: 'Gestion d\'équipe & rôles',
    desc: 'Invitez vos collaborateurs par email. Attribuez les rôles Visiteur, Utilisateur ou Admin. Chaque membre voit uniquement ce qu\'il doit voir.'
  },
  {
    icon: Download,
    color: 'text-emerald-600', bg: 'bg-emerald-50',
    title: 'Export CSV pour comptabilité',
    desc: 'Exportez toutes vos factures et devis en CSV compatible Excel. Colonnes : N°, Client, Date, Statut, HT, TVA, TTC. Prêt pour votre comptable.'
  },
  {
    icon: TrendingUp,
    color: 'text-orange-500', bg: 'bg-orange-50',
    title: 'Dashboard & KPIs en direct',
    desc: 'Montant à encaisser, CA du mois, factures en retard, top 5 clients, graphique 6 mois — tout ce dont vous avez besoin sur un seul écran.'
  },
  {
    icon: ShieldCheck,
    color: 'text-purple-600', bg: 'bg-purple-50',
    title: 'Sécurité multi-tenant',
    desc: 'Chaque entreprise est isolée. Vos données sont chiffrées et protégées par Row Level Security. Personne d\'autre ne peut y accéder.'
  },
]

const TESTIMONIALS = [
  {
    name: 'Mamadou Diallo',
    role: 'Gérant, Quincaillerie Diallo & Frères',
    avatar: 'MD',
    color: 'bg-blue-600',
    text: 'Avec le lien Wave directement sur la facture, mon taux de paiement dans les 48h a doublé. Plus besoin de relancer 5 fois. Le client scanne, paie, c\'est réglé.'
  },
  {
    name: 'Aïssatou Ndiaye',
    role: 'Directrice, Ndiaye Consulting',
    avatar: 'AN',
    color: 'bg-emerald-600',
    text: 'J\'ai créé mon premier devis en 2 minutes sur mon téléphone. Le client l\'a reçu par email, l\'a accepté et je l\'ai converti en facture en 1 clic. Payé par Orange Money le jour même.'
  },
  {
    name: 'Ibrahima Sow',
    role: 'Fondateur, Auto-École Excellence Dakar',
    avatar: 'IS',
    color: 'bg-orange-500',
    text: 'Mon comptable adore l\'export CSV. Le dashboard me dit exactement combien je dois encaisser et ce qui est en retard. Je gère 3 collaborateurs avec les rôles, chacun fait son travail.'
  },
  {
    name: 'Fatou Sarr',
    role: 'Gérante, Sarr Traiteur & Events',
    avatar: 'FS',
    color: 'bg-purple-600',
    text: 'Les templates sont magnifiques. Mes clients me disent que mes factures font très professionnel. Le catalogue me permet de facturer mes prestations en 30 secondes, sans retaper les prix.'
  }
]

const PLANS = [
  {
    name: 'Gratuit',
    price: '0',
    period: '/mois',
    desc: 'Pour tester sans engagement',
    cta: 'Commencer gratuitement',
    href: '/login',
    highlight: false,
    features: [
      '5 factures par mois',
      '10 clients maximum',
      '1 utilisateur',
      'Lien de paiement Wave / Orange Money',
      'Factures conformes DGID (NINEA, RCCM)',
      'PDF téléchargeable & imprimable',
    ]
  },
  {
    name: 'PME',
    price: '9 900',
    period: ' FCFA/mois',
    desc: 'Pour les PME qui veulent se faire payer vite',
    cta: 'Choisir le plan PME',
    href: '/login',
    highlight: true,
    badge: 'Le plus populaire',
    features: [
      'Factures & devis illimités',
      'Clients illimités',
      '3 utilisateurs',
      'Templates Pro (Classique, Moderne, Élite)',
      'Conversion devis → facture en 1 clic',
      'Relances WhatsApp intelligentes',
      'Catalogue produits & services',
      'Livre d\'Inventaire dynamique',
      'Envoi par email professionnel',
      'Conformité DGID Sénégal intégrée',
    ]
  },
  {
    name: 'Pro',
    price: '19 900',
    period: ' FCFA/mois',
    desc: 'Pour les équipes qui grandissent',
    cta: 'Choisir le plan Pro',
    href: '/login',
    highlight: false,
    features: [
      'Tout le plan PME inclus',
      'Jusqu\'à 20 utilisateurs',
      'Livre d\'Inventaire multi-utilisateurs',
      'Rapports avancés & exports CSV',
      'Gestion des rôles (Visiteur, Utilisateur, Admin)',
      'Permissions sécurisées par équipe',
      'Support onboarding dédié',
    ]
  }
]

const FAQ = [
  {
    q: 'Est-ce que FactureFlow SN est vraiment gratuit ?',
    a: 'Oui. Le plan Gratuit vous donne accès à 5 factures par mois, 10 clients, les liens de paiement Wave et la conformité DGID. Aucune carte bancaire n\'est requise, aucune date d\'expiration. Vous évoluez uniquement quand vous en avez besoin.'
  },
  {
    q: 'Mes factures sont-elles conformes à la réglementation DGID ?',
    a: 'Absolument. FactureFlow SN intègre la TVA 18% calculée par ligne, la numérotation séquentielle obligatoire, le NINEA et le RCCM de votre entreprise, le NIF de vos clients, ainsi que toutes les mentions légales exigées par la Direction Générale des Impôts et Domaines du Sénégal.'
  },
  {
    q: 'Comment mes clients me paient-ils ?',
    a: 'Chaque facture générée contient un lien de paiement Wave avec le montant pré-rempli. Votre client ouvre le lien sur son téléphone, confirme le paiement et c\'est réglé. Orange Money est également accepté. Vous marquez ensuite la facture comme payée et votre Livre d\'Inventaire se met à jour.'
  },
  {
    q: 'Puis-je inviter mon comptable ou mon équipe ?',
    a: 'Oui. Le plan PME inclut 3 utilisateurs et le plan Pro jusqu\'à 20. Vous invitez par email, choisissez le rôle (Visiteur en lecture seule, Utilisateur pour créer des factures, ou Admin pour tout gérer) et chaque personne accède uniquement aux fonctions autorisées.'
  },
  {
    q: 'Et si je fais une erreur sur une facture ?',
    a: 'Pas de panique. Vous pouvez modifier vos factures à tout moment : client, lignes, montants, date d\'échéance. La numérotation séquentielle est préservée et vos registres restent exacts.'
  },
  {
    q: 'Comment fonctionne le paiement de l\'abonnement ?',
    a: 'Envoyez le montant de votre plan par Wave ou Orange Money, puis partagez la capture d\'écran sur notre WhatsApp de support. Votre plan est activé sous 2 heures. Sans engagement mensuel, vous pouvez changer ou annuler à tout moment.'
  },
]

/* ── Page ───────────────────────────────────────────────────────────────────── */

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
            <a href="#fonctionnalites" className="hover:text-gray-900 transition-colors">Fonctionnalités</a>
            <a href="#comment-ca-marche" className="hover:text-gray-900 transition-colors">Comment ça marche</a>
            <a href="#tarifs" className="hover:text-gray-900 transition-colors">Tarifs</a>
            <a href="#temoignages" className="hover:text-gray-900 transition-colors">Témoignages</a>
            <a href="#faq" className="hover:text-gray-900 transition-colors">FAQ</a>
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
              N°1 de la facturation conforme DGID au Sénégal
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black text-gray-900 tracking-tight leading-[1.08]">
              Facturez, relancez, encaissez —<br className="hidden sm:inline" />
              <span className="text-blue-600">
                tout depuis votre téléphone.
              </span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-500 max-w-3xl mx-auto leading-relaxed font-medium">
              FactureFlow SN est le logiciel de facturation conçu pour les PME sénégalaises.<br className="hidden md:block" />
              Devis en 2 minutes, paiement Wave en 1 clic, relances WhatsApp automatiques<br className="hidden md:block" />
              et <strong className="text-gray-800">conformité DGID garantie.</strong>
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/login" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-base sm:text-lg px-6 sm:px-10 h-12 sm:h-14 md:h-16 rounded-2xl shadow-2xl shadow-blue-500/30 hover:scale-105 transition-transform font-bold">
                  Créer mon compte gratuit
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <a href="#comment-ca-marche" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto h-12 sm:h-14 md:h-16 rounded-2xl text-base sm:text-lg font-semibold border-gray-200 hover:bg-gray-50">
                  Voir comment ça marche
                  <ChevronRight className="ml-1 w-5 h-5" />
                </Button>
              </a>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-gray-400 font-medium pt-2">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Gratuit pour toujours</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Aucune carte bancaire</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Conforme DGID</span>
            </div>
          </div>
        </section>

        {/* ── Social Proof Bar ── */}
        <section className="py-6 bg-white border-y border-gray-100 px-4 sm:px-6">
          <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-center">
            <div>
              <p className="text-2xl sm:text-3xl font-black text-gray-900">100%</p>
              <p className="text-xs sm:text-sm text-gray-500 font-medium">Conforme DGID</p>
            </div>
            <div className="hidden sm:block w-px h-10 bg-gray-200" />
            <div>
              <p className="text-2xl sm:text-3xl font-black text-gray-900">2 min</p>
              <p className="text-xs sm:text-sm text-gray-500 font-medium">Pour créer un devis</p>
            </div>
            <div className="hidden sm:block w-px h-10 bg-gray-200" />
            <div>
              <p className="text-2xl sm:text-3xl font-black text-gray-900">1 clic</p>
              <p className="text-xs sm:text-sm text-gray-500 font-medium">Devis → Facture</p>
            </div>
            <div className="hidden sm:block w-px h-10 bg-gray-200" />
            <div>
              <p className="text-2xl sm:text-3xl font-black text-emerald-600">Wave</p>
              <p className="text-xs sm:text-sm text-gray-500 font-medium">Paiement intégré</p>
            </div>
          </div>
        </section>

        {/* ── Pain Points ── */}
        <section className="py-16 sm:py-20 bg-gray-950 px-4 sm:px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">
                Ces problèmes vous coûtent de l&apos;argent chaque mois
              </h2>
              <p className="text-gray-400 text-lg">Si vous vous reconnaissez, FactureFlow SN est fait pour vous.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {[
                { icon: Clock, text: 'Vous relancez vos clients 3, 4, 5 fois par WhatsApp avant d\'être payé' },
                { icon: AlertTriangle, text: 'Vous perdez des heures à créer vos devis sur Word ou Excel, avec des erreurs de calcul' },
                { icon: BarChart3, text: 'Vous ne savez pas combien d\'argent vous devez encore encaisser ce mois-ci' },
                { icon: FileText, text: 'Vos factures ne sont pas conformes DGID et vous risquez un redressement fiscal' },
                { icon: Users, text: 'Votre équipe n\'a pas accès aux factures et vous êtes le seul à tout gérer' },
                { icon: Receipt, text: 'Vous n\'avez aucune trace de vos paiements reçus ni de votre chiffre d\'affaires réel' },
              ].map((item, i) => (
                <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-7 flex flex-col gap-4">
                  <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center">
                    <item.icon className="w-6 h-6 text-red-400" />
                  </div>
                  <p className="text-gray-300 text-base sm:text-lg font-medium leading-snug">&ldquo;{item.text}&rdquo;</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-12">
              <p className="text-blue-400 font-bold text-xl mb-6">FactureFlow SN élimine chacun de ces problèmes.</p>
              <Link href="/login">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 h-12 rounded-xl shadow-lg shadow-blue-500/25">
                  Essayer gratuitement <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* ── Comment ça marche (détaillé) ── */}
        <section id="comment-ca-marche" className="py-16 sm:py-24 px-4 sm:px-6 bg-white">
          <div className="max-w-5xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-4">
              Comment utiliser FactureFlow SN
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">De l&apos;inscription à votre premier encaissement en 5 étapes simples. Aucune compétence technique requise.</p>
          </div>
          <div className="max-w-4xl mx-auto space-y-6">
            {[
              {
                step: '01',
                icon: UserPlus,
                color: 'text-blue-600', bg: 'bg-blue-50',
                title: 'Créez votre compte en 30 secondes',
                desc: 'Email, mot de passe, nom de votre entreprise — c\'est tout. Votre espace est prêt. Vous êtes automatiquement sur le plan Gratuit avec 5 factures par mois.',
                detail: 'Un guide de démarrage interactif vous accompagne : configurer votre entreprise, ajouter votre premier client, envoyer votre premier devis. Barre de progression visuelle à chaque étape.'
              },
              {
                step: '02',
                icon: Settings,
                color: 'text-orange-500', bg: 'bg-orange-50',
                title: 'Configurez votre entreprise',
                desc: 'Ajoutez votre logo, votre NINEA, votre RCCM, votre adresse et votre numéro Wave. Choisissez votre template favori parmi 3 designs professionnels.',
                detail: 'Activez ou désactivez la TVA 18% selon votre régime fiscal. Toutes ces informations apparaîtront automatiquement sur chaque facture et devis que vous créerez.'
              },
              {
                step: '03',
                icon: FileText,
                color: 'text-emerald-600', bg: 'bg-emerald-50',
                title: 'Créez un devis ou une facture',
                desc: 'Sélectionnez un client, ajoutez vos lignes de prestation (ou piochez dans votre catalogue), la TVA est calculée automatiquement par ligne. Envoyez par email ou WhatsApp.',
                detail: 'Si votre client accepte le devis, convertissez-le en facture en 1 clic. Les montants, les lignes et la TVA sont repris automatiquement. La numérotation séquentielle DGID est gérée pour vous.'
              },
              {
                step: '04',
                icon: Smartphone,
                color: 'text-blue-600', bg: 'bg-blue-50',
                title: 'Votre client paie par Mobile Money',
                desc: 'Chaque facture contient un lien Wave pré-rempli avec le montant exact. Votre client l\'ouvre sur son téléphone, confirme et c\'est payé. Orange Money est aussi accepté.',
                detail: 'Si le paiement tarde, générez une relance WhatsApp personnalisée en 1 clic. Le message inclut le nom du client, le numéro de facture, le montant et le lien vers le PDF.'
              },
              {
                step: '05',
                icon: BarChart3,
                color: 'text-orange-500', bg: 'bg-orange-50',
                title: 'Suivez votre trésorerie en temps réel',
                desc: 'Votre dashboard affiche le montant à encaisser, le CA du mois, les factures en retard et le top 5 de vos clients. Le Livre d\'Inventaire trace chaque paiement reçu.',
                detail: 'Exportez vos données en CSV pour votre comptable. Graphique d\'évolution du CA sur 6 mois. Alertes automatiques quand une facture passe en retard.'
              },
            ].map((s) => (
              <div key={s.step} className="relative bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-lg transition-all duration-300">
                <div className="flex flex-col sm:flex-row gap-5">
                  <div className="flex-shrink-0">
                    <div className={`w-14 h-14 ${s.bg} ${s.color} rounded-2xl flex items-center justify-center`}>
                      <s.icon className="w-7 h-7" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">ÉTAPE {s.step}</span>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900">{s.title}</h3>
                    </div>
                    <p className="text-gray-600 leading-relaxed mb-2">{s.desc}</p>
                    <p className="text-gray-400 text-sm leading-relaxed">{s.detail}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/login">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-base sm:text-lg px-8 sm:px-10 h-12 sm:h-14 rounded-2xl shadow-2xl shadow-blue-500/30 hover:scale-105 transition-transform font-bold">
                Commencer maintenant — c&apos;est gratuit
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </section>

        {/* ── Features Grid ── */}
        <section id="fonctionnalites" className="py-16 sm:py-24 bg-gray-50 px-4 sm:px-6 border-y border-gray-100">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-4">Tout ce dont votre PME a besoin pour facturer et encaisser</h2>
              <p className="text-gray-500 text-lg max-w-2xl mx-auto">12 fonctionnalités pensées pour le marché sénégalais. Conformité DGID, paiement mobile, relances automatiques.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {FEATURES.map((f, i) => (
                <div key={i} className="bg-white p-6 sm:p-7 rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
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

        {/* ── Conformité DGID ── */}
        <section className="py-16 sm:py-20 px-4 sm:px-6 bg-white">
          <div className="max-w-5xl mx-auto">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 sm:p-12 md:p-16 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
              <div className="relative flex flex-col lg:flex-row gap-10 items-center">
                <div className="flex-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-sm font-bold mb-6">
                    <Shield className="w-4 h-4" /> Conformité garantie
                  </div>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight mb-6">
                    Factures 100% conformes<br />à la réglementation DGID
                  </h2>
                  <p className="text-gray-300 text-base sm:text-lg leading-relaxed mb-8">
                    FactureFlow SN applique automatiquement toutes les exigences légales de la Direction Générale des Impôts et Domaines du Sénégal. Vous facturez en toute sérénité, sans risque de redressement.
                  </p>
                  <ul className="space-y-3">
                    {[
                      'TVA 18% calculée automatiquement par ligne',
                      'Numérotation séquentielle obligatoire (DGID)',
                      'NINEA et RCCM de votre entreprise sur chaque document',
                      'NIF / identifiant fiscal du client affiché',
                      'Mentions légales de pénalités DGID en pied de page',
                      'Badge de conformité DGID visible sur chaque facture',
                      'Conditions de paiement et notes personnalisables',
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
                        <span className="text-gray-200 font-medium">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex-shrink-0 w-full lg:w-72">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
                    <div className="w-20 h-20 mx-auto mb-4 bg-emerald-500/20 rounded-2xl flex items-center justify-center">
                      <ShieldCheck className="w-10 h-10 text-emerald-400" />
                    </div>
                    <p className="text-white font-bold text-lg mb-1">Conforme DGID</p>
                    <p className="text-gray-400 text-sm">Sénégal</p>
                    <div className="mt-4 pt-4 border-t border-white/10 space-y-2 text-left">
                      <p className="text-gray-300 text-xs flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> TVA 18%</p>
                      <p className="text-gray-300 text-xs flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> NINEA / RCCM</p>
                      <p className="text-gray-300 text-xs flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Numérotation séquentielle</p>
                      <p className="text-gray-300 text-xs flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Mentions légales</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Testimonials ── */}
        <section id="temoignages" className="py-16 sm:py-24 px-4 sm:px-6 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-4">Ce qu&apos;en disent les PME sénégalaises</h2>
              <div className="flex items-center justify-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-amber-400" />)}
                <span className="text-gray-500 text-sm font-medium ml-2">4.9 / 5 — Noté par nos utilisateurs</span>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {TESTIMONIALS.map((t, i) => (
                <div key={i} className="bg-white border border-gray-100 rounded-3xl p-6 flex flex-col gap-4">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(5)].map((_, j) => <Star key={j} className="w-3.5 h-3.5 fill-amber-400" />)}
                  </div>
                  <p className="text-gray-700 leading-relaxed font-medium text-sm flex-1">&ldquo;{t.text}&rdquo;</p>
                  <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
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
        <section id="tarifs" className="py-16 sm:py-24 px-4 sm:px-6 bg-white">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-4">Des tarifs pensés pour les PME sénégalaises</h2>
              <p className="text-slate-500 text-lg max-w-xl mx-auto">Commencez gratuitement. Passez au plan supérieur uniquement quand votre activité le justifie. Sans engagement.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 items-stretch">
              {PLANS.map((plan) => (
                <div
                  key={plan.name}
                  className={`relative rounded-3xl p-6 sm:p-8 flex flex-col gap-6 bg-white transition-all ${plan.highlight
                    ? 'border-2 border-blue-600 shadow-xl shadow-blue-500/10 md:scale-105 z-10'
                    : 'border border-gray-200 shadow-sm'
                    }`}
                >
                  {plan.badge && (
                    <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
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
            <div className="text-center mt-10 space-y-2">
              <p className="text-slate-500 text-sm flex items-center justify-center gap-2 font-medium">
                <Lock className="w-4 h-4" /> Paiement par Wave, Orange Money ou virement · Sans engagement
              </p>
              <p className="text-slate-400 text-xs">
                Envoyez le montant par Wave → Partagez la capture sur WhatsApp → Plan activé sous 2h
              </p>
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section id="faq" className="py-16 sm:py-24 px-4 sm:px-6 bg-gray-50">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-4">Questions fréquentes</h2>
              <p className="text-gray-500 text-lg">Tout ce que vous devez savoir avant de commencer.</p>
            </div>
            <div className="space-y-4">
              {FAQ.map((item, i) => (
                <details key={i} className="group bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                  <summary className="flex items-center justify-between cursor-pointer p-6 text-left font-bold text-gray-900 hover:bg-gray-50 transition-colors">
                    <span className="pr-4">{item.q}</span>
                    <ChevronDown className="w-5 h-5 text-gray-400 shrink-0 group-open:rotate-180 transition-transform duration-200" />
                  </summary>
                  <div className="px-6 pb-6 text-gray-600 leading-relaxed">
                    {item.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA Final ── */}
        <section className="py-16 sm:py-20 md:py-28 px-4 sm:px-6 bg-white">
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl p-8 sm:p-12 md:p-20 text-center relative overflow-hidden shadow-2xl shadow-blue-500/30">
            <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-white mb-6 relative z-10 tracking-tight">
              Arrêtez de perdre de l&apos;argent.<br className="hidden sm:inline" /> Commencez à encaisser.
            </h2>
            <p className="text-blue-100 text-lg md:text-xl mb-4 max-w-2xl mx-auto relative z-10 font-medium">
              Les PME qui utilisent FactureFlow SN divisent par deux leurs délais de paiement. Devis professionnel en 2 minutes, relance WhatsApp en 1 clic, paiement Wave instantané.
            </p>
            <p className="text-blue-200/80 text-sm mb-10 relative z-10">
              Créez votre compte en 30 secondes. C&apos;est gratuit, sans carte bancaire et sans engagement.
            </p>
            <Link href="/login" className="relative z-10 inline-block">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-50 h-12 sm:h-14 md:h-16 px-8 sm:px-12 rounded-2xl text-base sm:text-lg font-bold shadow-xl hover:scale-105 transition-transform">
                Créer mon compte gratuit
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-blue-200 text-sm mt-8 relative z-10">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Gratuit pour toujours</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Conforme DGID</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Paiement Wave intégré</span>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="bg-gray-950 border-t border-gray-800 py-10 sm:py-14 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-8">
            <div className="max-w-xs">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-lg">F</div>
                <span className="text-lg font-bold text-white">FactureFlow <span className="text-blue-400">SN</span></span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">Le logiciel de facturation et d&apos;encaissement Mobile Money conçu pour les PME sénégalaises. Conforme DGID.</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-sm">
              <div>
                <p className="text-white font-bold mb-3">Produit</p>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#fonctionnalites" className="hover:text-white transition-colors">Fonctionnalités</a></li>
                  <li><a href="#tarifs" className="hover:text-white transition-colors">Tarifs</a></li>
                  <li><a href="#comment-ca-marche" className="hover:text-white transition-colors">Comment ça marche</a></li>
                  <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
                </ul>
              </div>
              <div>
                <p className="text-white font-bold mb-3">Conformité</p>
                <ul className="space-y-2 text-gray-400">
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> DGID Sénégal</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> TVA 18%</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> NINEA / RCCM</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Données sécurisées</li>
                </ul>
              </div>
              <div>
                <p className="text-white font-bold mb-3">Support</p>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="https://wa.me/221786037913" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">WhatsApp</a></li>
                  <li><a href="mailto:contact@factureflow.sn" className="hover:text-white transition-colors">Email</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-gray-600 text-sm">© 2026 FactureFlow SN — Tous droits réservés</p>
            <div className="flex gap-6 text-sm text-gray-500">
              <a href="#" className="hover:text-white transition-colors">Mentions légales</a>
              <a href="#" className="hover:text-white transition-colors">Confidentialité</a>
              <a href="#" className="hover:text-white transition-colors">CGU</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}