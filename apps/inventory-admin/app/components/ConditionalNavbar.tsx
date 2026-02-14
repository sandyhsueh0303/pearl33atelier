'use client'

import { usePathname } from 'next/navigation'
import Navbar from './Navbar'

export default function ConditionalNavbar() {
  const pathname = usePathname()
  
  // Only show Navbar when not on the login page
  if (pathname === '/admin/login') {
    return null
  }
  
  return <Navbar />
}
