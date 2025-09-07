# Implementation Guide - Flashcard Research Synthesizer

**Version:** v1.0 (Clean Serverless Architecture)  
**Last Updated:** January 16, 2025  
**Audience:** Developers, Technical Contributors

## Overview

This guide documents the technical implementation details, key components, and development patterns used in the Flashcard Research Synthesizer application. The application has been completely rewritten with a clean serverless architecture using Next.js 15.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                Next.js 15 Application                   │
│                                                         │
│  ┌─────────────────┐    ┌─────────────────┐           │
│  │   Frontend      │    │   API Routes    │           │
│  │   (React)       │◄──►│   (Serverless)  │◄─────────►│
│  │                 │    │                 │           │
│  │ • TypeScript    │    │ • TypeScript    │           │
│  │ • Tailwind CSS  │    │ • Input Validation│         │
│  │ • Radix UI      │    │ • Error Handling│           │
│  │ • i18n Support  │    │ • Type Safety   │           │
│  └─────────────────┘    └─────────────────┘           │
│                                                         │
│  ┌─────────────────────────────────────────────────────┐│
│  │              Supabase Integration                   ││
│  │                                                     ││
│  │ • PostgreSQL Database                               ││
│  │ • Row Level Security                                ││
│  │ • File Storage (Future)                             ││
│  │ • Real-time Subscriptions (Future)                 ││
│  └─────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

---

## Key Components

### 1. Rich Text Editor (`RichTextEditor.tsx`)

**Purpose:** Apple Notes-style contentEditable rich text editor

**Key Features:**
- contentEditable with custom formatting toolbar
- Bilingual text direction support (RTL/LTR)
- Auto-save functionality with debouncing
- Media insertion placeholders
- Keyboard shortcuts (Ctrl+S for save)

**Implementation Details:**
```typescript
// Core structure
const RichTextEditor = ({ onSave, initialContent, placeholder }) => {
  const { locale, dir } = useLocale();
  const [content, setContent] = useState(initialContent);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Direction handling
  const editorDirection = locale === 'fa' ? 'rtl' : 'ltr';
  
  // Auto-save with debouncing
  const handleSave = useCallback(async () => {
    if (!hasChanges) return;
    
    setIsSaving(true);
    try {
      await onSave(content);
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving content:', error);
    } finally {
      setIsSaving(false);
    }
  }, [hasChanges, content, onSave]);
  
  // Content editing
  const handleContentChange = (value: string) => {
    setContent(value);
    setHasChanges(value !== initialContent);
  };
};
```

**Key Technical Decisions:**
- Uses `contentEditable` instead of Draft.js/Slate for simplicity
- HTML content storage for full formatting preservation
- Multiple direction enforcement strategies for RTL/LTR
- Composition event handling for IME input support

### 2. Project Detail Page (`app/project/[id]/page.tsx`)

**Purpose:** Main interface combining notes sidebar with rich text editor

**Layout Structure:**
```
┌─────────────────────────────────────────────────────────┐
│ Header (Back button, Project name)                     │
├─────────────────┬───────────────────────────────────────┤
│ Notes Sidebar   │ Rich Text Editor                      │
│                 │                                       │
│ • Notes List    │ • Formatting Toolbar                 │
│ • Create Button │ • contentEditable Area               │
│ • Search (TBD)  │ • Auto-save Status                   │
│                 │                                       │
└─────────────────┴───────────────────────────────────────┘
```

**State Management:**
```typescript
const [project, setProject] = useState<Project | null>(null);
const [notes, setNotes] = useState<Note[]>([]);
const [selectedNote, setSelectedNote] = useState<Note | null>(null);
const [isCreatingNote, setIsCreatingNote] = useState(false);
```

### 3. Locale Context (`LocaleContext.tsx`)

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

### 4. Supabase Integration (`lib/supabase.ts`)

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

export interface Note {
  id: string
  project_id: string
  title: string
  content: string
  created_at: string
  updated_at: string
}
```

---

## API Routes Architecture

### RESTful Endpoints

**Projects:**
```
GET    /api/projects          # List all projects
POST   /api/projects          # Create new project
```

**Notes:**
```
GET    /api/projects/[id]/notes    # List project notes
POST   /api/projects/[id]/notes    # Create new note
PUT    /api/notes/[id]             # Update existing note
DELETE /api/notes/[id]             # Delete note
```

### API Route Implementation Example

```typescript
// /api/projects/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/projects - List all projects
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
    }

    return NextResponse.json({ projects: data || [] });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/projects - Create a new project
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description } = body;

    // Validate input
    if (!name || typeof name !== 'string' || name.trim().length < 1) {
      return NextResponse.json({
        error: 'Project name is required and must be a non-empty string'
      }, { status: 400 });
    }

    if (name.trim().length > 100) {
      return NextResponse.json({
        error: 'Project name must be less than 100 characters'
      }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('projects')
      .insert({
        name: name.trim(),
        description: description?.trim() || null
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
    }

    return NextResponse.json({ project: data }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

### Next.js 15 Compatibility

**Important:** All API routes use the new Next.js 15 parameter handling:

```typescript
// Correct for Next.js 15
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params; // Must await params
  // ... rest of implementation
}
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_notes_project_id ON notes(project_id);
CREATE INDEX idx_notes_updated_at ON notes(updated_at DESC);
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

## Development Patterns

### 1. Error Handling Pattern

**Frontend:**
```typescript
const fetchProjects = async () => {
  try {
    setIsLoading(true);
    setError(null);
    
    const response = await fetch('/api/projects');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    setProjects(data.projects || []);
  } catch (error) {
    console.error('Error fetching projects:', error);
    setError('Failed to load projects. Please try again.');
  } finally {
    setIsLoading(false);
  }
};
```

**API Routes:**
```typescript
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
    }

    return NextResponse.json({ projects: data || [] });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

### 2. State Management Pattern

**Component State:**
```typescript
// Loading states
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

// Data states
const [projects, setProjects] = useState<Project[]>([]);
const [selectedProject, setSelectedProject] = useState<Project | null>(null);

// UI states
const [isCreatingProject, setIsCreatingProject] = useState(false);
```

### 3. Auto-save Implementation

```typescript
// Debounced auto-save
const handleSave = useCallback(async () => {
  if (!hasChanges || !content) return;
  
  setIsSaving(true);
  
  try {
    await onSave(content);
    setLastSaved(new Date());
    setIsDirty(false);
  } catch (error) {
    console.error('Save failed:', error);
  } finally {
    setIsSaving(false);
  }
}, [hasChanges, content, onSave]);

// Auto-save triggers
useEffect(() => {
  if (hasChanges) {
    const timer = setTimeout(handleSave, 2000); // 2 second delay
    return () => clearTimeout(timer);
  }
}, [hasChanges, handleSave]);
```

---

## Text Direction Handling

### Multi-layered Approach

1. **HTML Attributes:**
```tsx
<div dir={editorDirection}>
  <div contentEditable dir={editorDirection}>
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

## Performance Considerations

### 1. Serverless Optimizations
- **Cold Start Mitigation**: Optimized imports and minimal dependencies
- **Function Size**: Keep API routes lightweight
- **Connection Pooling**: Supabase handles connection management
- **Edge Functions**: Future consideration for global performance

### 2. Frontend Optimizations
- **Debounced Operations**: Auto-save with 2-second delay
- **Optimized Re-renders**: `useCallback` and `useMemo` usage
- **Code Splitting**: Route-based splitting with Next.js
- **Image Optimization**: Next.js Image component (future)

### 3. Database Optimizations
- **Indexes**: Proper indexing on frequently queried columns
- **Query Optimization**: Select only needed fields
- **Connection Management**: Supabase handles connection pooling

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
- **Secure Storage**: Environment variables in Vercel
- **Gitignore**: Proper `.gitignore` configuration
- **Type Safety**: Environment variable validation

---

## Deployment Guide

### Vercel Deployment (Recommended)

1. **Connect Repository**
   - Connect GitHub repository to Vercel
   - Automatic deployments on push to main branch

2. **Environment Variables**
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Build Configuration**
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

4. **Deploy**
   - Vercel automatically builds and deploys
   - Edge functions for global performance

### Manual Deployment

```bash
# Build the application
npm run build

# Start production server
npm start
```

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
# Install dependencies
npm install

# Set up environment
cp env.example .env.local
# Edit .env.local with your Supabase credentials

# Start development server
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

*This implementation guide reflects the clean serverless architecture implemented in January 2025. It will be updated as the application evolves and new patterns emerge.*