#!/usr/bin/env bash
# Stop the Legacy Crafts tmux-backed local stack (apps + Meilisearch).
# Postgres and Redis (host services) are left running.
set -euo pipefail

TMUX_CONF="/exec-daemon/tmux.portal.conf"
tmux_cmd() {
  if [[ -f "$TMUX_CONF" ]]; then
    tmux -f "$TMUX_CONF" "$@"
  else
    tmux "$@"
  fi
}

for name in storefront medusa meilisearch; do
  if tmux_cmd has-session -t "=$name" 2>/dev/null; then
    echo "Stopping tmux session: $name"
    tmux_cmd kill-session -t "$name"
  else
    echo "Session $name not running"
  fi
done

# Best-effort kill if processes escaped tmux.
pkill -f 'meilisearch --db-path' 2>/dev/null || true
pkill -f 'medusa develop' 2>/dev/null || true
pkill -f 'next dev' 2>/dev/null || true

echo "Local app stack stopped. Postgres/Redis left running."
