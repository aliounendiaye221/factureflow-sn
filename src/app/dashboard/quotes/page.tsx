import { QuoteService } from '@/services/quoteService'
import { RbacService } from '@/services/rbacService'
import { CatalogService } from '@/services/catalogService'
import { AgencyService } from '@/services/agencyService'
import NewQuoteModal from './NewQuoteModal'
import QuoteListWithSearch from './QuoteListWithSearch'
import ExportCSVButton from '@/components/ExportCSVButton'
import { exportQuotesCSVAction } from '@/app/actions/exportActions'
import { FileText, ReceiptText, PlusCircle } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function QuotesPage() {
  const [quotes, clients, catalogItems, agency] = await Promise.all([
    QuoteService.getQuotes(),
    QuoteService.getClients(),
    CatalogService.getActiveCatalogItems(),
    AgencyService.getAgency(),
  ])

  // Vérifier si l'utilisateur a les droits d'édition/suppression
  const canEdit = await RbacService.checkRole(['super_admin', 'admin', 'user'])
  const canDelete = await RbacService.checkRole(['super_admin', 'admin'])

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-50 rounded-lg">
            <ReceiptText className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Devis</h2>
            <p className="text-gray-500 text-sm font-medium">Transformez vos prospects en clients fidèles</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ExportCSVButton action={exportQuotesCSVAction} filename="devis.csv" />
          {canEdit && (
            <NewQuoteModal
              clients={clients}
              catalogItems={catalogItems}
              isVatEnabled={agency?.is_vat_enabled ?? true}
            />
          )}
        </div>
      </div>

      {quotes.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center flex flex-col items-center">
          <FileText className="w-12 h-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">Aucun devis pour l'instant</h3>
          <p className="text-gray-500 max-w-sm mx-auto mb-5 text-sm">Prenez les devants. Envoyez un devis professionnel avec TVA 18% optionnelle et convertissez-le en facture dès acceptation.</p>
          {canEdit && (
            <NewQuoteModal
              clients={clients}
              catalogItems={catalogItems}
              isVatEnabled={agency?.is_vat_enabled ?? true}
            />
          )}
        </div>
      ) : (
        <QuoteListWithSearch
          quotes={quotes}
          canEdit={canEdit}
          canDelete={canDelete}
        />
      )}
    </div>
  )
}
