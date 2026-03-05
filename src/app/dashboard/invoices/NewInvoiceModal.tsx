'use client'

import { useEffect, useRef, useState } from 'react'
import { useFormState } from 'react-dom'
import { useRouter } from 'next/navigation'
import posthog from 'posthog-js'
import SubmitButton from '@/components/SubmitButton'
import {
  createInvoiceAction,
  convertQuoteToInvoiceAction,
  type InvoiceActionState,
} from '@/app/actions/invoiceActions'
import type { QuoteForConversion } from '@/services/invoiceService'
import type { CatalogItem } from '@/services/catalogService'
import { BookOpen, Plus, Search, X } from 'lucide-react'

type Client = { id: string; name: string }
type Item = { description: string; quantity: string; unit_price: string; tax_rate: string }
type Tab = 'nouvelle' | 'depuis-devis'

const TVA_DEFAULT = 18
const initialState: InvoiceActionState = { success: false, message: '' }

function emptyItem(taxRate: string): Item { return { description: '', quantity: '1', unit_price: '0', tax_rate: taxRate } }

function formatXOF(n: number) {
  return new Intl.NumberFormat('fr-SN', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(n)
}

// ── Catalogue picker ──────────────────────────────────────────────────────────
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
    <div className="absolute top-full left-0 mt-1 w-72 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
      <div className="p-2.5 border-b border-gray-100">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            autoFocus
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher…"
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>
      <div className="max-h-48 overflow-y-auto divide-y divide-gray-50">
        {filtered.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-4">Aucun article</p>
        ) : filtered.map(item => (
          <button
            key={item.id}
            type="button"
            onClick={() => { onSelect(item); onClose() }}
            className="w-full text-left px-3 py-2.5 hover:bg-blue-50 transition-colors"
          >
            <p className="text-xs font-medium text-gray-900">{item.name}</p>
            <div className="flex justify-between mt-0.5">
              {item.category && <span className="text-[10px] text-gray-400">{item.category}</span>}
              <span className="text-[10px] font-semibold text-gray-600 ml-auto">
                {formatXOF(item.unit_price)}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

export default function NewInvoiceModal({
  clients,
  quotes,
  catalogItems = [],
  isVatEnabled = true,
}: {
  clients: Client[]
  quotes: QuoteForConversion[]
  catalogItems?: CatalogItem[]
  isVatEnabled?: boolean
}) {
  const defaultTax = isVatEnabled ? String(TVA_DEFAULT) : '0'
  const [tab, setTab] = useState<Tab>('nouvelle')
  const router = useRouter()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const formFreeRef = useRef<HTMLFormElement>(null)
  const formQuoteRef = useRef<HTMLFormElement>(null)
  const [items, setItems] = useState<Item[]>([emptyItem(defaultTax)])
  const [selectedQuote, setSelectedQuote] = useState<QuoteForConversion | null>(null)
  const [showCatalog, setShowCatalog] = useState(false)
  const [activeCatalogIdx, setActiveCatalogIdx] = useState<number | null>(null)

  const [stateFree, actionFree] = useFormState(createInvoiceAction, initialState)
  const [stateQuote, actionQuote] = useFormState(convertQuoteToInvoiceAction, initialState)

  const subtotal = items.reduce(
    (s, it) => s + (parseFloat(it.unit_price) || 0) * (parseFloat(it.quantity) || 0), 0
  )

  useEffect(() => {
    if (stateFree.success) {
      router.refresh()
      posthog?.capture('invoice_created', { method: 'manual', amount: subtotal })
      dialogRef.current?.close()
      formFreeRef.current?.reset()
      setItems([emptyItem(defaultTax)])
    }
  }, [stateFree, subtotal, router])

  useEffect(() => {
    if (stateQuote.success) {
      router.refresh()
      posthog?.capture('invoice_created', { method: 'from_quote', quote_id: selectedQuote?.id })
      dialogRef.current?.close()
      formQuoteRef.current?.reset()
      setSelectedQuote(null)
    }
  }, [stateQuote, selectedQuote, router])

  const openModal = () => dialogRef.current?.showModal()
  const closeModal = () => {
    dialogRef.current?.close()
    setItems([emptyItem(defaultTax)])
    setSelectedQuote(null)
    setShowCatalog(false)
  }

  const updateItem = (idx: number, field: keyof Item, value: string) =>
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, [field]: value } : it))
  const addItem = () => setItems(prev => [...prev, emptyItem(defaultTax)])
  const removeItem = (idx: number) =>
    setItems(prev => prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev)

  const insertFromCatalog = (catalogItem: CatalogItem) => {
    const newItem: Item = {
      description: catalogItem.name,
      quantity: '1',
      unit_price: String(catalogItem.unit_price),
      tax_rate: String(catalogItem.tax_rate ?? 0),
    }
    if (activeCatalogIdx !== null) {
      setItems(prev => { const u = [...prev]; u[activeCatalogIdx] = newItem; return u })
    } else {
      setItems(prev => [...prev, newItem])
    }
    setShowCatalog(false)
    setActiveCatalogIdx(null)
  }

  const quoteSubtotal = selectedQuote ? Number(selectedQuote.subtotal) : 0
  const quoteTva = selectedQuote ? Number(selectedQuote.tax_amount) : 0
  const quoteTotal = quoteSubtotal + quoteTva

  return (
    <>
      <button
        onClick={openModal}
        className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl hover:bg-primary/90 transition-colors font-semibold text-sm"
      >
        <Plus className="w-4 h-4" />
        Nouvelle Facture
      </button>

      <dialog
        ref={dialogRef}
        className="w-[calc(100%-1rem)] sm:w-full max-w-2xl rounded-2xl p-0 shadow-2xl backdrop:bg-black/50"
        onClose={closeModal}
      >
        <div className="bg-white rounded-2xl max-h-[92vh] flex flex-col">

          <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 shrink-0">
            <h2 className="text-lg font-bold text-gray-900">Nouvelle facture</h2>
            <button type="button" onClick={closeModal} className="text-gray-400 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex border-b border-gray-100 px-6 shrink-0">
            {(['nouvelle', 'depuis-devis'] as Tab[]).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`py-3 px-4 text-sm font-medium border-b-2 -mb-px transition-colors ${tab === t
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
              >
                {t === 'nouvelle' ? 'Facture libre' : `Depuis un devis (${quotes.length})`}
              </button>
            ))}
          </div>

          {/* ── TAB : Facture libre ─────────────────────────────────────────── */}
          {tab === 'nouvelle' && (
            <form ref={formFreeRef} action={actionFree} className="overflow-y-auto flex-1 flex flex-col">
              <div className="px-6 py-5 space-y-5 flex-1">

                {!stateFree.success && stateFree.message && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
                    {stateFree.message}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Client <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="client_id"
                    required
                    defaultValue=""
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  >
                    <option value="" disabled>Sélectionnez un client…</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  {stateFree.errors?.client_id && (
                    <p className="text-red-500 text-xs mt-1">{stateFree.errors.client_id}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Date d'échéance</label>
                  <input
                    name="due_date"
                    type="date"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-semibold text-gray-700">
                      Lignes <span className="text-red-500">*</span>
                    </label>
                    {catalogItems.length > 0 && (
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => { setActiveCatalogIdx(null); setShowCatalog(v => !v) }}
                          className="flex items-center gap-1.5 text-xs text-primary font-medium bg-primary/5 hover:bg-primary/10 px-2.5 py-1.5 rounded-lg transition-colors"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          Catalogue
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
                  {stateFree.errors?.items && (
                    <p className="text-red-500 text-xs mb-2">{stateFree.errors.items}</p>
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
                        <div className="col-span-5 relative">
                          <input
                            value={item.description}
                            onChange={e => updateItem(idx, 'description', e.target.value)}
                            placeholder="Design logo…"
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                          />
                          {catalogItems.length > 0 && (
                            <div className="relative">
                              <button
                                type="button"
                                title="Depuis le catalogue"
                                onClick={() => { setActiveCatalogIdx(idx); setShowCatalog(true) }}
                                className="absolute right-2 text-gray-300 hover:text-primary transition-colors"
                                style={{ top: '-25px' }}
                              >
                                <BookOpen className="w-3 h-3" />
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
                          className="col-span-2 text-right border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                        <button type="button" onClick={() => removeItem(idx)}
                          className="col-span-1 text-gray-300 hover:text-red-500 flex justify-center">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button type="button" onClick={addItem} className="mt-3 text-sm text-primary hover:text-primary-700 font-medium flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5" />
                    Ajouter une ligne
                  </button>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Notes / Conditions de paiement
                  </label>
                  <textarea
                    name="notes"
                    rows={2}
                    placeholder="Ex: Paiement Wave ou Orange Money. Acompte 50% requis."
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                  />
                </div>

                <div className="bg-gray-50 rounded-xl p-4 space-y-1.5 text-sm border border-gray-100">
                  <div className="flex justify-between text-gray-600">
                    <span>Sous-total HT</span><span>{formatXOF(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>TVA</span><span>{formatXOF(items.reduce((s, it) => s + ((parseFloat(it.unit_price) || 0) * (parseFloat(it.quantity) || 0) * ((parseFloat(it.tax_rate) || 0) / 100)), 0))}</span>
                  </div>
                  <div className="flex justify-between font-bold text-gray-900 border-t border-gray-200 pt-2 mt-1">
                    <span>Total TTC</span>
                    <span className="text-primary">{formatXOF(subtotal + items.reduce((s, it) => s + ((parseFloat(it.unit_price) || 0) * (parseFloat(it.quantity) || 0) * ((parseFloat(it.tax_rate) || 0) / 100)), 0))}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 shrink-0 bg-white">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 font-medium rounded-lg hover:bg-gray-50">Annuler</button>
                <SubmitButton label="Créer la facture" pendingLabel="Enregistrement…" />
              </div>
            </form>
          )}

          {/* ── TAB : Depuis un devis ────────────────────────────────────────── */}
          {tab === 'depuis-devis' && (
            <form ref={formQuoteRef} action={actionQuote} className="overflow-y-auto flex-1 flex flex-col">
              <div className="px-6 py-5 space-y-5 flex-1">

                {!stateQuote.success && stateQuote.message && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
                    {stateQuote.message}
                  </div>
                )}

                {quotes.length === 0 ? (
                  <div className="text-center py-10 text-gray-400">
                    <p className="text-sm">Aucun devis disponible pour la conversion.</p>
                    <p className="text-xs mt-1">Créez d'abord un devis et faites-le accepter.</p>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Sélectionnez un devis <span className="text-red-500">*</span>
                      </label>
                      {stateQuote.errors?.quote_id && (
                        <p className="text-red-500 text-xs mb-2">{stateQuote.errors.quote_id}</p>
                      )}
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {quotes.map(q => (
                          <label
                            key={q.id}
                            className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer transition-colors ${selectedQuote?.id === q.id
                              ? 'border-primary bg-primary/5'
                              : 'border-gray-200 hover:border-gray-300'
                              }`}
                          >
                            <div className="flex items-center gap-3">
                              <input
                                type="radio" name="quote_id" value={q.id} required
                                onChange={() => setSelectedQuote(q)}
                                className="text-primary"
                              />
                              <div>
                                <p className="text-sm font-semibold text-gray-800">{q.quote_number}</p>
                                <p className="text-xs text-gray-500">{q.client?.name ?? '-'}</p>
                              </div>
                            </div>
                            <span className="text-sm font-bold text-gray-700">
                              {formatXOF(Number(q.total_amount))}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Date d'échéance</label>
                      <input
                        name="due_date" type="date"
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                    </div>

                    {selectedQuote && (
                      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-1.5 text-sm">
                        <p className="font-semibold text-primary mb-2">Devis {selectedQuote.quote_number}</p>
                        <div className="flex justify-between text-gray-600">
                          <span>Sous-total HT</span><span>{formatXOF(quoteSubtotal)}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                          <span>TVA</span><span>{formatXOF(Number(selectedQuote.tax_amount) || quoteTva)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-gray-900 border-t border-primary/20 pt-2 mt-1">
                          <span>Total TTC</span>
                          <span className="text-primary">{formatXOF(quoteTotal)}</span>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {quotes.length > 0 && (
                <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 shrink-0 bg-white">
                  <button type="button" onClick={closeModal} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 font-medium rounded-lg hover:bg-gray-50">Annuler</button>
                  <SubmitButton label="Convertir en facture" pendingLabel="Conversion…" extraDisabled={!selectedQuote} />
                </div>
              )}
            </form>
          )}

        </div>
      </dialog>
    </>
  )
}

