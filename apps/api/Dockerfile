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

# Copy dependencies
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

# Copy built files
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/node_modules ./node_modules
COPY --from=builder /app/apps/api/prisma ./prisma
COPY --from=builder /app/packages/types/dist ./node_modules/@ppop/types/dist
COPY --from=builder /app/packages/config/dist ./node_modules/@ppop/config/dist
COPY --from=builder /app/packages/utils/dist ./node_modules/@ppop/utils/dist

# Create startup script that runs migrations then starts server
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'npx prisma migrate deploy' >> /app/start.sh && \
    echo 'node dist/index.js' >> /app/start.sh && \
    chmod +x /app/start.sh

USER apiuser

EXPOSE 3001

CMD ["/app/start.sh"]
