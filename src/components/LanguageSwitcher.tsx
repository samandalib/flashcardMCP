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
      className="flex items-center gap-2"
      dir={dir}
    >
      <span className="text-sm font-medium">
        {locale === 'en' ? 'فارسی' : 'English'}
      </span>
    </Button>
  );
}
