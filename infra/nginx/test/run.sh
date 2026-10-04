#!/usr/bin/env bash
# Serves both builds through the real nginx config and checks the URL contract.
# Needs Docker and `pnpm build` for both apps first.
set -euo pipefail

cd "$(dirname "$0")/../../.."
port="${PORT:-8088}"
name="letshyre-nginx-test"
www=/var/www/letshyre
conf="$(mktemp)"
# containers often have IPv6 off, and the [::] listen would fail to bind
grep -v 'listen \[::\]' infra/nginx/sites/letshyre.ai.conf >"$conf"

docker run -d --rm --name "$name" -p "$port:80" \
  -v "$conf:/etc/nginx/conf.d/default.conf:ro" \
  -v "$PWD/infra/nginx/snippets:/etc/nginx/snippets:ro" \
  -v "$PWD/apps/marketing/build:$www/marketing/current:ro" \
  -v "$PWD/apps/marketing/build/client/assets:$www/marketing/assets:ro" \
  -v "$PWD/apps/legacy/build:$www/legacy/current:ro" \
  -v "$PWD/apps/legacy/build/client/assets:$www/legacy/assets:ro" \
  nginx:stable >/dev/null
trap 'docker logs "$name" | tail -20; docker rm -f "$name" >/dev/null' EXIT

docker exec "$name" nginx -t
for _ in $(seq 1 20); do
  curl -sf -H "Host: letshyre.ai" "http://localhost:$port/health" >/dev/null && break
  sleep 0.5
done

node infra/nginx/test/assert.ts "http://localhost:$port"
