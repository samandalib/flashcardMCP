# PRD — Flashcard Research Synthesizer (v0)

**Version:** v0 (Original)  
**Date:** January 2025  
**Status:** Baseline Document  

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

## 8. UI (Next.js + Tailwind + shadcn/ui)
- Projects list (left nav)
- Card list (main panel)
- Card = body + reference + media chips
- New/Edit Card modal
- Top-right CTA → Synthesize
- Connected → runs tool
- Not connected → export & copy prompt

---

## 9. Technical Implementation
- **Frontend:** Next.js 14 (App Router), Tailwind, shadcn/ui
- **Backend:** Supabase (Postgres + Storage)
- **Uploads:** Supabase Storage with pre-signed URLs
- **MCP Server:** Node/TS using @modelcontextprotocol/sdk
- **LLM:** OpenAI GPT with JSON output mode for synthesis

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

## 13. Timeline (MVP)
- **Week 1:** Project & Card CRUD, Supabase setup
- **Week 2:** Attachments, editing, media storage
- **Week 3:** MCP server (resources + synthesize tool)
- **Week 4:** CTA integration + export fallback

---

## Definition of Done (MVP)
- Create/edit unlimited cards under projects
- Cards support text, reference, media
- Synthesis CTA works (MCP + fallback)
- Deployable demo on Vercel + Supabase

