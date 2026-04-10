# ===========================================
# API Dockerfile - Simple Single Approch
# ===========================================

FROM node:22-alpine AS builder
RUN apk add --no-cache libc6-compat openssl dumb-init

WORKDIR /app

# Install pnpm via corepack
RUN corepack enable && corepack prepare pnpm@10.33.0 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api
COPY apps/api/prisma ./apps/api/prisma

RUN pnpm install --frozen-lockfile

COPY . .

RUN cd apps/api && pnpm exec prisma generate
RUN cd apps/api && pnpm exec nest build

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
            CMD node -e 'require('http').get('http://localhost:3001/health', (r)=> r.statusCode === 200 ? process.exit(0) : process.exit(1))' || exit 1

ENTRYPOINT [ "dumb-init": "--" ]
CMD [ "node", "apps/api/dist/src/main" ]