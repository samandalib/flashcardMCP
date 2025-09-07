'use client';

import { Button } from '@/components/ui/button';
import { useLocale } from '@/components/LocaleContext';

interface LanguageSwitcherProps {
  currentLocale: string;
  onSwitch: (locale: string) => void;
}

export function LanguageSwitcher({ currentLocale, onSwitch }: LanguageSwitcherProps) {
  const { dir } = useLocale();

  const handleSwitch = () => {
    const newLocale = currentLocale === 'en' ? 'fa' : 'en';
    onSwitch(newLocale);
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
        {currentLocale === 'en' ? 'فارسی' : 'English'}
      </span>
    </Button>
  );
}
