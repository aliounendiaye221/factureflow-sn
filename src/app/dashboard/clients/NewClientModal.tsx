'use client'

import { useEffect, useRef } from 'react'
import { useFormState } from 'react-dom'
import SubmitButton from '@/components/SubmitButton'
import { createClientAction, type CreateClientState } from '@/app/actions/clientActions'

const initialState: CreateClientState = { success: false, message: '' }

export default function NewClientModal() {
  const [state, formAction] = useFormState(createClientAction, initialState)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  // Fermer automatiquement le modal et réinitialiser le formulaire après succès
  useEffect(() => {
    if (state.success) {
      dialogRef.current?.close()
      formRef.current?.reset()
    }
  }, [state])

  const openModal = () => dialogRef.current?.showModal()
  const closeModal = () => dialogRef.current?.close()

  return (
    <>
      {/* Bouton d'ouverture */}
      <button
        onClick={openModal}
        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium"
      >
        + Nouveau Client
      </button>

      {/* Modal natif HTML */}
      <dialog
        ref={dialogRef}
        className="w-[calc(100%-1rem)] sm:w-full max-w-md rounded-xl p-0 shadow-2xl backdrop:bg-black/50"
        onClose={closeModal}
      >
        <div className="bg-white rounded-xl">
          {/* En-tête */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800">Nouveau client</h2>
            <button
              type="button"
              onClick={closeModal}
              className="text-gray-400 hover:text-gray-600 text-xl leading-none"
            >
              ×
            </button>
          </div>

          {/* Formulaire */}
          <form ref={formRef} action={formAction} className="px-6 py-5 space-y-4">

            {/* Message d'erreur global */}
            {!state.success && state.message && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-md">
                {state.message}
              </div>
            )}

            {/* Nom */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom <span className="text-red-500">*</span>
              </label>
              <input
                name="name"
                type="text"
                required
                placeholder="Agence Delta, Groupe Teranga…"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {state.errors?.name && (
                <p className="text-red-500 text-xs mt-1">{state.errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                name="email"
                type="email"
                placeholder="contact@client.sn"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {state.errors?.email && (
                <p className="text-red-500 text-xs mt-1">{state.errors.email}</p>
              )}
            </div>

            {/* Téléphone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
              <input
                name="phone"
                type="tel"
                placeholder="+221 77 000 00 00"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {state.errors?.phone && (
                <p className="text-red-500 text-xs mt-1">{state.errors.phone}</p>
              )}
            </div>

            {/* Adresse */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
              <input
                name="address"
                type="text"
                placeholder="Dakar, Plateau…"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {state.errors?.address && (
                <p className="text-red-500 text-xs mt-1">{state.errors.address}</p>
              )}
            </div>

            {/* NIF / NINEA client */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">NIF / NINEA</label>
              <input
                name="tax_id"
                type="text"
                placeholder="00000000000"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Annuler
              </button>
              <SubmitButton label="Créer le client" pendingLabel="Enregistrement…" />
            </div>
          </form>
        </div>
      </dialog>
    </>
  )
}
