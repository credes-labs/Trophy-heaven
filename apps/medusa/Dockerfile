# Medusa v2.18 backend image for Legacy Crafts.
# Build from the monorepo root:
#   docker build -f apps/medusa/Dockerfile -t legacy-crafts-medusa .
FROM node:24-bookworm-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@10.33.3 --activate
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc* ./
COPY packages/config/package.json packages/config/
COPY packages/observability/package.json packages/observability/
COPY packages/schemas/package.json packages/schemas/
COPY apps/medusa/package.json apps/medusa/
RUN pnpm install --frozen-lockfile --filter @legacy-crafts/medusa...

FROM base AS build
COPY --from=deps /app /app
COPY packages ./packages
COPY apps/medusa ./apps/medusa
COPY tsconfig.json ./
RUN pnpm --filter @legacy-crafts/schemas build \
 && pnpm --filter @legacy-crafts/medusa build

FROM base AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /app /app
WORKDIR /app/apps/medusa
EXPOSE 9000
HEALTHCHECK --interval=10s --timeout=5s --retries=10 \
  CMD node -e "fetch('http://127.0.0.1:9000/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["pnpm", "start"]
