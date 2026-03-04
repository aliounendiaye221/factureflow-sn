'use client'

import { useFormStatus } from 'react-dom'

type Props = {
  label: string
  pendingLabel: string
  className?: string
  extraDisabled?: boolean
}

export default function SubmitButton({ label, pendingLabel, className, extraDisabled }: Props) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending || extraDisabled}
      className={className ?? 'px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors'}
    >
      {pending ? pendingLabel : label}
    </button>
  )
}
