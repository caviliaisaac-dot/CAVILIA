import type { Metadata, Viewport } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from 'sonner'
import { PwaInstall } from '@/components/pwa-install'
import { PwaUpdateBanner } from '@/components/pwa-update-banner'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })
const playfair = Playfair_Display({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CAVILIA - Studio Club 1998',
  description: 'Barbearia premium - Agende seu horário com elegância',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'CAVILIA',
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'apple-mobile-web-app-title': 'CAVILIA',
    'application-name': 'CAVILIA',
    'msapplication-TileColor': '#2a211c',
    'msapplication-tap-highlight': 'no',
  },
}

export const viewport: Viewport = {
  themeColor: '#d4a017',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/images/app-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="CAVILIA" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={`${inter.className} font-sans antialiased`}>
        <PwaUpdateBanner />
        {children}
        <Toaster richColors position="top-center" />
        <PwaInstall />
        <Analytics />
      </body>
    </html>
  )
}
