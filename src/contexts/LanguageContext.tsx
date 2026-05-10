import React, { createContext, useContext, useState, useEffect } from 'react'
import i18n from '../i18n'

type Language = 'Indonesia' | 'English' | 'Russian'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('language') as Language
    return saved || 'Indonesia'
  })

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem('language', lang)
    
    // Map internal language names to i18next codes if needed
    const i18nCode = lang === 'Indonesia' ? 'id' : lang === 'English' ? 'en' : 'ru'
    i18n.changeLanguage(i18nCode)
  }

  useEffect(() => {
    const i18nCode = language === 'Indonesia' ? 'id' : language === 'English' ? 'en' : 'ru'
    i18n.changeLanguage(i18nCode)
  }, [])

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
