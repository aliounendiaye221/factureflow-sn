'use client'

import { useFormState } from 'react-dom'
import { updateQuoteStatusAction, deleteQuoteAction, type QuoteStatusState } from '@/app/actions/quoteActions'
import { sendQuoteEmailAction } from '@/app/actions/emailActions'
import { useRouter } from 'next/navigation'
import { useState, useTransition, useEffect } from 'react'
import { CheckCircle2, FileText, Mail, MessageCircle, Trash2 } from 'lucide-react'

type Props = {
  quoteId: string
  status: string
  hasBilling: boolean
  canDelete?: boolean
  clientPhone?: string | null
  clientEmail?: string | null
  clientName?: string | null
  quoteNumber?: string | null
}

const initial: QuoteStatusState = { success: false, message: '' }
const deleteInitial = { success: false, message: '' }

export default function QuoteRowActions({ quoteId, status, hasBilling, canDelete = false, clientPhone, clientEmail, clientName, quoteNumber }: Props) {
  const router = useRouter()
  const [state, formAction] = useFormState(updateQuoteStatusAction, initial)
  const [deleteState, deleteAction] = useFormState(deleteQuoteAction, deleteInitial)

  // Rafraîchir les données quand une action réussit
  useEffect(() => {
    if (state.success || deleteState.success) {
      router.refresh()
    }
  }, [state.success, deleteState.success, router])

  const [emailSent, setEmailSent] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [isPendingEmail, startEmailTransition] = useTransition()

  const handleSendEmail = () => {
    setEmailError('')
    startEmailTransition(async () => {
      const result = await sendQuoteEmailAction(quoteId)
      if (result.success) {
        setEmailSent(true)
        setTimeout(() => setEmailSent(false), 3000)
      } else {
        setEmailError(result.message)
        setTimeout(() => setEmailError(''), 4000)
      }
    })
  }

  const handleDelete = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!window.confirm('Supprimer ce devis ? Cette action est irréversible.')) return
    const formData = new FormData(e.currentTarget)
    deleteAction(formData)
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://www.factureflow.sn'
  let waLink = ''
  if (clientPhone) {
    const cleanPhone = clientPhone.replace(/\D/g, '')
    const quoteUrl = `${siteUrl}/print/quote/${quoteId}`
    const waMsg = `Bonjour ${clientName || 'cher(e) client(e)'},\n\nVeuillez trouver votre devis *${quoteNumber || ''}* en cliquant sur le lien ci-dessous :\n\n${quoteUrl}\n\nN'hésitez pas à nous contacter pour toute question. Merci !`
    waLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(waMsg)}`
  }

  const btn = (label: string, nextStatus: string, color: string) => (
    <form action={formAction} className="inline">
      <input type="hidden" name="id" value={quoteId} />
      <input type="hidden" name="status" value={nextStatus} />
      <button
        type="submit"
        className={`text-xs font-medium px-2 py-1 rounded transition-colors ${color}`}
      >
        {label}
      </button>
    </form>
  )

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-1 justify-end flex-wrap">
        {/* Ouvrir le PDF */}
        <a
          href={`/print/quote/${quoteId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-7 h-7 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          title="Voir le devis PDF"
        >
          <FileText className="w-3.5 h-3.5" />
        </a>

        {/* WhatsApp (si téléphone client disponible) */}
        {clientPhone && (status === 'draft' || status === 'sent') && (
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            title="Envoyer le devis par WhatsApp"
            className="flex items-center justify-center w-7 h-7 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5" />
          </a>
        )}

        {/* Email (si email client disponible) */}
        {clientEmail && (status === 'draft' || status === 'sent') && (
          <button
            type="button"
            onClick={handleSendEmail}
            disabled={isPendingEmail || emailSent}
            title={emailSent ? 'Email envoyé !' : 'Envoyer le devis par email'}
            className="flex items-center justify-center w-7 h-7 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
          >
            {emailSent
              ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
              : <Mail className={`w-3.5 h-3.5 ${isPendingEmail ? 'animate-pulse' : ''}`} />
            }
          </button>
        )}

        {/* Envoyer (draft → sent) */}
        {status === 'draft' && btn('Envoyer', 'sent', 'text-blue-700 hover:bg-blue-50 border border-blue-200')}

        {/* Accepter / Refuser (draft ou sent) */}
        {(status === 'draft' || status === 'sent') && (
          <>
            {btn('Accepter', 'accepted', 'text-green-700 hover:bg-green-50 border border-green-200')}
            {btn('Refuser', 'rejected', 'text-red-600  hover:bg-red-50  border border-red-200')}
          </>
        )}

        {/* Convertir en facture (accepted uniquement, et pas encore facturé) */}
        {status === 'accepted' && !hasBilling && (
          <a
            href="/dashboard/invoices"
            className="text-xs font-medium px-2 py-1 rounded border border-orange-200 text-orange-700 hover:bg-orange-50 transition-colors"
            title="Allez dans Factures → Nouvelle facture → Depuis un devis"
          >
            → Facturer
          </a>
        )}

        {/* Supprimer (admin uniquement, devis non convertis en facture) */}
        {canDelete && !hasBilling && status !== 'accepted' && (
          <form onSubmit={handleDelete} className="inline">
            <input type="hidden" name="id" value={quoteId} />
            <button
              type="submit"
              title="Supprimer le devis"
              className="flex items-center justify-center w-7 h-7 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </form>
        )}
        {!deleteState.success && deleteState.message && (
          <p className="text-red-500 text-xs ml-1">{deleteState.message}</p>
        )}
      </div>
      {emailError && (
        <p className="text-red-500 text-xs text-right max-w-xs">{emailError}</p>
      )}
    </div>
  )
}
