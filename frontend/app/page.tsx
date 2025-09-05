'use client';

import {LanguageSwitcher} from '@/components/LanguageSwitcher';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {useLocale} from '@/components/LocaleContext';

// Simple translations object
const translations = {
  en: {
    navigation: {
      projects: "Projects"
    },
    projects: {
      noProjects: "No projects yet",
      createFirst: "Create your first project to get started",
      createNew: "Create New Project"
    }
  },
  fa: {
    navigation: {
      projects: "پروژه‌ها"
    },
    projects: {
      noProjects: "هنوز پروژه‌ای وجود ندارد",
      createFirst: "اولین پروژه خود را ایجاد کنید",
      createNew: "ایجاد پروژه جدید"
    }
  }
};

export default function HomePage() {
  const { locale, dir, setLocale } = useLocale();
  const t = translations[locale as keyof typeof translations];

  return (
    <div className="min-h-screen bg-gray-50" dir={dir}>
      {/* Simple Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-lg font-semibold text-gray-900">
            {t.navigation.projects}
          </h1>
          <LanguageSwitcher currentLocale={locale} onSwitch={setLocale} />
        </div>
      </header>
      
      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Empty State */}
        <Card className="text-center py-12">
          <CardHeader>
            <CardTitle className="text-xl text-gray-700 mb-2">
              {t.projects.noProjects}
            </CardTitle>
            <p className="text-gray-500 text-sm">
              {t.projects.createFirst}
            </p>
          </CardHeader>
          <CardContent>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg">
              {t.projects.createNew}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}