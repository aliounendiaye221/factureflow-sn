'use client'

import { useState } from 'react'
import { Ban, RotateCcw, Trash2 } from 'lucide-react'
import { suspendAgencyAction, reactivateAgencyAction, deleteAgencyAction } from '@/app/actions/superAdminActions'

interface Props {
    agencyId: string
    isSuspended: boolean
    agencyName: string
}

export default function AgencyActions({ agencyId, isSuspended, agencyName }: Props) {
    const [loading, setLoading] = useState<string | null>(null)
    const [msg, setMsg] = useState<string | null>(null)

    async function handleAction(action: 'suspend' | 'reactivate' | 'delete') {
        const confirmMessages: Record<string, string> = {
            suspend: `Suspendre l'agence "${agencyName}" ? Elle perdra l'accès à ses données.`,
            reactivate: `Réactiver l'agence "${agencyName}" ?`,
            delete: `SUPPRIMER DÉFINITIVEMENT l'agence "${agencyName}" et TOUTES ses données ? Cette action est irréversible.`,
        }
        if (!confirm(confirmMessages[action])) return
        setLoading(action)
        setMsg(null)
        try {
            let result
            if (action === 'suspend') result = await suspendAgencyAction(agencyId)
            else if (action === 'reactivate') result = await reactivateAgencyAction(agencyId)
            else result = await deleteAgencyAction(agencyId)
            setMsg(result.message)
            if (result.success) {
                window.location.reload()
            }
        } catch {
            setMsg('Erreur inattendue.')
        } finally {
            setLoading(null)
        }
    }

    return (
        <div className="flex items-center gap-2">
            {msg && <span className="text-xs text-gray-500 mr-1">{msg}</span>}
            {isSuspended ? (
                <button
                    onClick={() => handleAction('reactivate')}
                    disabled={loading !== null}
                    className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 disabled:opacity-50 transition-colors"
                    title="Réactiver"
                >
                    <RotateCcw className="w-4 h-4" />
                </button>
            ) : (
                <button
                    onClick={() => handleAction('suspend')}
                    disabled={loading !== null}
                    className="p-1.5 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 disabled:opacity-50 transition-colors"
                    title="Suspendre"
                >
                    <Ban className="w-4 h-4" />
                </button>
            )}
            <button
                onClick={() => handleAction('delete')}
                disabled={loading !== null}
                className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50 transition-colors"
                title="Supprimer"
            >
                <Trash2 className="w-4 h-4" />
            </button>
        </div>
    )
}
