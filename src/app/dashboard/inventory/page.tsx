import { InvoiceService } from '@/services/invoiceService'
import { QuoteService } from '@/services/quoteService'
import { AgencyService } from '@/services/agencyService'
import { Book, CheckCircle2, FileSpreadsheet, FileText } from 'lucide-react'
import Link from 'next/link'

function formatXOF(n: number) {
    return new Intl.NumberFormat('fr-SN', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(n)
}

function formatDate(dateStr: string | null) {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('fr-SN')
}

export default async function InventoryPage() {
    const invoices = await InvoiceService.getInvoices()
    const paidInvoices = invoices.filter(inv => inv.status === 'paid')

    // Note: getInvoices naturally filters for the current agency via getAuthContext
    const quotes = await QuoteService.getQuotes()
    const acceptedQuotes = quotes.filter(q => q.status === 'accepted')

    const totalPaid = paidInvoices.reduce((sum, inv) => sum + Number(inv.total_amount), 0)
    const totalAcceptedQuotes = acceptedQuotes.reduce((sum, q) => sum + Number(q.total_amount), 0)

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Livre d'Inventaire</h1>
                <p className="text-gray-500">Historique complet de vos encaissements et engagements acceptés.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-medium text-gray-500">Total Encaissé</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{formatXOF(totalPaid)}</p>
                    <p className="text-xs text-gray-400 mt-1">{paidInvoices.length} factures réglées</p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <FileText className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-medium text-gray-500">Engagements Acceptés</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{formatXOF(totalAcceptedQuotes)}</p>
                    <p className="text-xs text-gray-400 mt-1">{acceptedQuotes.length} devis acceptés</p>
                </div>
            </div>

            <div className="space-y-6">
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <FileSpreadsheet className="w-5 h-5 text-gray-400" />
                        <h2 className="text-lg font-bold text-gray-800">Factures Réglées</h2>
                    </div>
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="px-4 md:px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Numéro</th>
                                    <th className="px-4 md:px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Client</th>
                                    <th className="px-4 md:px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 hidden sm:table-cell">Date Paiement</th>
                                    <th className="px-4 md:px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-gray-500">Montant</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {paidInvoices.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-10 text-center text-gray-400 text-sm">Aucune facture réglée.</td>
                                    </tr>
                                ) : (
                                    paidInvoices.map(inv => (
                                        <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <Link href={`/dashboard/invoices`} className="text-blue-600 font-bold hover:underline">
                                                    {inv.invoice_number}
                                                </Link>
                                            </td>
                                            <td className="px-4 md:px-6 py-4 text-sm text-gray-600">{inv.client?.name}</td>
                                            <td className="px-4 md:px-6 py-4 text-sm text-gray-600 hidden sm:table-cell">{formatDate(inv.paid_at)}</td>
                                            <td className="px-6 py-4 text-right font-bold text-gray-900">{formatXOF(Number(inv.total_amount))}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                        </div>
                    </div>
                </section>

                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <Book className="w-5 h-5 text-gray-400" />
                        <h2 className="text-lg font-bold text-gray-800">Devis Acceptés</h2>
                    </div>
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="px-4 md:px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Numéro</th>
                                    <th className="px-4 md:px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Client</th>
                                    <th className="px-4 md:px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 hidden sm:table-cell">Statut</th>
                                    <th className="px-4 md:px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-gray-500">Montant</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {acceptedQuotes.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-10 text-center text-gray-400 text-sm">Aucun devis accepté.</td>
                                    </tr>
                                ) : (
                                    acceptedQuotes.map(q => (
                                        <tr key={q.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <Link href={`/dashboard/quotes`} className="text-blue-600 font-bold hover:underline">
                                                    {q.quote_number}
                                                </Link>
                                            </td>
                                            <td className="px-4 md:px-6 py-4 text-sm text-gray-600">{q.client?.name}</td>
                                            <td className="px-4 md:px-6 py-4 text-sm hidden sm:table-cell">
                                                <span className="px-2 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase rounded-md">Accepté</span>
                                            </td>
                                            <td className="px-6 py-4 text-right font-bold text-gray-900">{formatXOF(Number(q.total_amount))}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    )
}
