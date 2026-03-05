'use client'

import { useEffect, useRef, useState } from 'react'
import { useFormState } from 'react-dom'
import { useRouter } from 'next/navigation'
import posthog from 'posthog-js'
import { createQuoteAction, type CreateQuoteState } from '@/app/actions/quoteActions'
import { Button } from '@/components/ui/Button'
import { PlusCircle, Plus, X, ReceiptText, BookOpen, Search } from 'lucide-react'
import SubmitButton from '@/components/SubmitButton'
import type { CatalogItem } from '@/services/catalogService'

type Client = { id: string; name: string }
type Item = { description: string; quantity: string; unit_price: string; tax_rate: string }

const initialState: CreateQuoteState = { success: false, message: '' }

function emptyItem(taxRate: string): Item {
  return { description: '', quantity: '1', unit_price: '0', tax_rate: taxRate }
}

function formatXOF(amount: number) {
  return new Intl.NumberFormat('fr-SN', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(amount)
}

// ── Composant picker catalogue ────────────────────────────────────────────────
function CatalogPicker({
  catalogItems,
  onSelect,
  onClose,
}: {
  catalogItems: CatalogItem[]
  onSelect: (item: CatalogItem) => void
  onClose: () => void
}) {
  const [search, setSearch] = useState('')
  const filtered = catalogItems.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    (i.category ?? '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
      <div className="p-3 border-b border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            autoFocus
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher dans le catalogue…"
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
      </div>
      <div className="max-h-56 overflow-y-auto divide-y divide-gray-50">
        {filtered.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">Aucun article trouvé</p>
        ) : (
          filtered.map(item => (
            <button
              key={item.id}
              type="button"
              onClick={() => { onSelect(item); onClose() }}
              className="w-full text-left px-4 py-3 hover:bg-primary/5 transition-colors group"
            >
              <p className="text-sm font-medium text-gray-900 group-hover:text-primary">{item.name}</p>
              <div className="flex items-center justify-between mt-0.5">
                {item.category && <span className="text-xs text-gray-400">{item.category}</span>}
                <span className="text-xs font-semibold text-gray-700 ml-auto">
                  {formatXOF(item.unit_price)} / {item.unit ?? 'forfait'}
                </span>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  )
}

export default function NewQuoteModal({
  clients,
  catalogItems = [],
  isVatEnabled = true,
}: {
  clients: Client[]
  catalogItems?: CatalogItem[]
  isVatEnabled?: boolean
}) {
  const defaultTax = isVatEnabled ? '18' : '0'
  const [state, formAction] = useFormState(createQuoteAction, initialState)
  const router = useRouter()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const [items, setItems] = useState<Item[]>([emptyItem(defaultTax)])
  const [showCatalog, setShowCatalog] = useState(false)
  const [activeCatalogIdx, setActiveCatalogIdx] = useState<number | null>(null)

  // Calculs en temps réel
  const subT = items.reduce((s, it) => s + (parseFloat(it.unit_price) || 0) * (parseFloat(it.quantity) || 0), 0)
  const taxAmount = items.reduce((s, it) => s + ((parseFloat(it.unit_price) || 0) * (parseFloat(it.quantity) || 0) * ((parseFloat(it.tax_rate) || 0) / 100)), 0)
  const total = subT + taxAmount

  // Fermer et réinitialiser après succès
  useEffect(() => {
    if (state.success) {
      router.refresh()
      if (typeof window !== 'undefined' && posthog) {
        posthog.capture('quote_created', { amount: total })
      }
      dialogRef.current?.close()
      formRef.current?.reset()
      setItems([emptyItem(defaultTax)])
    }
  }, [state, total, router])

  const openModal = () => dialogRef.current?.showModal()
  const closeModal = () => {
    dialogRef.current?.close()
    setItems([emptyItem(defaultTax)])
  }

  const updateItem = (idx: number, field: keyof Item, value: string) =>
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, [field]: value } : it))

  const addItem = () => setItems(prev => [...prev, emptyItem(defaultTax)])

  const removeItem = (idx: number) =>
    setItems(prev => prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev)

  // Insérer un article depuis le catalogue
  const insertFromCatalog = (catalogItem: CatalogItem) => {
    const newItem: Item = {
      description: catalogItem.name,
      quantity: '1',
      unit_price: String(catalogItem.unit_price),
      tax_rate: String(catalogItem.tax_rate ?? 0),
    }
    if (activeCatalogIdx !== null) {
      setItems(prev => {
        const updated = [...prev]
        updated[activeCatalogIdx] = newItem
        return updated
      })
    } else {
      setItems(prev => [...prev, newItem])
    }
    setShowCatalog(false)
    setActiveCatalogIdx(null)
  }

  return (
    <>
      <Button onClick={openModal}>
        <PlusCircle className="mr-2 h-4 w-4" />
        Nouveau Devis
      </Button>

      <dialog
        ref={dialogRef}
        className="w-[calc(100%-1rem)] sm:w-full max-w-3xl rounded-2xl p-0 shadow-2xl backdrop:bg-black/40 backdrop:backdrop-blur-sm open:animate-in open:fade-in open:zoom-in-95"
        onClose={closeModal}
      >
        <div className="bg-white rounded-2xl max-h-[90vh] flex flex-col">
          {/* En-tête */}
          <div className="flex items-center justify-between px-4 sm:px-8 py-4 sm:py-5 border-b border-gray-100 shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-50 rounded-lg">
                <ReceiptText className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Créer un devis</h2>
            </div>
            <button type="button" onClick={closeModal} className="text-gray-400 hover:text-gray-900 transition-colors p-2 rounded-full hover:bg-gray-100">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Formulaire scrollable */}
          <form ref={formRef} action={formAction} className="overflow-y-auto flex-1">
            <div className="px-4 sm:px-8 py-4 sm:py-6 space-y-6 sm:space-y-8">

              {/* Erreur globale */}
              {!state.success && state.message && (
                <div className="bg-alert/10 border border-alert/20 text-alert-700 text-sm px-4 py-3 rounded-lg flex items-center gap-2">
                  <X className="w-4 h-4" />
                  {state.message}
                </div>
              )}

              {/* Sélection client */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Client destinataire <span className="text-alert">*</span>
                </label>
                <select
                  name="client_id"
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none"
                  defaultValue=""
                >
                  <option value="" disabled>Sélectionnez un client dans la liste…</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                {state.errors?.client_id && (
                  <p className="text-alert-700 text-xs mt-1.5 font-medium">{state.errors.client_id}</p>
                )}
              </div>

              {/* Lignes du devis */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-semibold text-gray-900">
                    Détail des prestations <span className="text-alert">*</span>
                  </label>
                  {catalogItems.length > 0 && (
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => { setActiveCatalogIdx(null); setShowCatalog(v => !v) }}
                        className="flex items-center gap-1.5 text-xs text-primary font-medium bg-primary/5 hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        Depuis le catalogue
                      </button>
                      {showCatalog && activeCatalogIdx === null && (
                        <CatalogPicker
                          catalogItems={catalogItems}
                          onSelect={insertFromCatalog}
                          onClose={() => setShowCatalog(false)}
                        />
                      )}
                    </div>
                  )}
                </div>
                {state.errors?.items && (
                  <p className="text-alert-700 text-xs mb-3 font-medium bg-alert/5 p-2 rounded">{state.errors.items}</p>
                )}

                <div className="space-y-3">
                  <div className="hidden md:grid grid-cols-12 gap-3 text-xs font-semibold text-gray-500 px-2">
                    <span className="col-span-5 uppercase tracking-wider">Description</span>
                    <span className="col-span-2 text-center uppercase tracking-wider">Quantité</span>
                    <span className="col-span-2 text-center uppercase tracking-wider">TVA (%)</span>
                    <span className="col-span-2 text-right uppercase tracking-wider">Prix unit. (XOF)</span>
                    <span className="col-span-1" />
                  </div>

                  {items.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center bg-gray-50/50 p-4 md:p-2 rounded-xl border border-gray-100/50 md:border-transparent md:bg-transparent">
                      <input type="hidden" name={`items[${idx}][description]`} value={item.description} />
                      <input type="hidden" name={`items[${idx}][quantity]`} value={item.quantity} />
                      <input type="hidden" name={`items[${idx}][unit_price]`} value={item.unit_price} />
                      <input type="hidden" name={`items[${idx}][tax_rate]`} value={item.tax_rate} />

                      <div className="col-span-1 md:col-span-5 relative">
                        <input
                          value={item.description}
                          onChange={e => updateItem(idx, 'description', e.target.value)}
                          placeholder="Ex: Développement web complet"
                          className="w-full border border-gray-200 bg-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all hover:bg-gray-50 focus:bg-white pr-9"
                        />
                        {catalogItems.length > 0 && (
                          <div className="relative">
                            <button
                              type="button"
                              title="Choisir depuis le catalogue"
                              onClick={() => {
                                setActiveCatalogIdx(idx)
                                setShowCatalog(true)
                              }}
                              className="absolute right-2.5 -translate-y-1/2 text-gray-300 hover:text-primary transition-colors"
                              style={{ top: '-18px' }}
                            >
                              <BookOpen className="w-3.5 h-3.5" />
                            </button>
                            {showCatalog && activeCatalogIdx === idx && (
                              <CatalogPicker
                                catalogItems={catalogItems}
                                onSelect={insertFromCatalog}
                                onClose={() => { setShowCatalog(false); setActiveCatalogIdx(null) }}
                              />
                            )}
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-2 md:gap-3 col-span-1 md:col-span-6 relative">
                        <div className="relative">
                          <span className="absolute -top-5 left-1 text-[10px] text-gray-400 font-medium md:hidden uppercase">Qté</span>
                          <input
                            value={item.quantity}
                            onChange={e => updateItem(idx, 'quantity', e.target.value)}
                            type="number" min="0" step="0.01" placeholder="1"
                            className="w-full border border-gray-200 bg-white rounded-lg px-3 py-2.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all tabular-nums"
                          />
                        </div>
                        <div className="relative">
                          <span className="absolute -top-5 left-1 text-[10px] text-gray-400 font-medium md:hidden uppercase">TVA (%)</span>
                          <input
                            value={item.tax_rate}
                            onChange={e => updateItem(idx, 'tax_rate', e.target.value)}
                            type="number" min="0" max="100" step="0.1" placeholder="0"
                            className="w-full border border-gray-200 bg-white rounded-lg px-3 py-2.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all tabular-nums"
                          />
                        </div>
                        <div className="relative">
                          <span className="absolute -top-5 left-1 text-[10px] text-gray-400 font-medium md:hidden uppercase">Prix Unit.</span>
                          <input
                            value={item.unit_price}
                            onChange={e => updateItem(idx, 'unit_price', e.target.value)}
                            type="number" min="0" step="1" placeholder="0"
                            className="w-full border border-gray-200 bg-white rounded-lg px-3 py-2.5 text-sm md:text-right focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all tabular-nums"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(idx)}
                        className="col-span-1 text-gray-300 hover:text-alert-700 hover:bg-alert/10 p-2 text-center transition-colors rounded-lg flex justify-center mt-2 md:mt-0"
                      >
                        <span className="md:hidden text-sm mr-2">Supprimer la ligne</span>
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={addItem}
                  className="mt-4 flex items-center gap-2 text-sm text-primary hover:text-primary-700 font-medium bg-primary/5 hover:bg-primary/10 px-4 py-2 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter une ligne
                </button>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Notes / Conditions
                </label>
                <textarea
                  name="notes"
                  rows={3}
                  placeholder="Ex: Validité 30 jours. Acompte 50% à la commande. Paiement Wave ou Orange Money."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                />
              </div>

              {/* Récapitulatif */}
              <div className="bg-gray-50 rounded-xl p-6 space-y-3 text-sm border border-gray-100">
                <div className="flex justify-between text-gray-500 font-medium">
                  <span>Sous-total HT</span>
                  <span className="tabular-nums">{formatXOF(subT)}</span>
                </div>
                <div className="flex justify-between text-gray-500 font-medium">
                  <span>TVA</span>
                  <span className="tabular-nums">{formatXOF(taxAmount)}</span>
                </div>
                <div className="flex justify-between items-end font-bold text-gray-900 border-t border-gray-200/60 pt-4 mt-2">
                  <span className="text-base">Montant Total TTC</span>
                  <span className="text-3xl text-primary tabular-nums tracking-tight">{formatXOF(total)}</span>
                </div>
              </div>
            </div>

            {/* Actions fixées en bas */}
            <div className="flex justify-end gap-3 px-8 py-5 border-t border-gray-100 shrink-0 bg-white sticky bottom-0 z-10">
              <Button variant="ghost" type="button" onClick={closeModal}>
                Annuler
              </Button>
              <SubmitButton label="Générer la Proposition" pendingLabel="Enregistrement…" />
            </div>
          </form>
        </div>
      </dialog>
    </>
  )
}
