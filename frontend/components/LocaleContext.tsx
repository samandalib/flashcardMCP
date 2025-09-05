'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface LocaleContextType {
  locale: string;
  dir: string;
  setLocale: (locale: string) => void;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState('en');
  const [dir, setDir] = useState('ltr');
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Mark as hydrated
    setIsHydrated(true);
    
    // Get locale from localStorage or default to 'en'
    const savedLocale = localStorage.getItem('locale') || 'en';
    setLocaleState(savedLocale);
    setDir(savedLocale === 'fa' ? 'rtl' : 'ltr');
    
    // Update HTML attributes after hydration
    document.documentElement.lang = savedLocale;
    document.documentElement.dir = savedLocale === 'fa' ? 'rtl' : 'ltr';
  }, []);

  const setLocale = (newLocale: string) => {
    setLocaleState(newLocale);
    setDir(newLocale === 'fa' ? 'rtl' : 'ltr');
    localStorage.setItem('locale', newLocale);
    
    // Update HTML attributes
    if (isHydrated) {
      document.documentElement.lang = newLocale;
      document.documentElement.dir = newLocale === 'fa' ? 'rtl' : 'ltr';
    }
  };

  return (
    <LocaleContext.Provider value={{ locale, dir, setLocale }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (context === undefined) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
}
