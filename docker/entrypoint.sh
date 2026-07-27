#!/usr/bin/env bash
set -euo pipefail

: "${PASCAL_MCP_HTTP_TOKEN:?PASCAL_MCP_HTTP_TOKEN must be set}"

mkdir -p "${PASCAL_DATA_DIR}"

bun packages/mcp/dist/bin/pascal-mcp.js \
  --http \
  --host 127.0.0.1 \
  --port 3917 &
mcp_pid=$!

(
  cd apps/editor
  bun run start --hostname 127.0.0.1 --port 3002
) &
editor_pid=$!

nginx -g "daemon off;" &
nginx_pid=$!

shutdown() {
  trap - EXIT INT TERM
  kill -TERM "${mcp_pid}" "${editor_pid}" "${nginx_pid}" 2>/dev/null || true
  wait "${mcp_pid}" "${editor_pid}" "${nginx_pid}" 2>/dev/null || true
}

trap shutdown EXIT INT TERM

wait -n "${mcp_pid}" "${editor_pid}" "${nginx_pid}"
