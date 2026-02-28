# ============================================
# YOKAGE 醫美 SaaS — Production Dockerfile
# Multi-stage build: pnpm install → vite build + esbuild → slim runtime
# ============================================

# ---- Stage 1: Build ----
FROM node:22-slim AS builder

# Install pnpm and build essentials for native modules (bcrypt)
RUN corepack enable && corepack prepare pnpm@10.4.1 --activate \
    && apt-get update -qq \
    && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy dependency manifests first for layer caching
COPY package.json pnpm-lock.yaml ./
COPY patches/ ./patches/

# Install ALL dependencies (including devDependencies for build tools)
RUN pnpm install --frozen-lockfile

# Copy source code
COPY client/ ./client/
COPY server/ ./server/
COPY shared/ ./shared/
COPY drizzle/ ./drizzle/
COPY public/ ./public/
COPY vite.config.ts tsconfig.json ./

# Create attached_assets directory (referenced in vite alias, may not exist)
RUN mkdir -p attached_assets

# Build frontend (vite)
ENV NODE_ENV=production
RUN npx vite build

# Build backend (esbuild) — use index.prod.ts to avoid vite dependency in production bundle
RUN npx esbuild server/_core/index.prod.ts \
    --platform=node \
    --packages=external \
    --bundle \
    --format=esm \
    --outfile=dist/index.js

# ---- Stage 2: Production Runtime ----
FROM node:22-slim AS runtime

# Install only runtime deps (curl for healthcheck)
RUN apt-get update -qq \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy dependency manifests and install production-only deps
COPY package.json pnpm-lock.yaml ./
COPY patches/ ./patches/

RUN corepack enable && corepack prepare pnpm@10.4.1 --activate \
    && pnpm install --frozen-lockfile --prod

# Copy build artifacts from builder
COPY --from=builder /app/dist/ ./dist/

# Copy public assets (rich-menu-templates etc.)
COPY public/ ./public/

# Cloud Run uses PORT env var (default 8080)
ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

# Health check for Cloud Run
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:${PORT}/api/trpc/system.health?input=%7B%22json%22%3A%7B%22timestamp%22%3A0%7D%7D || exit 1

# Start the Express server
CMD ["node", "dist/index.js"]
