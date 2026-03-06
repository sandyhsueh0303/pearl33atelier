import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Start Your Inquiry',
  description:
    'Start your pearl inquiry with 33 Pearl Atelier. Share your pearl type preference, budget range, occasion, and timeline for tailored recommendations.',
  alternates: {
    canonical: '/custom/inquiry',
  },
}

export default function CustomInquiryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
