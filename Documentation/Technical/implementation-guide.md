# Implementation Guide - Research Note Synthesizer

**Version:** v1.1 (TabbedEditor with Auto-Save)  
**Last Updated:** January 16, 2025  
**Audience:** Developers, Technical Contributors

## Overview

This guide documents the technical implementation details, key components, and development patterns used in the Research Note Synthesizer application. The application uses a hybrid architecture with Next.js 15 frontend and Express.js backend, featuring a tabbed note editor with auto-save functionality.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                Next.js 15 Frontend                      │
│                                                         │
│  ┌─────────────────┐    ┌─────────────────┐           │
│  │   Components    │    │   API Calls     │           │
│  │                 │◄──►│                 │◄─────────►│
│  │ • TabbedEditor  │    │ • Fetch API     │           │
│  │ • Project Pages │    │ • HTTP Requests │           │
│  │ • LocaleContext │    │ • Error Handling│           │
│  └─────────────────┘    └─────────────────┘           │
│                                                         │
│  ┌─────────────────────────────────────────────────────┐│
│  │              Express.js Backend                     ││
│  │                                                     ││
│  │ • RESTful API Routes                                ││
│  │ • Supabase Integration                              ││
│  │ • Input Validation                                  ││
│  │ • Error Handling                                    ││
│  └─────────────────────────────────────────────────────┘│
│                                                         │
│  ┌─────────────────────────────────────────────────────┐│
│  │              Supabase Database                      ││
│  │                                                     ││
│  │ • PostgreSQL Database                               ││
│  │ • Row Level Security                                ││
│  │ • Real-time Capabilities                            ││
│  └─────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

---

## Key Components

### 1. TabbedEditor (`src/components/TabbedEditor.tsx`)

**Purpose:** Multi-tab note editor with auto-save functionality

**Key Features:**
- Multiple tabs (Finding, Evidence, Details) with custom tab support
- Auto-save with 2-second debouncing
- Visual save status indicators
- Tab management (add/delete custom tabs)
- Bilingual support with proper text direction

**Implementation Details:**
```typescript
// Core structure
const TabbedEditor = ({ 
  noteId, 
  initialTabs = {}, 
  initialActiveTab = 'finding',
  onSave,
  isSaving = false 
}) => {
  const [tabs, setTabs] = useState<NoteTabs>(initialTabs);
  const [activeTab, setActiveTab] = useState<string>(initialActiveTab);
  const [hasChanges, setHasChanges] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-save with debouncing
  const handleTabContentChange = (tabName: string, content: string) => {
    setTabs(prev => ({
      ...prev,
      [tabName]: {
        ...prev[tabName],
        content
      }
    }));
    setHasChanges(true);

    // Clear existing timeout and set new one
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      handleSave();
    }, 2000);
  };

  const handleSave = async () => {
    try {
      await onSave(noteId, tabs, activeTab);
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving tabs:', error);
    }
  };
};
```

**Tab Structure:**
```typescript
interface NoteTab {
  content: string
  order: number
  created_at: string
}

interface NoteTabs {
  [tabName: string]: NoteTab
}

// Default tabs
const defaultTabs: NoteTabs = {
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
};
```

### 2. Project Detail Page (`src/app/project/[id]/page.tsx`)

**Purpose:** Main interface combining notes sidebar with tabbed editor

**Layout Structure:**
```
┌─────────────────────────────────────────────────────────┐
│ Header (Back button, Project name)                     │
├─────────────────┬───────────────────────────────────────┤
│ Notes Sidebar   │ TabbedEditor                          │
│                 │                                       │
│ • Notes List    │ • Tab Navigation (Finding/Evidence/  │
│ • Create Button │   Details + Custom Tabs)              │
│ • Search (TBD)  │ • Textarea Content Areas             │
│                 │ • Auto-save Status Indicators         │
│                 │ • Add/Delete Tab Controls             │
└─────────────────┴───────────────────────────────────────┘
```

**State Management:**
```typescript
const [project, setProject] = useState<Project | null>(null);
const [notes, setNotes] = useState<Note[]>([]);
const [selectedNote, setSelectedNote] = useState<Note | null>(null);
const [isCreatingNote, setIsCreatingNote] = useState(false);
const [mobileView, setMobileView] = useState<'notes' | 'editor'>('notes');
```

**Save Handler:**
```typescript
const handleUpdateNoteTabs = async (noteId: string, tabs: Record<string, object>, activeTab: string) => {
  try {
    if (noteId === 'new-note' || noteId === 'new') {
      // Create a new note
      const response = await fetch(`/api/projects/${projectId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Untitled Note',
          tabs: tabs,
          active_tab: activeTab
        }),
      });
      
      const data = await response.json();
      setNotes(prev => [data.note, ...prev]);
      setSelectedNote(data.note);
      setIsCreatingNote(false);
    } else {
      // Update existing note
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tabs: tabs,
          active_tab: activeTab
        }),
      });
      
      const data = await response.json();
      setNotes(prev => prev.map(note => note.id === noteId ? data.note : note));
      setSelectedNote(data.note);
    }
  } catch (error) {
    console.error('Error saving note:', error);
    throw error;
  }
};
```

### 3. Locale Context (`src/components/LocaleContext.tsx`)

**Purpose:** Global language and text direction management

**Implementation:**
```typescript
const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState('en');
  const [dir, setDir] = useState('ltr');
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydration-safe initialization
  useEffect(() => {
    setIsHydrated(true);
    const savedLocale = localStorage.getItem('locale') || 'en';
    setLocaleState(savedLocale);
    setDir(savedLocale === 'fa' ? 'rtl' : 'ltr');
    
    // Update DOM attributes after hydration
    document.documentElement.lang = savedLocale;
    document.documentElement.dir = savedLocale === 'fa' ? 'rtl' : 'ltr';
  }, []);

  const setLocale = (newLocale: string) => {
    setLocaleState(newLocale);
    setDir(newLocale === 'fa' ? 'rtl' : 'ltr');
    localStorage.setItem('locale', newLocale);
    
    if (isHydrated) {
      document.documentElement.lang = newLocale;
      document.documentElement.dir = newLocale === 'fa' ? 'rtl' : 'ltr';
    }
  };
}
```

### 4. Supabase Integration (`src/lib/supabase.ts`)

**Purpose:** Centralized database client and type definitions

**Implementation:**
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

// Database types
export interface Project {
  id: string
  name: string
  description?: string
  created_at: string
  updated_at: string
}

export interface NoteTab {
  content: string
  order: number
  created_at: string
}

export interface NoteTabs {
  [tabName: string]: NoteTab
}

export interface Note {
  id: string
  project_id: string
  title: string
  content: string
  tabs?: NoteTabs
  active_tab?: string
  default_tabs?: string[]
  created_at: string
  updated_at: string
}
```

---

## Backend API Architecture

### Express.js Server (`backend/server.js`)

**Purpose:** RESTful API server handling database operations

**Key Features:**
- Supabase integration for database operations
- Input validation and error handling
- CORS configuration for frontend communication
- Environment variable management

**API Endpoints:**

**Projects:**
```
GET    /api/projects          # List all projects
POST   /api/projects          # Create new project
GET    /api/projects/:id      # Get project details
```

**Notes:**
```
GET    /api/projects/:id/notes    # List project notes
POST   /api/projects/:id/notes    # Create new note
PUT    /api/notes/:id             # Update existing note
DELETE /api/notes/:id             # Delete note
```

**Implementation Example:**
```javascript
// POST /api/projects/:id/notes - Create new note
app.post('/api/projects/:id/notes', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, tabs, active_tab } = req.body;

    // Validate input
    if (!title || typeof title !== 'string' || title.trim().length < 1) {
      return res.status(400).json({
        error: 'Note title is required and must be a non-empty string'
      });
    }

    // Create note with tabs
    const { data, error } = await supabase
      .from('notes')
      .insert({
        project_id: id,
        title: title.trim(),
        tabs: tabs || {},
        active_tab: active_tab || 'finding'
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Failed to create note' });
    }

    res.status(201).json({ note: data });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

---

## Database Schema

### Tables

**projects**
```sql
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**notes**
```sql
CREATE TABLE notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL DEFAULT 'Untitled Note',
  content TEXT NOT NULL DEFAULT '',
  tabs JSONB, -- Store tab structure as JSON
  active_tab VARCHAR(50) DEFAULT 'finding',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_notes_project_id ON notes(project_id);
CREATE INDEX idx_notes_updated_at ON notes(updated_at DESC);
CREATE INDEX idx_notes_tabs ON notes USING GIN (tabs);
```

### Row Level Security (RLS)

```sql
-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (to be restricted later)
CREATE POLICY "Allow all operations on projects" ON projects
  FOR ALL USING (true);

CREATE POLICY "Allow all operations on notes" ON notes
  FOR ALL USING (true);
```

---

## Auto-Save Implementation

### Debounced Auto-Save Pattern

```typescript
// TabbedEditor auto-save implementation
const handleTabContentChange = (tabName: string, content: string) => {
  setTabs(prev => ({
    ...prev,
    [tabName]: {
      ...prev[tabName],
      content
    }
  }));
  setHasChanges(true);

  // Clear existing timeout and set new one
  if (saveTimeoutRef.current) {
    clearTimeout(saveTimeoutRef.current);
  }
  
  saveTimeoutRef.current = setTimeout(() => {
    handleSave();
  }, 2000);
};

// Cleanup timeout on unmount
useEffect(() => {
  return () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
  };
}, []);
```

### Save Status Indicators

```typescript
// Visual feedback for save status
{hasChanges && (
  <span className="text-sm text-orange-600 flex items-center gap-1">
    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
    {t.unsavedChanges}
  </span>
)}
{!hasChanges && (
  <span className="text-sm text-green-600 flex items-center gap-1">
    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
    {t.saved}
  </span>
)}
```

---

## Text Direction Handling

### Multi-layered Approach

1. **HTML Attributes:**
```tsx
<div dir={editorDirection}>
  <textarea dir={editorDirection} />
```

2. **CSS Properties:**
```typescript
style={{
  direction: editorDirection,
  textAlign: editorDirection === 'rtl' ? 'right' : 'left',
  unicodeBidi: 'embed'
}}
```

3. **Tailwind Classes:**
```tsx
className={`${editorDirection === 'ltr' ? 'text-left' : 'text-right'}`}
```

### Locale-based Direction

```typescript
const editorDirection = locale === 'fa' ? 'rtl' : 'ltr';
```

---

## Development Patterns

### 1. Error Handling Pattern

**Frontend:**
```typescript
const handleSave = async () => {
  try {
    await onSave(noteId, tabs, activeTab);
    setHasChanges(false);
  } catch (error) {
    console.error('Error saving tabs:', error);
    // Show user-friendly error message
  }
};
```

**Backend:**
```javascript
app.post('/api/projects/:id/notes', async (req, res) => {
  try {
    // ... validation and database operations
    
    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Failed to create note' });
    }

    res.status(201).json({ note: data });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

### 2. State Management Pattern

**Component State:**
```typescript
// Loading states
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

// Data states
const [tabs, setTabs] = useState<NoteTabs>(initialTabs);
const [activeTab, setActiveTab] = useState<string>(initialActiveTab);

// UI states
const [hasChanges, setHasChanges] = useState(false);
const [isCreatingNote, setIsCreatingNote] = useState(false);
```

### 3. Tab Management Pattern

```typescript
// Add custom tab
const addCustomTab = () => {
  if (newTabName.trim()) {
    const tabName = newTabName.trim().toLowerCase().replace(/\s+/g, '_');
    const maxOrder = Math.max(...Object.values(tabs).map(tab => tab.order));
    
    setTabs(prev => ({
      ...prev,
      [tabName]: {
        content: '',
        order: maxOrder + 1,
        created_at: new Date().toISOString()
      }
    }));
    
    setActiveTab(tabName);
    setNewTabName('');
    setShowAddTab(false);
    setHasChanges(true);
  }
};

// Delete custom tab
const deleteTab = (tabName: string) => {
  if (Object.keys(tabs).length <= 1) return; // Don't delete the last tab
  
  const newTabs = { ...tabs };
  delete newTabs[tabName];
  setTabs(newTabs);
  
  if (activeTab === tabName) {
    const remainingTabs = Object.keys(newTabs);
    setActiveTab(remainingTabs[0]);
  }
  
  setHasChanges(true);
};
```

---

## Performance Considerations

### 1. Auto-Save Optimizations
- **Debouncing**: Prevents excessive API calls during typing
- **Timeout Management**: Proper cleanup to prevent memory leaks
- **Change Detection**: Only save when content actually changes

### 2. Frontend Optimizations
- **Optimized Re-renders**: `useCallback` and `useMemo` usage
- **Code Splitting**: Route-based splitting with Next.js
- **State Management**: Minimal state updates

### 3. Database Optimizations
- **Indexes**: Proper indexing on frequently queried columns
- **Query Optimization**: Select only needed fields
- **JSON Storage**: Efficient tab structure storage

---

## Security Considerations

### 1. Input Validation
- **Server-side validation**: All API routes validate input
- **Length limits**: Text field character limits
- **Type checking**: TypeScript ensures type safety
- **SQL Injection**: Supabase client prevents SQL injection

### 2. Content Security
- **HTML Sanitization**: Future implementation needed
- **XSS Protection**: Careful handling of HTML content
- **CORS**: Configured for production domains

### 3. Environment Variables
- **Secure Storage**: Environment variables in deployment platform
- **Gitignore**: Proper `.gitignore` configuration
- **Type Safety**: Environment variable validation

---

## Deployment Guide

### Development Setup

```bash
# Install dependencies
npm install

# Set up environment
cp backend/env.example backend/.env
# Edit backend/.env with your Supabase credentials

# Start backend server
cd backend && npm start

# Start frontend (in separate terminal)
cd frontend && npm run dev
```

### Production Deployment

**Backend (Express.js):**
- Deploy to platforms like Railway, Render, or Heroku
- Set environment variables for Supabase credentials
- Configure CORS for frontend domain

**Frontend (Next.js):**
- Deploy to Vercel, Netlify, or similar platforms
- Configure environment variables
- Set up custom domain if needed

### Database Setup (Supabase)

1. **Create Project**
   - Create new Supabase project
   - Note down URL and anon key

2. **Run Migrations**
   ```sql
   -- Run the migration scripts in supabase/migrations/
   ```

3. **Configure RLS**
   - Set up Row Level Security policies
   - Configure storage buckets (future)

---

## Development Workflow

### Local Development

```bash
# Backend development
cd backend
npm install
cp env.example .env
# Edit .env with Supabase credentials
npm start

# Frontend development (separate terminal)
cd frontend
npm install
npm run dev
```

### Code Quality

- **TypeScript**: Strict mode enabled
- **ESLint**: Next.js recommended configuration
- **Prettier**: Code formatting (if configured)
- **Git Hooks**: Pre-commit hooks (future)

### Testing Strategy (Future)

- **Unit Tests**: Component and utility function tests
- **Integration Tests**: API route testing
- **E2E Tests**: Critical user journey testing

---

## Monitoring and Analytics

### Performance Monitoring
- **Vercel Analytics**: Built-in performance monitoring
- **Core Web Vitals**: Automatic tracking
- **Function Metrics**: API route performance

### Error Tracking
- **Vercel Error Tracking**: Built-in error monitoring
- **Custom Error Handling**: Structured error responses
- **Logging**: Console logging for development

---

*This implementation guide reflects the current TabbedEditor implementation with auto-save functionality as of January 16, 2025. It will be updated as the application evolves and new patterns emerge.*