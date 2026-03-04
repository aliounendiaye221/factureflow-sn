'use client'

import { useState } from 'react'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface Props {
  quoteId: string
}

export default function AcceptQuoteButton({ quoteId }: Props) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const handleAccept = async () => {
    const confirmed = window.confirm(
      'Confirmez-vous l\'acceptation de ce devis ? Cette action est définitive.'
    )
    if (!confirmed) return

    setStatus('loading')
    setErrorMsg('')

    try {
      const res = await fetch(`/api/quotes/${quoteId}/accept`, {
        method: 'POST',
      })
      const json = await res.json() as { success?: boolean; message?: string; error?: string }

      if (!res.ok) {
        setStatus('error')
        setErrorMsg(json.error ?? 'Une erreur est survenue.')
        return
      }

      setStatus('success')
      // Recharger la page après 2 secondes pour afficher le nouveau statut
      setTimeout(() => window.location.reload(), 2000)
    } catch {
      setStatus('error')
      setErrorMsg('Impossible de contacter le serveur. Veuillez réessayer.')
    }
  }

  if (status === 'success') {
    return (
      <div className="flex items-center gap-2 px-5 py-3 bg-success/10 text-success-700 rounded-xl font-semibold text-sm">
        <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
        Devis accepté ! Merci de votre confiance.
      </div>
    )
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        size="lg"
        className="w-full sm:w-auto text-base shadow-xl shadow-primary/20"
        onClick={handleAccept}
        disabled={status === 'loading'}
      >
        {status === 'loading' ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Envoi en cours…
          </>
        ) : (
          'Accepter le Devis'
        )}
      </Button>
      {status === 'error' && (
        <p className="text-xs text-alert-700 text-right max-w-xs">{errorMsg}</p>
      )}
    </div>
  )
}
