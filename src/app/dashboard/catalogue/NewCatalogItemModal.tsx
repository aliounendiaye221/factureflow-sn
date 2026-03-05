'use client'

import { useEffect, useRef, useState } from 'react'
import { useFormState } from 'react-dom'
import { createCatalogItemAction, type CatalogActionState } from '@/app/actions/catalogActions'
import SubmitButton from '@/components/SubmitButton'
import { Plus, Package, X } from 'lucide-react'

const TYPES = [{ value: 'product', label: 'Produit' }, { value: 'service', label: 'Service' }]
const initialState: CatalogActionState = { success: false, message: '' }

export default function NewCatalogItemModal() {
  const [state, formAction] = useFormState(createCatalogItemAction, initialState)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state.success) {
      dialogRef.current?.close()
      formRef.current?.reset()
    }
  }, [state])

  return (
    <>
      <button
        onClick={() => dialogRef.current?.showModal()}
        className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl hover:bg-primary/90 transition-colors font-semibold text-sm"
      >
        <Plus className="w-4 h-4" />
        Nouvel article
      </button>

      <dialog
        ref={dialogRef}
        className="w-[calc(100%-1rem)] sm:w-full max-w-lg rounded-2xl p-0 shadow-2xl backdrop:bg-black/40"
        onClose={() => dialogRef.current?.close()}
      >
        <div className="bg-white rounded-2xl">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-50 rounded-lg">
                <Package className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Ajouter un article</h2>
            </div>
            <button type="button" onClick={() => dialogRef.current?.close()} className="text-gray-400 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form ref={formRef} action={formAction} className="px-6 py-5 space-y-4">
            {!state.success && state.message && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
                {state.message}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Nom de l'article <span className="text-red-500">*</span>
              </label>
              <input
                name="name"
                type="text"
                required
                placeholder="Ex: Développement site web, Conseil stratégique…"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
              {state.errors?.name && <p className="text-red-500 text-xs mt-1">{state.errors.name}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Prix unitaire (XOF) <span className="text-red-500">*</span>
                </label>
                <input
                  name="unit_price"
                  type="number"
                  min="0"
                  step="100"
                  required
                  placeholder="50000"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
                {state.errors?.unit_price && <p className="text-red-500 text-xs mt-1">{state.errors?.unit_price}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Taux de TVA (%)</label>
                <input
                  name="tax_rate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  defaultValue="0"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Type</label>
              <select
                name="type"
                defaultValue="service"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              >
                {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
              <textarea
                name="description"
                rows={2}
                placeholder="Description détaillée (optionnel)"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
              />
              {state.errors?.description && <p className="text-red-500 text-xs mt-1">{state.errors.description}</p>}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => dialogRef.current?.close()}
                className="px-4 py-2.5 text-sm text-gray-600 hover:text-gray-800 font-medium rounded-xl hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <SubmitButton label="Ajouter au catalogue" pendingLabel="Enregistrement…" />
            </div>
          </form>
        </div>
      </dialog>
    </>
  )
}
