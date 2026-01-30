FROM node:20-alpine AS base

# Install pnpm
RUN npm install -g pnpm

FROM base AS deps
WORKDIR /app

# Copy package files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY packages/types/package.json ./packages/types/
COPY packages/config/package.json ./packages/config/
COPY packages/utils/package.json ./packages/utils/
COPY apps/api/package.json ./apps/api/

# Install dependencies
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app

# Copy all dependencies (pnpm hoists to root node_modules)
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/types/node_modules ./packages/types/node_modules
COPY --from=deps /app/packages/config/node_modules ./packages/config/node_modules
COPY --from=deps /app/packages/utils/node_modules ./packages/utils/node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules

# Copy source
COPY packages ./packages
COPY apps/api ./apps/api

# Build packages
WORKDIR /app/packages/types
RUN pnpm build

WORKDIR /app/packages/config
RUN pnpm build

WORKDIR /app/packages/utils
RUN pnpm build

# Generate Prisma client
WORKDIR /app/apps/api
RUN pnpm db:generate

# Build API
RUN pnpm build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 apiuser

# Copy entire node_modules from builder (includes generated Prisma client)
COPY --from=builder /app/node_modules ./node_modules

# Copy built dist files
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder /app/packages/types/dist ./packages/types/dist
COPY --from=builder /app/packages/config/dist ./packages/config/dist
COPY --from=builder /app/packages/utils/dist ./packages/utils/dist

# Copy package.json for prisma to find schema
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json

WORKDIR /app/apps/api

USER apiuser

EXPOSE 3001

# Run migrations then start server
CMD ["sh", "-c", "npx prisma@5.22.0 migrate deploy && node dist/index.js"]
