'use client'

import { usePathname } from 'next/navigation'
import Navbar from './Navbar'

export default function ConditionalNavbar() {
  const pathname = usePathname()
  
  // 不在登入頁面時才顯示 Navbar
  if (pathname === '/admin/login') {
    return null
  }
  
  return <Navbar />
}
