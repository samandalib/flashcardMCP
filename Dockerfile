# Multi-stage Dockerfile for Flashcard Research Synthesizer

# Stage 1: Build Frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci --only=production
COPY frontend/ .
RUN npm run build

# Stage 2: Build Backend
FROM node:18-alpine AS backend-builder
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --only=production
COPY backend/ .

# Stage 3: Production
FROM node:18-alpine AS production
WORKDIR /app

# Install PM2 for process management
RUN npm install -g pm2

# Copy built applications
COPY --from=frontend-builder /app/frontend/.next ./frontend/.next
COPY --from=frontend-builder /app/frontend/public ./frontend/public
COPY --from=frontend-builder /app/frontend/package*.json ./frontend/
COPY --from=backend-builder /app/backend ./backend

# Install production dependencies
WORKDIR /app/frontend
RUN npm ci --only=production

WORKDIR /app/backend
RUN npm ci --only=production

# Create PM2 ecosystem file
WORKDIR /app
COPY ecosystem.config.js ./

# Expose ports
EXPOSE 3000 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Start applications with PM2
CMD ["pm2-runtime", "ecosystem.config.js"]
