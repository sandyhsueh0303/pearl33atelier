'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Language, translations } from './translations'

interface LanguageContextType {
  lang: Language
  setLang: (lang: Language) => void
  t: (section: keyof typeof translations, key: string) => string
  isLoaded: boolean
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>('en')
  const [isLoaded, setIsLoaded] = useState(false)

  // Load saved language preference on mount
  useEffect(() => {
    const savedLang = localStorage.getItem('pearl33-lang') as Language
    if (savedLang && (savedLang === 'zh' || savedLang === 'en')) {
      setLangState(savedLang)
    }
    setIsLoaded(true)
  }, [])

  const setLang = (newLang: Language) => {
    setLangState(newLang)
    localStorage.setItem('pearl33-lang', newLang)
  }

  // Translation helper function
  const t = (section: keyof typeof translations, key: string): string => {
    const sectionData = translations[section] as Record<string, { zh: string; en: string }>
    if (sectionData && sectionData[key]) {
      return sectionData[key][lang]
    }
    return key // Fallback to key if translation not found
  }

  // Show nothing until language preference is loaded to prevent flash
  if (!isLoaded) {
    return null
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, isLoaded }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
