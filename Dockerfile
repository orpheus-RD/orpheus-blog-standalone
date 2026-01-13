# =============================================================================
# Orpheus Blog - Backend Dockerfile
# Optimized for Render deployment with multi-stage build
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1: Dependencies
# -----------------------------------------------------------------------------
FROM node:22-alpine AS deps

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.4.1 --activate

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY patches ./patches

# Install dependencies
RUN pnpm install --frozen-lockfile --prod=false

# -----------------------------------------------------------------------------
# Stage 2: Builder
# -----------------------------------------------------------------------------
FROM node:22-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.4.1 --activate

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source files
COPY . .

# Build the server
RUN pnpm build:server

# -----------------------------------------------------------------------------
# Stage 3: Production Runner
# -----------------------------------------------------------------------------
FROM node:22-alpine AS runner

# Install pnpm for production dependencies
RUN corepack enable && corepack prepare pnpm@10.4.1 --activate

WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 expressjs

# Copy package files for production dependencies
COPY package.json pnpm-lock.yaml ./
COPY patches ./patches

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod && \
    pnpm store prune

# Copy built server from builder stage
COPY --from=builder /app/dist ./dist

# Copy drizzle schema for runtime
COPY --from=builder /app/drizzle ./drizzle

# Copy shared types
COPY --from=builder /app/shared ./shared

# Change ownership to non-root user
RUN chown -R expressjs:nodejs /app

# Switch to non-root user
USER expressjs

# Expose port (Render will set PORT env var)
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT:-3000}/health || exit 1

# Start the server
CMD ["node", "dist/index.js"]
