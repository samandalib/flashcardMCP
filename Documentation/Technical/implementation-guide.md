# Implementation Guide - Research Note Synthesizer

**Version:** v0.2  
**Last Updated:** January 16, 2025  
**Audience:** Developers, Technical Contributors

## Overview

This guide documents the technical implementation details, key components, and development patterns used in the Research Note Synthesizer application.

---

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (Next.js)     │◄──►│   (Express)     │◄──►│   (Supabase)    │
│                 │    │                 │    │                 │
│ • React         │    │ • Node.js       │    │ • PostgreSQL    │
│ • TypeScript    │    │ • RESTful API   │    │ • File Storage  │
│ • Tailwind      │    │ • CORS enabled  │    │ • Row Level     │
│ • shadcn/ui     │    │ • Input validation│    │   Security      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
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

## Backend API Design

### RESTful Endpoints

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

### Input Validation Example

```javascript
// Note creation validation
app.post('/api/projects/:id/notes', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;

    // Validate input
    if (!title || typeof title !== 'string' || title.trim().length < 1) {
      return res.status(400).json({
        error: 'Title is required'
      });
    }

    if (!content || typeof content !== 'string') {
      return res.status(400).json({
        error: 'Content is required'
      });
    }

    if (title.trim().length > 200) {
      return res.status(400).json({
        error: 'Title must be less than 200 characters'
      });
    }

    // Database operation
    const { data, error } = await supabase
      .from('notes')
      .insert([{
        project_id: id,
        title: title.trim(),
        content: content,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating note:', error);
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

## Deployment Guide

### Frontend (Vercel)
1. Connect GitHub repository
2. Configure environment variables
3. Set build command: `cd frontend && npm run build`
4. Set output directory: `frontend/.next`

### Backend (To be determined)
1. Railway/Render deployment
2. Environment variable configuration
3. Database connection setup
4. CORS origin configuration

### Database (Supabase)
1. Create project
2. Run migration scripts
3. Configure RLS policies
4. Set up storage buckets (for media)

---

*This implementation guide will be updated as the application evolves and new patterns emerge.*
