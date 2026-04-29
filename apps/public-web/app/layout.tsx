import type { Metadata, Viewport } from 'next'
import { Playfair_Display } from 'next/font/google'
import Script from 'next/script'
import Navigation from './components/Navigation'
import Footer from './components/Footer'
import { CartProvider } from './components/CartProvider'
import './globals.css'

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '600'],
  display: 'swap',
  variable: '--font-playfair-display',
})
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.33pearlatelier.com'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
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
  openGraph: {
    type: 'website',
    siteName: '33 Pearl Atelier',
    url: siteUrl,
    title: '33 Pearl Atelier | Pearl Jewelry & Custom Pearl Design',
    description:
      'Shop handcrafted pearl jewelry and custom pearl design services by 33 Pearl Atelier. Discover pearl guides, care tips, and bespoke pieces.',
    images: [
      {
        url: `${siteUrl}/images/og-home.png`,
        width: 1200,
        height: 630,
        alt: '33 Pearl Atelier',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '33 Pearl Atelier | Pearl Jewelry & Custom Pearl Design',
    description:
      'Shop handcrafted pearl jewelry and custom pearl design services by 33 Pearl Atelier. Discover pearl guides, care tips, and bespoke pieces.',
    images: [`${siteUrl}/images/og-home.png`],
  },
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
        <Script
          id="apollo-tracker"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              function initApollo(){
                var n=Math.random().toString(36).substring(7),o=document.createElement("script");
                o.src="https://assets.apollo.io/micro/website-tracker/tracker.iife.js?nocache="+n;
                o.async=true;
                o.defer=true;
                o.onload=function(){
                  window.trackingFunctions.onLoad({appId:"69f047c93d60a400119443c7"})
                };
                document.head.appendChild(o)
              }
              initApollo();
            `,
          }}
        />
        <CartProvider>
          <Navigation />
          <main style={{ paddingTop: '80px' }}>
            {children}
          </main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  )
}
