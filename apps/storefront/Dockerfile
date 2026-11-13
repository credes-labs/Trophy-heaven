# Next.js 16 storefront image for Trophy Heaven.
# Build from the monorepo root:
#   docker build -f apps/storefront/Dockerfile -t trophy-heaven-storefront .
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
COPY apps/storefront/package.json apps/storefront/
RUN pnpm install --frozen-lockfile --filter @trophy-heaven/storefront...

FROM base AS build
ARG NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000
ARG NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=
ARG NEXT_PUBLIC_BASE_URL=http://localhost:3000
ENV NEXT_PUBLIC_MEDUSA_BACKEND_URL=$NEXT_PUBLIC_MEDUSA_BACKEND_URL \
    NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=$NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY \
    NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL
COPY --from=deps /app /app
COPY packages ./packages
COPY apps/storefront ./apps/storefront
COPY tsconfig.json ./
RUN pnpm --filter @trophy-heaven/schemas build \
 && pnpm --filter @trophy-heaven/storefront build

FROM base AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /app /app
WORKDIR /app/apps/storefront
EXPOSE 3000
HEALTHCHECK --interval=10s --timeout=5s --retries=10 \
  CMD node -e "fetch('http://127.0.0.1:3000').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["pnpm", "start"]
