'use client'

import SearchBar, { useSearchFilter } from '@/components/SearchFilter'
import EditInvoiceModal from './EditInvoiceModal'
import InvoiceRowActions from './InvoiceRowActions'
import type { InvoiceWithRelations } from '@/services/invoiceService'

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  unpaid: { label: 'Non pay\u00e9e', className: 'bg-yellow-100 text-yellow-700 border border-yellow-200' },
  paid: { label: 'Pay\u00e9e', className: 'bg-green-100 text-green-700 border border-green-200' },
  overdue: { label: 'En retard', className: 'bg-red-100 text-red-600 border border-red-200' },
  cancelled: { label: 'Annul\u00e9e', className: 'bg-gray-100 text-gray-700 border border-gray-200' },
}

function formatXOF(n: number) {
  return new Intl.NumberFormat('fr-SN', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(n)
}
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-SN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

type Client = { id: string; name: string }

export default function InvoiceListWithSearch({
  invoices,
  clients,
  canEdit,
  canDelete,
}: {
  invoices: InvoiceWithRelations[]
  clients: Client[]
  canEdit: boolean
  canDelete: boolean
}) {
  const FILTERS = [
    {
      key: 'status',
      label: 'Statut',
      getValue: (inv: InvoiceWithRelations) => inv.status,
      options: [
        { value: 'unpaid', label: 'Non pay\u00e9es' },
        { value: 'paid', label: 'Pay\u00e9es' },
        { value: 'overdue', label: 'En retard' },
      ],
    },
  ] as const

  const { query, setQuery, activeFilters, setFilter, filtered, clearAll, hasActive } =
    useSearchFilter(
      invoices,
      ['invoice_number', (inv: InvoiceWithRelations) => inv.client?.name ?? ''],
      FILTERS as never
    )

  return (
    <div className="space-y-4">
      <SearchBar
        query={query}
        setQuery={setQuery}
        activeFilters={activeFilters}
        setFilter={setFilter}
        clearAll={clearAll}
        hasActive={hasActive}
        filteredCount={filtered.length}
        placeholder="Rechercher par num\u00e9ro, client\u2026"
        filters={FILTERS as never}
      />

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-10 text-center text-gray-400 text-sm">
            Aucune facture ne correspond \u00e0 votre recherche.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left font-bold text-gray-600">Numéro</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left font-bold text-gray-600">Client</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left font-bold text-gray-600 hidden md:table-cell">Échéance</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-right font-semibold text-gray-600 hidden sm:table-cell">Total TTC</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left font-semibold text-gray-600">Statut</th>
                  {canEdit && <th className="px-3 sm:px-6 py-3 sm:py-4" />}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filtered.map(inv => {
                  const s = STATUS_LABELS[inv.status] ?? STATUS_LABELS['unpaid']
                  return (
                    <tr key={inv.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap font-bold text-blue-600">
                        {inv.invoice_number}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-gray-900 font-medium truncate max-w-[100px] md:max-w-[150px]">
                        {inv.client?.name ?? '-'}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-gray-500 hidden md:table-cell">
                        {inv.due_date ? formatDate(inv.due_date) : '—'}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right font-bold text-gray-900 hidden sm:table-cell">
                        {formatXOF(inv.total_amount)}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-semibold ${s.className}`}>
                          {s.label}
                        </span>
                      </td>
                      {canEdit && (
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1 sm:gap-2">
                            <EditInvoiceModal
                              invoiceId={inv.id}
                              status={inv.status}
                              currentClientId={inv.client_id}
                              currentItems={inv.items}
                              currentDueDate={inv.due_date}
                              clients={clients}
                            />
                            <InvoiceRowActions
                              invoiceId={inv.id}
                              status={inv.status}
                              canDelete={canDelete}
                              clientPhone={inv.client?.phone}
                              clientEmail={inv.client?.email}
                              clientName={inv.client?.name}
                              invoiceNumber={inv.invoice_number}
                              total={inv.total_amount}
                            />
                          </div>
                        </td>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
