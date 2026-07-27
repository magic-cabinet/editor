FROM oven/bun:1.3.1 AS builder

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates git \
  && rm -rf /var/lib/apt/lists/*

COPY . .

RUN bun install --frozen-lockfile
RUN bunx tsc --build packages/core/tsconfig.json --force \
  && bunx turbo run build --filter=editor... \
  && bunx tsc --build packages/mcp/tsconfig.json --force

FROM oven/bun:1.3.1 AS runtime

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
VOLUME ["/data"]

HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=5 \
  CMD curl --fail --silent http://127.0.0.1:8080/api/health >/dev/null || exit 1

ENTRYPOINT ["/usr/local/bin/pascal-entrypoint"]
