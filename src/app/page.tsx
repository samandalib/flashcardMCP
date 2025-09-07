'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useLocale } from '@/components/LocaleContext';
import { CreateProjectDialog } from '@/components/CreateProjectDialog';
import { Project } from '@/lib/supabase';
import { MoreVertical, Edit2, Trash2, Check, X } from 'lucide-react';

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
      error: "Failed to load projects",
      editProject: "Edit Project",
      deleteProject: "Delete Project",
      confirmDelete: "Are you sure you want to delete this project?",
      projectDeleted: "Project deleted successfully",
      projectUpdated: "Project updated successfully",
      deleteError: "Failed to delete project",
      updateError: "Failed to update project"
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
      error: "خطا در بارگذاری پروژه‌ها",
      editProject: "ویرایش پروژه",
      deleteProject: "حذف پروژه",
      confirmDelete: "آیا مطمئن هستید که می‌خواهید این پروژه را حذف کنید؟",
      projectDeleted: "پروژه با موفقیت حذف شد",
      projectUpdated: "پروژه با موفقیت به‌روزرسانی شد",
      deleteError: "خطا در حذف پروژه",
      updateError: "خطا در به‌روزرسانی پروژه"
    }
  }
};

export default function HomePage() {
  const router = useRouter();
  const { locale, dir } = useLocale();
  const t = translations[locale as keyof typeof translations];
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  // Fetch projects on component mount
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/projects');
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
      const response = await fetch('/api/projects', {
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

  const handleEditProject = (project: Project) => {
    setEditingProject(project.id);
    setEditName(project.name);
  };

  const handleSaveEdit = async (projectId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: editName.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || t.projects.updateError);
      }

      const data = await response.json();
      setProjects(prev => prev.map(p => p.id === projectId ? data.project : p));
      setEditingProject(null);
      setEditName('');
    } catch (error) {
      console.error('Error updating project:', error);
      alert(error instanceof Error ? error.message : t.projects.updateError);
    }
  };

  const handleCancelEdit = () => {
    setEditingProject(null);
    setEditName('');
  };

  const handleDeleteProject = async (projectId: string) => {
    console.log('handleDeleteProject called with projectId:', projectId);
    const project = projects.find(p => p.id === projectId);
    const projectName = project?.name || 'this project';
    
    console.log('Project found:', project);
    console.log('Project name:', projectName);
    
    if (!confirm(`${t.projects.confirmDelete}\n\nProject: "${projectName}"`)) {
      console.log('User cancelled deletion');
      return;
    }

    console.log('User confirmed deletion, proceeding...');

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
      });

      console.log('Delete response status:', response.status);
      console.log('Delete response ok:', response.ok);

      if (!response.ok) {
        const errorData = await response.json();
        console.log('Delete error data:', errorData);
        throw new Error(errorData.error || t.projects.deleteError);
      }

      const result = await response.json();
      console.log('Delete success result:', result);

      setProjects(prev => prev.filter(p => p.id !== projectId));
      console.log(t.projects.projectDeleted);
    } catch (error) {
      console.error('Error deleting project:', error);
      alert(error instanceof Error ? error.message : t.projects.deleteError);
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
    <div className="bg-gray-50" dir={dir}>
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
                <Card 
                  key={project.id} 
                  className="hover:shadow-md transition-shadow cursor-pointer relative group"
                  onClick={() => router.push(`/project/${project.id}`)}
                >
                  {/* Edit/Delete Menu */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 hover:bg-gray-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditProject(project);
                        }}
                        title={t.projects.editProject}
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log('Delete button clicked for project:', project.id);
                          handleDeleteProject(project.id);
                        }}
                        title={t.projects.deleteProject}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <CardHeader>
                    {editingProject === project.id ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="text-lg font-semibold"
                          onClick={(e) => e.stopPropagation()}
                          onKeyDown={(e) => {
                            e.stopPropagation();
                            if (e.key === 'Enter') {
                              handleSaveEdit(project.id);
                            } else if (e.key === 'Escape') {
                              handleCancelEdit();
                            }
                          }}
                          autoFocus
                        />
                        <Button
                          size="sm"
                          className="h-6 w-6 p-0 bg-green-600 hover:bg-green-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSaveEdit(project.id);
                          }}
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCancelEdit();
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <CardTitle className="text-lg">{project.name}</CardTitle>
                    )}
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
                      <span className="text-xs text-blue-600 font-medium">
                        {t.projects.viewProject}
                      </span>
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