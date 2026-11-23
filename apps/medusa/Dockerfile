# Medusa v2.18 backend image for Trophy Heaven (Render, or any Docker host).
# Build from the monorepo root:
#   docker build -f apps/medusa/Dockerfile -t trophy-heaven-medusa .
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
RUN pnpm install --frozen-lockfile --filter @trophy-heaven/medusa...

# NODE_ENV stays unset here: the admin build needs dev dependencies, and medusa-config
# only demands production secrets and storage when the app actually runs.
FROM base AS build
COPY --from=deps /app /app
COPY packages ./packages
COPY apps/medusa ./apps/medusa
COPY tsconfig.json ./
RUN pnpm --filter @trophy-heaven/schemas build \
 && pnpm --filter @trophy-heaven/medusa build

FROM base AS runtime
ENV NODE_ENV=production
ENV PORT=9000
COPY --from=build /app /app
# Medusa runs from its build output; packages resolve through ../../node_modules.
RUN echo '#!/bin/sh' > /usr/local/bin/medusa \
 && echo 'exec /app/apps/medusa/node_modules/.bin/medusa "$@"' >> /usr/local/bin/medusa \
 && chmod +x /usr/local/bin/medusa
WORKDIR /app/apps/medusa/.medusa/server
EXPOSE 9000
HEALTHCHECK --interval=10s --timeout=5s --start-period=60s --retries=10 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||9000)+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["medusa", "start"]
