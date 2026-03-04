import { CatalogService } from '@/services/catalogService'
import { RbacService } from '@/services/rbacService'
import NewCatalogItemModal from './NewCatalogItemModal'
import EditCatalogItemModal from './EditCatalogItemModal'
import { Package, Tag } from 'lucide-react'

export const dynamic = 'force-dynamic'

function formatXOF(n: number) {
  return new Intl.NumberFormat('fr-SN', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(n)
}

export default async function CataloguePage() {
  const items = await CatalogService.getCatalogItems()
  const canEdit = await RbacService.checkRole(['super_admin', 'admin', 'user'])
  const canDelete = await RbacService.checkRole(['super_admin', 'admin'])

  // Regrouper par type (produit / service)
  const grouped = items.reduce<Record<string, typeof items>>((acc, item) => {
    const cat = item.type === 'product' ? 'Produits' : 'Services'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(item)
    return acc
  }, {})

  const categories = Object.keys(grouped).sort()

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-50 rounded-lg">
            <Package className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Catalogue</h2>
            <p className="text-gray-500 text-sm font-medium">
              Bibliothèque de vos prestations pour facturer en 1 clic
            </p>
          </div>
        </div>
        {canEdit && <NewCatalogItemModal />}
      </div>

      {/* Contenu */}
      {items.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-14 text-center flex flex-col items-center">
          <Package className="w-14 h-14 text-gray-200 mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-1">Catalogue vide</h3>
          <p className="text-gray-500 text-sm max-w-sm mx-auto mb-6">
            Ajoutez vos produits et services récurrents pour les insérer rapidement dans vos devis et factures.
          </p>
          {canEdit && <NewCatalogItemModal />}
        </div>
      ) : (
        <div className="space-y-6">
          {categories.map(category => (
            <div key={category} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              {/* En-tête catégorie */}
              <div className="px-6 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
                <Tag className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-semibold text-gray-600 uppercase tracking-wider">
                  {category}
                </span>
                <span className="ml-auto text-xs text-gray-400 font-medium">
                  {grouped[category].length} article{grouped[category].length > 1 ? 's' : ''}
                </span>
              </div>

              {/* Articles */}
              <div className="divide-y divide-gray-50">
                {grouped[category].map(item => (
                  <div
                    key={item.id}
                    className={`px-6 py-4 flex items-center gap-4 hover:bg-gray-50/50 transition-colors ${!item.is_active ? 'opacity-50' : ''}`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900 truncate">{item.name}</p>
                        {!item.is_active && (
                          <span className="inline-flex px-2 py-0.5 rounded-md bg-gray-100 text-gray-500 text-xs font-medium border border-gray-200">
                            Archivé
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-sm text-gray-500 mt-0.5 truncate">{item.description}</p>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <p className="font-bold text-gray-900">{formatXOF(item.unit_price)}</p>
                      <p className="text-xs text-gray-400">TVA {item.tax_rate}%</p>
                    </div>

                    {canEdit && (
                      <EditCatalogItemModal item={item} canDelete={canDelete} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats récap */}
      {items.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 px-5 py-4">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Total articles</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{items.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 px-5 py-4">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Actifs</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{items.filter(i => i.is_active).length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 px-5 py-4">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Services</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{items.filter(i => i.type === 'service').length}</p>
          </div>
        </div>
      )}
    </div>
  )
}
