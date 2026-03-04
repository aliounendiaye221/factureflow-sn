'use client'

import { useState, useEffect, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useSearchParams } from 'next/navigation'
import {
  Zap, ArrowRight, CheckCircle2, Eye, EyeOff,
  Shield, Users, TrendingUp, FileText
} from 'lucide-react'

type Mode = 'login' | 'signup' | 'forgot'

const FEATURES = [
  { icon: FileText, text: 'Factures & devis professionnels' },
  { icon: TrendingUp, text: 'Dashboard de trésorerie en temps réel' },
  { icon: Users, text: "Gestion d'équipe multi-rôles" },
  { icon: Shield, text: 'Données sécurisées & RGPD' },
]

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-950" />
    }>
      <LoginForm />
    </Suspense>
  )
}

function LoginForm() {
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [agencyName, setAgencyName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    const urlError = searchParams.get('error')
    if (urlError === 'lien_invalide') setError('Ce lien est invalide ou a expiré. Faites une nouvelle demande.')
    if (urlError === 'session_expiree') setError('Votre session a expiré. Faites une nouvelle demande.')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${siteUrl}/auth/callback?next=/auth/update-password`,
    })
    setLoading(false)
    if (error) setError(error.message)
    else setInfo('Un lien de réinitialisation a été envoyé à votre adresse email.')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setInfo(null)

    if (mode === 'login') {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(error.message === 'Invalid login credentials' ? 'Email ou mot de passe incorrect.' : error.message)
        setLoading(false)
      } else {
        if (typeof window !== 'undefined' && (window as any).posthog && data.user) {
          (window as any).posthog.identify(data.user.id, { email: data.user.email })
            ; (window as any).posthog.capture('user_login', { method: 'email' })
        }
        window.location.href = '/dashboard'
      }
      return
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.')
      setLoading(false)
      return
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { agency_name: agencyName } },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    if (typeof window !== 'undefined' && (window as any).posthog && data.user) {
      (window as any).posthog.identify(data.user.id, { email: data.user.email, agency_name: agencyName })
        ; (window as any).posthog.capture('user_signup', { method: 'email' })
    }

    if (data.session) {
      if (data.user) {
        await supabase.from('agencies').upsert({
          id: data.user.id,
          name: agencyName || email.split('@')[0],
        })
      }
      window.location.href = '/dashboard'
    } else {
      setInfo('Vérifiez votre email pour confirmer votre inscription.')
      setMode('login')
      setLoading(false)
    }
  }

  const switchMode = (m: Mode) => { setMode(m); setError(null); setInfo(null) }

  return (
    <div className="min-h-screen flex">
      {/* ── LEFT PANEL — Brand Visual ── */}
      <div className="hidden lg:flex lg:w-[52%] xl:w-[55%] relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 overflow-hidden flex-col justify-between p-12">
        {/* Background decorations */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-3xl translate-x-1/4 translate-y-1/4" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-white/5 rounded-full blur-2xl" />
          {/* Grid dots */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '32px 32px' }}
          />
        </div>

        {/* Top: Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo flex items-center justify-center shadow-glow">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-white tracking-tight">FactureFlow</span>
              <span className="text-xl font-bold text-blue-400 ml-1">SN</span>
            </div>
          </div>
        </div>

        {/* Center: Hero text */}
        <div className="relative z-10 space-y-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 border border-white/30 text-white text-xs font-semibold mb-6">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
              </span>
              La facturation B2B à l&apos;africaine
            </div>

            <h1 className="text-4xl xl:text-5xl font-black text-white leading-[1.1] tracking-tight">
              Encaissez plus vite.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-white to-blue-100">
                Travaillez mieux.
              </span>
            </h1>
            <p className="text-blue-100 text-lg mt-4 max-w-sm leading-relaxed">
              Devis, factures et paiements Wave & Orange Money dans une seule plateforme.
            </p>
          </div>

          {/* Feature pills */}
          <div className="grid grid-cols-2 gap-3">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className="flex items-center gap-2.5 bg-white/15 border border-white/20 rounded-xl px-4 py-3 text-white text-sm font-medium"
              >
                <f.icon className="w-4 h-4 text-blue-200 flex-shrink-0" />
                {f.text}
              </div>
            ))}
          </div>

          {/* Testimonial */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <p className="text-blue-100 text-sm leading-relaxed">
              &ldquo;Avant FactureFlow, je relançais mes clients par WhatsApp. Maintenant ils paient directement depuis la facture. Mon taux de recouvrement a doublé.&rdquo;
            </p>
            <div className="flex items-center gap-2.5 mt-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo flex items-center justify-center text-white font-bold text-xs">MD</div>
              <div>
                <p className="text-white text-xs font-semibold">Mamadou Diallo</p>
                <p className="text-slate-500 text-xs">CEO, Agence Teranga Digital</p>
              </div>
              <div className="ml-auto flex gap-0.5">
                {[...Array(5)].map((_, j) => (
                  <span key={j} className="text-amber-400 text-xs">★</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom: Stats bar */}
        <div className="relative z-10 flex items-center gap-8 pt-4 border-t border-white/20">
          {[
            { val: '500+', label: 'PME actives' },
            { val: '98%', label: 'Satisfaction' },
            { val: '2 min', label: 'Setup' },
          ].map((s) => (
            <div key={s.val}>
              <p className="text-xl font-black text-white">{s.val}</p>
              <p className="text-blue-200 text-xs font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT PANEL — Auth Form ── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 bg-slate-50 min-h-screen">
        {/* Mobile logo (shown on small screens) */}
        <div className="flex lg:hidden items-center gap-2.5 mb-8">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-sm">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-slate-900">FactureFlow <span className="text-primary">SN</span></span>
        </div>

        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-white rounded-2xl shadow-card-md border border-slate-200/80 p-8">

            {/* Header */}
            <div className="mb-7">
              {mode === 'forgot' ? (
                <>
                  <h2 className="text-2xl font-bold text-slate-900">Mot de passe oublié</h2>
                  <p className="text-slate-500 text-sm mt-1.5">Renseignez votre email pour recevoir un lien.</p>
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-slate-900">
                    {mode === 'login' ? 'Bon retour 👋' : 'Créer un compte'}
                  </h2>
                  <p className="text-slate-500 text-sm mt-1.5">
                    {mode === 'login'
                      ? 'Connectez-vous à votre espace FactureFlow.'
                      : 'Démarrez gratuitement. Aucune carte requise.'}
                  </p>
                </>
              )}
            </div>

            {/* Tabs (login/signup) */}
            {mode !== 'forgot' && (
              <div className="flex gap-1 p-1 bg-slate-100 rounded-xl mb-7">
                {(['login', 'signup'] as Mode[]).map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => switchMode(m)}
                    className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${mode === m
                      ? 'bg-white text-slate-900 shadow-card'
                      : 'text-slate-500 hover:text-slate-700'
                      }`}
                  >
                    {m === 'login' ? 'Connexion' : 'Créer un compte'}
                  </button>
                ))}
              </div>
            )}

            {/* Alerts */}
            {error && (
              <div className="mb-5 flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                <span className="text-red-500 mt-0.5">✕</span>
                {error}
              </div>
            )}
            {info && (
              <div className="mb-5 flex items-start gap-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-3 text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                {info}
              </div>
            )}

            {/* Forgot password form */}
            {mode === 'forgot' && (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="vous@agence.sn"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all placeholder-slate-400"
                    required
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 font-semibold transition-all shadow-md hover:shadow-glow-sm text-sm"
                >
                  {loading ? 'Envoi…' : 'Envoyer le lien'}
                </button>
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="w-full py-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
                >
                  ← Retour à la connexion
                </button>
              </form>
            )}

            {/* Login / Signup form */}
            {mode !== 'forgot' && (
              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'signup' && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Nom de votre agence <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={agencyName}
                      onChange={e => setAgencyName(e.target.value)}
                      placeholder="Agence Teranga, Studio Delta…"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all placeholder-slate-400"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="vous@agence.sn"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all placeholder-slate-400"
                    required
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-sm font-semibold text-slate-700">
                      Mot de passe {mode === 'signup' && <span className="text-slate-400 font-normal">(min. 6 car.)</span>}
                    </label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => switchMode('forgot')}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
                      >
                        Oublié ?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 pr-11 border border-slate-200 rounded-xl text-sm text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all placeholder-slate-400"
                      required
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowPassword(v => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3.5 rounded-xl hover:from-blue-700 hover:to-indigo disabled:opacity-50 font-bold transition-all shadow-md hover:shadow-glow-sm flex items-center justify-center gap-2 text-sm mt-2"
                >
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      {mode === 'login' ? 'Se connecter' : 'Créer mon compte'}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-slate-400 mt-5">
            En continuant, vous acceptez nos{' '}
            <a href="#" className="underline hover:text-slate-600">Conditions</a>
            {' '}et notre{' '}
            <a href="#" className="underline hover:text-slate-600">Politique de confidentialité</a>.
          </p>
        </div>
      </div>
    </div>
  )
}