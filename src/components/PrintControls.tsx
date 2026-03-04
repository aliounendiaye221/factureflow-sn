'use client'

import { useEffect } from 'react'

/**
 * Barre de contrôle print/fermer + auto-impression.
 * Rendu côté client uniquement (hidden lors de l'impression).
 */
export default function PrintControls({ autoPrint = true }: { autoPrint?: boolean }) {
  useEffect(() => {
    if (!autoPrint) return
    const t = setTimeout(() => window.print(), 500)
    return () => clearTimeout(t)
  }, [autoPrint])

  return (
    <div className="print:hidden fixed top-4 right-4 flex gap-2 z-50">
      <button
        onClick={() => window.print()}
        className="bg-blue-600 text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-blue-700 shadow"
      >
        Imprimer / Télécharger PDF
      </button>
      <button
        onClick={() => window.close()}
        className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200 shadow"
      >
        Fermer
      </button>
    </div>
  )
}
