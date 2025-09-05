'use client';

import {Button} from '@/components/ui/button';

interface LanguageSwitcherProps {
  currentLocale: string;
  onSwitch: (locale: string) => void;
}

export function LanguageSwitcher({ currentLocale, onSwitch }: LanguageSwitcherProps) {
  return (
    <div className="flex gap-1">
      <Button
        variant={currentLocale === 'en' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onSwitch('en')}
        className="text-xs px-2 py-1 h-7"
      >
        EN
      </Button>
      <Button
        variant={currentLocale === 'fa' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onSwitch('fa')}
        className="text-xs px-2 py-1 h-7"
      >
        FA
      </Button>
    </div>
  );
}
