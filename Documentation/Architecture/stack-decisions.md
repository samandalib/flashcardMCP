# Technical Stack Decisions

**Last Updated:** January 16, 2025

## Current Stack (Clean Serverless Architecture)

### Frontend & Backend (Full-Stack Next.js)
- **Next.js 15** (App Router with API Routes)
- **TypeScript** (strict mode)
- **Tailwind CSS v4** (utility-first styling)
- **Radix UI** (accessible component primitives)
- **Custom UI Components** (built on Radix primitives)
- **React Context** (for i18n and state management)

### Database & Storage
- **Supabase** (PostgreSQL database + Storage)
- **Direct Integration** (no separate backend server)

### MCP Integration (Planned)
- **Separate Node.js service** using @modelcontextprotocol/sdk
- **Communication:** HTTP API between Next.js API routes and MCP server

### Deployment
- **Full Application:** Vercel (serverless deployment)
- **Database:** Supabase Cloud
- **MCP Server:** To be determined (Railway/Render/VPS)

---

## Key Architectural Decisions

### Decision 1: Serverless Architecture Migration ✅ COMPLETED

**Previous Plan:** Express.js backend with separate frontend
**New Decision:** Full Next.js serverless architecture

**Rationale for Migration:**
- **Simplified Architecture**: Single codebase for frontend and backend
- **Better Performance**: Serverless functions scale automatically
- **Cost Efficiency**: Pay only for actual usage
- **Deployment Simplicity**: Single Vercel deployment
- **Type Safety**: Shared TypeScript types between frontend and API
- **Modern Best Practices**: Aligns with current web development trends

**Trade-offs:**
- ✅ Single codebase to maintain
- ✅ Automatic scaling and performance
- ✅ Shared TypeScript types
- ✅ Simplified deployment process
- ✅ Better developer experience
- ✅ Cost-effective for variable traffic
- ❌ Less control over server environment
- ❌ Cold start latency for API routes
- ❌ Function execution time limits

**Date:** January 16, 2025  
**Status:** ✅ Migrated and Implemented

### Decision 2: Supabase Integration Strategy

**Decision:** Direct Supabase integration via Next.js API routes

**Rationale:**
- **Built-in Security**: Row Level Security policies
- **Real-time Capabilities**: Future real-time features ready
- **File Storage**: Integrated storage for media uploads
- **Type Generation**: Automatic TypeScript types from schema
- **Edge Functions**: Can leverage Supabase Edge Functions if needed

**Trade-offs:**
- ✅ Fast development velocity
- ✅ Built-in auth and storage
- ✅ Real-time subscriptions ready
- ✅ Automatic type generation
- ❌ Vendor lock-in
- ❌ Less control over database configuration

**Date:** January 2025  
**Status:** ✅ Implemented

### Decision 3: UI Component Architecture

**Decision:** Custom components built on Radix UI primitives

**Rationale:**
- **Accessibility**: Radix provides accessible primitives out of the box
- **Customization**: Full control over styling and behavior
- **Bundle Size**: Only include components we actually use
- **Design System**: Consistent design language across the app
- **TypeScript**: Full type safety for all components

**Trade-offs:**
- ✅ Excellent accessibility
- ✅ Complete design control
- ✅ Optimized bundle size
- ✅ Consistent API across components
- ❌ More development effort than pre-built libraries
- ❌ Need to maintain custom components

**Date:** January 16, 2025  
**Status:** ✅ Implemented

### Decision 4: Rich Text Editor Implementation

**Options Considered:**
1. **Draft.js** - Facebook's rich text framework
2. **Slate.js** - Completely customizable rich text editor
3. **TinyMCE/CKEditor** - Traditional WYSIWYG editors
4. **contentEditable** - Native browser API with custom toolbar

**Decision:** Custom contentEditable implementation with toolbar

**Rationale:**
- **Simplicity**: Apple Notes-style simplicity and performance
- **Control**: Full control over formatting and behavior
- **Performance**: Lighter weight than full editor frameworks
- **Integration**: Better integration with React ecosystem
- **i18n Support**: Easier to implement bilingual text direction

**Trade-offs:**
- ✅ Lightweight and fast
- ✅ Complete customization control
- ✅ Native browser behavior
- ✅ Better RTL/LTR support
- ❌ More development effort for complex features
- ❌ Cross-browser compatibility concerns
- ❌ Manual handling of edge cases

**Date:** January 16, 2025  
**Status:** ✅ Implemented

### Decision 5: Internationalization Approach

**Options Considered:**
1. **next-intl** - Next.js focused i18n library
2. **react-i18next** - Popular React i18n solution
3. **Custom React Context** - Simple state-based approach

**Decision:** Custom React Context with localStorage persistence

**Rationale:**
- **Simplicity**: Only two languages (English/Farsi) needed
- **Control**: Better control over text direction changes
- **Performance**: Avoided hydration issues with next-intl
- **MVP Focus**: Simpler implementation for initial version

**Trade-offs:**
- ✅ Simple and lightweight
- ✅ Full control over direction changes
- ✅ No hydration issues
- ✅ Easy to understand and maintain
- ❌ Less scalable for many languages
- ❌ Manual translation management
- ❌ No advanced i18n features (pluralization, etc.)

**Date:** January 16, 2025  
**Status:** ✅ Implemented

### Decision 6: Content Storage Format

**Options Considered:**
1. **Structured JSON** - Parsed content with formatting metadata
2. **Markdown** - Plain text with formatting syntax
3. **HTML** - Rich HTML content storage
4. **Draft.js ContentState** - Editor-specific format

**Decision:** HTML content storage in TEXT database fields

**Rationale:**
- **Compatibility**: Direct compatibility with contentEditable
- **Preservation**: Preserves all formatting information
- **Rendering**: Easy to render without parsing
- **Media Support**: Supports media embeds and complex layouts
- **Standard**: Standard format for rich content

**Trade-offs:**
- ✅ Full formatting preservation
- ✅ Direct rendering capability
- ✅ Media embed support
- ✅ Standard web format
- ❌ Potential security concerns (XSS)
- ❌ Larger storage size than markdown
- ❌ Less portable than structured formats

**Date:** January 16, 2025  
**Status:** ✅ Implemented

### Decision 7: API Route Architecture

**Decision:** RESTful API routes following Next.js conventions

**Structure:**
```
/api/projects          - Project management
/api/projects/[id]/notes - Project-specific notes
/api/notes/[id]        - Individual note operations
```

**Rationale:**
- **Conventions**: Follows Next.js App Router conventions
- **RESTful**: Clear, predictable API structure
- **Type Safety**: Full TypeScript support
- **Error Handling**: Consistent error responses
- **Validation**: Input validation on all endpoints

**Trade-offs:**
- ✅ Clear API structure
- ✅ Type-safe endpoints
- ✅ Consistent error handling
- ✅ Easy to test and debug
- ❌ More files to maintain
- ❌ Potential code duplication

**Date:** January 16, 2025  
**Status:** ✅ Implemented

---

## Architecture Benefits

### Serverless Advantages
1. **Automatic Scaling**: Functions scale based on demand
2. **Cost Efficiency**: Pay only for actual usage
3. **Zero Maintenance**: No server management required
4. **Global Distribution**: Edge functions for better performance
5. **Built-in Security**: Vercel handles security updates

### Development Experience
1. **Single Codebase**: Frontend and backend in one repository
2. **Shared Types**: TypeScript types shared between frontend and API
3. **Hot Reloading**: Full-stack hot reloading in development
4. **Type Safety**: End-to-end type safety
5. **Simplified Deployment**: Single command deployment

---

## Future Considerations

### Potential Enhancements
1. **Authentication**: Supabase Auth integration when needed
2. **Real-time Features**: Supabase real-time subscriptions
3. **File Uploads**: Supabase Storage for media files
4. **Caching**: Redis for API response caching
5. **Monitoring**: Vercel Analytics and error tracking

### Monitoring Points
- API route performance and cold starts
- Supabase query performance and costs
- Bundle size optimization
- TypeScript compilation times
- Vercel function execution limits

### Migration Considerations
- **Database**: Could migrate to PlanetScale if needed
- **Storage**: Could use Vercel Blob or AWS S3
- **MCP Server**: Will remain separate service
- **Authentication**: Supabase Auth ready for integration