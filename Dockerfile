# Railway API deployment — run from monorepo root
FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9 --activate
WORKDIR /app

# ---- Install all deps ----
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json tsconfig.base.json ./
COPY apps/api/package.json apps/api/
COPY packages/shared/package.json packages/shared/
RUN pnpm install --frozen-lockfile

# ---- Build shared package ----
COPY packages/shared/ packages/shared/
RUN cd packages/shared && pnpm run build

# ---- Build API ----
COPY apps/api/ apps/api/
RUN cd apps/api && pnpm run build

# ---- Production image ----
FROM node:20-alpine
WORKDIR /app

COPY --from=base /app/apps/api/dist ./dist
COPY --from=base /app/apps/api/package.json ./package.json
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/packages/shared/dist ./node_modules/shared/dist
COPY --from=base /app/packages/shared/package.json ./node_modules/shared/package.json

ENV NODE_ENV=production
EXPOSE ${PORT:-3001}

CMD ["node", "dist/main.js"]
