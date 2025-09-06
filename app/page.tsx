'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {LanguageSwitcher} from '@/components/LanguageSwitcher';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {useLocale} from '@/components/LocaleContext';
import {CreateProjectDialog} from '@/components/CreateProjectDialog';

// Simple translations object
const translations = {
  en: {
    navigation: {
      projects: "Projects"
    },
    projects: {
      noProjects: "No projects yet",
      createFirst: "Create your first project to get started",
      createNew: "Create New Project",
      recentProjects: "Recent Projects",
      viewProject: "View Project",
      loading: "Loading projects...",
      error: "Failed to load projects"
    }
  },
  fa: {
    navigation: {
      projects: "پروژه‌ها"
    },
    projects: {
      noProjects: "هنوز پروژه‌ای وجود ندارد",
      createFirst: "اولین پروژه خود را ایجاد کنید",
      createNew: "ایجاد پروژه جدید",
      recentProjects: "پروژه‌های اخیر",
      viewProject: "مشاهده پروژه",
      loading: "در حال بارگذاری پروژه‌ها...",
      error: "خطا در بارگذاری پروژه‌ها"
    }
  }
};

interface Project {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

const API_BASE_URL = '/api';

export default function HomePage() {
  const router = useRouter();
  const { locale, dir, setLocale } = useLocale();
  const t = translations[locale as keyof typeof translations];
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch projects on component mount
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/projects`);
      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }
      
      const data = await response.json();
      setProjects(data.projects || []);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProject = async (projectData: { name: string; description?: string }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create project');
      }

      const data = await response.json();
      setProjects(prev => [data.project, ...prev]);
    } catch (error) {
      console.error('Error creating project:', error);
      throw error; // Re-throw to let the dialog handle the error
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir={dir}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t.projects.loading}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir={dir}>
        <div className="text-center">
          <p className="text-red-600 mb-4">{t.projects.error}</p>
          <Button onClick={fetchProjects} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

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
        {projects.length === 0 ? (
          /* Empty State */
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
              <CreateProjectDialog onCreateProject={handleCreateProject} />
            </CardContent>
          </Card>
        ) : (
          /* Projects List */
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">
                {t.projects.recentProjects}
              </h2>
              <CreateProjectDialog onCreateProject={handleCreateProject} />
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <Card key={project.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    {project.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {project.description}
                      </p>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">
                        {new Date(project.created_at).toLocaleDateString(locale === 'fa' ? 'fa-IR' : 'en-US')}
                      </span>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => router.push(`/project/${project.id}`)}
                      >
                        {t.projects.viewProject}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}