'use client'

import { useState } from 'react'
import { Copy, CheckCircle2, MessageCircle, Smartphone } from 'lucide-react'

const WAVE_NUMBER = process.env.NEXT_PUBLIC_WAVE_NUMBER ?? '78 000 00 00'
const SUPPORT_WA  = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP ?? '221780000000'

export default function MobileMoneyForm({
    invoiceId,
    amount,
    amountObj,
    invoiceNumber,
}: {
    invoiceId: string
    amount: number
    amountObj: { formatted: string; raw: number }
    invoiceNumber?: string
}) {
    const [copied, setCopied] = useState(false)

    const ref = invoiceNumber ?? invoiceId.slice(0, 8).toUpperCase()
    const waMessage =
        `Bonjour, je viens de payer la facture *${ref}* d'un montant de *${amountObj.formatted}* via Wave.\n\n` +
        `(Je joins la capture d'écran du paiement Wave ci-dessous)`
    const waLink = `https://wa.me/${SUPPORT_WA}?text=${encodeURIComponent(waMessage)}`

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(WAVE_NUMBER)
            setCopied(true)
            setTimeout(() => setCopied(false), 2500)
        } catch {
            alert(`Numéro Wave : ${WAVE_NUMBER}`)
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
                                    {WAVE_NUMBER}
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

                <p className="text-xs text-gray-400 text-center pt-4 border-t border-gray-100">
                    Votre facture sera marquée comme payée dès confirmation du paiement.
                </p>
            </div>
        </div>
    )
} {
    const [method, setMethod] = useState<'wave' | 'orange_money'>('wave')
    const [phone, setPhone] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        // Simuler le délai réseau
        await new Promise(resolve => setTimeout(resolve, 2000))

        // Simulation : Succès
        setSuccess(true)
        setIsLoading(false)

        // Recharger la page après un court délai pour montrer le changement de statut
        setTimeout(() => {
            window.location.reload()
        }, 2000)
    }

    if (success) {
        return (
            <div className="bg-success/10 border border-success/20 rounded-2xl p-8 text-center mt-8 md:mt-12 transition-all">
                <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-success-700" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Paiement Initialisé !</h3>
                <p className="text-gray-600">Veuillez valider le paiement sur votre application {method === 'wave' ? 'Wave' : 'Orange Money'}.</p>
            </div>
        )
    }

    return (
        <div className="bg-white border top border-gray-200 shadow-xl shadow-gray-200/50 rounded-3xl overflow-hidden mt-8 md:mt-12">
            <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 md:px-8 md:py-6 flex items-center justify-between">
                <div className="flex-1">
                    <h2 className="text-lg md:text-xl font-bold text-gray-900">Paiement Sécurisé</h2>
                    <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5"><Lock className="w-3.5 h-3.5" /> Chiffré de bout en bout</p>
                </div>
                <div className="text-right flex-1">
                    <p className="text-sm text-gray-500 mb-0.5">Montant à régler</p>
                    <p className="text-2xl font-black text-primary tracking-tight">{amountObj.formatted}</p>
                </div>
            </div>

            <div className="p-6 md:p-8">
                <div className="flex justify-center gap-4 mb-8">
                    <button
                        onClick={() => setMethod('wave')}
                        className={`flex-1 flex flex-col items-center justify-center py-4 px-2 rounded-2xl border-2 transition-all ${method === 'wave'
                                ? 'border-[#1fa4fc] bg-blue-50 text-[#1fa4fc] shadow-md shadow-blue-100'
                                : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                    >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 font-bold text-xl ${method === 'wave' ? 'bg-[#1fa4fc] text-white shadow-lg shadow-blue-200' : 'bg-gray-100 text-gray-400'}`}>
                            <span className="text-2xl mt-[-2px]">w</span>
                        </div>
                        <span className="font-semibold text-sm">Wave</span>
                    </button>

                    <button
                        onClick={() => setMethod('orange_money')}
                        className={`flex-1 flex flex-col items-center justify-center py-4 px-2 rounded-2xl border-2 transition-all ${method === 'orange_money'
                                ? 'border-[#f16e00] bg-orange-50 text-[#f16e00] shadow-md shadow-orange-100'
                                : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                    >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 font-bold text-xl ${method === 'orange_money' ? 'bg-[#f16e00] text-white shadow-lg shadow-orange-200' : 'bg-gray-100 text-gray-400'}`}>
                            <span className="text-xl">OM</span>
                        </div>
                        <span className="font-semibold text-sm">Orange Money</span>
                    </button>
                </div>

                <form onSubmit={handlePayment} className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Numéro de téléphone
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Smartphone className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="Ex: 77 123 45 67"
                                required
                                className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3.5 pl-12 focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white outline-none transition-all font-mono placeholder:font-sans placeholder:text-gray-400 text-lg"
                            />
                        </div>
                    </div>
                    <Button
                        type="submit"
                        className={`w-full py-6 text-lg font-bold shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center ${method === 'wave' ? 'bg-[#1fa4fc] hover:bg-[#1fa4fc]/90 shadow-blue-200' : 'bg-[#f16e00] hover:bg-[#f16e00]/90 shadow-orange-200'}`}
                        disabled={isLoading || !phone || phone.length < 9}
                    >
                        {isLoading ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Traitement en cours...
                            </span>
                        ) : (
                            `Payer ${amountObj.formatted}`
                        )}
                    </Button>
                    <p className="text-xs text-center text-gray-400 mt-4 flex items-center justify-center gap-1.5 font-medium">
                        <Lock className="w-3.5 h-3.5" /> Sécurisé par PayDunya
                    </p>
                </form>
            </div>
        </div>
    )
}
