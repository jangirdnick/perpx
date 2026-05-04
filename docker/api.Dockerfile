FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.33.0 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/package.json
COPY packages/shared/package.json ./packages/shared/package.json

RUN pnpm install --frozen-lockfile

# ------------------

FROM node:22-alpine AS builder
RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.33.0 --activate

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY . .

RUN cd apps/api && pnpm exec prisma generate
RUN cd apps/api && pnpm exec nest build

# ------------------

FROM node:22-alpine AS runner
RUN apk add --no-cache dumb-init

WORKDIR /app

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

ENV NODE_ENV=production
ENV PORT=3001

COPY --from=builder --chown=nestjs:nodejs /app/apps/api/dist ./apps/api/dist
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/package.json ./package.json

USER nestjs

EXPOSE 3001

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "apps/api/dist/src/main"]