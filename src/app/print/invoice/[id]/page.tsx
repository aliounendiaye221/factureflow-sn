import { notFound } from 'next/navigation'
import { InvoiceService } from '@/services/invoiceService'
import { AgencyService } from '@/services/agencyService'
import PrintControls from '@/components/PrintControls'
import type { LucideProps } from 'lucide-react'
import { CheckCircle2, AlertCircle, Clock, ShieldCheck } from 'lucide-react'
import MobileMoneyForm from './MobileMoneyForm'
import ClassicTemplate from '@/components/invoice-templates/ClassicTemplate'
import ModernTemplate from '@/components/invoice-templates/ModernTemplate'
import EliteTemplate from '@/components/invoice-templates/EliteTemplate'
import type { InvoiceData, AgencyData } from '@/types/invoiceTemplate'

export const dynamic = 'force-dynamic'

function fmt(n: number) {
  return new Intl.NumberFormat('fr-SN', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(n)
}

const STATUS_FR: Record<string, { label: string; color: string; bg: string; icon: React.ComponentType<LucideProps> }> = {
  unpaid: { label: 'En attente de paiement', color: 'text-warning-700', bg: 'bg-warning/10', icon: Clock },
  paid: { label: 'Payée', color: 'text-success-700', bg: 'bg-success/10', icon: CheckCircle2 },
  overdue: { label: 'En retard', color: 'text-alert-700', bg: 'bg-alert/10', icon: AlertCircle },
  cancelled: { label: 'Annulée', color: 'text-gray-600', bg: 'bg-gray-100', icon: AlertCircle },
}

export default async function InvoicePrintPage({ params }: { params: { id: string } }) {
  // Méthodes publiques (sans auth) — page partageable avec les clients
  const invoice = await InvoiceService.getPublicInvoiceById(params.id)
  if (!invoice) notFound()

  const agency = await AgencyService.getPublicAgency(invoice.agency_id)

  const statusConfig = STATUS_FR[invoice.status] ?? STATUS_FR['unpaid']

  // Préparation des données pour le template
  const templateData: InvoiceData = {
    id: invoice.id,
    invoice_number: invoice.invoice_number,
    status: invoice.status as any,
    created_at: invoice.created_at,
    due_date: invoice.due_date,
    paid_at: invoice.paid_at,
    subtotal: invoice.subtotal,
    tax_amount: invoice.tax_amount,
    total_amount: invoice.total_amount,
    items: (invoice.items as any[]).map(item => ({
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      tax_rate: item.tax_rate ?? 18,
    })),
    client: invoice.client ? {
      id: invoice.client.id,
      name: invoice.client.name,
      email: invoice.client.email,
      phone: invoice.client.phone,
      address: invoice.client.address,
      tax_id: invoice.client.tax_id,
    } : null,
    notes: (invoice as any).notes ?? null,
    payment_terms: (invoice as any).payment_terms ?? null,
    quote_number: invoice.quote?.quote_number ?? null,
  }

  const agencyData: AgencyData | null = agency ? {
    name: agency.name,
    email: agency.email,
    phone: agency.phone,
    address: agency.address,
    ninea: agency.ninea,
    rccm: agency.rccm,
    logo_url: agency.logo_url
  } : null

  // Sélection du template
  const templateId = (agency as any)?.invoice_template || 'classic'
  // console.log('DEBUG: Printing invoice', params.id, 'with template:', templateId)

  const renderTemplate = () => {
    const props = {
      invoice: templateData,
      agency: agencyData,
      statusConfig,
      document_type: 'invoice' as const
    }

    switch (templateId) {
      case 'modern': return <ModernTemplate {...props} />
      case 'elite': return <EliteTemplate {...props} />
      default: return <ClassicTemplate {...props} />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-32 print:pb-0 font-sans">
      <PrintControls />

      <div className={`max-w-[1000px] mx-auto md:my-10 bg-white md:shadow-2xl md:rounded-3xl overflow-hidden print:shadow-none print:my-0 print:border-none print:max-w-none ${templateId === 'classic' ? 'max-w-3xl' : ''}`}>
        {renderTemplate()}
      </div>

      {/* ── FORMULAIRE MOBILE MONEY (Seulement si non payée) ── */}
      {(invoice.status === 'unpaid' || invoice.status === 'overdue') && (
        <div className="max-w-3xl mx-auto px-4 print:hidden">
          <MobileMoneyForm
            invoiceId={invoice.id}
            amount={invoice.total_amount}
            amountObj={{ formatted: fmt(invoice.total_amount), raw: invoice.total_amount }}
            invoiceNumber={invoice.invoice_number}
          />
        </div>
      )}
    </div>
  )
}
