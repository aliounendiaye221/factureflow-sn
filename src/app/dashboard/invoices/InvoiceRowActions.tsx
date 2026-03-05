'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { markInvoicePaidAction, deleteInvoiceAction, type MarkPaidState } from '@/app/actions/invoiceActions'
import { sendInvoiceEmailAction } from '@/app/actions/emailActions'
import { useRouter } from 'next/navigation'
import { useState, useTransition, useEffect } from 'react'
import { CheckCircle2, Copy, FileText, Mail, MessageCircle, Trash2 } from 'lucide-react'

type Props = {
  invoiceId: string
  status: string
  invoiceNumber: string
  total: number
  clientPhone?: string | null
  clientName?: string | null
  clientEmail?: string | null
  canDelete?: boolean
}

const initial: MarkPaidState = { success: false, message: '' }
const deleteInitial = { success: false, message: '' }

export default function InvoiceRowActions({ invoiceId, status, invoiceNumber, total, clientPhone, clientName, clientEmail, canDelete = false }: Props) {
  const router = useRouter()
  const [state, formAction] = useFormState(markInvoicePaidAction, initial)
  const [deleteState, deleteAction] = useFormState(deleteInvoiceAction, deleteInitial)

  // Rafraîchir les données quand une action réussit
  useEffect(() => {
    if (state.success || deleteState.success) {
      router.refresh()
    }
  }, [state.success, deleteState.success, router])

  const [copied, setCopied] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [isPendingEmail, startEmailTransition] = useTransition()
  const handleCopyLink = async () => {
    try {
      const res = await fetch(`/api/invoices/${invoiceId}/payment-link?provider=wave`)
      const json = await res.json() as { url?: string; error?: string }
      if (json.url) {
        await navigator.clipboard.writeText(json.url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    } catch {
      alert('Impossible de générer le lien de paiement.')
    }
  }

  const handleSendEmail = () => {
    setEmailError('')
    startEmailTransition(async () => {
      const result = await sendInvoiceEmailAction(invoiceId)
      if (result.success) {
        setEmailSent(true)
        setTimeout(() => setEmailSent(false), 3000)
      } else {
        setEmailError(result.message)
        setTimeout(() => setEmailError(''), 4000)
      }
    })
  }

  const formatXOF = (n: number) => new Intl.NumberFormat('fr-SN', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(n)

  let waLink = ''
  if (clientPhone) {
    const cleanPhone = clientPhone.replace(/\D/g, '')
    const isOverdue = status === 'overdue'
    const message = isOverdue
      ? `Bonjour ${clientName || 'Cher client'},

Nous vous contactons au sujet de la facture *${invoiceNumber}* d'un montant de *${formatXOF(total)}*, dont le règlement est *en retard*.

Nous vous serions reconnaissants de bien vouloir procéder au paiement dans les meilleurs délais :
${process.env.NEXT_PUBLIC_SITE_URL || 'https://factureflow-sn.vercel.app'}/print/invoice/${invoiceId}

Pour toute question, n'hésitez pas à nous contacter. Merci.`
      : `Bonjour ${clientName || 'Cher client'},

Sauf erreur de notre part, le règlement de la facture *${invoiceNumber}* d'un montant de *${formatXOF(total)}* est en attente.

Vous pouvez consulter et payer votre facture en ligne ici :
${process.env.NEXT_PUBLIC_SITE_URL || 'https://factureflow-sn.vercel.app'}/print/invoice/${invoiceId}

Merci de votre confiance !`
    waLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
  }

  const handleDelete = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!window.confirm(`Supprimer la facture ${invoiceNumber} ? Cette action est irréversible.`)) return
    const formData = new FormData(e.currentTarget)
    deleteAction(formData)
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-2 justify-end">
        {/* PDF */}
        <a
          href={`/print/invoice/${invoiceId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-8 h-8 text-gray-400 hover:text-primary hover:bg-primary-50 rounded-lg transition-colors"
          title="Voir la facture"
        >
          <FileText className="w-4 h-4" />
        </a>

        {/* Lien de paiement Wave + WhatsApp + Email (si non payée) */}
        {(status === 'unpaid' || status === 'overdue') && (
          <>
            <button
              type="button"
              onClick={handleCopyLink}
              title="Copier le lien de paiement Wave"
              className="flex items-center justify-center w-8 h-8 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
            >
              {copied ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            </button>

            {clientPhone && (
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                title={status === 'overdue' ? '⚠️ Relancer par WhatsApp — facture en retard' : 'Relancer par WhatsApp'}
                className={`flex items-center justify-center w-8 h-8 rounded-lg transition-colors ${status === 'overdue'
                  ? 'text-green-600 bg-green-100 hover:bg-green-200'
                  : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                  }`}
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            )}

            {clientEmail && (
              <button
                type="button"
                onClick={handleSendEmail}
                disabled={isPendingEmail || emailSent}
                title={emailSent ? 'Email envoyé !' : 'Envoyer la facture par email'}
                className="flex items-center justify-center w-8 h-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
              >
                {emailSent
                  ? <CheckCircle2 className="w-4 h-4 text-green-500" />
                  : <Mail className={`w-4 h-4 ${isPendingEmail ? 'animate-pulse' : ''}`} />
                }
              </button>
            )}
          </>
        )}

        {/* Marquer comme payée */}
        {(status === 'unpaid' || status === 'overdue') && (
          <form action={formAction} className="inline">
            <input type="hidden" name="id" value={invoiceId} />
            <SubmitPaidButton success={state.success} />
          </form>
        )}

        {/* Supprimer (admin uniquement, factures non payées) */}
        {canDelete && status !== 'paid' && (
          <form onSubmit={handleDelete} className="inline">
            <input type="hidden" name="id" value={invoiceId} />
            <button
              type="submit"
              title="Supprimer la facture"
              className="flex items-center justify-center w-8 h-8 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </form>
        )}
        {!deleteState.success && deleteState.message && (
          <p className="text-red-500 text-xs">{deleteState.message}</p>
        )}
      </div>
      {emailError && (
        <p className="text-red-500 text-xs text-right max-w-xs">{emailError}</p>
      )}
    </div>
  )
}

function SubmitPaidButton({ success }: { success: boolean }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      title="Marquer comme payée"
      className={`flex items-center justify-center w-8 h-8 rounded-lg transition-colors ${success
        ? 'text-green-600 bg-green-50'
        : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
        } ${pending ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <CheckCircle2 className={`w-4 h-4 ${success ? 'fill-green-100' : ''} ${pending ? 'animate-pulse' : ''}`} />
    </button>
  )
}
