# Environment Variables Documentation

## Required Environment Variables

### Frontend (.env.local)
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### Backend (.env)
```bash
# Supabase Configuration
SUPABASE_URL=your-supabase-project-url
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Server Configuration
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

### MCP Server (.env)
```bash
# Supabase Configuration
SUPABASE_URL=your-supabase-project-url
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key

# Server Configuration
PORT=3002
NODE_ENV=development
```

## Production Environment Variables

### Vercel Deployment
Set these in Vercel dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_APP_URL`

### Docker Deployment
Pass environment variables via:
- Docker Compose file
- Kubernetes ConfigMap/Secret
- Environment file mounting

## Security Notes
- Never commit `.env` files to version control
- Use different Supabase projects for development/production
- Rotate API keys regularly
- Use service role keys only on backend services
