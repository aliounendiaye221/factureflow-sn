import { SuperAdminService } from '@/services/superAdminService'
import {
    AlertTriangle, Clock, CheckCircle2, XCircle,
    MessageSquare, ArrowUpCircle
} from 'lucide-react'
import TicketManager from './TicketManager'

export const dynamic = 'force-dynamic'

const statusConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
    open: { label: 'Ouvert', icon: <AlertTriangle className="w-4 h-4" />, color: 'bg-red-50 text-red-700 border-red-200' },
    in_progress: { label: 'En cours', icon: <Clock className="w-4 h-4" />, color: 'bg-amber-50 text-amber-700 border-amber-200' },
    resolved: { label: 'Résolu', icon: <CheckCircle2 className="w-4 h-4" />, color: 'bg-green-50 text-green-700 border-green-200' },
    closed: { label: 'Fermé', icon: <XCircle className="w-4 h-4" />, color: 'bg-gray-50 text-gray-600 border-gray-200' },
}

const priorityConfig: Record<string, { label: string; color: string }> = {
    urgent: { label: 'Urgent', color: 'bg-red-600 text-white' },
    high: { label: 'Haute', color: 'bg-orange-500 text-white' },
    medium: { label: 'Moyenne', color: 'bg-amber-400 text-amber-900' },
    low: { label: 'Basse', color: 'bg-gray-200 text-gray-700' },
}

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('fr-SN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default async function SupportPage() {
    const tickets = await SuperAdminService.getSupportTickets()

    const statusCounts = tickets.reduce((acc, t) => {
        acc[t.status] = (acc[t.status] || 0) + 1
        return acc
    }, {} as Record<string, number>)

    const openTickets = tickets.filter(t => t.status === 'open' || t.status === 'in_progress')
    const closedTickets = tickets.filter(t => t.status === 'resolved' || t.status === 'closed')

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-xl font-bold text-gray-900">Support Technique</h3>
                <p className="text-sm text-gray-500">
                    {tickets.length} ticket{tickets.length > 1 ? 's' : ''} — {openTickets.length} en attente de traitement
                </p>
            </div>

            {/* ═══ STATUS COUNTERS ═══ */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Object.entries(statusConfig).map(([key, cfg]) => (
                    <div key={key} className={`rounded-xl border p-4 flex items-center gap-3 ${cfg.color}`}>
                        {cfg.icon}
                        <div>
                            <p className="text-xl font-bold">{statusCounts[key] ?? 0}</p>
                            <p className="text-[11px] font-medium opacity-80">{cfg.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* ═══ TICKETS OUVERTS ═══ */}
            {openTickets.length > 0 && (
                <div className="space-y-3">
                    <h4 className="font-bold text-gray-900 flex items-center gap-2">
                        <ArrowUpCircle className="w-5 h-5 text-red-500" />
                        Tickets Ouverts / En Cours ({openTickets.length})
                    </h4>
                    {openTickets.map(ticket => (
                        <div key={ticket.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${priorityConfig[ticket.priority]?.color ?? 'bg-gray-200'}`}>
                                            {priorityConfig[ticket.priority]?.label ?? ticket.priority}
                                        </span>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusConfig[ticket.status]?.color ?? ''}`}>
                                            {statusConfig[ticket.status]?.label ?? ticket.status}
                                        </span>
                                    </div>
                                    <h5 className="font-bold text-gray-900">{ticket.subject}</h5>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        {ticket.user_email} — {formatDate(ticket.created_at)}
                                    </p>
                                </div>
                            </div>
                            <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-3 mb-3">{ticket.message}</p>
                            {ticket.admin_notes && (
                                <div className="bg-blue-50 rounded-xl p-3 mb-3">
                                    <p className="text-xs font-bold text-blue-700 mb-1">
                                        <MessageSquare className="w-3 h-3 inline mr-1" /> Notes Admin
                                    </p>
                                    <p className="text-sm text-blue-800">{ticket.admin_notes}</p>
                                </div>
                            )}
                            <TicketManager ticketId={ticket.id} currentStatus={ticket.status} currentNotes={ticket.admin_notes ?? ''} />
                        </div>
                    ))}
                </div>
            )}

            {/* ═══ TICKETS RÉSOLUS / FERMÉS ═══ */}
            {closedTickets.length > 0 && (
                <div className="space-y-3">
                    <h4 className="font-bold text-gray-900 flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        Tickets Résolus / Fermés ({closedTickets.length})
                    </h4>
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 text-sm">
                                <thead className="bg-gray-50/50">
                                    <tr>
                                        <th className="px-4 sm:px-6 py-3 text-left font-semibold text-gray-600">Sujet</th>
                                        <th className="px-4 sm:px-6 py-3 text-left font-semibold text-gray-600 hidden sm:table-cell">Email</th>
                                        <th className="px-4 sm:px-6 py-3 text-center font-semibold text-gray-600">Statut</th>
                                        <th className="px-4 sm:px-6 py-3 text-left font-semibold text-gray-600 hidden md:table-cell">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {closedTickets.map(ticket => (
                                        <tr key={ticket.id} className="hover:bg-gray-50/50">
                                            <td className="px-4 sm:px-6 py-3">
                                                <p className="font-medium text-gray-900 truncate max-w-[200px]">{ticket.subject}</p>
                                                <p className="text-[10px] text-gray-400 sm:hidden">{ticket.user_email}</p>
                                            </td>
                                            <td className="px-4 sm:px-6 py-3 text-xs text-gray-500 hidden sm:table-cell">{ticket.user_email}</td>
                                            <td className="px-4 sm:px-6 py-3 text-center">
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusConfig[ticket.status]?.color ?? ''}`}>
                                                    {statusConfig[ticket.status]?.label ?? ticket.status}
                                                </span>
                                            </td>
                                            <td className="px-4 sm:px-6 py-3 text-xs text-gray-500 hidden md:table-cell">{formatDate(ticket.created_at)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {tickets.length === 0 && (
                <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                    <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">Aucun ticket de support pour le moment.</p>
                    <p className="text-xs text-gray-400 mt-1">Les tickets créés par les utilisateurs apparaîtront ici.</p>
                </div>
            )}
        </div>
    )
}
