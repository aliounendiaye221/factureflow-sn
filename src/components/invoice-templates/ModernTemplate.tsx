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

export default function ModernTemplate({ invoice, agency, statusConfig, document_type = 'invoice', actions }: InvoiceTemplateProps) {
    const StatusIcon = statusConfig.icon
    const isInvoice = document_type === 'invoice'
    const title = isInvoice ? 'FACTURE' : 'DEVIS'

    return (
        <div className="flex min-h-[700px] bg-white [print-color-adjust:exact] [-webkit-print-color-adjust:exact] text-[13px]">
            {/* ── Barre latérale ── */}
            <div className="w-48 print:w-40 bg-slate-900 text-slate-100 p-5 print:p-4 flex flex-col justify-between shrink-0">
                <div>
                    {agency?.logo_url ? (
                        <img src={agency.logo_url} alt={agency.name} className="h-8 w-auto object-contain mb-4 brightness-0 invert" />
                    ) : (
                        <div className="h-8 w-8 bg-blue-600 rounded mb-4 flex items-center justify-center font-bold text-sm">F</div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <p className="text-[9px] uppercase tracking-widest text-slate-500 mb-1">Vendeur</p>
                            <p className="font-bold text-sm leading-tight">{agency?.name}</p>
                            <div className="text-[11px] text-slate-400 space-y-0.5 mt-1">
                                {agency?.address && <p>{agency.address}</p>}
                                {agency?.phone && <p>{agency.phone}</p>}
                                {agency?.email && <p className="break-all">{agency.email}</p>}
                            </div>
                        </div>

                        <div className="border-t border-slate-800 pt-3">
                            <p className="text-[9px] uppercase tracking-widest text-slate-500 mb-1">Client</p>
                            <p className="font-bold text-sm leading-tight">{invoice.client?.name}</p>
                            <div className="text-[11px] text-slate-400 space-y-0.5 mt-1">
                                {invoice.client?.address && <p>{invoice.client.address}</p>}
                                {invoice.client?.phone && <p>{invoice.client.phone}</p>}
                                {invoice.client?.email && <p className="break-all">{invoice.client.email}</p>}
                                {invoice.client?.tax_id && <p className="text-[9px] font-mono mt-1">NINEA : {invoice.client.tax_id}</p>}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-800 text-[9px] text-slate-500 space-y-0.5">
                    {agency?.ninea && <p className="font-mono">NINEA : {agency.ninea}</p>}
                    {agency?.rccm && <p className="font-mono">RCCM : {agency.rccm}</p>}
                    <div className="mt-1.5 flex items-center gap-1 text-emerald-400">
                        <ShieldCheck className="w-2.5 h-2.5" />
                        <span className="uppercase tracking-widest">Conforme DGID</span>
                    </div>
                </div>
            </div>

            {/* ── Contenu principal ── */}
            <div className="flex-1 p-6 print:p-4 flex flex-col">
                {/* En-tête */}
                <div className="flex justify-between items-start mb-5">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tighter">{title}</h1>
                        <p className="text-sm font-mono text-slate-400">N° {invoice.invoice_number}</p>
                    </div>
                    <div className="text-right space-y-0.5">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold ${statusConfig.bg} ${statusConfig.color}`}>
                            <StatusIcon className="w-3.5 h-3.5" />
                            {statusConfig.label}
                        </span>
                        <p className="text-xs text-slate-400 mt-1.5">Date : <span className="text-slate-900 font-semibold">{fmtDate(invoice.created_at)}</span></p>
                        {isInvoice && invoice.due_date && (
                            <p className="text-xs text-slate-400">Échéance : <span className="text-slate-900 font-semibold">{fmtDate(invoice.due_date)}</span></p>
                        )}
                        {!isInvoice && invoice.validity_days && (
                            <p className="text-xs text-slate-400">Validité : {invoice.validity_days}j — {addDays(invoice.created_at, invoice.validity_days)}</p>
                        )}
                    </div>
                </div>

                {/* ── Tableau ── */}
                <table className="w-full mb-4 flex-grow-0">
                    <thead>
                        <tr className="border-b-2 border-slate-900 text-[10px] uppercase tracking-wider text-slate-400 font-bold">
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
                    <tbody className="divide-y divide-slate-100">
                        {invoice.items.map((item, i) => {
                            const ht = item.quantity * item.unit_price
                            const rate = item.tax_rate ?? 18
                            const tva = ht * (rate / 100)
                            const ttc = ht + tva
                            return (
                                <tr key={i} className="text-slate-700">
                                    {!isInvoice && <td className="py-2 text-center text-slate-400 font-bold text-xs">{i + 1}</td>}
                                    <td className="py-2 font-medium text-slate-900">{item.description}</td>
                                    <td className="py-2 text-center">{item.quantity}</td>
                                    <td className="py-2 text-right tabular-nums">{fmt(item.unit_price)}</td>
                                    <td className="py-2 text-right font-semibold tabular-nums text-slate-900">{fmt(ht)}</td>
                                    {isInvoice && <td className="py-2 text-center text-slate-500 text-xs">{rate}%</td>}
                                    {isInvoice && <td className="py-2 text-right tabular-nums text-slate-600">{fmt(tva)}</td>}
                                    {isInvoice && <td className="py-2 text-right font-bold tabular-nums text-slate-900">{fmt(ttc)}</td>}
                                </tr>
                            )
                        })}
                    </tbody>
                </table>

                {/* ── Totaux ── */}
                <div className="flex justify-end mb-4">
                    <div className="w-60">
                        <div className="flex justify-between py-1 text-xs text-slate-400">
                            <span>Total HT</span>
                            <span className="text-slate-900 font-semibold tabular-nums">{fmt(invoice.subtotal)}</span>
                        </div>
                        <div className="flex justify-between py-1 text-xs text-slate-400">
                            <span>TVA (18%)</span>
                            <span className="text-slate-900 font-semibold tabular-nums">{fmt(invoice.tax_amount)}</span>
                        </div>
                        <div className="flex justify-between py-2 border-t-2 border-slate-900 mt-1">
                            <span className="font-black uppercase text-slate-900">Total TTC</span>
                            <span className="text-lg font-black text-blue-600 tabular-nums">{fmt(invoice.total_amount)}</span>
                        </div>
                        {invoice.paid_at && isInvoice && (
                            <div className="flex items-center justify-end gap-1 text-emerald-600 text-[10px] font-bold mt-1">
                                <CheckCircle2 className="w-3 h-3" />
                                Payée le {fmtDateLong(invoice.paid_at)}
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Infos paiement (Facture) ── */}
                {isInvoice && (
                    <div className="mb-3 bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-600 space-y-0.5">
                        <p><span className="font-semibold text-slate-800">Paiement :</span> {invoice.payment_terms || 'Wave / Orange Money / Virement / Espèces'}</p>
                        {invoice.due_date && <p><span className="font-semibold text-slate-800">Échéance :</span> {fmtDateLong(invoice.due_date)}</p>}
                        {invoice.quote_number && <p><span className="font-semibold text-slate-800">Réf. devis :</span> {invoice.quote_number}</p>}
                        {invoice.notes && <p><span className="font-semibold text-slate-800">Notes :</span> {invoice.notes}</p>}
                    </div>
                )}

                {/* ── Conditions (Devis) ── */}
                {!isInvoice && (
                    <div className="mb-3 space-y-2">
                        <div className="border border-slate-200 rounded-lg p-3">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Conditions</p>
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
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Acceptation du Client</p>
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

                {actions && <div className="mt-auto print:hidden">{actions}</div>}

                {/* ── Footer ── */}
                <div className="mt-auto pt-3 border-t border-slate-100 text-[9px] text-slate-400 uppercase tracking-widest text-center">
                    {isInvoice
                        ? "Conforme aux réglementations fiscales DGID — Sénégal"
                        : `Devis valable ${invoice.validity_days ?? 30} jours`
                    }
                    <span className="block mt-0.5 normal-case tracking-normal">Généré par FactureFlow SN</span>
                </div>
            </div>
        </div>
    )
}