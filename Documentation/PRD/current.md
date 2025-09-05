# PRD — Flashcard Research Synthesizer (v0.1)

**Version:** v0.1 (Revised)  
**Date:** January 2025  
**Status:** Current Working Document  
**Previous Version:** [v0 Original](./v0-original.md)

## Changes from v0
- **Technical Stack:** Revised from Express backend to Next.js full-stack approach
- **Architecture:** Single codebase deployment instead of separate frontend/backend services

---

## 1. Overview

A lightweight application for capturing research findings as cards, organizing them into projects, and invoking ChatGPT (via MCP) to synthesize the findings into structured narratives with citations.

This PRD covers the first iteration (MVP) of the product.

---

## 2. Goals
- Provide a simple way to capture and edit research findings.
- Allow attaching unlimited references and media to each card.
- Organize cards under projects.
- Offer a one-click path to send project findings into ChatGPT for synthesis.

---

## 3. Core User Stories
1. **Create a project:** As a user, I can create a project to group related research cards.
2. **Add a finding card:** As a user, I can add cards with:
   - Freeform text (finding/insight)
   - References (link or structured metadata)
   - Media attachments (PDF, images, video, audio)
3. **Edit cards:** As a user, I can edit any card's text, reference, or attachments.
4. **Unlimited content:** As a user, I can add any amount of text and media without artificial limits.
5. **Synthesize project:** As a user, I can click a CTA to open/sync the project in ChatGPT for synthesis into a narrative.

---

## 4. Scope (MVP)

### In-Scope
- Project CRUD
- Card CRUD (text, reference, media upload/link)
- Unlimited content per card (using object storage for media)
- CTA → ChatGPT integration
- If MCP is connected: trigger synthesize(projectId) tool
- Else: export JSONL + copy prompt to clipboard

### Out-of-Scope (Future)
- Spaced repetition
- Advanced outlines
- Contradiction detection
- Team collaboration
- Rich citation styling
- Semantic search/graph view

---

## 5. Data Model

### Projects
- id
- name
- created_at

### Cards
- id
- project_id
- body (TEXT)
- reference (JSONB)
- created_at, updated_at

### Attachments
- id
- card_id
- type (image | video | pdf | web | audio)
- url
- meta

### Syntheses (optional)
- id
- project_id
- markdown
- bibliography
- created_at

---

## 6. Key Flows

### Card Creation
1. User selects project.
2. Clicks New Card.
3. Enters text, reference, and uploads or links media.
4. Saves → card appears in project list.

### Editing a Card
- Inline edit or open drawer → update fields → save.

### Synthesis
- User clicks Synthesize Findings.
- If MCP available: call tool synthesize(projectId).
- Else: export JSONL + pre-filled ChatGPT prompt.

---

## 7. MCP Server (Integration)

### Resources
- mcp://projects/:id → project + card IDs
- mcp://cards/:id → card data (body, reference, attachments)

### Tools
- synthesize(projectId, citationStyle, stylePreset) → { markdown, bibliography, toc, gaps }

---

## 8. UI (Next.js + Tailwind + shadcn/ui + i18n)
- Projects list (left nav)
- Card list (main panel)
- Card = body + reference + media chips
- New/Edit Card modal
- Top-right CTA → Synthesize
- Connected → runs tool
- Not connected → export & copy prompt
- **Language switcher** (English/Farsi)
- **RTL support** for Farsi interface

---

## 9. Technical Implementation (REVISED)

### Frontend & Backend
- **Framework:** Next.js 15 (App Router) with TypeScript
- **Styling:** Tailwind CSS v4 + shadcn/ui components
- **Internationalization:** next-intl for English/Farsi support
- **RTL Support:** Right-to-left layout for Farsi
- **Backend:** Next.js API Routes (full-stack approach)
- **Database:** Supabase (PostgreSQL + Storage)
- **File Storage:** Supabase Storage with pre-signed URLs

### MCP Integration
- **MCP Server:** Separate Node.js service using @modelcontextprotocol/sdk
- **Communication:** HTTP API between Next.js app and MCP server
- **LLM:** OpenAI GPT with JSON output mode for synthesis

### Deployment
- **Main App:** Vercel (Next.js + API routes)
- **MCP Server:** Railway/Render (separate service)
- **Database:** Supabase Cloud

---

## 10. Constraints
- No artificial size limits, but storage quota and upload size may be constrained by Supabase plan.
- Citation fidelity depends on cards containing clean references.

---

## 11. Success Metrics
- **Usability:** Can a user capture 10–20 cards with mixed media in under 5 minutes?
- **Reliability:** Synthesis tool returns valid JSON >95% of attempts.
- **Adoption:** At least 1 complete project (10+ cards) synthesized by each early tester.

---

## 12. Future Enhancements
- Spaced repetition learning
- Semantic/embedding search
- Contradiction detection
- Team sharing + permissions
- Advanced outlines and chaptering
- Rich citation rendering (APA, MLA, numeric)
- Graph view of supports/contradicts

---

## 13. Timeline (MVP) - REVISED

### Week 1: Next.js Full-Stack Foundation + i18n
- Remove Express backend, consolidate into Next.js
- Set up Supabase + basic schema
- Configure next-intl for English/Farsi support
- Implement API routes for Projects CRUD
- Basic project list UI with shadcn/ui + RTL support

### Week 2: Cards & Media
- Cards CRUD API routes
- File upload API route → Supabase Storage  
- Card creation/editing UI
- Media attachment handling

### Week 3: MCP Server
- Separate Node.js MCP server
- Implement synthesize tool
- Next.js API route to communicate with MCP server
- Synthesis UI integration

### Week 4: Polish & Deploy
- Export fallback when MCP unavailable
- UI polish and error handling
- Deploy to Vercel + MCP server to Railway/Render

---

## Definition of Done (MVP)
- Create/edit unlimited cards under projects
- Cards support text, reference, media
- Synthesis CTA works (MCP + fallback)
- Single Next.js app deployable on Vercel + separate MCP server
