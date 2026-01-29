import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Inventory Admin - 33 Pearl Atelier',
  description: 'Inventory management system for 33 Pearl Atelier',
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
