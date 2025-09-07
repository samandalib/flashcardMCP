'use client';

import { Button } from '@/components/ui/button';
import { useLocale } from '@/components/LocaleContext';

export function LanguageSwitcher() {
  const { locale, dir, setLocale } = useLocale();

  const handleSwitch = () => {
    const newLocale = locale === 'en' ? 'fa' : 'en';
    setLocale(newLocale);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleSwitch}
      className="flex items-center gap-1 h-7 px-2"
      dir={dir}
    >
      <span className="text-xs font-medium">
        {locale === 'en' ? 'فارسی' : 'English'}
      </span>
    </Button>
  );
}
