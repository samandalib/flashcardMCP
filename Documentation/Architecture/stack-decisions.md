# Technical Stack Decisions

**Last Updated:** January 16, 2025

## Current Stack (Implemented)

### Frontend
- **Next.js 15** (App Router)
- **TypeScript** 
- **Tailwind CSS v4**
- **shadcn/ui** (component library)
- **React Context** (for i18n and state management)

### Backend  
- **Express.js** (RESTful API server)
- **Node.js** (runtime environment)
- **Supabase** (PostgreSQL database + Storage)

### MCP Integration (Planned)
- **Separate Node.js service** using @modelcontextprotocol/sdk
- **Communication:** HTTP API between Express and MCP server

### Deployment
- **Frontend:** Vercel
- **Backend:** To be determined (Railway/Render/VPS)
- **Database:** Supabase Cloud

---

## Key Architectural Decisions

### Decision 1: Express Backend vs Next.js API Routes

**Initial Plan:** Migrate to Next.js API Routes for full-stack approach

**Actual Decision:** Keep Express.js backend

**Rationale for Change:**
- Express backend was already implemented and working
- Focused development effort on core features rather than migration
- Express provides more flexibility for complex API logic
- Easier to scale backend independently
- Team familiarity with Express patterns

**Trade-offs:**
- ✅ More flexibility for complex backend operations
- ✅ Independent backend scaling
- ✅ No migration risks or downtime
- ✅ Better separation of concerns
- ❌ Two codebases to maintain
- ❌ Separate deployment processes
- ❌ No shared TypeScript types (yet)

**Date:** January 16, 2025  
**Status:** Implemented and Confirmed  

### Decision 2: Supabase vs Self-hosted PostgreSQL

**Decision:** Use Supabase for database and file storage

**Rationale:**
- Built-in file storage with CDN
- Real-time subscriptions (future feature)
- Automatic backups and scaling
- Strong Next.js integration
- Row Level Security for future multi-tenancy

**Trade-offs:**
- ✅ Fast development velocity
- ✅ Built-in storage + auth
- ✅ Generous free tier
- ❌ Vendor lock-in
- ❌ Less control over database configuration

**Date:** January 2025  
**Status:** Decided  

### Decision 3: Separate MCP Server vs Integrated

**Decision:** Run MCP server as separate Node.js service

**Rationale:**
- MCP protocol requires persistent connection
- Next.js API routes are stateless
- Better separation of concerns
- Can scale MCP server independently

**Trade-offs:**
- ✅ Proper MCP protocol implementation
- ✅ Independent scaling
- ✅ Better error isolation
- ❌ Additional service to deploy
- ❌ Network latency between services

**Date:** January 2025  
**Status:** Decided  

### Decision 4: Rich Text Editor Implementation

**Options Considered:**
1. **Draft.js** - Facebook's rich text framework
2. **Slate.js** - Completely customizable rich text editor
3. **TinyMCE/CKEditor** - Traditional WYSIWYG editors
4. **contentEditable** - Native browser API with custom toolbar

**Decision:** Custom contentEditable implementation with toolbar

**Rationale:**
- Apple Notes-style simplicity and performance
- Full control over formatting and behavior
- Lighter weight than full editor frameworks
- Better integration with React ecosystem
- Easier to implement bilingual text direction

**Trade-offs:**
- ✅ Lightweight and fast
- ✅ Complete customization control
- ✅ Native browser behavior
- ✅ Better RTL/LTR support
- ❌ More development effort for complex features
- ❌ Cross-browser compatibility concerns
- ❌ Manual handling of edge cases

**Date:** January 16, 2025  
**Status:** Implemented

### Decision 5: Internationalization Approach

**Options Considered:**
1. **next-intl** - Next.js focused i18n library
2. **react-i18next** - Popular React i18n solution
3. **Custom React Context** - Simple state-based approach

**Decision:** Custom React Context with localStorage persistence

**Rationale:**
- Only two languages (English/Farsi) needed
- Simple toggle-based switching vs route-based locales
- Better control over text direction changes
- Avoided hydration issues with next-intl
- Simpler implementation for MVP

**Trade-offs:**
- ✅ Simple and lightweight
- ✅ Full control over direction changes
- ✅ No hydration issues
- ✅ Easy to understand and maintain
- ❌ Less scalable for many languages
- ❌ Manual translation management
- ❌ No advanced i18n features (pluralization, etc.)

**Date:** January 16, 2025  
**Status:** Implemented

### Decision 6: Content Storage Format

**Options Considered:**
1. **Structured JSON** - Parsed content with formatting metadata
2. **Markdown** - Plain text with formatting syntax
3. **HTML** - Rich HTML content storage
4. **Draft.js ContentState** - Editor-specific format

**Decision:** HTML content storage in TEXT database fields

**Rationale:**
- Direct compatibility with contentEditable
- Preserves all formatting information
- Easy to render without parsing
- Supports media embeds and complex layouts
- Standard format for rich content

**Trade-offs:**
- ✅ Full formatting preservation
- ✅ Direct rendering capability
- ✅ Media embed support
- ✅ Standard web format
- ❌ Potential security concerns (XSS)
- ❌ Larger storage size than markdown
- ❌ Less portable than structured formats

**Date:** January 16, 2025  
**Status:** Implemented

---

## Future Considerations

### Potential Changes
1. **Database:** Consider moving to Neon or PlanetScale if Supabase limitations arise
2. **MCP Server:** Could explore serverless functions if connection requirements change
3. **Frontend:** May add React Query for better state management as app grows
4. **Authentication:** Currently not needed, but Supabase Auth ready when required

### Monitoring Points
- Next.js API route performance under load
- Supabase storage costs as media uploads scale
- MCP server reliability and connection handling
