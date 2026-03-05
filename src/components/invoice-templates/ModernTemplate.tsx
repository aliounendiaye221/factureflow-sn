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
        <div className="flex flex-col md:flex-row min-h-[1000px] bg-white [print-color-adjust:exact] [-webkit-print-color-adjust:exact]">
            {/* Sidebar Gauche — Vendeur / Prestataire */}
            <div className="w-full md:w-72 bg-slate-900 text-slate-100 p-8 flex flex-col justify-between print:bg-slate-900">
                <div>
                    {agency?.logo_url ? (
                        <img src={agency.logo_url} alt={agency.name} className="h-20 w-auto object-contain mb-8 brightness-0 invert" />
                    ) : (
                        <div className="h-12 w-12 bg-blue-600 rounded-lg mb-8 flex items-center justify-center font-bold text-xl">F</div>
                    )}

                    <div className="space-y-6">
                        {/* Vendeur */}
                        <div>
                            <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-2">Vendeur / Prestataire</p>
                            <p className="font-bold text-lg">{agency?.name}</p>
                            {agency?.address && <p className="text-sm text-slate-400 mt-1">{agency.address}</p>}
                            {agency?.phone && <p className="text-sm text-slate-400">Tél : {agency.phone}</p>}
                            {agency?.email && <p className="text-sm text-slate-400">{agency.email}</p>}
                        </div>

                        {/* Client */}
                        <div>
                            <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-2">Client</p>
                            <p className="font-bold">{invoice.client?.name}</p>
                            {invoice.client?.address && <p className="text-sm text-slate-400 mt-1">{invoice.client.address}</p>}
                            {invoice.client?.phone && <p className="text-sm text-slate-400">Tél : {invoice.client.phone}</p>}
                            {invoice.client?.email && <p className="text-sm text-slate-400">{invoice.client.email}</p>}
                            {invoice.client?.tax_id && <p className="text-[10px] text-slate-500 mt-2 font-mono">NINEA/NIF : {invoice.client.tax_id}</p>}
                        </div>
                    </div>
                </div>

                <div className="pt-6 border-t border-slate-800 text-[10px] text-slate-500 space-y-1.5">
                    {agency?.ninea && <p className="font-mono">NINEA : {agency.ninea}</p>}
                    {agency?.rccm && <p className="font-mono">RCCM : {agency.rccm}</p>}
                    <div className="mt-2 flex items-center gap-1 text-emerald-400">
                        <ShieldCheck className="w-3 h-3" />
                        <span className="uppercase tracking-widest">Conforme DGID</span>
                    </div>
                </div>
            </div>

            {/* Contenu Principal */}
            <div className="flex-1 p-8 md:p-12">
                {/* En-tête : Titre + numéro + dates */}
                <div className="flex flex-col sm:flex-row justify-between items-start mb-10 gap-4">
                    <div>
                        <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-1">{title}</h1>
                        <p className="text-xl font-mono text-slate-400">N° {invoice.invoice_number}</p>
                    </div>
                    <div className="text-left sm:text-right space-y-1">
                        <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold ${statusConfig.bg} ${statusConfig.color}`}>
                            <StatusIcon className="w-4 h-4" />
                            {statusConfig.label}
                        </span>
                        <p className="text-sm text-slate-400 mt-3">Date : <span className="text-slate-900 font-bold">{fmtDate(invoice.created_at)}</span></p>
                        {isInvoice && invoice.due_date && (
                            <p className="text-sm text-slate-400">Échéance : <span className="text-slate-900 font-bold">{fmtDate(invoice.due_date)}</span></p>
                        )}
                        {!isInvoice && invoice.validity_days && (
                            <p className="text-sm text-slate-400">Validité : {invoice.validity_days} jours (jusqu&apos;au {addDays(invoice.created_at, invoice.validity_days)})</p>
                        )}
                    </div>
                </div>

                {/* Tableau des prestations DGID */}
                <table className="w-full mb-10">
                    <thead>
                        <tr className="border-b-2 border-slate-900 text-left text-xs uppercase tracking-wider text-slate-400">
                            {!isInvoice && <th className="py-4 font-black text-center w-10">#</th>}
                            <th className="py-4 font-black">Désignation</th>
                            <th className="py-4 font-black text-center">Qté</th>
                            <th className="py-4 font-black text-right">PU HT</th>
                            <th className="py-4 font-black text-right">Montant HT</th>
                            {isInvoice && <th className="py-4 font-black text-center">TVA %</th>}
                            {isInvoice && <th className="py-4 font-black text-right">TVA</th>}
                            {isInvoice && <th className="py-4 font-black text-right">TTC</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {invoice.items.map((item, i) => {
                            const montantHT = item.quantity * item.unit_price
                            const tvaRate = item.tax_rate ?? 18
                            const tvaAmount = montantHT * (tvaRate / 100)
                            const ttc = montantHT + tvaAmount
                            return (
                                <tr key={i} className="text-slate-700">
                                    {!isInvoice && <td className="py-5 text-center text-slate-400 font-bold">{i + 1}</td>}
                                    <td className="py-5 font-medium">{item.description}</td>
                                    <td className="py-5 text-center">{item.quantity}</td>
                                    <td className="py-5 text-right tabular-nums">{fmt(item.unit_price)}</td>
                                    <td className="py-5 text-right font-bold tabular-nums text-slate-900">{fmt(montantHT)}</td>
                                    {isInvoice && <td className="py-5 text-center text-slate-500">{tvaRate}%</td>}
                                    {isInvoice && <td className="py-5 text-right tabular-nums text-slate-600">{fmt(tvaAmount)}</td>}
                                    {isInvoice && <td className="py-5 text-right font-bold tabular-nums text-slate-900">{fmt(ttc)}</td>}
                                </tr>
                            )
                        })}
                    </tbody>
                </table>

                {/* Totaux */}
                <div className="flex justify-end mb-8">
                    <div className="w-full md:w-80 space-y-4">
                        <div className="flex justify-between text-slate-400">
                            <span>Total HT</span>
                            <span className="text-slate-900 font-bold">{fmt(invoice.subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                            <span>TVA (18%)</span>
                            <span className="text-slate-900 font-bold">{fmt(invoice.tax_amount)}</span>
                        </div>
                        <div className="flex justify-between items-center pt-6 border-t-2 border-slate-900">
                            <span className="text-xl font-black uppercase">Total TTC</span>
                            <span className="text-3xl font-black text-blue-600">{fmt(invoice.total_amount)}</span>
                        </div>

                        {invoice.paid_at && isInvoice && (
                            <div className="bg-emerald-50 text-emerald-700 p-4 rounded-2xl flex items-center justify-between font-bold text-sm">
                                <span className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5" /> Payée le</span>
                                <span>{fmtDateLong(invoice.paid_at)}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Infos complémentaires (Facture) */}
                {isInvoice && (
                    <div className="mb-8 bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-2 text-sm text-slate-700">
                        <p><span className="font-semibold text-slate-900">Mode de paiement :</span> {invoice.payment_terms || 'Wave / Orange Money / Virement / Espèces'}</p>
                        {invoice.due_date && <p><span className="font-semibold text-slate-900">Échéance :</span> {fmtDateLong(invoice.due_date)}</p>}
                        {invoice.quote_number && <p><span className="font-semibold text-slate-900">Réf. devis :</span> {invoice.quote_number}</p>}
                        {invoice.notes && <p><span className="font-semibold text-slate-900">Notes :</span> {invoice.notes}</p>}
                    </div>
                )}

                {/* Conditions (Devis) */}
                {!isInvoice && (
                    <div className="mb-8 space-y-6">
                        <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-5">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Conditions</p>
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

                        {/* Zone acceptation client */}
                        <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 print:break-inside-avoid">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Acceptation du Client</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600">
                                <div className="space-y-3">
                                    <p>Bon pour accord :</p>
                                    <p>Nom &amp; Prénom : ________________________________</p>
                                    <p>Fonction : ________________________________</p>
                                </div>
                                <div className="space-y-3">
                                    <p>Signature / Cachet :</p>
                                    <div className="h-20 border border-slate-200 rounded-lg bg-white"></div>
                                    <p>Date : ____ / ____ / {new Date(invoice.created_at).getFullYear()}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {actions && <div className="mt-10 print:hidden">{actions}</div>}

                <div className="mt-16 pt-8 border-t border-slate-100 text-[10px] text-slate-400 uppercase tracking-widest text-center">
                    {isInvoice
                        ? "Conforme aux réglementations fiscales DGID en vigueur au Sénégal."
                        : `Ce devis est valable ${invoice.validity_days ?? 30} jours à compter de sa date d'émission.`
                    }
                    <span className="block mt-1">Généré par FactureFlow SN</span>
                </div>
            </div>
        </div>
    )
}
