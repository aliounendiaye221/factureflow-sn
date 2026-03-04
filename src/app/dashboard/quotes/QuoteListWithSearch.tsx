'use client'

import SearchBar, { useSearchFilter } from '@/components/SearchFilter'
import QuoteRowActions from './QuoteRowActions'
import type { QuoteWithRelations } from '@/services/quoteService'

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  draft: { label: 'Brouillon', className: 'bg-gray-100 text-gray-700 border border-gray-200' },
  sent: { label: 'Envoy\u00e9', className: 'bg-blue-50 text-blue-700 border border-blue-200' },
  accepted: { label: 'Accept\u00e9', className: 'bg-green-100 text-green-700 border border-green-200' },
  rejected: { label: 'Refus\u00e9', className: 'bg-red-100 text-red-600 border border-red-200' },
}

function formatXOF(n: number) {
  return new Intl.NumberFormat('fr-SN', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(n)
}
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-SN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default function QuoteListWithSearch({
  quotes,
  canEdit,
  canDelete,
}: {
  quotes: QuoteWithRelations[]
  canEdit: boolean
  canDelete: boolean
}) {
  const FILTERS = [
    {
      key: 'status',
      label: 'Statut',
      getValue: (q: QuoteWithRelations) => q.status,
      options: [
        { value: 'draft', label: 'Brouillon' },
        { value: 'sent', label: 'Envoy\u00e9' },
        { value: 'accepted', label: 'Accept\u00e9' },
        { value: 'rejected', label: 'Refus\u00e9' },
      ],
    },
  ] as const

  const { query, setQuery, activeFilters, setFilter, filtered, clearAll, hasActive } =
    useSearchFilter(
      quotes,
      ['quote_number', (q: QuoteWithRelations) => q.client?.name ?? ''],
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
            Aucun devis ne correspond \u00e0 votre recherche.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-4 text-left font-bold text-gray-600">Num\u00e9ro</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-600">Client</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-600">Date</th>
                  <th className="px-6 py-4 text-right font-semibold text-gray-600">Total TTC</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-600">Statut</th>
                  {canEdit && <th className="px-6 py-4" />}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filtered.map(quote => {
                  const s = STATUS_LABELS[quote.status] ?? STATUS_LABELS['draft']
                  const hasBilling = Array.isArray(quote.invoices) && quote.invoices.length > 0
                  return (
                    <tr key={quote.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap font-bold text-blue-600">
                        {quote.quote_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-medium">
                        {quote.client?.name ?? '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                        {formatDate(quote.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-gray-900">
                        {formatXOF(quote.total_amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-semibold ${s.className}`}>
                          {s.label}
                        </span>
                      </td>
                      {canEdit && (
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <QuoteRowActions
                            quoteId={quote.id}
                            status={quote.status}
                            hasBilling={hasBilling}
                            canDelete={canDelete}
                            clientPhone={quote.client?.phone}
                            clientEmail={quote.client?.email}
                            clientName={quote.client?.name}
                            quoteNumber={quote.quote_number}
                          />
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
