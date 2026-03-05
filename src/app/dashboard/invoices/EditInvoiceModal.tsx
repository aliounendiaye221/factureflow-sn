'use client'

import { useEffect, useRef, useState } from 'react'
import { useFormState } from 'react-dom'
import { useRouter } from 'next/navigation'
import SubmitButton from '@/components/SubmitButton'
import { updateInvoiceAction, type InvoiceActionState } from '@/app/actions/invoiceActions'
import { Edit, X, Plus } from 'lucide-react'
import type { InvoiceItem } from '@/services/invoiceService'

type Client = { id: string; name: string }
type Item = { description: string; quantity: string; unit_price: string; tax_rate: string }

const initialState: InvoiceActionState = { success: false, message: '' }

function emptyItem(): Item { return { description: '', quantity: '1', unit_price: '0', tax_rate: '0' } }

function formatXOF(n: number) {
    return new Intl.NumberFormat('fr-SN', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(n)
}

type Props = {
    invoiceId: string
    status: string
    currentClientId: string
    currentItems: any
    currentDueDate: string | null
    clients: Client[]
}

export default function EditInvoiceModal({
    invoiceId,
    status,
    currentClientId,
    currentItems,
    currentDueDate,
    clients
}: Props) {
    const dialogRef = useRef<HTMLDialogElement>(null)

    // Format dates appropriately for the input: YYYY-MM-DD
    const defaultDueDate = currentDueDate ? currentDueDate.split('T')[0] : ''
    const initialItems: Item[] = Array.isArray(currentItems) && currentItems.length > 0
        ? currentItems.map((item: any) => ({
            description: item.description,
            quantity: item.quantity.toString(),
            unit_price: item.unit_price.toString(),
            tax_rate: (item.tax_rate ?? 0).toString()
        }))
        : [emptyItem()]

    const router = useRouter()
    const [items, setItems] = useState<Item[]>(initialItems)
    const [state, formAction] = useFormState(updateInvoiceAction.bind(null, invoiceId), initialState)

    useEffect(() => {
        if (state.success) {
            router.refresh()
            dialogRef.current?.close()
        }
    }, [state, router])

    const openModal = () => {
        setItems(initialItems)
        dialogRef.current?.showModal()
    }
    const closeModal = () => {
        dialogRef.current?.close()
    }

    // ── Calculs en temps réel ──────────────────────────────────
    const subtotal = items.reduce(
        (s, it) => s + (parseFloat(it.unit_price) || 0) * (parseFloat(it.quantity) || 0), 0
    )
    const taxAmount = items.reduce(
        (s, it) => s + ((parseFloat(it.unit_price) || 0) * (parseFloat(it.quantity) || 0) * ((parseFloat(it.tax_rate) || 0) / 100)), 0
    )

    const updateItem = (idx: number, field: keyof Item, value: string) =>
        setItems(prev => prev.map((it, i) => i === idx ? { ...it, [field]: value } : it))

    const addItem = () => setItems(prev => [...prev, emptyItem()])
    const removeItem = (idx: number) =>
        setItems(prev => prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev)

    return (
        <>
            <button
                onClick={openModal}
                className="flex items-center justify-center w-8 h-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors tooltip-trigger"
                title="Modifier la facture"
            >
                <Edit className="w-4 h-4" />
            </button>

            <dialog
                ref={dialogRef}
                className="w-[calc(100%-1rem)] sm:w-full max-w-2xl rounded-2xl p-0 shadow-2xl backdrop:bg-black/50"
                onClose={closeModal}
            >
                <div className="bg-white rounded-2xl max-h-[92vh] flex flex-col text-left">
                    {/* En-tête */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
                        <h2 className="text-lg font-bold text-gray-900">Modifier la facture {status === 'paid' && <span className="text-emerald-600 text-xs ml-2">(Payée)</span>}</h2>
                        <button type="button" onClick={closeModal} className="text-gray-400 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Formulaire */}
                    <form action={formAction} className="overflow-y-auto flex-1 flex flex-col">
                        <div className="px-6 py-5 space-y-5 flex-1">
                            {!state.success && state.message && (
                                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
                                    {state.message}
                                </div>
                            )}

                            {/* Client */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                    Client <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="client_id"
                                    required
                                    defaultValue={currentClientId}
                                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                >
                                    <option value="" disabled>Sélectionnez un client…</option>
                                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                                {state.errors?.client_id && (
                                    <p className="text-red-500 text-xs mt-1">{state.errors.client_id}</p>
                                )}
                            </div>

                            {/* Date d'échéance */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Date d'échéance</label>
                                <input
                                    name="due_date"
                                    type="date"
                                    defaultValue={defaultDueDate}
                                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                />
                            </div>

                            {/* Lignes */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Lignes <span className="text-red-500">*</span>
                                </label>
                                {state.errors?.items && (
                                    <p className="text-red-500 text-xs mb-2">{state.errors.items}</p>
                                )}
                                <div className="space-y-2">
                                    <div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-500 px-1">
                                        <span className="col-span-5">Description</span>
                                        <span className="col-span-2 text-center">Qté</span>
                                        <span className="col-span-2 text-center">TVA (%)</span>
                                        <span className="col-span-2 text-right">Prix unit. (XOF)</span>
                                        <span className="col-span-1" />
                                    </div>
                                    {items.map((item, idx) => (
                                        <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                                            <input type="hidden" name={`items[${idx}][description]`} value={item.description} />
                                            <input type="hidden" name={`items[${idx}][quantity]`} value={item.quantity} />
                                            <input type="hidden" name={`items[${idx}][unit_price]`} value={item.unit_price} />
                                            <input type="hidden" name={`items[${idx}][tax_rate]`} value={item.tax_rate} />
                                            <input
                                                value={item.description}
                                                onChange={e => updateItem(idx, 'description', e.target.value)}
                                                placeholder="Design logo…"
                                                className="col-span-5 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                            />
                                            <input
                                                value={item.quantity}
                                                onChange={e => updateItem(idx, 'quantity', e.target.value)}
                                                type="number" min="0" step="0.01"
                                                className="col-span-2 border border-gray-200 rounded-lg px-2 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                            />
                                            <input
                                                value={item.tax_rate}
                                                onChange={e => updateItem(idx, 'tax_rate', e.target.value)}
                                                type="number" min="0" max="100" step="0.1"
                                                className="col-span-2 border border-gray-200 rounded-lg px-2 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                            />
                                            <input
                                                value={item.unit_price}
                                                onChange={e => updateItem(idx, 'unit_price', e.target.value)}
                                                type="number" min="0" step="1"
                                                className="col-span-2 border border-gray-200 rounded-lg px-2 py-2 text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                            />
                                            <button
                                                type="button" onClick={() => removeItem(idx)}
                                                className="col-span-1 text-gray-300 hover:text-red-500 flex justify-center"
                                            ><X className="w-4 h-4" /></button>
                                        </div>
                                    ))}
                                </div>
                                <button type="button" onClick={addItem} className="mt-3 text-sm text-primary hover:text-primary-700 font-medium flex items-center gap-1.5">
                                    <Plus className="w-3.5 h-3.5" />
                                    Ajouter une ligne
                                </button>
                            </div>

                            {/* Récap */}
                            <div className="bg-gray-50 rounded-xl p-4 space-y-1.5 text-sm mb-4 border border-gray-100">
                                <div className="flex justify-between text-gray-600">
                                    <span>Sous-total HT</span><span>{formatXOF(subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>TVA</span><span>{formatXOF(taxAmount)}</span>
                                </div>
                                <div className="flex justify-between font-bold text-gray-900 text-base border-t border-gray-200 pt-2 mt-2">
                                    <span>Total TTC</span>
                                    <span className="text-primary">{formatXOF(subtotal + taxAmount)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 shrink-0 bg-white">
                            <button type="button" onClick={closeModal} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 font-medium rounded-lg hover:bg-gray-50">Annuler</button>
                            <SubmitButton label="Enregistrer les modifications" pendingLabel="Enregistrement…" />
                        </div>
                    </form>
                </div>
            </dialog>
        </>
    )
}
