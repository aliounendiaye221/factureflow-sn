'use client'

import { useState } from 'react'
import { Copy, CheckCircle2, MessageCircle } from 'lucide-react'

type Props = {
    planName: string
    planPrice: number
    agencyId: string
    supportWhatsapp: string
    waveNumber: string
}

export default function UpgradeButton({ planName, planPrice, agencyId, supportWhatsapp, waveNumber }: Props) {
    const [copied, setCopied] = useState(false)
    const [showInstructions, setShowInstructions] = useState(false)

    const formattedPrice = planPrice.toLocaleString('fr-SN')
    const waMessage = `Bonjour, je souhaite activer le plan *${planName}* (${formattedPrice} FCFA/mois) sur FactureFlow SN.\n\nMon ID entreprise : *${agencyId}*\n\n(Je joins la capture du paiement Wave ci-dessous)`
    const waLink = `https://wa.me/${supportWhatsapp}?text=${encodeURIComponent(waMessage)}`

    const handleCopyWave = async () => {
        try {
            await navigator.clipboard.writeText(waveNumber)
            setCopied(true)
            setTimeout(() => setCopied(false), 2500)
        } catch {
            alert(`Numéro Wave : ${waveNumber}`)
        }
    }

    if (!showInstructions) {
        return (
            <button
                onClick={() => setShowInstructions(true)}
                className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors bg-white text-blue-600 hover:bg-blue-50 border border-blue-200"
            >
                Activer le plan {planName}
                <span className="text-blue-400">→</span>
            </button>
        )
    }

    return (
        <div className="mt-4 bg-white rounded-xl border border-gray-200 p-5 space-y-4">
            <h4 className="font-bold text-gray-900 text-sm">Comment activer le plan {planName} :</h4>

            <ol className="space-y-3 text-sm text-gray-700">
                <li className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                    <div>
                        <p className="font-medium">Envoyez <span className="text-blue-700 font-black">{formattedPrice} FCFA</span> via Wave à :</p>
                        <div className="flex items-center gap-2 mt-1.5">
                            <code className="bg-gray-100 px-3 py-1.5 rounded-lg font-mono font-bold text-gray-900 text-sm">{waveNumber}</code>
                            <button
                                onClick={handleCopyWave}
                                className="flex items-center gap-1.5 text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                            >
                                {copied ? <CheckCircle2 className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                {copied ? 'Copié !' : 'Copier'}
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Référence : <span className="font-mono">{agencyId.slice(0, 8).toUpperCase()}</span></p>
                    </div>
                </li>

                <li className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                    <div>
                        <p className="font-medium">Envoyez la capture du paiement Wave sur WhatsApp :</p>
                        <a
                            href={waLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1.5 flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-700 transition-colors w-fit"
                        >
                            <MessageCircle className="w-4 h-4" />
                            Envoyer sur WhatsApp
                        </a>
                    </div>
                </li>

                <li className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">✓</span>
                    <p className="font-medium text-emerald-700">Activation confirmée dans les <strong>2 heures</strong> ouvrables</p>
                </li>
            </ol>

            <p className="text-xs text-gray-400 text-center pt-2 border-t border-gray-100">
                Paiement sécurisé · Wave · Orange Money · Virement bancaire
            </p>
        </div>
    )
}
