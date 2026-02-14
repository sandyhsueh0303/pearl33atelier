import type { Metadata, Viewport } from 'next'
import { Playfair_Display } from 'next/font/google'
import Navigation from './components/Navigation'
import Footer from './components/Footer'
import './globals.css'

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-playfair-display',
})

export const metadata: Metadata = {
  title: {
    default: '33 Pearl Atelier | Pearl Jewelry & Custom Pearl Design',
    template: '%s | 33 Pearl Atelier',
  },
  description:
    'Shop handcrafted pearl jewelry and custom pearl design services by 33 Pearl Atelier. Discover pearl guides, care tips, and bespoke pieces.',
  keywords: [
    'handcrafted pearl jewelry',
    'custom pearl design',
    'akoya pearls',
    'south sea pearls',
    'tahitian pearls',
    'pearl care guide',
    'pearl blog',
  ],
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: '33 Pearl Atelier',
    description:
      'Handcrafted pearl jewelry and custom pearl design services.',
  }

  return (
    <html lang="en">
      <body className={playfairDisplay.variable}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <Navigation />
        <main style={{ paddingTop: '80px' }}>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
