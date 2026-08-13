#!/usr/bin/env bash
# Bring up the Legacy Crafts local stack on host services (no Docker required).
# Starts Meilisearch, Medusa (:9000), and the storefront (:3000) under tmux.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

TMUX_CONF="/exec-daemon/tmux.portal.conf"
tmux_cmd() {
  if [[ -f "$TMUX_CONF" ]]; then
    tmux -f "$TMUX_CONF" "$@"
  else
    tmux "$@"
  fi
}

ensure_session() {
  local name="$1"
  local cwd="$2"
  tmux_cmd has-session -t "=$name" 2>/dev/null || \
    tmux_cmd new-session -d -s "$name" -c "$cwd" -- "${SHELL:-bash}" -l
}

wait_http() {
  local url="$1"
  local label="$2"
  local attempts="${3:-60}"
  for ((i=1; i<=attempts; i++)); do
    if curl -sf "$url" >/dev/null 2>&1; then
      echo "✓ $label is up ($url)"
      return 0
    fi
    sleep 1
  done
  echo "✗ timed out waiting for $label ($url)" >&2
  return 1
}

echo "==> Checking Postgres + Redis"
pg_isready -h 127.0.0.1 -p 5432 >/dev/null
redis-cli ping | grep -q PONG
echo "✓ Postgres and Redis accepting connections"

echo "==> Building shared schemas"
pnpm --filter @legacy-crafts/schemas build

echo "==> Starting Meilisearch"
mkdir -p "$ROOT/.data/meilisearch"
ensure_session meilisearch "$ROOT"
# Restart cleanly if already running a shell without the server.
if ! curl -sf http://127.0.0.1:7700/health >/dev/null 2>&1; then
  tmux_cmd send-keys -t "meilisearch:0.0" \
    'MEILI_ENV=development MEILI_MASTER_KEY=masterKey_dev_only_change_me meilisearch --db-path /workspace/.data/meilisearch --http-addr 127.0.0.1:7700' C-m
fi
wait_http http://127.0.0.1:7700/health Meilisearch 30

echo "==> Migrating Medusa DB"
(cd apps/medusa && npx medusa db:migrate)

echo "==> Seeding (idempotent)"
(cd apps/medusa && npx medusa exec ./src/scripts/seed.ts)

echo "==> Starting Medusa backend"
ensure_session medusa "$ROOT/apps/medusa"
if ! curl -sf http://127.0.0.1:9000/health >/dev/null 2>&1; then
  tmux_cmd send-keys -t "medusa:0.0" 'pnpm dev' C-m
fi
wait_http http://127.0.0.1:9000/health Medusa 90

echo "==> Starting storefront"
ensure_session storefront "$ROOT/apps/storefront"
if ! curl -sf http://127.0.0.1:3000 >/dev/null 2>&1; then
  tmux_cmd send-keys -t "storefront:0.0" 'pnpm dev' C-m
fi
wait_http http://127.0.0.1:3000 Storefront 90

echo ""
echo "Legacy Crafts is live:"
echo "  Storefront  http://localhost:3000"
echo "  Medusa API  http://localhost:9000"
echo "  Admin       http://localhost:9000/app"
echo "  Meilisearch http://localhost:7700"
echo "  Admin login admin@legacycrafts.test / LegacyCrafts!Dev1"
echo ""
echo "tmux sessions: meilisearch, medusa, storefront"
echo "Stop with: scripts/dev-down.sh"
