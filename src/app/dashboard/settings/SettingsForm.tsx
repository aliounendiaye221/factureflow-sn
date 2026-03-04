'use client'

import { useFormState } from 'react-dom'
import { useState, useTransition } from 'react'
import SubmitButton from '@/components/SubmitButton'
import { updateAgencyAction, updateAgencyLogoAction, type SettingsState } from '@/app/actions/settingsActions'
import LogoUpload from './LogoUpload'

type Props = {
  defaultValues: {
    name: string
    ninea: string | null
    rccm: string | null
    email: string | null
    phone: string | null
    address: string | null
    logo_url: string | null
    invoice_template: 'classic' | 'modern' | 'elite'
    is_vat_enabled: boolean
  }
  userId: string
}

const initialState: SettingsState = {}

export default function SettingsForm({ defaultValues, userId }: Props) {
  const [state, formAction] = useFormState(updateAgencyAction, initialState)
  const [logoSuccess, setLogoSuccess] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  const handleLogoUpload = (url: string) => {
    startTransition(async () => {
      const result = await updateAgencyLogoAction(url)
      if (result.error) {
        console.error('Logo save error:', result.error)
      } else {
        setLogoSuccess('Logo mis à jour avec succès.')
        setTimeout(() => setLogoSuccess(null), 3000)
      }
    })
  }

  return (
    <form action={formAction} className="space-y-6">

      {/* Message de succès */}
      {state.success && (
        <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-md text-sm">
          {state.message}
        </div>
      )}

      {/* Erreur globale */}
      {state.message && !state.success && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
          {state.message}
        </div>
      )}

      {/* ── Logo de l'agence ────────────────────────────────────── */}
      <div className="pb-4 border-b border-gray-100">
        {logoSuccess && (
          <div className="mb-3 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md text-sm">
            {logoSuccess}
          </div>
        )}
        <LogoUpload
          currentLogoUrl={defaultValues.logo_url}
          userId={userId}
          onUploadSuccessAction={handleLogoUpload}
        />
      </div>

      {/* ── Identité légale ────────────────────────────────────── */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
          Identité légale
        </h3>
        <div className="space-y-4">
          {/* Nom de l'agence */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom de l'agence <span className="text-red-500">*</span>
            </label>
            <input
              name="name"
              type="text"
              defaultValue={defaultValues.name}
              placeholder="Ex: Agence Teranga SARL"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-800"
              required
            />
            {state.errors?.name && (
              <p className="text-red-500 text-xs mt-1">{state.errors.name[0]}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* NINEA */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">NINEA</label>
              <input
                name="ninea"
                type="text"
                defaultValue={defaultValues.ninea ?? ''}
                placeholder="00000000000"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-800 uppercase"
              />
              {state.errors?.ninea && (
                <p className="text-red-500 text-xs mt-1">{state.errors.ninea[0]}</p>
              )}
            </div>

            {/* RCCM */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">RCCM</label>
              <input
                name="rccm"
                type="text"
                defaultValue={defaultValues.rccm ?? ''}
                placeholder="SN-DKR-2024-B-00000"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-800 uppercase"
              />
              {state.errors?.rccm && (
                <p className="text-red-500 text-xs mt-1">{state.errors.rccm[0]}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Coordonnées de contact ──────────────────────────────── */}
      <div className="pt-4 border-t border-gray-100">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
          Coordonnées de contact
        </h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Email de contact */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email de contact</label>
              <input
                name="email"
                type="email"
                defaultValue={defaultValues.email ?? ''}
                placeholder="contact@monagence.sn"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-800"
              />
              {state.errors?.email && (
                <p className="text-red-500 text-xs mt-1">{state.errors.email[0]}</p>
              )}
            </div>

            {/* Téléphone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
              <input
                name="phone"
                type="tel"
                defaultValue={defaultValues.phone ?? ''}
                placeholder="+221 77 000 00 00"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-800"
              />
              {state.errors?.phone && (
                <p className="text-red-500 text-xs mt-1">{state.errors.phone[0]}</p>
              )}
            </div>
          </div>

          {/* Adresse */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Adresse physique</label>
            <textarea
              name="address"
              defaultValue={defaultValues.address ?? ''}
              placeholder="Rue 10 Almadies, Dakar, Sénégal"
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-800 resize-none text-sm"
            />
            {state.errors?.address && (
              <p className="text-red-500 text-xs mt-1">{state.errors.address[0]}</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Paramètres fiscaux ──────────────────────────────────── */}
      <div className="pt-4 border-t border-gray-100">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
          Paramètres fiscaux
        </h3>
        <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
          <div className="flex-1 pr-4">
            <p className="text-sm font-bold text-gray-900 leading-none">Activer la TVA (18%)</p>
            <p className="text-[11px] text-gray-500 mt-1">
              Si activé, une taxe de 18% sera suggérée par défaut sur tous vos nouveaux devis et factures.
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              name="is_vat_enabled"
              defaultChecked={defaultValues.is_vat_enabled}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>

      {/* ── Design de Facture ───────────────────────────────────── */}
      <div className="pt-4 border-t border-gray-100">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
          Design de vos factures
        </h3>
        <p className="text-xs text-gray-500 mb-6 font-medium">
          Le template sélectionné s'appliquera à tous vos devis et factures lors de l'impression ou de l'envoi.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Classique */}
          <label className="relative flex flex-col cursor-pointer focus:outline-none group">
            <input
              type="radio"
              name="invoice_template"
              value="classic"
              defaultChecked={defaultValues.invoice_template === 'classic' || !defaultValues.invoice_template}
              className="sr-only peer"
            />
            <div className="p-4 border border-gray-200 rounded-2xl bg-white peer-checked:border-blue-600 peer-checked:ring-4 peer-checked:ring-blue-50 transition-all hover:border-gray-300 flex flex-col gap-3">
              <div className="h-24 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100 overflow-hidden">
                <div className="w-12 h-16 bg-white shadow-sm border border-gray-200 rounded p-1 space-y-1 scale-90">
                  <div className="h-1 w-full bg-blue-600"></div>
                  <div className="h-1 w-2/3 bg-gray-200"></div>
                  <div className="h-2 w-full bg-gray-50 mt-2"></div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-gray-900 leading-none">Classique DGI</p>
                  <p className="text-[10px] text-gray-500 mt-1">Épuré & Officiel</p>
                </div>
                <div className="hidden peer-checked:block bg-blue-600 text-white rounded-full p-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                </div>
              </div>
            </div>
          </label>

          {/* Moderne */}
          <label className="relative flex flex-col cursor-pointer focus:outline-none group">
            <input
              type="radio"
              name="invoice_template"
              value="modern"
              defaultChecked={defaultValues.invoice_template === 'modern'}
              className="sr-only peer"
            />
            <div className="p-4 border border-gray-200 rounded-2xl bg-white peer-checked:border-blue-600 peer-checked:ring-4 peer-checked:ring-blue-50 transition-all hover:border-gray-300 flex flex-col gap-3">
              <div className="h-24 bg-slate-50 rounded-xl flex items-center justify-center border border-gray-100 overflow-hidden">
                <div className="w-12 h-16 bg-white shadow-sm border border-gray-200 rounded flex overflow-hidden scale-90">
                  <div className="w-4 h-full bg-slate-900"></div>
                  <div className="flex-1 p-1 space-y-1">
                    <div className="h-1 w-full bg-slate-200"></div>
                    <div className="h-2 w-full bg-slate-50 mt-2"></div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-gray-900 leading-none">Moderne Pro</p>
                  <p className="text-[10px] text-gray-500 mt-1">Structure Dynamique</p>
                </div>
                <div className="hidden peer-checked:block bg-blue-600 text-white rounded-full p-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                </div>
              </div>
            </div>
          </label>

          {/* Élite */}
          <label className="relative flex flex-col cursor-pointer focus:outline-none group">
            <input
              type="radio"
              name="invoice_template"
              value="elite"
              defaultChecked={defaultValues.invoice_template === 'elite'}
              className="sr-only peer"
            />
            <div className="p-4 border border-gray-200 rounded-2xl bg-white peer-checked:border-blue-600 peer-checked:ring-4 peer-checked:ring-blue-50 transition-all hover:border-gray-300 flex flex-col gap-3">
              <div className="h-24 bg-blue-50 rounded-xl flex items-center justify-center border border-gray-100 overflow-hidden">
                <div className="w-12 h-16 bg-white shadow-sm border border-gray-200 rounded p-1 relative scale-90">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-blue-700"></div>
                  <div className="h-2 w-1/3 bg-gray-200 mt-2"></div>
                  <div className="h-4 w-full bg-blue-100 mt-3 rounded-sm"></div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-gray-900 leading-none">Élite Prestige</p>
                  <p className="text-[10px] text-gray-500 mt-1">L'Excellence Visuelle</p>
                </div>
                <div className="hidden peer-checked:block bg-blue-600 text-white rounded-full p-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                </div>
              </div>
            </div>
          </label>
        </div>
      </div>

      <div className="pt-8 border-t border-gray-100">
        <SubmitButton
          label="Enregistrer les modifications"
          pendingLabel="Enregistrement…"
          className="w-full sm:w-auto bg-blue-600 text-white px-10 py-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 font-bold transition-all shadow-lg shadow-blue-500/20"
        />
      </div>
    </form>
  )
}
