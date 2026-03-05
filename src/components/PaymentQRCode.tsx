'use client'

import { QRCodeSVG } from 'qrcode.react'

interface PaymentQRCodeProps {
  waveNumber?: string | null
  amount?: number
  reference?: string
  paymentLink?: string | null
  size?: number
}

export default function PaymentQRCode({ waveNumber, amount, reference, paymentLink, size = 80 }: PaymentQRCodeProps) {
  // Priorité : lien de paiement personnalisé > lien Wave généré
  let url = paymentLink

  if (!url && waveNumber) {
    const cleanPhone = waveNumber.replace(/\s/g, '')
    url = `https://wave.com/send?phone=${cleanPhone}`
    if (amount) url += `&amount=${amount}`
    if (reference) url += `&note=${encodeURIComponent(reference)}`
  }

  if (!url) return null

  return (
    <div className="flex flex-col items-center gap-1">
      <QRCodeSVG value={url} size={size} level="M" />
      <p className="text-[8px] text-gray-400 font-medium">Scanner pour payer</p>
    </div>
  )
}
