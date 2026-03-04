import type { Metadata } from 'next'
import { Inter, Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import { PostHogProvider } from '@/components/providers/PostHogProvider'
import PostHogPageView from '@/components/providers/PostHogPageView'
import { Suspense } from 'react'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
})

export const metadata: Metadata = {
  title: 'FactureFlow SN — Facturation & Encaissement Mobile Money',
  description: 'Créez vos devis et factures professionnels, encaissez par Wave et Orange Money au Sénégal. La solution de facturation B2B pour PME et agences africaines.',
  keywords: ['facturation', 'devis', 'Sénégal', 'Wave', 'Orange Money', 'PME', 'agence'],
  openGraph: {
    title: 'FactureFlow SN',
    description: 'Devis, factures et paiements Mobile Money pour les PME africaines.',
    locale: 'fr_SN',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" className={`${inter.variable} ${plusJakarta.variable}`}>
      <body className={`${inter.className} bg-background text-foreground antialiased`}>
        <PostHogProvider>
          <Suspense fallback={null}>
            <PostHogPageView />
          </Suspense>
          {children}
        </PostHogProvider>
      </body>
    </html>
  )
}