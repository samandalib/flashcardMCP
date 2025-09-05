# Flashcard Research Synthesizer - Changelog

All notable changes to the product requirements and architecture decisions will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

### Changed
- **Proposed:** Technical stack revision from current Express backend to Next.js full-stack approach
- **Proposed:** Backend implementation will use Next.js API Routes instead of separate Express server

### Noted
- Current project structure confirmed to have Express backend in `/backend/` folder

### Added
- **Internationalization (i18n) support** for English and Farsi languages
- **RTL (Right-to-Left) layout** requirements for Farsi interface
- **Language switching UI** component requirements
- **next-intl integration** plan for translation management

### Changed
- **Technical stack** now includes next-intl for i18n
- **Timeline** updated to include i18n setup in Week 1
- **UI requirements** expanded to include language switcher and RTL support

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
