# Flashcard Research Synthesizer - Changelog

All notable changes to the product requirements and architecture decisions will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [v1.0] - 2025-01-16

### Added
- **Complete Serverless Rewrite** - Full Next.js 15 application with API routes
- **Clean Architecture** - Single codebase with frontend and backend integrated
- **TypeScript Type Safety** - End-to-end type safety with shared interfaces
- **Radix UI Components** - Accessible component primitives with custom styling
- **Rich Text Editor** - Custom contentEditable implementation with auto-save
- **Internationalization** - English/Farsi support with RTL/LTR switching
- **Project Management** - Full CRUD operations for projects
- **Note Management** - Full CRUD operations for notes within projects
- **Auto-save Functionality** - Debounced content saving with visual feedback
- **Responsive Design** - Mobile-first design with Tailwind CSS
- **Error Handling** - Comprehensive validation and error responses
- **Vercel Deployment** - Optimized serverless deployment configuration

### Changed
- **Architecture:** Complete migration from Express backend to Next.js API routes
- **Database Integration:** Direct Supabase integration via Next.js API routes
- **UI Framework:** Migrated from shadcn/ui to Radix UI primitives with custom styling
- **Deployment:** Single Vercel deployment instead of separate frontend/backend
- **Type Safety:** Full TypeScript implementation with strict mode
- **Component Architecture:** Custom components built on Radix UI primitives
- **State Management:** React Context for internationalization and component state

### Fixed
- **Next.js 15 Compatibility:** Updated API routes to handle Promise-based params
- **TypeScript Errors:** Resolved all linting and type errors
- **Build Process:** Clean build with no errors or warnings
- **Deployment Issues:** Simplified Vercel configuration for serverless deployment
- **Bundle Size:** Optimized dependencies and removed unused packages

### Technical Decisions
- **Serverless Architecture:** Chose Next.js API routes over separate Express backend
- **UI Components:** Built custom components on Radix UI for better control
- **Database:** Direct Supabase integration for simplicity and performance
- **Deployment:** Single Vercel deployment for cost efficiency and simplicity
- **Type Safety:** Strict TypeScript configuration for better developer experience

### Removed
- **Express Backend** - Replaced with Next.js API routes
- **Monorepo Structure** - Simplified to single Next.js application
- **shadcn/ui Dependency** - Replaced with Radix UI primitives
- **Complex Build Configuration** - Simplified to standard Next.js build
- **Separate Deployment Processes** - Unified deployment on Vercel

## [v0.2] - 2025-01-16

### Added
- **Apple Notes-style Rich Text Editor** - Complete contentEditable implementation
- **Project Detail Page** - Sidebar navigation with notes list and main editor area
- **Notes CRUD API** - Backend endpoints for creating, reading, updating, deleting notes
- **Database Migration** - New `notes` table with proper schema and RLS policies
- **Auto-save Functionality** - Debounced content saving on input and blur events
- **Formatting Toolbar** - Bold, italic, underline, alignment, lists, media insertion
- **CreateProjectDialog** - Modal component for new project creation
- **Bilingual Text Direction** - Dynamic RTL/LTR support based on locale
- **Enhanced Error Handling** - Comprehensive validation and error responses
- **Media Import Buttons** - Image, audio, file attachment placeholder functionality

### Changed
- **Architecture Decision:** Kept Express backend instead of migrating to Next.js API routes
- **UI Paradigm Shift:** From structured flashcards to free-form note-taking interface
- **Content Model:** Notes now store rich HTML content instead of front/back card structure
- **Navigation:** Added project-based organization with notes as sub-items
- **Internationalization:** Simplified from next-intl to React Context-based solution
- **Text Editor:** Replaced form-based input with contentEditable rich text editor

### Fixed
- **Text Direction Issues** - English text no longer appears right-to-left
- **DOM Manipulation Conflicts** - Resolved React virtual DOM conflicts with contentEditable
- **Hydration Mismatches** - Fixed server/client rendering inconsistencies
- **Environment Variables** - Properly configured dotenv loading in backend
- **Git Security** - Cleaned exposed Supabase credentials from repository history

### Technical Decisions
- **Editor Implementation:** Used contentEditable with careful DOM manipulation instead of draft-js/slate
- **Direction Control:** Multiple enforcement strategies (HTML dir, CSS direction, textAlign)
- **Content Storage:** HTML content in TEXT fields with proper sanitization
- **Auto-save Strategy:** Debounced saves on blur and Ctrl+S, with visual feedback
- **API Design:** RESTful endpoints with comprehensive input validation

### Removed
- **next-intl dependency** - Replaced with simpler React Context solution
- **Structured flashcard model** - Evolved to free-form notes
- **dangerouslySetInnerHTML** - Replaced with useEffect-based content management

## [Unreleased]

## [v0] - 2025-01-XX

### Added
- Initial PRD for Flashcard Research Synthesizer MVP
- Core user stories and feature scope
- Data model definition
- MCP integration specifications
- UI/UX requirements using Next.js + Tailwind + shadcn/ui
- 4-week implementation timeline

---

## Decision Log Format

Each major change should include:

```markdown
## [Version] - YYYY-MM-DD

### Added
- New features or requirements

### Changed  
- Modified existing requirements
- Architecture changes

### Deprecated
- Features marked for removal

### Removed
- Deleted features or requirements

### Fixed
- Bug fixes or clarifications

### Security
- Security-related changes
```

## Review Process

1. **Document Change**: Update relevant files in Documentation/
2. **Log Decision**: Add entry to this changelog with rationale  
3. **Cross-Reference**: Update any affected documents
4. **Version**: Increment version numbers if applicable