import { ShieldCheck, CheckCircle2 } from 'lucide-react'
import type { InvoiceTemplateProps } from '@/types/invoiceTemplate'

function fmt(n: number) {
    return new Intl.NumberFormat('fr-SN', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(n)
}

function fmtDate(iso: string) {
    return new Date(iso).toLocaleDateString('fr-SN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function fmtDateLong(iso: string) {
    return new Date(iso).toLocaleDateString('fr-SN', { day: '2-digit', month: 'long', year: 'numeric' })
}

function addDays(iso: string, days: number) {
    const d = new Date(iso)
    d.setDate(d.getDate() + days)
    return fmtDate(d.toISOString())
}

export default function ClassicTemplate({ invoice, agency, statusConfig, document_type = 'invoice', actions }: InvoiceTemplateProps) {
    const StatusIcon = statusConfig.icon
    const isInvoice = document_type === 'invoice'
    const title = isInvoice ? 'FACTURE' : 'DEVIS'

    return (
        <div className="p-6 print:p-0 [print-color-adjust:exact] [-webkit-print-color-adjust:exact] text-[13px]">
            {/* ── En-tête ── */}
            <div className="flex justify-between items-start mb-5">
                <div>
                    {agency?.logo_url && (
                        <img src={agency.logo_url} alt={agency.name} className="h-10 max-w-[140px] object-contain mb-1.5" />
                    )}
                    <p className="text-lg font-bold text-gray-900">{agency?.name ?? 'Mon Agence'}</p>
                </div>
                <div className="text-right">
                    <h1 className="text-xl font-black text-gray-900 uppercase tracking-tight">
                        {title} N° {invoice.invoice_number}
                    </h1>
                    <p className="text-xs text-gray-500 mt-0.5">Date : <span className="font-semibold text-gray-800">{fmtDate(invoice.created_at)}</span></p>
                    {isInvoice && invoice.due_date && (
                        <p className="text-xs text-gray-500">Échéance : <span className="font-semibold text-gray-800">{fmtDate(invoice.due_date)}</span></p>
                    )}
                    {!isInvoice && invoice.validity_days && (
                        <p className="text-xs text-gray-500">Validité : {invoice.validity_days}j — jusqu&apos;au {addDays(invoice.created_at, invoice.validity_days)}</p>
                    )}
                    <div className="mt-1.5 flex items-center gap-1.5 justify-end">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusConfig.bg} ${statusConfig.color}`}>
                            <StatusIcon className="w-3 h-3" />
                            {statusConfig.label}
                        </span>
                        <span className="inline-flex items-center gap-0.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
                            <ShieldCheck className="w-3 h-3" />
                            DGID
                        </span>
                    </div>
                </div>
            </div>

            <div className="border-t-2 border-gray-800 mb-4" />

            {/* ── Vendeur / Client ── */}
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Vendeur / Prestataire</p>
                    <p className="font-bold text-sm text-gray-900">{agency?.name ?? 'Mon Agence'}</p>
                    <div className="text-xs text-gray-600 space-y-0.5 mt-0.5">
                        {agency?.address && <p>{agency.address}</p>}
                        {agency?.phone && <p>Tél : {agency.phone}</p>}
                        {agency?.email && <p>{agency.email}</p>}
                    </div>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                        {agency?.ninea && <span className="font-mono text-[10px] text-gray-500">NINEA : {agency.ninea}</span>}
                        {agency?.rccm && <span className="font-mono text-[10px] text-gray-500">RCCM : {agency.rccm}</span>}
                    </div>
                </div>
                <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Client</p>
                    <p className="font-bold text-sm text-gray-900">{invoice.client?.name ?? 'Client inconnu'}</p>
                    <div className="text-xs text-gray-600 space-y-0.5 mt-0.5">
                        {invoice.client?.address && <p>{invoice.client.address}</p>}
                        {invoice.client?.phone && <p>Tél : {invoice.client.phone}</p>}
                        {invoice.client?.email && <p>{invoice.client.email}</p>}
                        {invoice.client?.tax_id && <p className="font-mono text-[10px]">NINEA/NIF : {invoice.client.tax_id}</p>}
                    </div>
                </div>
            </div>

            {/* ── Tableau des prestations ── */}
            <table className="w-full mb-4 border-collapse">
                <thead>
                    <tr className="bg-gray-800 text-white text-[10px] font-bold uppercase tracking-wider">
                        {!isInvoice && <th className="py-1.5 px-2 text-center w-8">#</th>}
                        <th className="py-1.5 px-2 text-left">Désignation</th>
                        <th className="py-1.5 px-2 text-center w-12">Qté</th>
                        <th className="py-1.5 px-2 text-right w-20">PU HT</th>
                        <th className="py-1.5 px-2 text-right w-20">Montant HT</th>
                        {isInvoice && <th className="py-1.5 px-2 text-center w-12">TVA&nbsp;%</th>}
                        {isInvoice && <th className="py-1.5 px-2 text-right w-20">TVA</th>}
                        {isInvoice && <th className="py-1.5 px-2 text-right w-20">TTC</th>}
                    </tr>
                </thead>
                <tbody>
                    {invoice.items.map((item, i) => {
                        const montantHT = item.quantity * item.unit_price
                        const tvaRate = item.tax_rate ?? 18
                        const tvaAmount = montantHT * (tvaRate / 100)
                        const ttc = montantHT + tvaAmount
                        return (
                            <tr key={i} className={`border-b border-gray-100 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                                {!isInvoice && <td className="py-1.5 px-2 text-center text-gray-400 font-bold text-xs">{i + 1}</td>}
                                <td className="py-1.5 px-2 font-medium text-gray-900">{item.description}</td>
                                <td className="py-1.5 px-2 text-center text-gray-600">{item.quantity}</td>
                                <td className="py-1.5 px-2 text-right text-gray-600 tabular-nums">{fmt(item.unit_price)}</td>
                                <td className="py-1.5 px-2 text-right font-semibold text-gray-900 tabular-nums">{fmt(montantHT)}</td>
                                {isInvoice && <td className="py-1.5 px-2 text-center text-gray-500">{tvaRate}%</td>}
                                {isInvoice && <td className="py-1.5 px-2 text-right text-gray-600 tabular-nums">{fmt(tvaAmount)}</td>}
                                {isInvoice && <td className="py-1.5 px-2 text-right font-bold text-gray-900 tabular-nums">{fmt(ttc)}</td>}
                            </tr>
                        )
                    })}
                </tbody>
            </table>

            {/* ── Totaux ── */}
            <div className="flex justify-end mb-4">
                <div className="w-64">
                    <div className="flex justify-between py-1 text-xs text-gray-600">
                        <span>Total HT</span>
                        <span className="font-semibold tabular-nums">{fmt(invoice.subtotal)}</span>
                    </div>
                    <div className="flex justify-between py-1 text-xs text-gray-600">
                        <span>TVA (18%)</span>
                        <span className="font-semibold tabular-nums">{fmt(invoice.tax_amount)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-t-2 border-gray-800 mt-1">
                        <span className="font-black text-gray-900 uppercase">Total TTC</span>
                        <span className="text-lg font-black text-blue-700 tabular-nums">{fmt(invoice.total_amount)}</span>
                    </div>
                    {invoice.paid_at && isInvoice && (
                        <div className="flex items-center justify-end gap-1 text-emerald-600 text-[10px] font-bold mt-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Réglée le {fmtDateLong(invoice.paid_at)}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Infos paiement (Facture) ── */}
            {isInvoice && (
                <div className="mb-3 border border-gray-200 rounded-lg p-3 text-xs text-gray-600 space-y-0.5">
                    <p><span className="font-semibold text-gray-800">Mode de paiement :</span> {invoice.payment_terms || 'Wave / Orange Money / Virement / Espèces'}</p>
                    {invoice.due_date && <p><span className="font-semibold text-gray-800">Échéance :</span> {fmtDateLong(invoice.due_date)}</p>}
                    {invoice.quote_number && <p><span className="font-semibold text-gray-800">Réf. devis :</span> {invoice.quote_number}</p>}
                    {invoice.notes && <p><span className="font-semibold text-gray-800">Notes :</span> {invoice.notes}</p>}
                </div>
            )}

            {/* ── Conditions (Devis) ── */}
            {!isInvoice && (
                <div className="mb-3 space-y-3">
                    <div className="border border-gray-200 rounded-lg p-3">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Conditions</p>
                        {invoice.notes ? (
                            <p className="text-xs text-gray-600 whitespace-pre-line">{invoice.notes}</p>
                        ) : (
                            <ul className="text-xs text-gray-600 space-y-0.5 list-disc list-inside">
                                <li>50% à la commande, 50% à la livraison</li>
                                <li>Paiement : Wave / Orange Money / Virement / Espèces</li>
                            </ul>
                        )}
                    </div>
                    <div className="border border-dashed border-gray-300 rounded-lg p-3 print:break-inside-avoid">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Acceptation du Client</p>
                        <div className="grid grid-cols-2 gap-3 text-xs text-gray-500">
                            <div className="space-y-1">
                                <p>Bon pour accord</p>
                                <p>Nom : ____________________________</p>
                            </div>
                            <div className="space-y-1">
                                <p>Signature / Cachet :</p>
                                <div className="h-12 border border-gray-200 rounded bg-white" />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {actions && <div className="mb-3 print:hidden">{actions}</div>}

            {/* ── Pied de page ── */}
            <div className="border-t border-gray-200 pt-2 text-center">
                <p className="text-[10px] text-gray-400">
                    {isInvoice
                        ? "En cas de retard, des pénalités peuvent s'appliquer conformément à la réglementation DGID."
                        : `Devis valable ${invoice.validity_days ?? 30} jours.`
                    }
                    {' '}— Généré par FactureFlow SN
                </p>
                {agency?.ninea && (
                    <p className="text-[9px] text-gray-300 font-mono mt-0.5">
                        {agency.name} — NINEA : {agency.ninea}{agency.rccm ? ` — RCCM : ${agency.rccm}` : ''}
                    </p>
                )}
            </div>
        </div>
    )
}