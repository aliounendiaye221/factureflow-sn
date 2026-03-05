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

export default function EliteTemplate({ invoice, agency, statusConfig, document_type = 'invoice', actions }: InvoiceTemplateProps) {
    const StatusIcon = statusConfig.icon
    const isInvoice = document_type === 'invoice'
    const title = isInvoice ? 'FACTURE' : 'DEVIS'

    return (
        <div className="bg-white [print-color-adjust:exact] [-webkit-print-color-adjust:exact] text-[13px]">
            {/* ── Header gradient compact ── */}
            <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-slate-900 px-6 py-5 print:px-4 print:py-3 text-white relative overflow-hidden">
                <div className="flex justify-between items-start relative z-10">
                    <div>
                        {agency?.logo_url ? (
                            <img src={agency.logo_url} alt={agency.name} className="h-8 w-auto object-contain mb-2 brightness-0 invert" />
                        ) : (
                            <p className="text-lg font-black tracking-tight mb-2">{agency?.name}</p>
                        )}
                        <div className="text-[11px] text-blue-200 space-y-0.5">
                            <p className="font-bold text-white text-sm">{agency?.name}</p>
                            {agency?.address && <p>{agency.address}</p>}
                            <div className="flex gap-3">
                                {agency?.phone && <span>{agency.phone}</span>}
                                {agency?.email && <span>{agency.email}</span>}
                            </div>
                        </div>
                        <div className="mt-1.5 flex gap-2 text-[9px] font-mono text-blue-300">
                            {agency?.ninea && <span>NINEA : {agency.ninea}</span>}
                            {agency?.rccm && <span>RCCM : {agency.rccm}</span>}
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-blue-400 text-[9px] font-black uppercase tracking-widest mb-0.5">{title} N°</p>
                        <p className="text-xl font-mono font-bold">{invoice.invoice_number}</p>
                        <p className="text-[11px] text-blue-200 mt-1">Date : {fmtDate(invoice.created_at)}</p>
                        {isInvoice && invoice.due_date && (
                            <p className="text-[11px] text-blue-200">Échéance : {fmtDate(invoice.due_date)}</p>
                        )}
                        {!isInvoice && invoice.validity_days && (
                            <p className="text-[11px] text-blue-200">Validité : {invoice.validity_days}j — {addDays(invoice.created_at, invoice.validity_days)}</p>
                        )}
                        <div className="mt-1.5 flex items-center gap-1.5 justify-end">
                            <span className="inline-flex items-center gap-0.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                                <ShieldCheck className="w-2.5 h-2.5" />
                                DGID
                            </span>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${statusConfig.bg} ${statusConfig.color}`}>
                                <StatusIcon className="w-3 h-3" />
                                {statusConfig.label}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-6 py-5 print:px-4 print:py-3">
                {/* ── Client ── */}
                <div className="mb-4 bg-slate-50 border border-slate-100 rounded-lg p-4 print:p-3">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Client</p>
                    <p className="text-base font-black text-slate-900">{invoice.client?.name}</p>
                    <div className="text-xs text-slate-600 space-y-0.5 mt-1">
                        {invoice.client?.address && <p>{invoice.client.address}</p>}
                        <div className="flex gap-3">
                            {invoice.client?.phone && <span>Tél : {invoice.client.phone}</span>}
                            {invoice.client?.email && <span>{invoice.client.email}</span>}
                        </div>
                        {invoice.client?.tax_id && (
                            <p className="text-[10px] font-mono text-slate-500 mt-0.5">NINEA/NIF : {invoice.client.tax_id}</p>
                        )}
                    </div>
                </div>

                {/* ── Tableau ── */}
                <table className="w-full mb-4">
                    <thead>
                        <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b-2 border-slate-200">
                            {!isInvoice && <th className="pb-2 text-center w-7">#</th>}
                            <th className="pb-2 text-left">Désignation</th>
                            <th className="pb-2 text-center w-10">Qté</th>
                            <th className="pb-2 text-right w-20">PU HT</th>
                            <th className="pb-2 text-right w-20">HT</th>
                            {isInvoice && <th className="pb-2 text-center w-10">TVA%</th>}
                            {isInvoice && <th className="pb-2 text-right w-16">TVA</th>}
                            {isInvoice && <th className="pb-2 text-right w-20">TTC</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {invoice.items.map((item, i) => {
                            const ht = item.quantity * item.unit_price
                            const rate = item.tax_rate ?? 18
                            const tva = ht * (rate / 100)
                            const ttc = ht + tva
                            return (
                                <tr key={i}>
                                    {!isInvoice && <td className="py-2 text-center text-slate-400 font-bold text-xs">{i + 1}</td>}
                                    <td className="py-2 font-semibold text-slate-900">{item.description}</td>
                                    <td className="py-2 text-center text-slate-600">{item.quantity}</td>
                                    <td className="py-2 text-right tabular-nums text-slate-600">{fmt(item.unit_price)}</td>
                                    <td className="py-2 text-right font-bold tabular-nums text-slate-900">{fmt(ht)}</td>
                                    {isInvoice && <td className="py-2 text-center text-slate-500 text-xs">{rate}%</td>}
                                    {isInvoice && <td className="py-2 text-right tabular-nums text-slate-600">{fmt(tva)}</td>}
                                    {isInvoice && <td className="py-2 text-right font-black tabular-nums text-slate-900">{fmt(ttc)}</td>}
                                </tr>
                            )
                        })}
                    </tbody>
                </table>

                {/* ── Totaux ── */}
                <div className="flex justify-end mb-4">
                    <div className="w-64">
                        <div className="flex justify-between py-1 text-xs text-slate-500 font-bold uppercase tracking-wider">
                            <span>Total HT</span>
                            <span className="text-slate-900 tabular-nums">{fmt(invoice.subtotal)}</span>
                        </div>
                        <div className="flex justify-between py-1 text-xs text-slate-500 font-bold uppercase tracking-wider">
                            <span>TVA (18%)</span>
                            <span className="text-slate-900 tabular-nums">{fmt(invoice.tax_amount)}</span>
                        </div>
                        <div className="flex justify-between items-center py-2.5 bg-slate-900 text-white px-4 rounded-lg mt-2">
                            <span className="font-black uppercase">Total TTC</span>
                            <span className="text-lg font-black text-blue-400 tabular-nums">{fmt(invoice.total_amount)}</span>
                        </div>
                        {invoice.paid_at && isInvoice && (
                            <div className="flex items-center justify-end gap-1.5 text-emerald-600 font-bold text-[10px] mt-1.5">
                                <ShieldCheck className="w-3.5 h-3.5" />
                                RÉGLÉE LE {fmtDateLong(invoice.paid_at).toUpperCase()}
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Infos paiement (Facture) ── */}
                {isInvoice && (
                    <div className="mb-3 bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-600 space-y-0.5">
                        <p><span className="font-bold text-slate-800">Paiement :</span> {invoice.payment_terms || 'Wave / Orange Money / Virement / Espèces'}</p>
                        {invoice.due_date && <p><span className="font-bold text-slate-800">Échéance :</span> {fmtDateLong(invoice.due_date)}</p>}
                        {invoice.quote_number && <p><span className="font-bold text-slate-800">Réf. devis :</span> {invoice.quote_number}</p>}
                        {invoice.notes && <p><span className="font-bold text-slate-800">Notes :</span> {invoice.notes}</p>}
                    </div>
                )}

                {/* ── Conditions + Acceptation (Devis) ── */}
                {!isInvoice && (
                    <div className="mb-3 space-y-2">
                        <div className="border border-slate-200 rounded-lg p-3">
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Conditions</p>
                            {invoice.notes ? (
                                <p className="text-xs text-slate-600 whitespace-pre-line">{invoice.notes}</p>
                            ) : (
                                <ul className="text-xs text-slate-600 space-y-0.5 list-disc list-inside">
                                    <li>50% à la commande, 50% à la livraison</li>
                                    <li>Paiement : Wave / Orange Money / Virement / Espèces</li>
                                </ul>
                            )}
                        </div>
                        <div className="border border-dashed border-slate-300 rounded-lg p-3 print:break-inside-avoid">
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Acceptation du Client</p>
                            <div className="grid grid-cols-2 gap-3 text-xs text-slate-500">
                                <div className="space-y-1">
                                    <p>Bon pour accord</p>
                                    <p>Nom : ________________________</p>
                                </div>
                                <div className="space-y-1">
                                    <p>Signature / Cachet :</p>
                                    <div className="h-10 border border-slate-200 rounded bg-white" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {actions && <div className="mb-3 print:hidden">{actions}</div>}

                {/* ── Footer ── */}
                <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-[9px] font-bold uppercase tracking-widest text-slate-400">
                    <span>{agency?.name}{agency?.ninea ? ` — NINEA : ${agency.ninea}` : ''}</span>
                    <span>FactureFlow SN</span>
                </div>
            </div>
        </div>
    )
}