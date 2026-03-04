import { InvoiceService } from '@/services/invoiceService'
import { RbacService } from '@/services/rbacService'
import { CatalogService } from '@/services/catalogService'
import { AgencyService } from '@/services/agencyService'
import NewInvoiceModal from './NewInvoiceModal'
import InvoiceListWithSearch from './InvoiceListWithSearch'
import ExportCSVButton from '@/components/ExportCSVButton'
import { exportInvoicesCSVAction } from '@/app/actions/exportActions'
import { FileStack, ReceiptText } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function InvoicesPage() {
  const [invoices, clients, quotes, catalogItems, agency] = await Promise.all([
    InvoiceService.getInvoices(),
    InvoiceService.getClients(),
    InvoiceService.getAcceptedQuotes(),
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
            <FileStack className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Factures</h2>
            <p className="text-gray-500 text-sm font-medium">Gérez vos encaissements avec conformité DGI</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ExportCSVButton action={exportInvoicesCSVAction} filename="factures.csv" />
          {canEdit && (
            <NewInvoiceModal
              clients={clients}
              quotes={quotes}
              catalogItems={catalogItems}
              isVatEnabled={agency?.is_vat_enabled ?? true}
            />
          )}
        </div>
      </div>

      {invoices.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center flex flex-col items-center">
          <ReceiptText className="w-12 h-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-1">Aucune facture pour l'instant</h3>
          <p className="text-gray-500 max-w-sm mx-auto mb-5 text-sm">Prêt à encaisser ? Convertissez un devis accepté ou créez une facture libre avec TVA 18% en quelques secondes.</p>
          {canEdit && (
            <Link
              href="/dashboard/quotes"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              <FileStack className="w-4 h-4" />
              Créer mon premier devis
            </Link>
          )}
        </div>
      ) : (
        <InvoiceListWithSearch
          invoices={invoices}
          clients={clients}
          canEdit={canEdit}
          canDelete={canDelete}
        />
      )}
    </div>
  )
}
