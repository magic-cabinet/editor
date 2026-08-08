# Matches `packageManager` in package.json and the version CI installs — a skew
# here is what makes `--frozen-lockfile` fail inside the image but not locally.
FROM oven/bun:1.3.14 AS builder

WORKDIR /app

# `next build` runs under `node`, and this image's `node` is a shim that re-execs
# bun (/usr/local/bun-node-fallback-bin/node). Next 16's build crashes it on both
# arm64 and amd64. CI does not hit this because GitHub runners have a real node.
RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates git nodejs \
  && rm -rf /var/lib/apt/lists/*

COPY . .

RUN bun install --frozen-lockfile
RUN bunx tsc --build packages/core/tsconfig.json --force \
  && bunx turbo run build --filter=editor... \
  && bunx tsc --build packages/mcp/tsconfig.json --force

FROM oven/bun:1.3.14 AS runtime

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends curl nginx \
  && rm -rf /var/lib/apt/lists/* \
  && rm -f /etc/nginx/sites-enabled/default

COPY --from=builder /app /app
COPY docker/nginx.conf /etc/nginx/conf.d/pascal.conf
COPY docker/entrypoint.sh /usr/local/bin/pascal-entrypoint

RUN chmod +x /usr/local/bin/pascal-entrypoint \
  && mkdir -p /data \
  && chown -R bun:bun /data /var/lib/nginx /var/log/nginx

ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_APP_URL=http://127.0.0.1:3002
ENV PASCAL_DATA_DIR=/data
ENV PORT=8080

EXPOSE 8080

HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=5 \
  CMD curl --fail --silent http://127.0.0.1:8080/api/health >/dev/null || exit 1

ENTRYPOINT ["/usr/local/bin/pascal-entrypoint"]
