'use client'

import { useEffect } from 'react'

/** Déclenche window.print() une fois la page chargée. */
export default function AutoPrint() {
  useEffect(() => {
    // Petit délai pour laisser les styles se charger
    const t = setTimeout(() => window.print(), 400)
    return () => clearTimeout(t)
  }, [])
  return null
}
