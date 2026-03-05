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
        <div className="bg-white min-h-[1000px] font-sans [print-color-adjust:exact] [-webkit-print-color-adjust:exact]">
            {/* Header Premium avec Gradient */}
            <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-slate-900 p-10 md:p-12 text-white relative overflow-hidden">
                <h1 className="text-7xl font-black tracking-tighter opacity-10 absolute top-4 right-8 select-none pointer-events-none">{title}</h1>
                <div className="flex flex-col md:flex-row justify-between items-start gap-8 relative z-10">
                    <div>
                        {agency?.logo_url ? (
                            <img src={agency.logo_url} alt={agency.name} className="h-16 w-auto object-contain mb-6 brightness-0 invert" />
                        ) : (
                            <div className="text-3xl font-black tracking-tighter mb-6">{agency?.name}</div>
                        )}
                        <div className="space-y-1 text-blue-100 text-sm">
                            <p className="text-[10px] uppercase tracking-widest text-blue-400 mb-1">Vendeur / Prestataire</p>
                            <p className="font-bold text-white text-lg">{agency?.name}</p>
                            {agency?.address && <p>{agency.address}</p>}
                            {agency?.phone && <p>Tél : {agency.phone}</p>}
                            {agency?.email && <p>{agency.email}</p>}
                        </div>
                        <div className="mt-4 flex flex-wrap gap-3 text-[10px] font-mono text-blue-300">
                            {agency?.ninea && <span className="bg-blue-800/50 px-2 py-0.5 rounded">NINEA : {agency.ninea}</span>}
                            {agency?.rccm && <span className="bg-blue-800/50 px-2 py-0.5 rounded">RCCM : {agency.rccm}</span>}
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-blue-400 text-xs font-black uppercase tracking-widest mb-2">{title} N°</p>
                        <p className="text-3xl font-mono font-bold">{invoice.invoice_number}</p>
                        <p className="text-sm text-blue-200 mt-2">Date : {fmtDate(invoice.created_at)}</p>
                        {isInvoice && invoice.due_date && (
                            <p className="text-sm text-blue-200">Échéance : {fmtDate(invoice.due_date)}</p>
                        )}
                        {!isInvoice && invoice.validity_days && (
                            <p className="text-sm text-blue-200">Validité : {invoice.validity_days} jours (jusqu&apos;au {addDays(invoice.created_at, invoice.validity_days)})</p>
                        )}
                        <div className="mt-4 inline-flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Conforme DGID
                        </div>
                        <div className="mt-4">
                            <span className={`inline-flex items-center gap-2 px-6 py-2 rounded-full text-sm font-black border-2 ${statusConfig.bg} ${statusConfig.color} border-current`}>
                                <StatusIcon className="w-4 h-4" />
                                {statusConfig.label}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-8 md:p-12">
                {/* Client */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                    <div className="bg-slate-50 p-6 md:p-8 rounded-3xl border border-slate-100">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Client</p>
                        <p className="text-2xl font-black text-slate-900">{invoice.client?.name}</p>
                        <div className="mt-4 space-y-1 text-slate-600 text-sm">
                            {invoice.client?.address && <p>{invoice.client.address}</p>}
                            {invoice.client?.phone && <p>Tél : {invoice.client.phone}</p>}
                            {invoice.client?.email && <p>{invoice.client.email}</p>}
                            {invoice.client?.tax_id && (
                                <p className="text-xs mt-3 font-mono text-slate-500 bg-slate-100 inline-block px-2 py-0.5 rounded">
                                    NINEA/NIF : {invoice.client.tax_id}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-col justify-center text-right space-y-2">
                        <p className="text-slate-400 text-xs uppercase font-bold">Date d&apos;émission</p>
                        <p className="text-xl font-bold text-slate-900">{fmtDateLong(invoice.created_at)}</p>
                        {isInvoice && invoice.due_date && (
                            <>
                                <p className="text-slate-400 text-xs uppercase font-bold mt-4">Échéance</p>
                                <p className="text-xl font-bold text-blue-600">{fmtDateLong(invoice.due_date)}</p>
                            </>
                        )}
                        {!isInvoice && invoice.validity_days && (
                            <>
                                <p className="text-slate-400 text-xs uppercase font-bold mt-4">Valide jusqu&apos;au</p>
                                <p className="text-xl font-bold text-blue-600">{addDays(invoice.created_at, invoice.validity_days)}</p>
                            </>
                        )}
                    </div>
                </div>

                {/* Tableau des prestations DGID */}
                <div className="mb-12">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b-2 border-slate-200">
                                {!isInvoice && <th className="pb-4 text-center w-10">#</th>}
                                <th className="pb-4">Désignation</th>
                                <th className="pb-4 text-center">Qté</th>
                                <th className="pb-4 text-right">PU HT</th>
                                <th className="pb-4 text-right">Montant HT</th>
                                {isInvoice && <th className="pb-4 text-center">TVA %</th>}
                                {isInvoice && <th className="pb-4 text-right">TVA</th>}
                                {isInvoice && <th className="pb-4 text-right">TTC</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {invoice.items.map((item, i) => {
                                const montantHT = item.quantity * item.unit_price
                                const tvaRate = item.tax_rate ?? 18
                                const tvaAmount = montantHT * (tvaRate / 100)
                                const ttc = montantHT + tvaAmount
                                return (
                                    <tr key={i}>
                                        {!isInvoice && <td className="py-6 text-center text-slate-400 font-bold">{i + 1}</td>}
                                        <td className="py-6">
                                            <p className="font-black text-slate-900 text-lg">{item.description}</p>
                                        </td>
                                        <td className="py-6 text-center font-bold text-slate-600">{item.quantity}</td>
                                        <td className="py-6 text-right font-bold text-slate-600 tabular-nums">{fmt(item.unit_price)}</td>
                                        <td className="py-6 text-right font-black text-slate-900 tabular-nums">{fmt(montantHT)}</td>
                                        {isInvoice && <td className="py-6 text-center text-slate-500">{tvaRate}%</td>}
                                        {isInvoice && <td className="py-6 text-right tabular-nums text-slate-600">{fmt(tvaAmount)}</td>}
                                        {isInvoice && <td className="py-6 text-right font-black text-slate-900 tabular-nums">{fmt(ttc)}</td>}
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Totaux */}
                <div className="flex justify-end pt-8 border-t-4 border-slate-900">
                    <div className="w-full md:w-96 space-y-4">
                        <div className="flex justify-between text-slate-500 font-bold uppercase text-xs tracking-widest">
                            <span>Total HT</span>
                            <span className="text-slate-900">{fmt(invoice.subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-slate-500 font-bold uppercase text-xs tracking-widest">
                            <span>TVA (18%)</span>
                            <span className="text-slate-900">{fmt(invoice.tax_amount)}</span>
                        </div>
                        <div className="flex justify-between items-center py-6 bg-slate-900 text-white px-8 rounded-2xl shadow-2xl shadow-blue-900/20 mt-6">
                            <span className="font-black tracking-tighter text-xl uppercase">Total TTC</span>
                            <span className="text-3xl font-black text-blue-400 tabular-nums">{fmt(invoice.total_amount)}</span>
                        </div>

                        {invoice.paid_at && isInvoice && (
                            <div className="flex items-center gap-3 text-emerald-600 font-black justify-end pt-4">
                                <ShieldCheck className="w-6 h-6" />
                                RÉGLÉE LE {fmtDateLong(invoice.paid_at).toUpperCase()}
                            </div>
                        )}
                    </div>
                </div>

                {/* Infos complémentaires (Facture) */}
                {isInvoice && (
                    <div className="mt-10 bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-2 text-sm text-slate-700">
                        <p><span className="font-black text-slate-900">Mode de paiement :</span> {invoice.payment_terms || 'Wave / Orange Money / Virement / Espèces'}</p>
                        {invoice.due_date && <p><span className="font-black text-slate-900">Échéance :</span> {fmtDateLong(invoice.due_date)}</p>}
                        {invoice.quote_number && <p><span className="font-black text-slate-900">Réf. devis :</span> {invoice.quote_number}</p>}
                        {invoice.notes && <p><span className="font-black text-slate-900">Notes :</span> {invoice.notes}</p>}
                    </div>
                )}

                {/* Conditions + Acceptation (Devis) */}
                {!isInvoice && (
                    <div className="mt-10 space-y-6">
                        <div className="bg-amber-50/50 border border-amber-200 rounded-2xl p-6">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3">Conditions</p>
                            {invoice.notes ? (
                                <p className="text-sm text-slate-700 whitespace-pre-line">{invoice.notes}</p>
                            ) : (
                                <ul className="text-sm text-slate-700 space-y-1.5 list-disc list-inside">
                                    <li>Modalités de paiement : 50% à la commande, 50% à la livraison</li>
                                    <li>Modes de paiement : Wave / Orange Money / Virement / Espèces</li>
                                    <li>Le présent document est un DEVIS (non une facture)</li>
                                </ul>
                            )}
                        </div>

                        <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 print:break-inside-avoid">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-5">Acceptation du Client</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-slate-600">
                                <div className="space-y-4">
                                    <p>Bon pour accord :</p>
                                    <p>Nom &amp; Prénom : ________________________________</p>
                                    <p>Fonction : ________________________________</p>
                                </div>
                                <div className="space-y-4">
                                    <p>Signature / Cachet :</p>
                                    <div className="h-24 border border-slate-200 rounded-xl bg-white"></div>
                                    <p>Date : ____ / ____ / {new Date(invoice.created_at).getFullYear()}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {actions && <div className="mt-12 print:hidden">{actions}</div>}

                <div className="mt-20 pt-10 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <div>{agency?.name}{agency?.ninea ? ` — NINEA : ${agency.ninea}` : ''}{agency?.rccm ? ` — RCCM : ${agency.rccm}` : ''}</div>
                    <div>Propulsé par FactureFlow SN</div>
                </div>
            </div>
        </div>
    )
}
