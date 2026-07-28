# syntax=docker/dockerfile:1

FROM oven/bun:1.3.1 AS builder

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates git \
  && rm -rf /var/lib/apt/lists/*

COPY package.json bun.lock ./
COPY apps/editor/package.json ./apps/editor/
COPY apps/ifc-converter/package.json ./apps/ifc-converter/
COPY apps/ifc-converter/scripts ./apps/ifc-converter/scripts/
COPY packages/core/package.json ./packages/core/
COPY packages/editor/package.json ./packages/editor/
COPY packages/eslint-config/package.json ./packages/eslint-config/
COPY packages/ifc-converter/package.json ./packages/ifc-converter/
COPY packages/magic-cabinet-engine/package.json ./packages/magic-cabinet-engine/
COPY packages/magic-cabinet-plugin/package.json ./packages/magic-cabinet-plugin/
COPY packages/mcp/package.json ./packages/mcp/
COPY packages/nodes/package.json ./packages/nodes/
COPY packages/typescript-config/package.json ./packages/typescript-config/
COPY packages/ui/package.json ./packages/ui/
COPY packages/viewer/package.json ./packages/viewer/
COPY tooling/typescript/package.json ./tooling/typescript/

RUN --mount=type=cache,target=/root/.bun/install/cache \
  bun install --frozen-lockfile

COPY . .

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

RUN sed -i 's/\r$//' /usr/local/bin/pascal-entrypoint \
  && chmod +x /usr/local/bin/pascal-entrypoint \
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
