# Flashcard Research Synthesizer - Changelog

All notable changes to the product requirements and architecture decisions will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

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
