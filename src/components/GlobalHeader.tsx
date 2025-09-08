'use client';

import { useLocale } from '@/components/LocaleContext';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export function GlobalHeader() {
  const { locale } = useLocale();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="w-full px-3 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center h-12 sm:h-10">
          {/* Logo/Title */}
          <div className="flex items-center flex-1 min-w-0">
            <h1 className="text-sm sm:text-sm font-medium text-gray-900 truncate">
              {locale === 'fa' ? 'سنتزکننده تحقیقات فلش‌کارت' : 'Flashcard Research Synthesizer'}
            </h1>
          </div>

          {/* Language Switcher */}
          <div className="flex items-center flex-shrink-0 ml-2">
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </header>
  );
}
