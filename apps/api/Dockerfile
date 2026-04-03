FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9 --activate

# ---- Dependencies ----
FROM base AS deps
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/api/package.json apps/api/
COPY packages/shared/package.json packages/shared/
RUN pnpm install --frozen-lockfile --prod=false

# ---- Build shared ----
FROM deps AS build-shared
WORKDIR /app
COPY packages/shared/ packages/shared/
RUN cd packages/shared && pnpm run build

# ---- Build API ----
FROM build-shared AS build
WORKDIR /app
COPY apps/api/ apps/api/
RUN cd apps/api && pnpm run build

# ---- Production ----
FROM node:20-alpine AS runner
WORKDIR /app

COPY --from=build /app/apps/api/dist ./dist
COPY --from=build /app/apps/api/package.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/packages/shared/dist ./node_modules/shared/dist
COPY --from=build /app/packages/shared/package.json ./node_modules/shared/

ENV NODE_ENV=production
ENV API_PORT=3001

EXPOSE 3001

CMD ["node", "dist/main.js"]
