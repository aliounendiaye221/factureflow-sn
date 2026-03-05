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
  title: 'FactureFlow SN — Facturation conforme DGID & Paiement Wave pour PME Sénégalaises',
  description: 'Créez devis et factures professionnels conformes DGID en 2 minutes. Encaissez par Wave et Orange Money. Relances WhatsApp, catalogue produits, gestion d\'équipe et Livre d\'Inventaire. Le logiciel de facturation N°1 pour les PME au Sénégal.',
  keywords: ['facturation Sénégal', 'logiciel facturation PME', 'facture DGID', 'devis Wave', 'Orange Money facturation', 'NINEA RCCM', 'TVA 18 Sénégal', 'facturation B2B Afrique', 'factureflow', 'relance WhatsApp facture', 'paiement mobile money', 'comptabilité PME Dakar'],
  openGraph: {
    title: 'FactureFlow SN — Facturez et encaissez par Wave / Orange Money',
    description: 'Devis en 2 min, paiement Wave en 1 clic, conformité DGID garantie. Le logiciel de facturation conçu pour les PME sénégalaises.',
    locale: 'fr_SN',
    type: 'website',
    siteName: 'FactureFlow SN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FactureFlow SN — Facturation & Paiement Mobile Money',
    description: 'Créez vos factures conformes DGID et encaissez par Wave / Orange Money. Gratuit pour démarrer.',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://factureflow-sn.vercel.app',
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