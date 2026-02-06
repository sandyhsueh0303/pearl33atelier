import type { Metadata } from 'next'
import { LanguageProvider } from './i18n'
import Navigation from './components/Navigation'
import './globals.css'

export const metadata: Metadata = {
  title: '33 Pearl Atelier - Fine Pearl Jewelry | 精品珍珠訂製首飾',
  description: '33 Pearl Atelier specializes in handcrafted pearl jewelry. Each piece is a unique work of art. 專注於純手工訂製珍珠首飾，每一件作品都是獨特的藝術品。',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <LanguageProvider>
          <Navigation />
          <main style={{ paddingTop: '80px' }}>
            {children}
          </main>
        </LanguageProvider>
      </body>
    </html>
  )
}
