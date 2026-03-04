'use client'

import { useState } from 'react'
import { updateTicketAction } from '@/app/actions/superAdminActions'

const STATUSES = [
    { value: 'open', label: 'Ouvert' },
    { value: 'in_progress', label: 'En cours' },
    { value: 'resolved', label: 'Résolu' },
    { value: 'closed', label: 'Fermé' },
]

interface Props {
    ticketId: string
    currentStatus: string
    currentNotes: string
}

export default function TicketManager({ ticketId, currentStatus, currentNotes }: Props) {
    const [status, setStatus] = useState(currentStatus)
    const [notes, setNotes] = useState(currentNotes)
    const [loading, setLoading] = useState(false)
    const [msg, setMsg] = useState<string | null>(null)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setMsg(null)
        const fd = new FormData()
        fd.set('ticketId', ticketId)
        fd.set('status', status)
        fd.set('adminNotes', notes)
        const result = await updateTicketAction({ success: false, message: '' }, fd)
        setMsg(result.message)
        if (result.success) {
            window.location.reload()
        }
        setLoading(false)
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-start sm:items-end gap-3 pt-2 border-t border-gray-100">
            <div className="flex-1 w-full">
                <label className="text-xs font-medium text-gray-600 block mb-1">Notes admin</label>
                <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    rows={2}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Ajouter une note ou réponse interne..."
                />
            </div>
            <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Statut</label>
                <select
                    value={status}
                    onChange={e => setStatus(e.target.value)}
                    className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                    {STATUSES.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                </select>
            </div>
            <div className="flex items-center gap-2">
                <button
                    type="submit"
                    disabled={loading}
                    className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-60 transition-colors whitespace-nowrap"
                >
                    {loading ? 'Envoi...' : 'Mettre à jour'}
                </button>
                {msg && <span className="text-xs text-green-600 font-medium">{msg}</span>}
            </div>
        </form>
    )
}
