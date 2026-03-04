'use client'

import { useEffect, useRef } from 'react'
import { useFormState } from 'react-dom'
import SubmitButton from '@/components/SubmitButton'
import { updateClientAction, type CreateClientState } from '@/app/actions/clientActions'
import { Edit } from 'lucide-react'

const initialState: CreateClientState = { success: false, message: '' }

type Props = {
    client: {
        id: string
        name: string
        email: string | null
        phone: string | null
        address: string | null
        tax_id: string | null
    }
}

export default function EditClientModal({ client }: Props) {
    const [state, formAction] = useFormState(updateClientAction.bind(null, client.id), initialState)
    const dialogRef = useRef<HTMLDialogElement>(null)

    useEffect(() => {
        if (state.success) {
            dialogRef.current?.close()
        }
    }, [state])

    const openModal = () => dialogRef.current?.showModal()
    const closeModal = () => dialogRef.current?.close()

    return (
        <>
            <button
                onClick={openModal}
                className="text-gray-400 hover:text-blue-600 p-2 rounded-lg hover:bg-blue-50 transition-colors tooltip-trigger"
                title="Éditer le client"
            >
                <Edit className="w-4 h-4" />
            </button>

            <dialog
                ref={dialogRef}
                className="w-full max-w-md rounded-xl p-0 shadow-2xl backdrop:bg-black/50"
                onClose={closeModal}
            >
                <div className="bg-white rounded-xl">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-800">Modifier {client.name}</h2>
                        <button
                            type="button"
                            onClick={closeModal}
                            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
                        >
                            ×
                        </button>
                    </div>

                    <form action={formAction} className="px-6 py-5 space-y-4">
                        {!state.success && state.message && (
                            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-md">
                                {state.message}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nom <span className="text-red-500">*</span>
                            </label>
                            <input
                                name="name"
                                type="text"
                                required
                                defaultValue={client.name}
                                placeholder="Agence Delta, Groupe Teranga…"
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {state.errors?.name && (
                                <p className="text-red-500 text-xs mt-1">{state.errors.name}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                name="email"
                                type="email"
                                defaultValue={client.email || ''}
                                placeholder="contact@client.sn"
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {state.errors?.email && (
                                <p className="text-red-500 text-xs mt-1">{state.errors.email}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                            <input
                                name="phone"
                                type="tel"
                                defaultValue={client.phone || ''}
                                placeholder="+221 77 000 00 00"
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {state.errors?.phone && (
                                <p className="text-red-500 text-xs mt-1">{state.errors.phone}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                            <input
                                name="address"
                                type="text"
                                defaultValue={client.address || ''}
                                placeholder="Dakar, Plateau…"
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {state.errors?.address && (
                                <p className="text-red-500 text-xs mt-1">{state.errors.address}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">NIF / NINEA</label>
                            <input
                                name="tax_id"
                                type="text"
                                defaultValue={client.tax_id || ''}
                                placeholder="00000000000"
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={closeModal}
                                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                            >
                                Annuler
                            </button>
                            <SubmitButton label="Enregistrer" pendingLabel="Enregistrement…" />
                        </div>
                    </form>
                </div>
            </dialog>
        </>
    )
}
