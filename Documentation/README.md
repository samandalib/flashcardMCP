# Research Note Synthesizer - Documentation

This folder contains all product documentation, requirements, and architectural decisions for the Research Note Synthesizer project (formerly Flashcard Research Synthesizer).

## Document Structure

- **PRD/** - Product Requirements Documents and revisions
- **Architecture/** - Technical architecture decisions and analysis  
- **Technical/** - Implementation guides and development documentation
- **Changelog.md** - Revision history and decision log

## Quick Links

### Current Documentation (v0.3)
- [**Current State Summary**](./CURRENT_STATE.md) - Working implementation overview
- [**Current PRD (v0.3)**](./PRD/v0.3-current.md) - Reflects implemented TabbedEditor with auto-save
- [**Implementation Guide**](./Technical/implementation-guide.md) - Technical implementation details
- [**Stack Decisions**](./Architecture/stack-decisions.md) - Architecture choices and rationale
- [**Changelog**](./Changelog.md) - Complete evolution history

### Historical Documentation
- [Previous PRD (v0.2)](./PRD/v0.2-current.md) - Rich text editor implementation
- [Previous PRD (v0.1)](./PRD/current.md) - Intermediate version
- [Original PRD (v0)](./PRD/v0-original.md) - Initial flashcard concept

## Current Status (v0.3 - January 16, 2025)

### ✅ Implemented Features
- **Tabbed Note Editor** - Multi-tab interface with Finding/Evidence/Details tabs
- **Auto-save Functionality** - 2-second debounced content persistence
- **Project-based Organization** - Notes grouped under projects
- **Bilingual Support** - English/Farsi with proper RTL/LTR text direction
- **Tab Management** - Add/delete custom tabs with visual feedback
- **Responsive Design** - Mobile-friendly interface
- **Complete CRUD Operations** - Projects and notes management

### 🔄 In Progress
- Media upload functionality (UI complete, backend integration pending)
- Note deletion capabilities
- Advanced search features

### ⏳ Planned
- MCP integration for ChatGPT synthesis
- Export capabilities (PDF, markdown, JSON)
- Advanced search and filtering
- Collaboration features

## Contributing to Documentation

When making changes to requirements or architecture:

1. **Update the relevant document** (PRD, implementation guide, etc.)
2. **Add entry to Changelog.md** with rationale and version bump
3. **Update cross-references** in other documents if needed
4. **Update this README** if structure changes
5. **Commit with descriptive message** explaining documentation changes

## Document Maintenance

| Document | Purpose | Update Frequency |
|----------|---------|------------------|
| Current PRD | Product requirements and status | After major feature implementations |
| Implementation Guide | Technical patterns and code structure | When new patterns are established |
| Stack Decisions | Architecture choices and rationale | When technical decisions are made |
| Changelog | Version history and decisions | With every significant change |

