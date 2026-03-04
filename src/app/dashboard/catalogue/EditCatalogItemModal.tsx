'use client'

import { useEffect, useRef, useState } from 'react'
import { useFormState } from 'react-dom'
import { updateCatalogItemAction, deleteCatalogItemAction, type CatalogActionState } from '@/app/actions/catalogActions'
import SubmitButton from '@/components/SubmitButton'
import { Pencil, Trash2, X } from 'lucide-react'
import type { CatalogItem } from '@/services/catalogService'

const TYPES = [{ value: 'product', label: 'Produit' }, { value: 'service', label: 'Service' }]
const initialState: CatalogActionState = { success: false, message: '' }

function formatXOF(n: number) {
  return new Intl.NumberFormat('fr-SN', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(n)
}

export default function EditCatalogItemModal({ item, canDelete }: { item: CatalogItem; canDelete: boolean }) {
  const [editState, editAction] = useFormState(updateCatalogItemAction, initialState)
  const [deleteState, deleteAction] = useFormState(deleteCatalogItemAction, initialState)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    if (editState.success || deleteState.success) {
      dialogRef.current?.close()
    }
  }, [editState.success, deleteState.success])

  return (
    <>
      <button
        onClick={() => { setConfirmDelete(false); dialogRef.current?.showModal() }}
        title="Modifier"
        className="p-2 text-gray-400 hover:text-primary hover:bg-primary-50 rounded-lg transition-colors"
      >
        <Pencil className="w-4 h-4" />
      </button>

      <dialog
        ref={dialogRef}
        className="w-full max-w-lg rounded-2xl p-0 shadow-2xl backdrop:bg-black/40"
        onClose={() => dialogRef.current?.close()}
      >
        <div className="bg-white rounded-2xl">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">Modifier l'article</h2>
            <button type="button" onClick={() => dialogRef.current?.close()} className="text-gray-400 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100">
              <X className="w-5 h-5" />
            </button>
          </div>

          {confirmDelete ? (
            <div className="px-6 py-6 space-y-4">
              <p className="text-sm text-gray-700">
                Supprimer <strong>{item.name}</strong> ? Cette action est irréversible.
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="flex-1 px-4 py-2.5 text-sm text-gray-600 font-medium rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <form action={deleteAction} className="flex-1">
                  <input type="hidden" name="id" value={item.id} />
                  <SubmitButton
                    label="Supprimer définitivement"
                    pendingLabel="Suppression…"
                    className="w-full bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
                  />
                </form>
              </div>
            </div>
          ) : (
            <form action={editAction} className="px-6 py-5 space-y-4">
              <input type="hidden" name="id" value={item.id} />

              {!editState.success && editState.message && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
                  {editState.message}
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
                  defaultValue={item.name}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Prix unitaire (XOF)
                  </label>
                  <input
                    name="unit_price"
                    type="number"
                    min="0"
                    step="100"
                    required
                    defaultValue={item.unit_price}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Taux de TVA (%)</label>
                  <input
                    name="tax_rate"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    defaultValue={item.tax_rate ?? 0}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Type</label>
                <select
                  name="type"
                  defaultValue={item.type ?? 'service'}
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
                  defaultValue={item.description ?? ''}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                {canDelete && (
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 font-medium transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Supprimer
                  </button>
                )}
                <div className="flex gap-3 ml-auto">
                  <button
                    type="button"
                    onClick={() => dialogRef.current?.close()}
                    className="px-4 py-2.5 text-sm text-gray-600 hover:text-gray-800 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <SubmitButton label="Enregistrer" pendingLabel="Mise à jour…" />
                </div>
              </div>
            </form>
          )}
        </div>
      </dialog>
    </>
  )
}
