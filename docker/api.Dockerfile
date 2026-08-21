# ============================================
# API Dockerfile - NestJS + Prisma + pnpm
# Optimized for AWS ECS
# ============================================

FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat openssl
RUN corepack enable && corepack prepare pnpm@10.33.0 --activate
WORKDIR /app

# ---------- Dependencies ----------
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/package.json
COPY packages/shared/package.json ./packages/shared/package.json

# Sirf api + workspace deps
RUN pnpm install --frozen-lockfile --filter=api...

# ---------- Builder ----------
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api ./apps/api
COPY packages/shared ./packages/shared

ENV NODE_ENV=production

# Prisma client generate + Nest build
RUN pnpm --filter=api exec prisma generate
RUN pnpm --filter=api build

# Production deps only (optional prune — monorepo pe carefully)
# RUN pnpm --filter=api deploy --prod /app/deploy

# ---------- Runner ----------
FROM node:22-alpine AS runner
RUN apk add --no-cache dumb-init openssl && \
    addgroup -S -g 1001 nodejs && \
    adduser -S -u 1001 -G nodejs nestjs

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

# Built app
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/dist ./apps/api/dist
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/package.json ./apps/api/package.json

# Prisma schema + generated client (path apne project ke hisaab se adjust)
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder --chown=nestjs:nodejs /app/package.json ./package.json

USER nestjs
EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:3001/health',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

ENTRYPOINT ["dumb-init","--"]
CMD ["node","apps/api/dist/src/main.js"]