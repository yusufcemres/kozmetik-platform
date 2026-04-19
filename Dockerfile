# API deployment (Render) — run from monorepo root
FROM node:20-alpine AS base
RUN apk add --no-cache python3 make g++
RUN corepack enable && corepack prepare pnpm@9 --activate
WORKDIR /app

# Bump Node heap for TypeScript build — default 1.7GB hits OOM on
# low-memory build workers as the monorepo has grown (scripts/onboarding,
# reviews, discovery, ~100+ entities/modules).
ENV NODE_OPTIONS="--max-old-space-size=3072"

# ---- Install all deps ----
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json tsconfig.base.json ./
COPY apps/api/package.json apps/api/
COPY packages/shared/package.json packages/shared/
RUN pnpm install --frozen-lockfile

# ---- Build shared package ----
COPY packages/shared/ packages/shared/
RUN cd packages/shared && pnpm exec tsc

# ---- Build API (split tsc + tsc-alias for clearer error output) ----
COPY apps/api/ apps/api/
RUN cd apps/api && pnpm exec tsc -p tsconfig.json
RUN cd apps/api && pnpm exec tsc-alias -p tsconfig.json

# ---- Production image ----
FROM node:20-alpine
WORKDIR /app

# Copy entire node_modules tree (pnpm symlinks need full structure)
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=base /app/apps/api/dist ./apps/api/dist
COPY --from=base /app/apps/api/package.json ./apps/api/package.json
COPY --from=base /app/packages/shared/dist ./packages/shared/dist
COPY --from=base /app/packages/shared/package.json ./packages/shared/package.json
COPY --from=base /app/package.json ./package.json

ENV NODE_ENV=production
EXPOSE ${PORT:-3001}

WORKDIR /app/apps/api
CMD ["node", "dist/main.js"]
