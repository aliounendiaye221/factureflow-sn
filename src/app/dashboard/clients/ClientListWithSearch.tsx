'use client'

import SearchBar, { useSearchFilter } from '@/components/SearchFilter'
import EditClientModal from './EditClientModal'
import DeleteConfirmButton from '@/components/DeleteConfirmButton'
import { deleteClientAction } from '@/app/actions/clientActions'
import type { Database } from '@/types/database.types'

type Client = Database['public']['Tables']['clients']['Row']
type ClientStat = { total_billed: number; invoice_count: number; unpaid_total: number }

function formatXOF(n: number) {
  return new Intl.NumberFormat('fr-SN', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(n)
}

export default function ClientListWithSearch({
  clients,
  stats = {},
  canEdit,
  canDelete,
}: {
  clients: Client[]
  stats?: Record<string, ClientStat>
  canEdit: boolean
  canDelete: boolean
}) {
  const { query, setQuery, activeFilters, setFilter, filtered, clearAll, hasActive } =
    useSearchFilter(clients, ['name', 'email', 'phone', 'tax_id'])

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
        placeholder="Rechercher par nom, email, téléphone, NIF…"
      />

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-10 text-center text-gray-400 text-sm">
            Aucun client ne correspond à votre recherche.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold text-gray-600">Client</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-600">Contact</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-600">Identifiants légaux</th>
                  <th className="px-6 py-4 text-right font-semibold text-gray-600">Total facturé</th>
                  <th className="px-6 py-4 text-right font-semibold text-gray-600">En attente</th>
                  {canEdit && <th className="px-6 py-4" />}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filtered.map((client) => {
                  const s: ClientStat = stats[client.id] ?? { total_billed: 0, invoice_count: 0, unpaid_total: 0 }
                  return (
                    <tr key={client.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="font-semibold text-gray-900">{client.name}</p>
                        {client.city && (
                          <p className="text-gray-400 text-xs">{client.city}{client.country ? `, ${client.country}` : ''}</p>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-gray-900 font-medium">{client.phone || '-'}</p>
                        <p className="text-gray-500 text-xs">{client.email || 'Aucun email'}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-100 text-gray-700 font-mono text-xs font-medium border border-gray-200">
                          {client.tax_id || 'Non renseigné'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        {s.invoice_count > 0 ? (
                          <>
                            <p className="font-semibold text-gray-900">{formatXOF(s.total_billed)}</p>
                            <p className="text-xs text-gray-400">{s.invoice_count} facture{s.invoice_count > 1 ? 's' : ''}</p>
                          </>
                        ) : (
                          <span className="text-gray-400 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        {s.unpaid_total > 0 ? (
                          <span className="inline-flex px-2.5 py-1 rounded-md text-xs font-semibold bg-yellow-50 text-yellow-700 border border-yellow-200">
                            {formatXOF(s.unpaid_total)}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">—</span>
                        )}
                      </td>
                      {canEdit && (
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2">
                            <EditClientModal client={client} />
                            {canDelete && (
                              <DeleteConfirmButton
                                id={client.id}
                                action={deleteClientAction}
                                confirmMessage={`Supprimer le client "${client.name}" ? Cette action est irréversible.`}
                                ariaLabel={`Supprimer ${client.name}`}
                              />
                            )}
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

