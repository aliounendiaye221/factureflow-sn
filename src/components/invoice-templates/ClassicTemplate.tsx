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
    const prefix = isInvoice ? 'N°' : 'N°'

    return (
        <div className="p-6 md:p-12 print:p-8 [print-color-adjust:exact] [-webkit-print-color-adjust:exact]">
            {/* ── En-tête : Titre + Statut ── */}
            <div className="flex flex-col-reverse md:flex-row justify-between items-start gap-6 mb-8">
                {/* Logo + Agence */}
                <div className="space-y-1">
                    {agency?.logo_url && (
                        <div className="mb-3">
                            <img src={agency.logo_url} alt={agency.name} className="h-16 max-w-[200px] object-contain" />
                        </div>
                    )}
                    <p className="text-2xl font-bold text-gray-900 tracking-tight">{agency?.name ?? 'Mon Agence'}</p>
                </div>

                {/* Numéro + Date */}
                <div className="text-left md:text-right">
                    <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight">
                        {title} {prefix} {invoice.invoice_number}
                    </h1>
                    <p className="text-sm text-gray-600 mt-1">Date : <span className="font-semibold text-gray-900">{fmtDate(invoice.created_at)}</span></p>

                    {isInvoice && invoice.due_date && (
                        <p className="text-sm text-gray-600 mt-0.5">Échéance : <span className="font-semibold text-gray-900">{fmtDate(invoice.due_date)}</span></p>
                    )}

                    {!isInvoice && invoice.validity_days && (
                        <p className="text-sm text-gray-600 mt-0.5">
                            Validité : {invoice.validity_days} jours (jusqu&apos;au {addDays(invoice.created_at, invoice.validity_days)})
                        </p>
                    )}

                    <div className="mt-3 flex items-center gap-2 justify-start md:justify-end">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${statusConfig.bg} ${statusConfig.color}`}>
                            <StatusIcon className="w-3.5 h-3.5" />
                            {statusConfig.label}
                        </span>
                        <span className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Conforme DGID
                        </span>
                    </div>
                </div>
            </div>

            {/* ── Bloc Vendeur / Client ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Vendeur */}
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Vendeur / Prestataire</p>
                    <p className="font-bold text-lg text-gray-900">{agency?.name ?? 'Mon Agence'}</p>
                    <div className="mt-2 space-y-1 text-sm text-gray-600">
                        {agency?.address && <p>{agency.address}</p>}
                        {agency?.phone && <p>Tél : {agency.phone}</p>}
                        {agency?.email && <p>Email : {agency.email}</p>}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                        {agency?.ninea && (
                            <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                                NINEA : {agency.ninea}
                            </span>
                        )}
                        {agency?.rccm && (
                            <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                                RCCM : {agency.rccm}
                            </span>
                        )}
                    </div>
                </div>

                {/* Client */}
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Client</p>
                    <p className="font-bold text-lg text-gray-900">{invoice.client?.name ?? 'Client inconnu'}</p>
                    <div className="mt-2 space-y-1 text-sm text-gray-600">
                        {invoice.client?.address && <p>{invoice.client.address}</p>}
                        {invoice.client?.phone && <p>Tél : {invoice.client.phone}</p>}
                        {invoice.client?.email && <p>Email : {invoice.client.email}</p>}
                        {invoice.client?.tax_id && (
                            <p className="font-mono text-xs mt-2">NINEA / NIF : {invoice.client.tax_id}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Tableau des prestations (DGID) ── */}
            <div className="mb-8 rounded-xl overflow-hidden border border-gray-200">
                {/* En-têtes */}
                <div className={`hidden md:grid ${isInvoice ? 'grid-cols-[1fr_60px_100px_100px_60px_90px_100px]' : 'grid-cols-[40px_1fr_60px_100px_110px]'} gap-2 bg-gray-800 text-white px-4 py-3 text-xs font-bold uppercase tracking-wider`}>
                    {!isInvoice && <div className="text-center">#</div>}
                    <div>Désignation</div>
                    <div className="text-center">Qté</div>
                    <div className="text-right">PU HT</div>
                    {isInvoice ? (
                        <>
                            <div className="text-right">Montant HT</div>
                            <div className="text-center">TVA %</div>
                            <div className="text-right">TVA</div>
                            <div className="text-right">TTC</div>
                        </>
                    ) : (
                        <div className="text-right">Montant HT</div>
                    )}
                </div>

                {/* Lignes */}
                <div className="divide-y divide-gray-100">
                    {invoice.items.map((item, i) => {
                        const montantHT = item.quantity * item.unit_price
                        const tvaRate = item.tax_rate ?? 18
                        const tvaAmount = montantHT * (tvaRate / 100)
                        const ttc = montantHT + tvaAmount

                        return (
                            <div key={i} className={`px-4 py-3 bg-white hover:bg-gray-50/50 transition-colors`}>
                                {/* Desktop */}
                                <div className={`hidden md:grid ${isInvoice ? 'grid-cols-[1fr_60px_100px_100px_60px_90px_100px]' : 'grid-cols-[40px_1fr_60px_100px_110px]'} gap-2 items-center`}>
                                    {!isInvoice && <div className="text-center text-gray-400 font-bold">{i + 1}</div>}
                                    <div className="font-medium text-gray-900">{item.description}</div>
                                    <div className="text-center text-gray-600">{item.quantity}</div>
                                    <div className="text-right text-gray-600 font-mono text-sm">{fmt(item.unit_price)}</div>
                                    <div className="text-right font-semibold text-gray-900 font-mono text-sm">{fmt(montantHT)}</div>
                                    {isInvoice && (
                                        <>
                                            <div className="text-center text-gray-500 text-sm">{tvaRate}%</div>
                                            <div className="text-right text-gray-600 font-mono text-sm">{fmt(tvaAmount)}</div>
                                            <div className="text-right font-bold text-gray-900 font-mono text-sm">{fmt(ttc)}</div>
                                        </>
                                    )}
                                </div>

                                {/* Mobile */}
                                <div className="md:hidden space-y-1">
                                    <div className="flex justify-between">
                                        <span className="font-medium text-gray-900">{!isInvoice && `${i + 1}. `}{item.description}</span>
                                        <span className="font-bold text-gray-900">{fmt(isInvoice ? ttc : montantHT)}</span>
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {item.quantity} x {fmt(item.unit_price)}
                                        {isInvoice && ` — TVA ${tvaRate}% : ${fmt(tvaAmount)}`}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* ── Totaux ── */}
            <div className="flex flex-col md:flex-row md:justify-end mb-8">
                <div className="w-full md:w-80 space-y-3 bg-gray-50 p-5 rounded-xl border border-gray-200">
                    <div className="flex justify-between text-sm text-gray-600 font-medium">
                        <span>Total HT</span>
                        <span className="tabular-nums font-semibold">{fmt(invoice.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600 font-medium">
                        <span>TVA (18%)</span>
                        <span className="tabular-nums font-semibold">{fmt(invoice.tax_amount)}</span>
                    </div>
                    <div className="flex justify-between items-end border-t-2 border-gray-800 pt-3 mt-2">
                        <span className="text-base font-bold text-gray-900 uppercase">Total TTC</span>
                        <span className="text-2xl font-black text-blue-600 tracking-tight tabular-nums relative">
                            {fmt(invoice.total_amount)}
                            {invoice.status === 'paid' && isInvoice && (
                                <div className="absolute -right-6 -top-2 bg-emerald-500 text-white rounded-full p-0.5 shadow-md">
                                    <CheckCircle2 className="w-4 h-4" />
                                </div>
                            )}
                        </span>
                    </div>

                    {invoice.paid_at && isInvoice && (
                        <div className="flex justify-between text-xs text-emerald-700 font-bold pt-2 border-t border-emerald-100 bg-emerald-50 p-2 rounded-lg mt-2">
                            <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4" /> Réglée le</span>
                            <span>{fmtDateLong(invoice.paid_at)}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Informations complémentaires (Facture) ── */}
            {isInvoice && (
                <div className="mb-8 bg-blue-50/50 border border-blue-100 rounded-xl p-5 space-y-2 text-sm text-gray-700">
                    {invoice.payment_terms && (
                        <p><span className="font-semibold text-gray-900">Mode de paiement :</span> {invoice.payment_terms}</p>
                    )}
                    {!invoice.payment_terms && (
                        <p><span className="font-semibold text-gray-900">Mode de paiement :</span> Wave / Orange Money / Virement / Espèces</p>
                    )}
                    {invoice.due_date && (
                        <p><span className="font-semibold text-gray-900">Échéance :</span> {fmtDateLong(invoice.due_date)}</p>
                    )}
                    {invoice.quote_number && (
                        <p><span className="font-semibold text-gray-900">Réf. devis :</span> {invoice.quote_number}</p>
                    )}
                    {invoice.notes && (
                        <p><span className="font-semibold text-gray-900">Notes :</span> {invoice.notes}</p>
                    )}
                </div>
            )}

            {/* ── Conditions (Devis) ── */}
            {!isInvoice && (
                <div className="mb-8 space-y-6">
                    {/* Notes / Conditions */}
                    <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-5">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Conditions</p>
                        {invoice.notes ? (
                            <p className="text-sm text-gray-700 whitespace-pre-line">{invoice.notes}</p>
                        ) : (
                            <ul className="text-sm text-gray-700 space-y-1.5 list-disc list-inside">
                                <li>Modalités de paiement : 50% à la commande, 50% à la livraison</li>
                                <li>Modes de paiement : Wave / Orange Money / Virement / Espèces</li>
                                <li>Le présent document est un DEVIS (non une facture)</li>
                            </ul>
                        )}
                    </div>

                    {/* Zone d'acceptation du client */}
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 print:break-inside-avoid">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Acceptation du Client</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                            <div className="space-y-3">
                                <p>Bon pour accord :</p>
                                <p>Nom &amp; Prénom : ________________________________</p>
                                <p>Fonction : ________________________________</p>
                            </div>
                            <div className="space-y-3">
                                <p>Signature / Cachet :</p>
                                <div className="h-20 border border-gray-200 rounded-lg bg-white"></div>
                                <p>Date : ____ / ____ / {new Date(invoice.created_at).getFullYear()}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Actions client */}
            {actions && (
                <div className="mb-8 print:hidden">
                    {actions}
                </div>
            )}

            {/* ── Pied de page ── */}
            <div className="border-t border-gray-200 pt-6 text-center text-gray-500 pb-6">
                <p className="text-sm font-medium text-gray-900 mb-1">Merci de votre confiance.</p>
                <p className="text-xs text-gray-400 font-medium">
                    {isInvoice
                        ? "En cas de retard de paiement, des pénalités peuvent s'appliquer conformément à la réglementation DGID."
                        : `Ce devis est valable ${invoice.validity_days ?? 30} jours à compter de sa date d'émission.`
                    } — Généré par FactureFlow SN
                </p>
                {agency?.ninea && (
                    <p className="text-[10px] text-gray-300 mt-1 font-mono">
                        {agency.name} — NINEA : {agency.ninea}{agency.rccm ? ` — RCCM : ${agency.rccm}` : ''}
                    </p>
                )}
            </div>
        </div>
    )
}
