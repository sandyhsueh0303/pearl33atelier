'use client'

import { useState } from 'react'

export default function HomeButton() {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <a 
      href="/products"
      style={{
        padding: '1rem 2.5rem',
        backgroundColor: isHovered ? '#555' : '#333',
        color: 'white',
        textDecoration: 'none',
        borderRadius: '8px',
        fontSize: '1.125rem',
        fontWeight: '500',
        transition: 'background-color 0.2s',
        cursor: 'pointer'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      View Collection
    </a>
  )
}
