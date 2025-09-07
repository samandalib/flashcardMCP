'use client';

import { useLocale } from '@/components/LocaleContext';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export function GlobalHeader() {
  const { locale } = useLocale();

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-10">
          {/* Logo/Title */}
          <div className="flex items-center">
            <h1 className="text-sm font-medium text-gray-700">
              {locale === 'fa' ? 'سنتزکننده تحقیقات فلش‌کارت' : 'Flashcard Research Synthesizer'}
            </h1>
          </div>

          {/* Language Switcher */}
          <div className="flex items-center">
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </header>
  );
}
