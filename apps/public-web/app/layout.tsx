import type { Metadata } from 'next'
import { Playfair_Display } from 'next/font/google'
import Navigation from './components/Navigation'
import './globals.css'

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-playfair-display',
})

export const metadata: Metadata = {
  title: '33 Pearl Atelier - Fine Pearl Jewelry',
  description: '33 Pearl Atelier specializes in handcrafted pearl jewelry. Each piece is a unique work of art.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={playfairDisplay.variable}>
        <Navigation />
        <main style={{ paddingTop: '80px' }}>
          {children}
        </main>
      </body>
    </html>
  )
}
