'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Plus, FileText, Calendar, Menu, X } from 'lucide-react';
import { useLocale } from '@/components/LocaleContext';
import { TabbedEditor } from '@/components/TabbedEditor';
import { Project, Note } from '@/lib/supabase';
import { extractNoteTitle } from '@/lib/utils';

// Translations for project detail page
const translations = {
  en: {
    backToProjects: "Back to Projects",
    projectNotes: "Project Notes",
    noNotes: "No notes yet",
    createFirstNote: "Create your first research note to get started",
    createNewNote: "Create New Note",
    notes: "Notes",
    created: "Created",
    lastModified: "Last Modified",
    newNote: "New Note",
    toggleSidebar: "Toggle Sidebar",
    showSidebar: "Show Sidebar",
    hideSidebar: "Hide Sidebar"
  },
  fa: {
    backToProjects: "بازگشت به پروژه‌ها",
    projectNotes: "یادداشت‌های پروژه",
    noNotes: "هنوز یادداشتی وجود ندارد",
    createFirstNote: "اولین یادداشت تحقیقاتی خود را ایجاد کنید",
    createNewNote: "ایجاد یادداشت جدید",
    notes: "یادداشت‌ها",
    created: "ایجاد شده",
    lastModified: "آخرین تغییر",
    newNote: "یادداشت جدید",
    toggleSidebar: "تغییر وضعیت نوار کناری",
    showSidebar: "نمایش نوار کناری",
    hideSidebar: "مخفی کردن نوار کناری"
  }
};

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { locale, dir } = useLocale();
  const t = translations[locale as keyof typeof translations];
  
  const [project, setProject] = useState<Project | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const projectId = params.id as string;

  useEffect(() => {
    if (projectId) {
      fetchProjectAndNotes();
    }
  }, [projectId]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchProjectAndNotes = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch project details
      const projectResponse = await fetch(`/api/projects/${projectId}`);
      if (!projectResponse.ok) {
        if (projectResponse.status === 404) {
          throw new Error('Project not found');
        }
        throw new Error('Failed to fetch project');
      }
      const projectData = await projectResponse.json();
      setProject(projectData.project);

      // Fetch notes for this project
      const notesResponse = await fetch(`/api/projects/${projectId}/notes`);
      if (notesResponse.ok) {
        const notesData = await notesResponse.json();
        setNotes(notesData.notes || []);
      } else {
        setNotes([]);
      }
    } catch (err) {
      console.error('Error fetching project data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNote = async (content: string) => {
    try {
      // Extract first line as title
      const title = extractNoteTitle(content);

      const response = await fetch(`/api/projects/${projectId}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title,
          content: content
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create note');
      }

      const data = await response.json();
      setNotes(prev => [data.note, ...prev]);
      setSelectedNote(data.note);
      setIsCreatingNote(false);
    } catch (error) {
      console.error('Error creating note:', error);
      throw error;
    }
  };

  const handleUpdateNoteTabs = async (noteId: string, tabs: Record<string, object>, activeTab: string) => {
    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tabs: tabs,
          active_tab: activeTab
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update note');
      }

      const data = await response.json();
      setNotes(prev => prev.map(note => note.id === noteId ? data.note : note));
      setSelectedNote(data.note);
    } catch (error) {
      console.error('Error updating note tabs:', error);
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir={dir}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading project...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir={dir}>
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Project not found'}</p>
          <Button onClick={() => router.push('/')} variant="outline">
            {t.backToProjects}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 flex flex-col h-full" dir={dir}>
      {/* Mobile Sidebar Toggle */}
      <div className="lg:hidden bg-white border-b border-gray-200 p-3">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {t.backToProjects}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="flex items-center gap-2"
          >
            {isSidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            {isSidebarOpen ? t.hideSidebar : t.showSidebar}
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className={`${isSidebarOpen ? 'w-80' : 'w-0'} bg-white border-r border-gray-200 flex flex-col transition-all duration-300 overflow-hidden lg:w-80`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              {t.backToProjects}
            </Button>
          </div>
          <h1 className="text-lg font-semibold text-gray-900">{project.name}</h1>
          {project.description && (
            <p className="text-sm text-gray-600 mt-1">{project.description}</p>
          )}
        </div>

        {/* Notes List */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-medium text-gray-700">{t.notes}</h2>
              <Button
                size="sm"
                onClick={() => setIsCreatingNote(true)}
                className="flex items-center gap-1"
              >
                <Plus className="h-3 w-3" />
                {t.newNote}
              </Button>
            </div>

            {notes.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500 mb-3">{t.noNotes}</p>
                <Button
                  size="sm"
                  onClick={() => setIsCreatingNote(true)}
                  className="text-blue-600"
                >
                  {t.createFirstNote}
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {notes.map((note) => (
                  <Card
                    key={note.id}
                    className={`cursor-pointer transition-colors ${
                      selectedNote?.id === note.id 
                        ? 'bg-blue-50 border-blue-200' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => {
                      console.log('Selected note data:', note);
                      console.log('Note tabs:', note.tabs);
                      console.log('Note active_tab:', note.active_tab);
                      console.log('Note default_tabs:', note.default_tabs);
                      setSelectedNote(note);
                    }}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {note.title}
                          </h3>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(note.updated_at).toLocaleDateString(locale === 'fa' ? 'fa-IR' : 'en-US')}
                          </p>
                        </div>
                        <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col">
        {/* Editor Header with Sidebar Toggle */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="flex items-center gap-2"
                title={isSidebarOpen ? t.hideSidebar : t.showSidebar}
              >
                {isSidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                <span className="hidden sm:inline">
                  {isSidebarOpen ? t.hideSidebar : t.showSidebar}
                </span>
              </Button>
            </div>
            {selectedNote && (
              <div className="text-sm text-gray-500">
                {locale === 'fa' ? 'یادداشت انتخاب شده' : 'Selected Note'}
              </div>
            )}
          </div>
        </div>

        {selectedNote || isCreatingNote ? (
          <div className="flex-1">
            {selectedNote ? (
              <div>
                <TabbedEditor
                  noteId={selectedNote.id}
                  initialTabs={selectedNote.tabs}
                  initialActiveTab={selectedNote.active_tab}
                  onSave={handleUpdateNoteTabs}
                />
                {/* Debug info */}
                <div className="mt-4 p-2 bg-gray-100 text-xs">
                  <div>Debug - Note ID: {selectedNote.id}</div>
                  <div>Debug - Tabs: {JSON.stringify(selectedNote.tabs)}</div>
                  <div>Debug - Active Tab: {selectedNote.active_tab}</div>
                  <div>Debug - Default Tabs: {JSON.stringify(selectedNote.default_tabs)}</div>
                </div>
              </div>
            ) : (
              <div className="h-full">
                <TabbedEditor
                  noteId="new-note"
                  initialTabs={{
                    finding: {
                      content: '',
                      order: 1,
                      created_at: new Date().toISOString()
                    },
                    evidence: {
                      content: '',
                      order: 2,
                      created_at: new Date().toISOString()
                    },
                    details: {
                      content: '',
                      order: 3,
                      created_at: new Date().toISOString()
                    }
                  }}
                  initialActiveTab="finding"
                  onSave={async (noteId, tabs, activeTab) => {
                    // Extract content from the finding tab for the main content
                    const content = tabs.finding?.content || '';
                    if (content.trim()) {
                      try {
                        await handleCreateNote(content);
                      } catch (error) {
                        console.error('Error creating note:', error);
                        throw error;
                      }
                    }
                  }}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-white">
            <div className="text-center">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {t.noNotes}
              </h3>
              <p className="text-gray-500 mb-4">
                {t.createFirstNote}
              </p>
              <Button
                onClick={() => setIsCreatingNote(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                {t.createNewNote}
              </Button>
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
