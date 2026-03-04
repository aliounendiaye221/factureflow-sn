'use client'

import { useState } from 'react'
import { Download } from 'lucide-react'

type Props = {
  action: () => Promise<string>
  filename: string
  label?: string
}

export default function ExportCSVButton({ action, filename, label = 'Exporter CSV' }: Props) {
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    setLoading(true)
    try {
      const csv = await action()
      // BOM UTF-8 pour Excel francophone
      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('Erreur lors de l\'export. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
    >
      <Download className="w-4 h-4" />
      {loading ? 'Export en cours…' : label}
    </button>
  )
}
