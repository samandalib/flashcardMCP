'use client';

import {NextIntlClientProvider} from 'next-intl';
import {useState, useEffect} from 'react';

export function LocaleProvider({ children, messages }: { children: React.ReactNode, messages: any }) {
  const [locale, setLocale] = useState('en');
  const [dir, setDir] = useState('ltr');

  useEffect(() => {
    // Get locale from localStorage or default to 'en'
    const savedLocale = localStorage.getItem('locale') || 'en';
    setLocale(savedLocale);
    setDir(savedLocale === 'fa' ? 'rtl' : 'ltr');
    
    // Update document direction
    document.documentElement.dir = dir;
    document.documentElement.lang = savedLocale;
  }, [dir]);

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      {children}
    </NextIntlClientProvider>
  );
}
