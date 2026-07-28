#!/usr/bin/env bash
set -euo pipefail

base_url="${MAGIC_CABINET_URL:-http://127.0.0.1:8080}"
token="${PASCAL_MCP_HTTP_TOKEN:-magic-cabinet-dev}"

for attempt in {1..60}; do
  if curl --fail --silent --max-time 5 "${base_url}/api/health" >/dev/null; then
    break
  fi

  if (( attempt == 60 )); then
    echo "Pascal did not become healthy at ${base_url} within 120 seconds." >&2
    exit 1
  fi

  sleep 2
done

curl --fail --silent --show-error --location --max-time 20 \
  --output /dev/null "${base_url}/live"

curl --fail --silent --show-error --max-time 20 \
  --header "Authorization: Bearer ${token}" \
  --header "Accept: application/json, text/event-stream" \
  --header "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-03-26","capabilities":{},"clientInfo":{"name":"magic-cabinet-docker-smoke","version":"1.0.0"}}}' \
  --output /dev/null "${base_url}/mcp"

echo "Pascal editor and authenticated MCP are ready at ${base_url}."
