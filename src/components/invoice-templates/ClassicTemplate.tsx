import { ShieldCheck, CheckCircle2 } from 'lucide-react'
import type { InvoiceTemplateProps } from '@/types/invoiceTemplate'

function fmt(n: number) {
    return new Intl.NumberFormat('fr-SN', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(n)
}

function fmtDate(iso: string) {
    return new Date(iso).toLocaleDateString('fr-SN', { day: '2-digit', month: 'long', year: 'numeric' })
}

export default function ClassicTemplate({ invoice, agency, statusConfig, document_type = 'invoice', actions }: InvoiceTemplateProps) {
    const StatusIcon = statusConfig.icon
    const title = document_type === 'invoice' ? 'FACTURE' : 'DEVIS'

    return (
        <div className="p-6 md:p-12 print:p-0 [print-color-adjust:exact] [-webkit-print-color-adjust:exact]">
            {/* ── En-tête ── */}
            <div className="flex flex-col-reverse md:flex-row justify-between items-start gap-8 mb-12">
                {/* Agence (émetteur) */}
                <div className="space-y-1">
                    <p className="text-2xl font-bold text-gray-900 tracking-tight">{agency?.name ?? 'Mon Agence'}</p>
                    <div className="flex flex-col gap-0.5 mt-2 text-sm text-gray-500">
                        {agency?.email && <p>{agency.email}</p>}
                        {agency?.phone && <p>{agency.phone}</p>}
                        {agency?.address && <p>{agency.address}</p>}
                        <div className="mt-2 space-y-0.5">
                            {agency?.ninea && <p className="font-mono text-xs bg-gray-100 inline-block px-2 py-0.5 rounded">NINEA: {agency.ninea}</p>}
                            {agency?.rccm && <p className="font-mono text-xs bg-gray-100 inline-block px-2 py-0.5 rounded ml-0 md:ml-2">RCCM: {agency.rccm}</p>}
                        </div>
                    </div>
                </div>

                {/* Numéro + statut (+ logo si disponible) */}
                <div className="text-left md:text-right">
                    {agency?.logo_url && (
                        <div className="mb-4 flex justify-start md:justify-end">
                            <img src={agency.logo_url} alt={agency.name} className="h-16 max-w-[200px] object-contain" />
                        </div>
                    )}
                    <div className="inline-flex items-center justify-center md:justify-end gap-3 mb-2">
                        <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tighter">{title}</h1>
                    </div>
                    <p className="text-lg font-mono font-bold text-gray-500">{invoice.invoice_number}</p>

                    <div className="mt-2 inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Conforme DGI Sénégal
                    </div>

                    <p className="text-sm text-gray-500 mt-2">Date: <span className="font-medium text-gray-900">{fmtDate(invoice.created_at)}</span></p>

                    {invoice.due_date && (
                        <p className="text-sm text-gray-500 mt-0.5">Échéance: <span className="font-medium text-gray-900">{fmtDate(invoice.due_date)}</span></p>
                    )}

                    <div className="mt-4 md:flex md:justify-end">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${statusConfig.bg} ${statusConfig.color}`}>
                            <StatusIcon className="w-3.5 h-3.5" />
                            Statut : {statusConfig.label}
                        </span>
                    </div>
                </div>
            </div>

            {/* ── Destinataire ── */}
            <div className="bg-gray-50/80 border border-gray-100 rounded-xl p-6 mb-10 w-full md:w-1/2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">{document_type === 'invoice' ? 'Facturé à' : 'Destinataire'}</p>
                <p className="font-bold text-lg text-gray-900">{invoice.client?.name ?? 'Client inconnu'}</p>
                <div className="mt-2 space-y-1 text-sm text-gray-600">
                    {invoice.client?.email && <p>{invoice.client.email}</p>}
                    {invoice.client?.phone && <p>{invoice.client.phone}</p>}
                    {invoice.client?.address && <p className="whitespace-pre-line mt-2">{invoice.client.address}</p>}
                    {invoice.client?.tax_id && <p className="text-xs text-gray-500 mt-3 font-mono">NIF: {invoice.client.tax_id}</p>}
                </div>
            </div>

            {/* ── Lignes ── */}
            <div className="mb-10 rounded-xl overflow-hidden border border-gray-200">
                <div className="hidden md:grid grid-cols-12 gap-4 bg-gray-50 border-b border-gray-200 px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    <div className="col-span-6">Description</div>
                    <div className="col-span-2 text-center">Qté</div>
                    <div className="col-span-2 text-right">PU HT</div>
                    <div className="col-span-2 text-right">Total HT</div>
                </div>

                <div className="divide-y divide-gray-100">
                    {invoice.items.map((item, i) => (
                        <div key={i} className="grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-4 md:items-center bg-white hover:bg-gray-50/50 transition-colors">
                            <div className="col-span-1 md:col-span-6">
                                <p className="font-medium text-gray-900">{item.description}</p>
                            </div>
                            <div className="col-span-1 md:hidden text-xs text-gray-500 font-medium">
                                {item.quantity} x {fmt(item.unit_price)}
                            </div>
                            <div className="hidden md:block col-span-2 text-center text-gray-600 font-medium">
                                {item.quantity}
                            </div>
                            <div className="hidden md:block col-span-2 text-right text-gray-600 font-mono">
                                {fmt(item.unit_price)}
                            </div>
                            <div className="col-span-1 md:col-span-2 text-right font-bold text-gray-900 font-mono">
                                {fmt(item.quantity * item.unit_price)}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Totaux ── */}
            <div className="flex flex-col md:flex-row md:justify-end mb-12">
                <div className="w-full md:w-80 space-y-3 bg-gray-50/50 p-6 rounded-xl border border-gray-100">
                    <div className="flex justify-between text-sm text-gray-600 font-medium">
                        <span>Sous-total HT</span>
                        <span className="tabular-nums">{fmt(invoice.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600 font-medium">
                        <span>TVA (18%)</span>
                        <span className="tabular-nums">{fmt(invoice.tax_amount)}</span>
                    </div>
                    <div className="flex justify-between items-end border-t border-gray-200 pt-4 mt-2 mb-2">
                        <span className="text-base font-bold text-gray-900 uppercase">Total TTC</span>
                        <span className="text-3xl font-black text-blue-600 tracking-tight tabular-nums relative">
                            {fmt(invoice.total_amount)}
                            {invoice.status === 'paid' && document_type === 'invoice' && (
                                <div className="absolute -right-6 -top-2 bg-emerald-500 text-white rounded-full p-0.5 shadow-md">
                                    <CheckCircle2 className="w-4 h-4" />
                                </div>
                            )}
                        </span>
                    </div>

                    {invoice.paid_at && document_type === 'invoice' && (
                        <div className="flex justify-between text-xs text-emerald-700 font-bold pt-2 border-t border-emerald-100 bg-emerald-50 p-2 rounded-lg mt-4">
                            <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4" /> Réglée le</span>
                            <span>{fmtDate(invoice.paid_at)}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Actions client */}
            {actions && (
                <div className="mb-8 print:hidden">
                    {actions}
                </div>
            )}

            {/* ── Pied de page ── */}
            <div className="border-t border-gray-200 pt-6 text-center text-gray-500 pb-10">
                <p className="text-sm font-medium text-gray-900 mb-1">Merci de votre confiance.</p>
                <p className="text-xs text-gray-400 font-medium">
                    {document_type === 'invoice'
                        ? "En cas de retard de paiement, des pénalités peuvent s'appliquer."
                        : "Ce devis est valable 30 jours à compter de sa date d'émission."
                    } Généré par FactureFlow SN.
                </p>
            </div>
        </div>
    )
}
