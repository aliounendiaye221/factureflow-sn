import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'FactureFlow SN — Document' }

export default function PrintLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white text-gray-900 font-sans antialiased min-h-screen">
      {children}
    </div>
  )
}
