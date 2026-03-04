import { ShieldCheck, CheckCircle2 } from 'lucide-react'
import type { InvoiceTemplateProps } from '@/types/invoiceTemplate'

function fmt(n: number) {
    return new Intl.NumberFormat('fr-SN', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(n)
}

function fmtDate(iso: string) {
    return new Date(iso).toLocaleDateString('fr-SN', { day: '2-digit', month: 'long', year: 'numeric' })
}

export default function EliteTemplate({ invoice, agency, statusConfig, document_type = 'invoice', actions }: InvoiceTemplateProps) {
    const StatusIcon = statusConfig.icon
    const title = document_type === 'invoice' ? 'FACTURE' : 'DEVIS'

    return (
        <div className="bg-white min-h-[1000px] font-sans [print-color-adjust:exact] [-webkit-print-color-adjust:exact]">
            {/* Header Premium avec Gradient */}
            <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-slate-900 p-12 text-white">
                <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                    <div>
                        {agency?.logo_url ? (
                            <img src={agency.logo_url} alt={agency.name} className="h-16 w-auto object-contain mb-6 brightness-0 invert" />
                        ) : (
                            <div className="text-3xl font-black tracking-tighter mb-6">{agency?.name}</div>
                        )}
                        <h1 className="text-7xl font-black tracking-tighter opacity-20 absolute top-4 right-8 select-none pointer-events-none">{title}</h1>
                        <div className="space-y-1 text-blue-100 text-sm">
                            <p className="font-bold text-white text-lg">{agency?.name}</p>
                            <p>{agency?.email}</p>
                            <p>{agency?.phone}</p>
                            <p className="opacity-75">{agency?.address}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-blue-400 text-xs font-black uppercase tracking-widest mb-2">Référence</p>
                        <p className="text-4xl font-mono font-bold">{invoice.invoice_number}</p>
                        <div className="mt-4 inline-flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Conforme DGI Sénégal
                        </div>
                        <div className="mt-6">
                            <span className={`inline-flex items-center gap-2 px-6 py-2 rounded-full text-sm font-black border-2 ${statusConfig.bg} ${statusConfig.color} border-current`}>
                                <StatusIcon className="w-4 h-4" />
                                {statusConfig.label}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
                    <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">{document_type === 'invoice' ? 'Destinataire' : 'Client'}</p>
                        <p className="text-2xl font-black text-slate-900">{invoice.client?.name}</p>
                        <div className="mt-4 space-y-1 text-slate-600">
                            <p>{invoice.client?.email}</p>
                            <p>{invoice.client?.phone}</p>
                            <p className="text-xs mt-4 opacity-50 font-mono">ID: {invoice.client?.id?.slice(0, 8) || '......'}</p>
                        </div>
                    </div>
                    <div className="flex flex-col justify-end text-right space-y-2">
                        <p className="text-slate-400 text-xs uppercase font-bold">Date d'émission</p>
                        <p className="text-xl font-bold text-slate-900">{fmtDate(invoice.created_at)}</p>
                        {invoice.due_date && (
                            <>
                                <p className="text-slate-400 text-xs uppercase font-bold mt-4">Échéance</p>
                                <p className="text-xl font-bold text-blue-600">{fmtDate(invoice.due_date)}</p>
                            </>
                        )}
                    </div>
                </div>

                <div className="mb-12">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100">
                                <th className="pb-4">Article & Description</th>
                                <th className="pb-4 text-center">Qté</th>
                                <th className="pb-4 text-right">Prix</th>
                                <th className="pb-4 text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {invoice.items.map((item, i) => (
                                <tr key={i}>
                                    <td className="py-8">
                                        <p className="font-black text-slate-900 text-lg">{item.description}</p>
                                        <p className="text-sm text-slate-400 italic">Prestation de service</p>
                                    </td>
                                    <td className="py-8 text-center font-bold text-slate-600">{item.quantity}</td>
                                    <td className="py-8 text-right font-bold text-slate-600 tabular-nums">{fmt(item.unit_price)}</td>
                                    <td className="py-8 text-right font-black text-slate-900 text-xl tabular-nums">{fmt(item.quantity * item.unit_price)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="flex justify-end pt-8 border-t-4 border-slate-900">
                    <div className="w-full md:w-96 space-y-4">
                        <div className="flex justify-between text-slate-500 font-bold uppercase text-xs tracking-widest">
                            <span>Sous-total</span>
                            <span className="text-slate-900">{fmt(invoice.subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-slate-500 font-bold uppercase text-xs tracking-widest">
                            <span>Taxe TVA (18%)</span>
                            <span className="text-slate-900">{fmt(invoice.tax_amount)}</span>
                        </div>
                        <div className="flex justify-between items-center py-6 bg-slate-900 text-white px-8 rounded-2xl shadow-2xl shadow-blue-900/20 mt-8">
                            <span className="font-black tracking-tighter text-2xl uppercase">Total Final</span>
                            <span className="text-4xl font-black text-blue-400 tabular-nums">{fmt(invoice.total_amount)}</span>
                        </div>

                        {invoice.paid_at && document_type === 'invoice' && (
                            <div className="flex items-center gap-3 text-emerald-600 font-black justify-end pt-4">
                                <ShieldCheck className="w-6 h-6" />
                                DOCUMENT RÉGLÉ LE {fmtDate(invoice.paid_at).toUpperCase()}
                            </div>
                        )}
                    </div>
                </div>

                {actions && <div className="mt-16 print:hidden">{actions}</div>}

                <div className="mt-32 pt-12 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <div>{agency?.name} — {agency?.ninea} / {agency?.rccm}</div>
                    <div>Propulsé par FactureFlow SN Élite</div>
                </div>
            </div>
        </div>
    )
}
