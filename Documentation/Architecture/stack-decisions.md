# Technical Stack Decisions

**Last Updated:** January 2025

## Current Stack

### Frontend
- **Next.js 15** (App Router)
- **TypeScript** 
- **Tailwind CSS v4**
- **shadcn/ui** (component library)

### Backend  
- **Next.js API Routes** (full-stack approach)
- **Supabase** (PostgreSQL + Storage)

### MCP Integration
- **Separate Node.js service** using @modelcontextprotocol/sdk
- **Communication:** HTTP API between Next.js and MCP server

### Deployment
- **Frontend/API:** Vercel
- **MCP Server:** Railway/Render
- **Database:** Supabase Cloud

---

## Key Architectural Decisions

### Decision 1: Next.js Full-Stack vs Express Backend

**Current State:** Project currently has separate Express backend (`/backend/server.js`)

**Decision:** Migrate to Next.js API Routes instead of separate Express server

**Rationale:**
- Single codebase to maintain and deploy
- Shared TypeScript types between frontend and backend
- Better performance with Next.js optimizations
- Simplified deployment (single Vercel app)
- Cost effective (free Vercel tier)

**Trade-offs:**
- ✅ Simpler architecture and deployment
- ✅ Type safety across full stack
- ✅ Better DX with hot reload
- ❌ Less flexibility for complex backend logic
- ❌ Vendor lock-in to Vercel ecosystem

**Date:** January 2025  
**Status:** Decided  

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
