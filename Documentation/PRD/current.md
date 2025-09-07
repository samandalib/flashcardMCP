# PRD — Flashcard Research Synthesizer (v1.0)

**Version:** v1.0 (Clean Serverless Architecture)  
**Date:** January 2025  
**Status:** Current Working Document  
**Previous Version:** [v0.1](./v0.1-current.md)

## Changes from v0.1
- **Architecture:** Complete rewrite with clean serverless architecture
- **Technical Stack:** Next.js 15 with API routes, Radix UI components
- **Database:** Direct Supabase integration via Next.js API routes
- **Deployment:** Single Vercel deployment (no separate backend)

---

## 1. Overview

A modern, serverless web application for creating and managing research projects with AI-powered flashcard generation. Built with Next.js 15, TypeScript, Tailwind CSS, and Supabase.

The application provides a clean, intuitive interface for researchers to organize their findings and prepare them for AI synthesis.

---

## 2. Goals
- Provide a simple way to capture and edit research findings
- Allow organizing findings into projects
- Offer a clean, modern user interface
- Support multiple languages (English/Farsi)
- Enable seamless AI integration for synthesis

---

## 3. Core User Stories
1. **Create a project:** As a user, I can create a project to group related research findings.
2. **Add research notes:** As a user, I can add notes with:
   - Rich text content
   - Structured metadata
   - Unlimited text content
3. **Edit notes:** As a user, I can edit any note's content and metadata.
4. **Organize content:** As a user, I can organize notes within projects.
5. **Language support:** As a user, I can switch between English and Farsi interfaces.

---

## 4. Scope (MVP)

### In-Scope ✅ IMPLEMENTED
- Project CRUD operations
- Note CRUD operations (text content)
- Rich text editing with auto-save
- Project organization
- Internationalization (English/Farsi)
- RTL support for Farsi
- Clean, modern UI with Tailwind CSS
- TypeScript type safety
- Serverless deployment

### Out-of-Scope (Future)
- Media attachments
- MCP integration
- AI synthesis features
- Spaced repetition
- Team collaboration
- Advanced search
- Export functionality

---

## 5. Data Model

### Projects
```typescript
interface Project {
  id: string
  name: string
  description?: string
  created_at: string
  updated_at: string
}
```

### Notes
```typescript
interface Note {
  id: string
  project_id: string
  title: string
  content: string
  created_at: string
  updated_at: string
}
```

---

## 6. Key Flows

### Project Creation
1. User clicks "Create New Project"
2. Enters project name and description
3. Project is created and appears in the list

### Note Creation
1. User selects a project
2. Clicks "New Note"
3. Enters note title and content
4. Note is auto-saved and appears in the sidebar

### Note Editing
1. User clicks on a note in the sidebar
2. Note content loads in the editor
3. User makes changes
4. Changes are auto-saved

### Language Switching
1. User clicks language switcher
2. Interface switches between English/Farsi
3. Text direction changes (LTR/RTL)
4. Preference is saved to localStorage

---

## 7. Technical Implementation (CURRENT)

### Architecture
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS v4
- **UI Components:** Radix UI + Custom components
- **Database:** Supabase (PostgreSQL)
- **Deployment:** Vercel (serverless)

### Key Features
- **Serverless API Routes:** Next.js API routes for all backend operations
- **Type Safety:** End-to-end TypeScript support
- **Internationalization:** Custom React Context for i18n
- **Rich Text Editor:** Custom contentEditable implementation
- **Auto-save:** Debounced auto-save functionality
- **Responsive Design:** Mobile-first responsive design

### File Structure
```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── project/[id]/     # Project pages
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── components/            # React components
│   ├── ui/               # UI primitives
│   └── ...               # Feature components
└── lib/                  # Utilities
    ├── supabase.ts       # Database client
    └── utils.ts          # Helper functions
```

---

## 8. UI/UX Design

### Design Principles
- **Simplicity:** Clean, uncluttered interface
- **Accessibility:** WCAG compliant components
- **Responsiveness:** Works on all device sizes
- **Internationalization:** Full RTL/LTR support
- **Performance:** Fast loading and smooth interactions

### Key Components
- **Project List:** Grid layout with project cards
- **Note Sidebar:** List of notes with creation date
- **Rich Text Editor:** Apple Notes-style editor
- **Language Switcher:** Toggle between English/Farsi
- **Create Dialogs:** Modal dialogs for project/note creation

---

## 9. API Design

### RESTful Endpoints
```
GET    /api/projects              # List projects
POST   /api/projects              # Create project
GET    /api/projects/[id]/notes   # List project notes
POST   /api/projects/[id]/notes   # Create note
PUT    /api/notes/[id]            # Update note
DELETE /api/notes/[id]            # Delete note
```

### Error Handling
- Consistent error response format
- Proper HTTP status codes
- Input validation on all endpoints
- Type-safe error handling

---

## 10. Database Schema

### Projects Table
```sql
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Notes Table
```sql
CREATE TABLE notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notes_project_id ON notes(project_id);
CREATE INDEX idx_notes_updated_at ON notes(updated_at DESC);
```

---

## 11. Constraints
- **Storage:** Supabase free tier limits
- **Performance:** Vercel function execution limits
- **Browser Support:** Modern browsers only
- **Content:** HTML content requires sanitization (future)

---

## 12. Success Metrics
- **Usability:** Users can create projects and notes without confusion
- **Performance:** Page loads under 2 seconds
- **Reliability:** 99%+ uptime on Vercel
- **Accessibility:** WCAG AA compliance
- **Internationalization:** Seamless language switching

---

## 13. Future Enhancements

### Phase 2: Media & AI Integration
- File upload and storage
- MCP server integration
- AI synthesis features
- Export functionality

### Phase 3: Advanced Features
- Team collaboration
- Advanced search
- Spaced repetition
- Analytics dashboard

### Phase 4: Enterprise Features
- Multi-tenancy
- Advanced permissions
- API access
- Custom integrations

---

## 14. Timeline (COMPLETED)

### ✅ Week 1: Clean Architecture Setup
- Complete rewrite with Next.js 15
- Supabase integration
- TypeScript configuration
- Basic UI components

### ✅ Week 2: Core Features
- Project CRUD operations
- Note CRUD operations
- Rich text editor
- Auto-save functionality

### ✅ Week 3: Polish & Deploy
- Internationalization
- RTL support
- UI polish
- Error handling
- Vercel deployment

---

## Definition of Done (MVP) ✅ ACHIEVED

- ✅ Create/edit projects with name and description
- ✅ Create/edit notes with rich text content
- ✅ Auto-save functionality
- ✅ Internationalization (English/Farsi)
- ✅ RTL support for Farsi
- ✅ Responsive design
- ✅ TypeScript type safety
- ✅ Serverless deployment on Vercel
- ✅ Clean, modern UI
- ✅ Error handling and validation

---

## Current Status

**Status:** ✅ MVP Complete  
**Deployment:** Live on Vercel  
**Architecture:** Clean serverless architecture  
**Next Phase:** Media attachments and AI integration