'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

type Language = 'en' | 'es' | 'ca'

interface Translations {
  [key: string]: {
    [key: string]: string
  }
}

const translations: Translations = {
  en: {
    // Navigation
    home: 'Home',
    transactions: 'Transactions',
    cards: 'Cards',
    user: 'Profile',
    
    // User Profile
    settings: 'Settings',
    language: 'Language',
    theme: 'Theme',
    notifications: 'Notifications',
    security: 'Security',
    about: 'About',
    logout: 'Logout',
    appearance: 'Appearance',
    darkTheme: 'Dark Mode',
    lightTheme: 'Light Mode',
    
    // Common
    save: 'Save',
    cancel: 'Cancel',
    confirm: 'Confirm',
    delete: 'Delete',
    edit: 'Edit',
    create: 'Create',
    close: 'Close',
    
    // Language names
    english: 'English',
    spanish: 'Spanish',
    catalan: 'Catalan',
    
    // Wallets Screen
    wallets: 'Wallets',
    accounts: 'accounts',
    account: 'account',
    noWallets: 'No wallets',
    tapToCreate: 'Tap + to create one',
    newWallet: 'New Wallet',
    name: 'Name',
    currency: 'Currency',
    exampleName: 'e.g., Monthly Expenses',
    shareHint: 'You can share the wallet with other users using the share icon',
    
    // User Profile
    profile: 'Profile',
    neonWalletUser: 'NeonWallet User',
    darkModeActive: 'Dark mode active',
    lightModeActive: 'Light mode active',
    englishSelected: 'English selected',
    spanishSelected: 'Spanish selected',
    selectLanguage: 'Select your language',
    
    // About Section
    aboutNeonWallet: 'About NeonWallet',
    neonWalletDescription: 'Your modern digital wallet solution with advanced features to manage your finances.',
    poweredBy: 'Powered by Nomad',
    aboutNomad: 'About Nomad',
    nomadDescription: 'Nomad is an innovative platform designed for travelers and people who handle multiple currencies. With smart expense management tools, real-time currency conversion, and shared wallets, Nomad helps you maintain complete control of your finances wherever you are.',
    nomadFeatures: '✓ Manage multiple wallets\n✓ Real-time currency conversion\n✓ Shared wallets\n✓ Detailed expense tracking\n✓ Intuitive and modern interface',
    version: 'NeonWallet v1.0.0',
    copyright: '© 2026 Powered by Nomad',
    
    // Options Menu
    configuration: 'Settings',
    closeSession: 'Sign out',
    
    // Error Messages
    errorTitle: 'Error',
    nameRequired: 'Name is required',
    couldNotCreate: 'Could not create wallet',
  },
  es: {
    // Navigation
    home: 'Inicio',
    transactions: 'Transacciones',
    cards: 'Tarjetas',
    user: 'Perfil',
    
    // User Profile
    settings: 'Configuración',
    language: 'Idioma',
    theme: 'Tema',
    notifications: 'Notificaciones',
    security: 'Seguridad',
    about: 'Acerca de',
    logout: 'Cerrar sesión',
    appearance: 'Apariencia',
    darkTheme: 'Modo Oscuro',
    lightTheme: 'Modo Claro',
    
    // Common
    save: 'Guardar',
    cancel: 'Cancelar',
    confirm: 'Confirmar',
    delete: 'Eliminar',
    edit: 'Editar',
    create: 'Crear',
    close: 'Cerrar',
    
    // Language names
    english: 'Inglés',
    spanish: 'Español',
    catalan: 'Catalán',
    
    // Wallets Screen
    wallets: 'Wallets',
    accounts: 'cuentas',
    account: 'cuenta',
    noWallets: 'Sin wallets',
    tapToCreate: 'Toca + para crear una',
    newWallet: 'Nueva Wallet',
    name: 'Nombre',
    currency: 'Moneda',
    exampleName: 'Ej: Gastos mensuales',
    shareHint: 'Puedes compartir la wallet con otros usuarios usando el icono de compartir',
    
    // User Profile
    profile: 'Perfil',
    neonWalletUser: 'Usuario NeonWallet',
    darkModeActive: 'Modo oscuro activado',
    lightModeActive: 'Modo claro activado',
    englishSelected: 'Inglés seleccionado',
    spanishSelected: 'Español seleccionado',
    selectLanguage: 'Selecciona tu idioma',
    
    // About Section
    aboutNeonWallet: 'Acerca de NeonWallet',
    neonWalletDescription: 'Tu solución de billetera digital moderna con funcionalidades avanzadas para gestionar tus finanzas.',
    poweredBy: 'Powered by Nomad',
    aboutNomad: 'Sobre Nomad',
    nomadDescription: 'Nomad es una plataforma innovadora diseñada para viajeros y personas que manejan múltiples monedas. Con herramientas de gestión de gastos inteligentes, conversión de monedas en tiempo real y wallets compartidas, Nomad te ayuda a mantener un control total de tus finanzas dondequiera que estés.',
    nomadFeatures: '✓ Gestión de múltiples wallets\n✓ Conversión de monedas en tiempo real\n✓ Wallets compartidas\n✓ Seguimiento de gastos detallado\n✓ Interfaz intuitiva y moderna',
    version: 'NeonWallet v1.0.0',
    copyright: '© 2026 Powered by Nomad',
    
    // Options Menu
    configuration: 'Configuración',
    closeSession: 'Cerrar sesión',
    
    // Error Messages
    errorTitle: 'Error',
    nameRequired: 'El nombre es obligatorio',
    couldNotCreate: 'No se pudo crear la wallet',
  },
  ca: {
    // Navigation
    home: 'Inici',
    transactions: 'Transaccions',
    cards: 'Targetes',
    user: 'Perfil',
    
    // User Profile
    settings: 'Configuració',
    language: 'Idioma',
    theme: 'Tema',
    notifications: 'Notificacions',
    security: 'Seguretat',
    about: 'Sobre',
    logout: 'Tancar sessió',
    appearance: 'Aparença',
    darkTheme: 'Mode Fosc',
    lightTheme: 'Mode Clar',
    
    // Common
    save: 'Desar',
    cancel: 'Cancel·lar',
    confirm: 'Confirmar',
    delete: 'Eliminar',
    edit: 'Editar',
    create: 'Crear',
    close: 'Tancar',
    
    // Language names
    english: 'Anglès',
    spanish: 'Espanyol',
    catalan: 'Català',
    
    // Wallets Screen
    wallets: 'Wallets',
    accounts: 'comptes',
    account: 'compte',
    noWallets: 'Sense wallets',
    tapToCreate: 'Toca + per crear-ne una',
    newWallet: 'Nova Wallet',
    name: 'Nom',
    currency: 'Moneda',
    exampleName: 'Ex: Despeses mensuals',
    shareHint: 'Pots compartir la wallet amb altres usuaris utilitzant la icona de compartir',
    
    // User Profile
    profile: 'Perfil',
    neonWalletUser: 'Usuari NeonWallet',
    darkModeActive: 'Mode fosc activat',
    lightModeActive: 'Mode clar activat',
    englishSelected: 'Anglès seleccionat',
    spanishSelected: 'Espanyol seleccionat',
    selectLanguage: 'Selecciona el teu idioma',
    
    // About Section
    aboutNeonWallet: 'Sobre NeonWallet',
    neonWalletDescription: 'La teva solució de cartera digital moderna amb funcionalitats avançades per gestionar les teves finances.',
    poweredBy: 'Powered by Nomad',
    aboutNomad: 'Sobre Nomad',
    nomadDescription: 'Nomad és una plataforma innovadora dissenyada per a viatgers i persones que gestionen múltiples monedes. Amb eines de gestió de despeses intel·ligents, conversió de monedes en temps real i wallets compartides, Nomad t\'ajuda a mantenir un control total de les teves finances allà on siguis.',
    nomadFeatures: '✓ Gestió de múltiples wallets\n✓ Conversió de monedes en temps real\n✓ Wallets compartides\n✓ Seguiment de despeses detallat\n✓ Interfície intuïtiva i moderna',
    version: 'NeonWallet v1.0.0',
    copyright: '© 2026 Powered by Nomad',
    
    // Options Menu
    configuration: 'Configuració',
    closeSession: 'Tancar sessió',
    
    // Error Messages
    errorTitle: 'Error',
    nameRequired: 'El nom és obligatori',
    couldNotCreate: 'No s\'ha pogut crear la wallet',
  },
}

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => Promise<void>
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>('en')

  useEffect(() => {
    loadLanguage()
  }, [])

  const loadLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('language')
      if (savedLanguage && ['en', 'es', 'ca'].includes(savedLanguage)) {
        setLanguageState(savedLanguage as Language)
      }
    } catch (error) {
      console.error('Error loading language:', error)
    }
  }

  const setLanguage = async (lang: Language) => {
    try {
      await AsyncStorage.setItem('language', lang)
      setLanguageState(lang)
    } catch (error) {
      console.error('Error saving language:', error)
    }
  }

  const t = (key: string): string => {
    return translations[language][key] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
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
