'use client'

import { useState } from 'react'
import { Copy, CheckCircle2, MessageCircle, Smartphone } from 'lucide-react'
import PaymentQRCode from '@/components/PaymentQRCode'

const FALLBACK_WAVE = process.env.NEXT_PUBLIC_WAVE_NUMBER ?? '78 000 00 00'
const FALLBACK_WA  = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP ?? '221780000000'

export default function MobileMoneyForm({
    invoiceId,
    amount,
    amountObj,
    invoiceNumber,
    waveNumber,
    whatsappNumber,
    paymentLink,
}: {
    invoiceId: string
    amount: number
    amountObj: { formatted: string; raw: number }
    invoiceNumber?: string
    waveNumber?: string
    whatsappNumber?: string
    paymentLink?: string
}) {
    const [copied, setCopied] = useState(false)

    const activeWave = waveNumber || FALLBACK_WAVE
    const activeWA = whatsappNumber || FALLBACK_WA

    const ref = invoiceNumber ?? invoiceId.slice(0, 8).toUpperCase()
    const waMessage =
        `Bonjour, je viens de payer la facture *${ref}* d'un montant de *${amountObj.formatted}* via Wave.\n\n` +
        `(Je joins la capture d'écran du paiement Wave ci-dessous)`
    const waLink = `https://wa.me/${activeWA}?text=${encodeURIComponent(waMessage)}`

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(activeWave)
            setCopied(true)
            setTimeout(() => setCopied(false), 2500)
        } catch {
            alert(`Numéro Wave : ${activeWave}`)
        }
    }

    return (
        <div className="bg-white border border-gray-200 shadow-xl shadow-gray-200/50 rounded-3xl overflow-hidden mt-8 md:mt-12">
            {/* Header */}
            <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 md:px-8 md:py-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-xl">
                        <Smartphone className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <h2 className="text-base md:text-lg font-bold text-gray-900">Payer par Mobile Money</h2>
                        <p className="text-xs text-gray-500">Wave · Orange Money</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-xs text-gray-400 mb-0.5">Montant à régler</p>
                    <p className="text-2xl font-black text-blue-600">{amountObj.formatted}</p>
                </div>
            </div>

            {/* Instructions */}
            <div className="p-6 md:p-8 space-y-5">
                <p className="text-sm font-semibold text-gray-700">Comment procéder (2 étapes) :</p>

                <ol className="space-y-5">
                    {/* Étape 1 */}
                    <li className="flex gap-3">
                        <span className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                        <div>
                            <p className="font-medium text-gray-800 text-sm">
                                Envoyez <span className="font-black text-blue-600">{amountObj.formatted}</span> via Wave à :
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                                <code className="bg-gray-100 px-3 py-1.5 rounded-lg font-mono font-bold text-gray-900 text-sm">
                                    {activeWave}
                                </code>
                                <button
                                    onClick={handleCopy}
                                    className="flex items-center gap-1.5 text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                                >
                                    {copied
                                        ? <><CheckCircle2 className="w-3 h-3" /> Copié !</>
                                        : <><Copy className="w-3 h-3" /> Copier</>
                                    }
                                </button>
                            </div>
                            <p className="text-xs text-gray-400 mt-1.5">
                                Référence à indiquer : <span className="font-mono font-semibold text-gray-700">{ref}</span>
                            </p>
                        </div>
                    </li>

                    {/* Étape 2 */}
                    <li className="flex gap-3">
                        <span className="w-7 h-7 rounded-full bg-green-100 text-green-700 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                        <div>
                            <p className="font-medium text-gray-800 text-sm mb-2">
                                Envoyez la capture du paiement Wave sur WhatsApp pour confirmation :
                            </p>
                            <a
                                href={waLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-green-700 transition-colors"
                            >
                                <MessageCircle className="w-4 h-4" />
                                Confirmer sur WhatsApp
                            </a>
                        </div>
                    </li>
                </ol>

                {/* QR Code de paiement */}
                {(waveNumber || paymentLink) && (
                    <div className="flex justify-center pt-4 border-t border-gray-100">
                        <PaymentQRCode
                            waveNumber={waveNumber}
                            amount={amount}
                            reference={ref}
                            paymentLink={paymentLink}
                            size={120}
                        />
                    </div>
                )}

                <p className="text-xs text-gray-400 text-center pt-4 border-t border-gray-100">
                    Votre facture sera marquée comme payée dès confirmation du paiement.
                </p>
            </div>
        </div>
    )
}
