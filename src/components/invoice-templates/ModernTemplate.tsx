import { ShieldCheck, CheckCircle2 } from 'lucide-react'
import type { InvoiceTemplateProps } from '@/types/invoiceTemplate'

function fmt(n: number) {
    return new Intl.NumberFormat('fr-SN', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(n)
}

function fmtDate(iso: string) {
    return new Date(iso).toLocaleDateString('fr-SN', { day: '2-digit', month: 'long', year: 'numeric' })
}

export default function ModernTemplate({ invoice, agency, statusConfig, document_type = 'invoice', actions }: InvoiceTemplateProps) {
    const StatusIcon = statusConfig.icon
    const title = document_type === 'invoice' ? 'FACTURE' : 'DEVIS'

    return (
        <div className="flex flex-col md:flex-row min-h-[1000px] bg-white [print-color-adjust:exact] [-webkit-print-color-adjust:exact]">
            {/* Sidebar Gauche (Couleur sombre) */}
            <div className="w-full md:w-72 bg-slate-900 text-slate-100 p-8 flex flex-col justify-between">
                <div>
                    {agency?.logo_url ? (
                        <img src={agency.logo_url} alt={agency.name} className="h-20 w-auto object-contain mb-8 brightness-0 invert" />
                    ) : (
                        <div className="h-12 w-12 bg-blue-600 rounded-lg mb-8 flex items-center justify-center font-bold text-xl">F</div>
                    )}

                    <div className="space-y-6">
                        <div>
                            <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-2">Émetteur</p>
                            <p className="font-bold text-lg">{agency?.name}</p>
                            <p className="text-sm text-slate-400 mt-1">{agency?.email}</p>
                            <p className="text-sm text-slate-400">{agency?.phone}</p>
                        </div>

                        <div>
                            <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-2">{document_type === 'invoice' ? 'Client' : 'Destinataire'}</p>
                            <p className="font-bold">{invoice.client?.name}</p>
                            <p className="text-sm text-slate-400 mt-1">{invoice.client?.email}</p>
                        </div>
                    </div>
                </div>

                <div className="pt-8 border-t border-slate-800 text-[10px] text-slate-500 space-y-2">
                    {agency?.address && <p>{agency.address}</p>}
                    <div className="flex flex-wrap gap-2">
                        {agency?.ninea && <span>NINEA: {agency.ninea}</span>}
                        {agency?.rccm && <span>RCCM: {agency.rccm}</span>}
                    </div>
                </div>
            </div>

            {/* Contenu Principal */}
            <div className="flex-1 p-8 md:p-12">
                <div className="flex justify-between items-start mb-12">
                    <div>
                        <h1 className="text-6xl font-black text-slate-900 tracking-tighter mb-2">{title}</h1>
                        <p className="text-xl font-mono text-slate-400">#{invoice.invoice_number}</p>
                        <div className="mt-4 inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Conforme DGI Sénégal
                        </div>
                    </div>
                    <div className="text-right">
                        <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold ${statusConfig.bg} ${statusConfig.color}`}>
                            <StatusIcon className="w-4 h-4" />
                            {statusConfig.label}
                        </span>
                        <p className="text-sm text-slate-400 mt-4">Émis le <span className="text-slate-900 font-bold">{fmtDate(invoice.created_at)}</span></p>
                    </div>
                </div>

                <table className="w-full mb-12">
                    <thead>
                        <tr className="border-b-2 border-slate-900 text-left text-xs uppercase tracking-wider text-slate-400">
                            <th className="py-4 font-black">Description</th>
                            <th className="py-4 font-black text-center">Qté</th>
                            <th className="py-4 font-black text-right">Prix Unitaire</th>
                            <th className="py-4 font-black text-right">Total HT</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {invoice.items.map((item, i) => (
                            <tr key={i} className="text-slate-700">
                                <td className="py-6 font-medium">{item.description}</td>
                                <td className="py-6 text-center">{item.quantity}</td>
                                <td className="py-6 text-right tabular-nums">{fmt(item.unit_price)}</td>
                                <td className="py-6 text-right font-bold tabular-nums text-slate-900">{fmt(item.quantity * item.unit_price)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="flex justify-end">
                    <div className="w-full md:w-80 space-y-4">
                        <div className="flex justify-between text-slate-400">
                            <span>Sous-total</span>
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

                        {invoice.paid_at && document_type === 'invoice' && (
                            <div className="bg-emerald-50 text-emerald-700 p-4 rounded-2xl flex items-center justify-between font-bold text-sm">
                                <span className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5" /> Payée le</span>
                                <span>{fmtDate(invoice.paid_at)}</span>
                            </div>
                        )}
                    </div>
                </div>

                {actions && <div className="mt-12 print:hidden">{actions}</div>}

                <div className="mt-24 pt-8 border-t border-slate-100 text-[10px] text-slate-400 uppercase tracking-widest text-center">
                    {document_type === 'invoice'
                        ? "Conforme aux réglementations fiscales en vigueur au Sénégal."
                        : "Ce devis est valable pendant 30 jours calendaires."
                    }
                </div>
            </div>
        </div>
    )
}
