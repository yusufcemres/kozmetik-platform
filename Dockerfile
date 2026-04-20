# API deployment (Render) — run from monorepo root
# Switched from node:20-alpine to node:20-slim (Debian): glibc-based,
# better native-dep compatibility (bcrypt, pg, etc). Slightly larger image
# but we don't pay per MB on Render free tier, and we pay *a lot* if Alpine
# build fails silently on musl quirks.
FROM node:20-slim AS base

# Debian build essentials for node-gyp / bcrypt native rebuild
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ ca-certificates \
  && rm -rf /var/lib/apt/lists/*

RUN corepack enable && corepack prepare pnpm@9 --activate
WORKDIR /app

# Bump Node heap for TypeScript build — default ~1.7GB hits OOM on
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

# ---- Build API (split tsc + tsc-alias so Render log points at the failing step) ----
COPY apps/api/ apps/api/
RUN cd apps/api && pnpm exec tsc -p tsconfig.json
RUN cd apps/api && pnpm exec tsc-alias -p tsconfig.json

# ---- Production image ----
FROM node:20-slim
WORKDIR /app

# Bake commit SHA + build time into the image so /api/v1/health returns
# the currently-deployed commit — quick way to verify Render picked up a push.
ARG BUILD_SHA=unknown
ARG BUILD_TIME=unknown
ENV BUILD_SHA=${BUILD_SHA}
ENV BUILD_TIME=${BUILD_TIME}

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
