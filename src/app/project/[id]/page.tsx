'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Plus, FileText, Calendar } from 'lucide-react';
import { useLocale } from '@/components/LocaleContext';
import { RichTextEditor } from '@/components/RichTextEditor';
import { Project, Note } from '@/lib/supabase';

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
    newNote: "New Note"
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
    newNote: "یادداشت جدید"
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

      // Fetch notes for this project
      const notesResponse = await fetch(`/api/projects/${projectId}/notes`);
      if (notesResponse.ok) {
        const notesData = await notesResponse.json();
        setNotes(notesData.notes || []);
      } else {
        setNotes([]);
      }

      // For now, we'll create a mock project object
      // In a real app, you'd fetch this from the API
      setProject({
        id: projectId,
        name: `Project ${projectId}`,
        description: 'Research project',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    } catch (err) {
      console.error('Error fetching project data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNote = async (content: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'Untitled Note',
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

  const handleUpdateNote = async (noteId: string, content: string) => {
    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: content
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
      console.error('Error updating note:', error);
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
    <div className="min-h-screen bg-gray-50 flex" dir={dir}>
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
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
                    onClick={() => setSelectedNote(note)}
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
        {selectedNote || isCreatingNote ? (
          <RichTextEditor
            onSave={selectedNote ? 
              (content) => handleUpdateNote(selectedNote.id, content) :
              (content) => handleCreateNote(content)
            }
            initialContent={selectedNote?.content || ''}
            placeholder={locale === 'fa' ? 'اینجا شروع به نوشتن کنید...' : 'Start writing here...'}
          />
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
  );
}
