#!/usr/bin/env bash
# Authenticate as the local admin user and rebuild the Meilisearch product index.
set -euo pipefail

BACKEND="${MEDUSA_BACKEND_URL:-http://127.0.0.1:9000}"
EMAIL="${ADMIN_EMAIL:-admin@legacycrafts.test}"
PASSWORD="${ADMIN_PASSWORD:-LegacyCrafts!Dev1}"

echo "==> Logging in as $EMAIL"
TOKEN="$(curl -sf -X POST "$BACKEND/auth/user/emailpass" \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" | node -e '
    let d=""; process.stdin.on("data",c=>d+=c); process.stdin.on("end",()=>{
      const j=JSON.parse(d); if(!j.token){console.error(d); process.exit(1)}; console.log(j.token)
    })
  ')"

echo "==> Reindexing products"
curl -sf -X POST "$BACKEND/admin/search/reindex" \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' | tee /tmp/lc-reindex.json
echo
echo "✓ Reindex requested"
