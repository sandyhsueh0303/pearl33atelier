import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '33 Pearl Atelier - Jewelry Shop',
  description: 'Welcome to 33 Pearl Atelier jewelry shop',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
