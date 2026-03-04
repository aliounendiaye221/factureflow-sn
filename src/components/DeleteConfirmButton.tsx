'use client'

import { useTransition } from 'react'
import { useFormState } from 'react-dom'
import { Trash2 } from 'lucide-react'

type ActionFn = (
  prevState: { success: boolean; message: string },
  formData: FormData
) => Promise<{ success: boolean; message: string }>

type Props = {
  id: string
  action: ActionFn
  confirmMessage?: string
  /** Label accessible pour le bouton (pour les lecteurs d'écran) */
  ariaLabel?: string
  disabled?: boolean
}

const initialState = { success: false, message: '' }

export default function DeleteConfirmButton({
  id,
  action,
  confirmMessage = 'Confirmez-vous la suppression ?',
  ariaLabel = 'Supprimer',
  disabled = false,
}: Props) {
  const [state, formAction] = useFormState(action, initialState)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!window.confirm(confirmMessage)) return
    startTransition(() => {
      const form = e.currentTarget
      const formData = new FormData(form)
      formAction(formData)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="inline">
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        disabled={disabled || isPending}
        aria-label={ariaLabel}
        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        title={ariaLabel}
      >
        <Trash2 className="w-4 h-4" />
      </button>
      {!state.success && state.message && (
        <p className="text-red-500 text-xs mt-1">{state.message}</p>
      )}
    </form>
  )
}
