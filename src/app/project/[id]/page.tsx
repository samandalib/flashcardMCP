'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLocale } from '@/components/LocaleContext';
import { TabbedEditor } from '@/components/TabbedEditor';
import { Project, Note } from '@/lib/supabase';
import { ArrowLeft, Menu, FileText, Plus, Download, Edit2, Check, X, Trash2, GripVertical } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

interface ProjectPageProps {
  params: Promise<{ id: string }>;
}

// Simple translations object
const translations = {
  en: {
    backToProjects: "Back to Projects",
    notes: "Notes",
    newNote: "New Note",
    noNotes: "No notes yet",
    createFirstNote: "Create your first research note to get started",
    createNewNote: "Create New Note",
    projectNotes: "Project Notes",
    showSidebar: "Show Sidebar",
    hideSidebar: "Hide Sidebar",
    downloadNotes: "Download Notes",
    downloadNotesAsJson: "Download Notes as JSON",
    editTitle: "Edit Title",
    saveTitle: "Save",
    cancelEdit: "Cancel",
    deleteNote: "Delete Note",
    confirmDelete: "Are you sure you want to delete this note?",
    confirmDeleteDescription: "This action cannot be undone.",
    delete: "Delete",
    cancel: "Cancel"
  },
  fa: {
    backToProjects: "بازگشت به پروژه‌ها",
    notes: "یادداشت‌ها",
    newNote: "یادداشت جدید",
    noNotes: "هنوز یادداشتی وجود ندارد",
    createFirstNote: "اولین یادداشت تحقیقاتی خود را ایجاد کنید",
    createNewNote: "ایجاد یادداشت جدید",
    projectNotes: "یادداشت‌های پروژه",
    showSidebar: "نمایش نوار کناری",
    hideSidebar: "مخفی کردن نوار کناری",
    downloadNotes: "دانلود یادداشت‌ها",
    downloadNotesAsJson: "دانلود یادداشت‌ها به صورت JSON",
    editTitle: "ویرایش عنوان",
    saveTitle: "ذخیره",
    cancelEdit: "لغو",
    deleteNote: "حذف یادداشت",
    confirmDelete: "آیا مطمئن هستید که می‌خواهید این یادداشت را حذف کنید؟",
    confirmDeleteDescription: "این عمل قابل بازگشت نیست.",
    delete: "حذف",
    cancel: "لغو"
  }
};

export default function ProjectPage({ params }: ProjectPageProps) {
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
  const [mobileView, setMobileView] = useState<'notes' | 'editor'>('notes');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState<string>('');
  const [deleteConfirmNoteId, setDeleteConfirmNoteId] = useState<string | null>(null);

  const resolvedParams = use(params);
  const projectId = resolvedParams.id;

  useEffect(() => {
    if (projectId) {
      fetchProjectAndNotes();
    }
  }, [projectId]);

  const fetchProjectAndNotes = async () => {
    try {
      setIsLoading(true);
      const projectResponse = await fetch(`/api/projects/${projectId}`);
      if (!projectResponse.ok) {
        if (projectResponse.status === 404) {
          throw new Error('Project not found');
        }
        throw new Error('Failed to fetch project');
      }
      const projectData = await projectResponse.json();
      setProject(projectData.project);

      const notesResponse = await fetch(`/api/projects/${projectId}/notes`);
      if (notesResponse.ok) {
        const notesData = await notesResponse.json();
        setNotes(notesData.notes || []);
      } else {
        setNotes([]);
      }
    } catch (err) {
      console.error('Error fetching project data:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
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
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create note');
      }

      const data = await response.json();
      setNotes(prev => [...prev, data.note]);
      setSelectedNote(data.note);
      setIsCreatingNote(false);
    } catch (error) {
      console.error('Error creating note:', error);
      throw error;
    }
  };

  const handleUpdateNoteTabs = async (noteId: string, tabs: Record<string, object>, activeTab: string) => {
    try {
      if (noteId === 'new-note' || noteId === 'new') {
        // Create a new note
        const response = await fetch(`/api/projects/${projectId}/notes`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: 'Untitled Note',
            tabs: tabs,
            active_tab: activeTab
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
      } else {
        // Update existing note
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
      }
    } catch (error) {
      console.error('Error saving note:', error);
      throw error;
    }
  };

  // Mobile navigation handlers
  const handleNoteSelect = (note: Note) => {
    setSelectedNote(note);
    setIsCreatingNote(false);
    setMobileView('editor');
  };

  const handleBackToNotes = () => {
    setMobileView('notes');
    setSelectedNote(null);
    setIsCreatingNote(false);
  };

  const handleCreateNoteClick = () => {
    setIsCreatingNote(true);
    setSelectedNote(null);
    setMobileView('editor');
  };

  const handleStartEditTitle = (note: Note) => {
    setEditingNoteId(note.id);
    setEditingTitle(note.title);
  };

  const handleCancelEditTitle = () => {
    setEditingNoteId(null);
    setEditingTitle('');
  };

  const handleSaveTitle = async (noteId: string) => {
    if (!editingTitle.trim()) {
      handleCancelEditTitle();
      return;
    }

    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: editingTitle.trim()
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update note title');
      }

      const data = await response.json();
      setNotes(prev => prev.map(note => note.id === noteId ? data.note : note));
      
      // Update selected note if it's the one being edited
      if (selectedNote?.id === noteId) {
        setSelectedNote(data.note);
      }
      
      setEditingNoteId(null);
      setEditingTitle('');
    } catch (error) {
      console.error('Error updating note title:', error);
      // You could add a toast notification here
    }
  };

  const deleteNoteFromAPI = async (noteId: string) => {
    try {
      console.log('Deleting note:', noteId);
      
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete note');
      }

      console.log('Note deleted successfully');
      
      // Remove note from state
      setNotes(prev => prev.filter(note => note.id !== noteId));
      
      // Clear selected note if it was the deleted one
      if (selectedNote?.id === noteId) {
        setSelectedNote(null);
      }
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const handleDeleteNote = (noteId: string) => {
    deleteNoteFromAPI(noteId);
    setDeleteConfirmNoteId(null);
  };

  const handleStartDelete = (noteId: string) => {
    setDeleteConfirmNoteId(noteId);
  };

  const handleCancelDelete = () => {
    setDeleteConfirmNoteId(null);
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) {
      return;
    }

    const { source, destination } = result;

    if (source.index === destination.index) {
      return;
    }

    // Reorder notes array
    const reorderedNotes = Array.from(notes);
    const [removed] = reorderedNotes.splice(source.index, 1);
    reorderedNotes.splice(destination.index, 0, removed);

    // Update local state immediately for better UX
    setNotes(reorderedNotes);

    // Prepare the new order data for API
    const noteOrders = reorderedNotes.map((note, index) => ({
      id: note.id,
      order: index
    }));

    try {
      const response = await fetch('/api/notes/reorder', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ noteOrders }),
      });

      if (!response.ok) {
        throw new Error('Failed to update note order');
      }

      console.log('Notes reordered successfully');
    } catch (error) {
      console.error('Error reordering notes:', error);
      // Revert the local state change on error
      setNotes(notes);
    }
  };

  const handleDownloadNotes = () => {
    if (!project || notes.length === 0) {
      return;
    }

    const exportData = notes.map(note => {
      const tabContent: Record<string, string> = {};
      
      // Extract tab content (tab:value pairs)
      if (note.tabs && typeof note.tabs === 'object') {
        Object.entries(note.tabs).forEach(([tabName, tabData]) => {
          if (tabData && typeof tabData === 'object' && 'content' in tabData) {
            tabContent[tabName] = tabData.content || '';
          }
        });
      }
      
      return tabContent;
    });

    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${project.name.replace(/[^a-zA-Z0-9]/g, '_')}_notes.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 p-3">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-gray-900 hover:text-gray-700"
          >
            <ArrowLeft className="h-4 w-4" />
            {t.backToProjects}
          </Button>
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-900">{project.name}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileView(mobileView === 'notes' ? 'editor' : 'notes')}
              className="flex items-center gap-2 text-gray-900 hover:text-gray-700"
            >
              {mobileView === 'notes' ? (
                <>
                  <FileText className="h-4 w-4" />
                  {selectedNote ? 'Edit Note' : 'Create Note'}
                </>
              ) : (
                <>
                  <Menu className="h-4 w-4" />
                  Notes List
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex lg:w-80 bg-white border-r border-gray-200 flex-col">
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
            {notes.length > 0 && (
              <div className="mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadNotes}
                  className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
                >
                  <Download className="h-4 w-4" />
                  {t.downloadNotes}
                </Button>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-sm font-medium text-gray-700">{t.notes}</h2>
                <Button
                  size="sm"
                  onClick={handleCreateNoteClick}
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
                    onClick={handleCreateNoteClick}
                    className="text-blue-600"
                  >
                    {t.createFirstNote}
                  </Button>
                </div>
              ) : (
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="desktop-notes">
                    {(provided) => (
                      <div 
                        className="space-y-2" 
                        {...provided.droppableProps} 
                        ref={provided.innerRef}
                      >
                        {notes.map((note, index) => (
                          <Draggable key={note.id} draggableId={note.id} index={index}>
                            {(provided, snapshot) => (
                              <Card
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`transition-colors ${
                                  editingNoteId === note.id 
                                    ? 'cursor-default' 
                                    : 'cursor-pointer'
                                } ${
                                  selectedNote?.id === note.id 
                                    ? 'bg-blue-50 border-blue-200' 
                                    : 'hover:bg-gray-50'
                                } ${
                                  snapshot.isDragging ? 'shadow-lg' : ''
                                }`}
                                onClick={() => {
                                  if (editingNoteId !== note.id) {
                                    handleNoteSelect(note);
                                  }
                                }}
                              >
                                <CardContent className="p-3">
                                  <div className="flex items-start justify-between">
                                    <div 
                                      {...provided.dragHandleProps}
                                      className="flex-shrink-0 mr-2 flex items-center justify-center text-gray-300 hover:text-gray-400 cursor-grab active:cursor-grabbing"
                                    >
                                      <GripVertical className="h-4 w-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                            {editingNoteId === note.id ? (
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={editingTitle}
                                  onChange={(e) => setEditingTitle(e.target.value)}
                                  className="text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded px-2 py-1 flex-1"
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      handleSaveTitle(note.id);
                                    } else if (e.key === 'Escape') {
                                      handleCancelEditTitle();
                                    }
                                  }}
                                />
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleSaveTitle(note.id)}
                                  className="h-6 w-6 p-0 text-green-600 hover:text-green-700"
                                >
                                  <Check className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={handleCancelEditTitle}
                                  className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <h3 className="text-sm font-medium text-gray-900 truncate flex-1">
                                  {note.title}
                                </h3>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStartEditTitle(note);
                                  }}
                                  className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                                >
                                  <Edit2 className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStartDelete(note.id);
                                  }}
                                  className="h-6 w-6 p-0 text-gray-400 hover:text-red-600"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(note.updated_at).toLocaleDateString(locale === 'fa' ? 'fa-IR' : 'en-US')}
                            </p>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Mobile View: Notes List */}
          {mobileView === 'notes' && (
            <div className="lg:hidden flex-1 bg-white">
              <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">{t.notes}</h2>
                  <div className="flex items-center gap-2">
                    {notes.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDownloadNotes}
                        className="flex items-center gap-1 text-gray-700 hover:text-gray-900"
                      >
                        <Download className="h-4 w-4" />
                        {t.downloadNotes}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      onClick={handleCreateNoteClick}
                      className="flex items-center gap-1"
                    >
                      <Plus className="h-4 w-4" />
                      {t.newNote}
                    </Button>
                  </div>
                </div>

                {notes.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">{t.noNotes}</h3>
                    <p className="text-gray-500 mb-4">{t.createFirstNote}</p>
                    <Button
                      onClick={handleCreateNoteClick}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {t.createNewNote}
                    </Button>
                  </div>
                ) : (
                  <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="mobile-notes">
                      {(provided) => (
                        <div 
                          className="space-y-3" 
                          {...provided.droppableProps} 
                          ref={provided.innerRef}
                        >
                          {notes.map((note, index) => (
                            <Draggable key={note.id} draggableId={note.id} index={index}>
                              {(provided, snapshot) => (
                                <Card
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className={`transition-colors ${
                                    editingNoteId === note.id 
                                      ? 'cursor-default' 
                                      : 'cursor-pointer hover:bg-gray-50'
                                  } ${
                                    snapshot.isDragging ? 'shadow-lg' : ''
                                  }`}
                                  onClick={() => {
                                    if (editingNoteId !== note.id) {
                                      handleNoteSelect(note);
                                    }
                                  }}
                                >
                                  <CardContent className="p-4">
                                    <div className="flex items-start justify-between">
                                      <div 
                                        {...provided.dragHandleProps}
                                        className="flex-shrink-0 mr-3 flex items-center justify-center text-gray-300 hover:text-gray-400 cursor-grab active:cursor-grabbing"
                                      >
                                        <GripVertical className="h-5 w-5" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                              {editingNoteId === note.id ? (
                                <div className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    value={editingTitle}
                                    onChange={(e) => setEditingTitle(e.target.value)}
                                    className="text-base font-medium text-gray-900 bg-white border border-gray-300 rounded px-2 py-1 flex-1"
                                    autoFocus
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        handleSaveTitle(note.id);
                                      } else if (e.key === 'Escape') {
                                        handleCancelEditTitle();
                                      }
                                    }}
                                  />
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleSaveTitle(note.id)}
                                    className="h-6 w-6 p-0 text-green-600 hover:text-green-700"
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={handleCancelEditTitle}
                                    className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <h3 className="text-base font-medium text-gray-900 truncate flex-1">
                                    {note.title}
                                  </h3>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleStartEditTitle(note);
                                    }}
                                    className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleStartDelete(note.id);
                                    }}
                                    className="h-6 w-6 p-0 text-gray-400 hover:text-red-600"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              )}
                              <p className="text-sm text-gray-500 mt-1">
                                {new Date(note.updated_at).toLocaleDateString(locale === 'fa' ? 'fa-IR' : 'en-US')}
                              </p>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                )}
              </div>
            </div>
          )}

          {/* Mobile View: Editor */}
          {mobileView === 'editor' && (
            <div className="lg:hidden flex-1 flex flex-col">
              <div className="bg-white border-b border-gray-200 p-3">
                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBackToNotes}
                    className="flex items-center gap-2 text-gray-900 hover:text-gray-700"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Notes
                  </Button>
                  <div className="text-sm font-medium text-gray-900">
                    {selectedNote ? selectedNote.title : 'Create New Note'}
                  </div>
                </div>
              </div>

              <div className="flex-1 bg-white">
                {selectedNote ? (
                  <div className="h-full">
                    <TabbedEditor
                      noteId={selectedNote.id}
                      initialTabs={selectedNote.tabs}
                      initialActiveTab={selectedNote.active_tab}
                      onSave={handleUpdateNoteTabs}
                    />
                  </div>
                ) : isCreatingNote ? (
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
                      onSave={handleUpdateNoteTabs}
                    />
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center bg-white">
                    <div className="text-center">
                      <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">{t.noNotes}</h3>
                      <p className="text-gray-500 mb-4">{t.createFirstNote}</p>
                      <Button
                        onClick={handleCreateNoteClick}
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
          )}

          {/* Desktop View: Editor */}
          <div className="hidden lg:flex flex-1 flex flex-col min-h-0">
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">{t.projectNotes}</h2>
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
                      onSave={handleUpdateNoteTabs}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-white">
                <div className="text-center">
                  <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{t.noNotes}</h3>
                  <p className="text-gray-500 mb-4">{t.createFirstNote}</p>
                  <Button
                    onClick={handleCreateNoteClick}
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

      {/* Delete Confirmation Dialog */}
      {deleteConfirmNoteId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" dir={dir}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">{t.deleteNote}</h3>
              </div>
            </div>
            <p className="text-gray-600 mb-6">{t.confirmDelete}</p>
            <p className="text-sm text-gray-500 mb-6">{t.confirmDeleteDescription}</p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={handleCancelDelete}
                className="text-gray-700 hover:text-gray-900"
              >
                {t.cancel}
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDeleteNote(deleteConfirmNoteId)}
                className="bg-red-600 hover:bg-red-700"
              >
                {t.delete}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}