import { notFound } from 'next/navigation'
import { QuoteService, type QuoteItem } from '@/services/quoteService'
import { AgencyService } from '@/services/agencyService'
import PrintControls from '@/components/PrintControls'
import AcceptQuoteButton from './AcceptQuoteButton'
import { CheckCircle2, MessageSquare, AlertCircle, Clock, XCircle } from 'lucide-react'
import ClassicTemplate from '@/components/invoice-templates/ClassicTemplate'
import ModernTemplate from '@/components/invoice-templates/ModernTemplate'
import EliteTemplate from '@/components/invoice-templates/EliteTemplate'
import type { InvoiceData, AgencyData } from '@/types/invoiceTemplate'

export const dynamic = 'force-dynamic'

function fmt(n: number) {
  return new Intl.NumberFormat('fr-SN', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(n)
}
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-SN', { day: '2-digit', month: 'long', year: 'numeric' })
}

const STATUS_FR: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  draft: { label: 'Brouillon', color: 'text-gray-600', bg: 'bg-gray-100', icon: Clock },
  sent: { label: 'En attente', color: 'text-primary-700', bg: 'bg-primary-50', icon: Clock },
  accepted: { label: 'Accepté', color: 'text-emerald-700', bg: 'bg-emerald-50', icon: CheckCircle2 },
  rejected: { label: 'Refusé', color: 'text-red-700', bg: 'bg-red-50', icon: XCircle },
}

export default async function QuotePrintPage({ params }: { params: { id: string } }) {
  // Méthodes publiques (sans auth) — page partageable avec les clients
  const quote = await QuoteService.getPublicQuoteById(params.id)
  if (!quote) notFound()

  const agency = await AgencyService.getPublicAgency(quote.agency_id)

  const items = (quote.items ?? []) as QuoteItem[]
  const client = quote.client
  const status = STATUS_FR[quote.status] || STATUS_FR.draft

  // Pré-remplissage du message WhatsApp
  const phoneWithoutSpaces = (agency?.phone ?? '').replace(/\s/g, '')
  const whatsAppMessage = encodeURIComponent(`Bonjour, j'aimerais valider le Devis #${quote.quote_number}. Pouvons-nous en discuter ?`)
  const whatsAppUrl = `https://wa.me/${phoneWithoutSpaces}?text=${whatsAppMessage}`

  // Préparation des données pour le template
  const templateData: InvoiceData = {
    id: quote.id,
    invoice_number: quote.quote_number,
    created_at: quote.created_at,
    due_date: null,
    status: quote.status as any,
    subtotal: quote.subtotal,
    tax_amount: quote.tax_amount,
    total_amount: quote.total_amount,
    items: (quote.items as any[]).map(item => ({
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      tax_rate: item.tax_rate ?? 18,
    })),
    client: quote.client ? {
      name: quote.client.name,
      email: quote.client.email,
      phone: quote.client.phone,
      address: quote.client.address,
      tax_id: quote.client.tax_id,
    } : null,
    paid_at: null,
    notes: (quote as any).notes ?? null,
    validity_days: (quote as any).validity_days ?? 30,
  }

  const selectedTemplate = (agency as any)?.invoice_template || 'classic'
  // console.log('DEBUG: Printing quote', params.id, 'with template:', selectedTemplate)

  // Actions client (Sticky Footer Mobile + In-template)
  const quoteActions = (
    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
      {quote.status !== 'accepted' && quote.status !== 'rejected' && (
        <>
          <a
            href={whatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center p-3 sm:px-4 sm:py-2.5 rounded-xl bg-[#25D366]/10 text-[#128C7E] font-medium text-sm hover:bg-[#25D366]/20 transition-colors"
          >
            <MessageSquare className="w-5 h-5 mr-2" />
            Poser une question
          </a>
          <AcceptQuoteButton quoteId={quote.id} />
        </>
      )}
    </div>
  )

  const renderTemplate = () => {
    const props = {
      invoice: templateData,
      agency: agency as unknown as AgencyData,
      statusConfig: status,
      document_type: 'quote' as const,
      actions: quoteActions
    }

    switch (selectedTemplate) {
      case 'modern': return <ModernTemplate {...props} />
      case 'elite': return <EliteTemplate {...props} />
      default: return <ClassicTemplate {...props} />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-32 print:pb-0">
      <PrintControls />
      <div className="max-w-[1000px] mx-auto md:my-10 bg-white md:shadow-2xl md:rounded-3xl overflow-hidden print:shadow-none print:my-0 print:max-w-none">
        {renderTemplate()}
      </div>

      {/* Sticky Footer Mobile (print:hidden) */}
      {quote.status !== 'accepted' && quote.status !== 'rejected' && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-gray-200 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] md:hidden z-50 print:hidden">
          {quoteActions}
        </div>
      )}
    </div>
  )
}
