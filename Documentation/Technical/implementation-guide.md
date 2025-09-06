# Implementation Guide - Research Note Synthesizer

**Version:** v0.3  
**Last Updated:** January 16, 2025  
**Audience:** Developers, Technical Contributors

## Overview

This guide documents the technical implementation details, key components, and development patterns used in the Research Note Synthesizer application. **Updated for v0.3 serverless architecture.**

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Vercel Platform                      │
│                                                         │
│  ┌─────────────────┐    ┌─────────────────┐            │
│  │   Frontend      │    │   API Routes     │            │
│  │   (Next.js)     │◄──►│   (Serverless)  │            │
│  │                 │    │                 │            │
│  │ • React         │    │ • NextRequest   │            │
│  │ • TypeScript    │    │ • NextResponse  │            │
│  │ • Tailwind      │    │ • Route Handlers│            │
│  │ • shadcn/ui     │    │ • Supabase Client│           │
│  └─────────────────┘    └─────────────────┘            │
│                                                         │
│  ┌─────────────────────────────────────────────────────┐│
│  │              Supabase (External)                    ││
│  │ • PostgreSQL Database                               ││
│  │ • File Storage                                      ││
│  │ • Row Level Security                                ││
│  └─────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

**Key Change in v0.3:** Migrated from separate Express backend to Next.js API routes for serverless deployment on Vercel.

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
  const editorRef = useRef<HTMLDivElement>(null);
  const [content, setContent] = useState(initialContent);
  const [isSaving, setIsSaving] = useState(false);
  
  // Direction handling
  const editorDirection = locale === 'fa' ? 'rtl' : 'ltr';
  
  // Auto-save with debouncing
  const handleSave = useCallback(async () => {
    if (isDirty && content) {
      setIsSaving(true);
      await onSave(content);
      setIsSaving(false);
      setLastSaved(new Date());
      setIsDirty(false);
    }
  }, [isDirty, content, onSave]);
  
  // Content editing
  const handleInput = useCallback(() => {
    if (editorRef.current && !isComposing) {
      const newContent = editorRef.current.innerHTML;
      setContent(newContent);
      setIsDirty(true);
    }
  }, [isComposing]);
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

---

## Backend API Design (Serverless)

### Next.js API Routes

**Projects:**
```
GET    /api/projects          # List all projects
POST   /api/projects          # Create new project
GET    /api/projects/[id]     # Get project details
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
// frontend/app/api/projects/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// GET /api/projects - List all projects
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to fetch projects', details: error.message }, { status: 500 });
    }

    return NextResponse.json({ projects: data || [] });
  } catch (error) {
    console.error('Unexpected error in API route:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

// POST /api/projects - Create new project
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description } = body;

    // Validate input
    if (!name || typeof name !== 'string' || name.trim().length < 1) {
      return NextResponse.json({
        error: 'Project name is required'
      }, { status: 400 });
    }

    if (name.trim().length > 100) {
      return NextResponse.json({
        error: 'Project name must be less than 100 characters'
      }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('projects')
      .insert([
        {
          name: name.trim(),
          description: description?.trim() || null,
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating project:', error);
      return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
    }

    return NextResponse.json({ project: data }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

### Key Differences from Express

| Aspect | Express (v0.2) | Next.js API Routes (v0.3) |
|--------|----------------|----------------------------|
| **Request/Response** | `req, res` | `NextRequest, NextResponse` |
| **Route Definition** | `app.get('/api/projects', handler)` | `export async function GET()` |
| **Error Handling** | Middleware | try/catch with NextResponse |
| **Environment** | `process.env` | Next.js env system |
| **Deployment** | Separate service | Serverless functions |
| **Scaling** | Manual | Automatic with Vercel |

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
    
    const response = await fetch(`${API_BASE_URL}/api/projects`);
    
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

**Backend:**
```javascript
app.get('/api/projects', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching projects:', error);
      return res.status(500).json({ error: 'Failed to fetch projects' });
    }

    res.json({ projects: data || [] });
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
const [projects, setProjects] = useState<Project[]>([]);
const [selectedProject, setSelectedProject] = useState<Project | null>(null);

// UI states
const [isCreatingProject, setIsCreatingProject] = useState(false);
```

### 3. Auto-save Implementation

```typescript
// Debounced auto-save
const handleSave = useCallback(async () => {
  if (!isDirty || !content) return;
  
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
}, [isDirty, content, onSave]);

// Auto-save triggers
useEffect(() => {
  if (isDirty) {
    const timer = setTimeout(handleSave, 2000); // 2 second delay
    return () => clearTimeout(timer);
  }
}, [isDirty, handleSave]);
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

### 1. Debounced Operations
- Auto-save with 2-second delay
- Search input debouncing (future)
- Resize event handling

### 2. Optimized Re-renders
- `useCallback` for event handlers
- `useMemo` for expensive calculations
- Proper dependency arrays in `useEffect`

### 3. Code Splitting
- Dynamic imports for heavy components
- Route-based code splitting with Next.js

---

## Security Considerations

### 1. Input Validation
- Server-side validation for all inputs
- Length limits on text fields
- Type checking for all parameters

### 2. Content Security
- HTML content sanitization (to be implemented)
- XSS protection considerations
- CORS configuration

### 3. Environment Variables
- Secure credential storage
- Proper `.gitignore` configuration
- Environment-specific configurations

---

## Testing Strategy (Future)

### Unit Tests
- Component rendering tests
- Utility function tests
- API endpoint tests

### Integration Tests
- User flow testing
- API integration tests
- Database operation tests

### E2E Tests
- Critical user journeys
- Cross-browser compatibility
- Mobile responsiveness

---

## Deployment Guide (v0.3 - Serverless)

### Single Vercel Deployment

**Frontend + Backend (API Routes):**
1. Connect GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your Supabase anon key
   - `SUPABASE_SERVICE_ROLE_KEY` = your Supabase service role key
3. Set build command: `cd frontend && npm run build`
4. Set output directory: `frontend/.next`
5. Deploy automatically on git push

### Environment Variables

**Required for Production:**
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Local Development:**
Create `frontend/.env.local` with the same variables for local testing.

### Database (Supabase)
1. Create Supabase project
2. Run migration scripts (if needed)
3. Configure RLS policies
4. Set up storage buckets (for future media uploads)

### Migration from Express (v0.2 → v0.3)

**What Changed:**
- ✅ No separate backend deployment needed
- ✅ Single Vercel deployment handles everything
- ✅ API routes automatically scale with Vercel
- ✅ Environment variables managed in Vercel dashboard
- ✅ No external backend hosting costs

**What Stayed the Same:**
- ✅ Same Supabase database and schema
- ✅ Same frontend functionality
- ✅ Same API endpoints (just different implementation)
- ✅ Same environment variables (different loading mechanism)

---

*This implementation guide will be updated as the application evolves and new patterns emerge.*
