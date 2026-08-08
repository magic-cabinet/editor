import { createHash, randomUUID, timingSafeEqual } from 'node:crypto'
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'
import { type CreationActor, type CreationContext, freezeCreationContext } from '../context'

const DEFAULT_HOST = '127.0.0.1'
const DEFAULT_RATE_LIMIT_PER_MINUTE = 120
const WINDOW_MS = 60_000
const ALLOWED_METHODS = 'GET, POST, DELETE, OPTIONS'
const ALLOWED_HEADERS =
  'authorization, content-type, mcp-session-id, mcp-protocol-version, x-pascal-mcp-token'

export type HttpTransportHandle = {
  /** Host interface the server is listening on. */
  host: string
  /** Port the server is actually listening on (useful when caller passed 0). */
  port: number
  /** Gracefully close the HTTP server and the MCP transport. */
  close(): Promise<void>
}

export type HttpTransportOptions = {
  /**
   * Network interface to bind. Defaults to loopback. Binding to a non-loopback
   * interface requires an auth token.
   */
  host?: string
  /** Bearer token for HTTP MCP calls. Defaults to PASCAL_MCP_HTTP_TOKEN. */
  authToken?: string
  /** Exact CORS origins allowed to call this transport. Loopback origins are allowed. */
  allowedOrigins?: string[]
  /** Per-client request cap per minute. Set <= 0 to disable. */
  rateLimitPerMinute?: number
  /** Authenticated identity returned from GET /health for local supervisors. */
  health?: { version: string; instanceId: string }
  /**
   * Keep authenticated sessions in the unowned local workspace used by the
   * co-located editor. Only enable this for a single-tenant local/showroom
   * deployment; hosted multi-tenant adapters should use `resolveIdentity`.
   */
  localWorkspace?: boolean
  /**
   * Resolve authenticated creator identity after transport authentication.
   * Hosted adapters should derive this from their trusted auth middleware.
   */
  resolveIdentity?: (request: IncomingMessage) =>
    | {
        actor: CreationActor
        ownerId: string | null
        workspaceId: string | null
      }
    | Promise<{
        actor: CreationActor
        ownerId: string | null
        workspaceId: string | null
      }>
}

export type McpServerFactory = (context: CreationContext) => McpServer

/**
 * Attach per-session `McpServer` instances to a Streamable HTTP endpoint.
 *
 * Uses the SDK's Node-flavored `StreamableHTTPServerTransport`, which accepts
 * `IncomingMessage`/`ServerResponse` directly via `handleRequest(req, res)`.
 * A new session ID is generated per connection (stateful mode).
 *
 * Listens on `127.0.0.1:<port>` (pass `0` for an ephemeral port in tests). The
 * returned handle exposes the actual bound port and a `close()` that stops
 * the underlying Node HTTP server. To bind a public interface, pass `host` and
 * configure an auth token.
 */
export async function connectHttp(
  createMcpServer: McpServerFactory,
  port: number,
  options: HttpTransportOptions = {},
): Promise<HttpTransportHandle> {
  const host = options.host ?? DEFAULT_HOST
  const authToken = options.authToken ?? process.env.PASCAL_MCP_HTTP_TOKEN
  if (!(isLoopbackHost(host) || authToken)) {
    throw new Error(
      'HTTP transport on a non-loopback host requires PASCAL_MCP_HTTP_TOKEN or authToken',
    )
  }
  const guard = createHttpGuard({
    authToken,
    allowedOrigins: options.allowedOrigins ?? envAllowedOrigins(),
    rateLimitPerMinute: options.rateLimitPerMinute ?? DEFAULT_RATE_LIMIT_PER_MINUTE,
  })

  const sessions = new Map<
    string,
    { server: McpServer; transport: StreamableHTTPServerTransport; context: CreationContext }
  >()
  const httpServer = createServer((req, res) => {
    if (!guard(req, res)) return
    handleMcpRequest(req, res).catch((err) => {
      // Log to stderr; never touch stdout (stdio transport uses it).
      console.error('[pascal-mcp] http transport error', err)
      if (!res.writableEnded) {
        try {
          res.writeHead(500).end()
        } catch {
          // Response may already be partially sent; nothing more we can do.
        }
      }
    })
  })

  async function handleMcpRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const pathname = req.url ? new URL(req.url, 'http://localhost').pathname : '/'
    if (pathname === '/health') {
      if (!options.health) return sendJson(res, 404, { error: 'not_found' })
      if (req.method !== 'GET') {
        res.setHeader('Allow', 'GET')
        return sendJson(res, 405, { error: 'method_not_allowed' })
      }
      return sendJson(res, 200, {
        status: 'ok',
        app: 'mcp',
        version: options.health.version,
        instanceId: options.health.instanceId,
      })
    }

    const sessionId = headerValue(req.headers['mcp-session-id'])
    if (sessionId) {
      const session = sessions.get(sessionId)
      if (!session) {
        sendJsonRpcError(res, 404, -32001, 'Session not found')
        return
      }
      if (options.resolveIdentity) {
        const identity = await options.resolveIdentity(req)
        if (!sameIdentity(session.context, identity)) {
          sendJsonRpcError(res, 403, -32003, 'Session identity mismatch')
          return
        }
      }
      await session.transport.handleRequest(req, res)
      return
    }

    if (req.method !== 'POST') {
      sendJsonRpcError(res, 400, -32000, 'Missing MCP session ID')
      return
    }

    const nextSessionId = randomUUID()
    const serviceId = authToken
      ? `service_${createHash('sha256').update(authToken).digest('hex').slice(0, 24)}`
      : null
    const identity = options.resolveIdentity
      ? await options.resolveIdentity(req)
      : options.localWorkspace
        ? {
            actor: { kind: 'local' as const, id: null },
            ownerId: null,
            workspaceId: null,
          }
        : authToken
          ? {
              actor: { kind: 'service' as const, id: serviceId },
              ownerId: serviceId,
              workspaceId: null,
            }
          : {
              actor: { kind: 'local' as const, id: null },
              ownerId: null,
              workspaceId: null,
            }
    const context = freezeCreationContext({
      ...identity,
      sessionId: nextSessionId,
      source: 'mcp',
    })
    const server = createMcpServer(context)
    let transport: StreamableHTTPServerTransport
    transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => nextSessionId,
      onsessioninitialized: (id) => {
        sessions.set(id, { server, transport, context })
      },
      onsessionclosed: (id) => {
        sessions.delete(id)
      },
    })
    transport.onclose = () => {
      const id = transport.sessionId
      if (id) sessions.delete(id)
    }

    await server.connect(transport)
    await transport.handleRequest(req, res)
    if (!transport.sessionId) {
      await server.close()
    }
  }

  await new Promise<void>((resolve, reject) => {
    const onError = (err: Error) => {
      httpServer.off('listening', onListening)
      reject(err)
    }
    const onListening = () => {
      httpServer.off('error', onError)
      resolve()
    }
    httpServer.once('error', onError)
    httpServer.once('listening', onListening)
    httpServer.listen(port, host)
  })

  const address = httpServer.address()
  const boundPort = typeof address === 'object' && address !== null ? address.port : port

  return {
    host,
    port: boundPort,
    close: async () => {
      const activeServers = [...sessions.values()].map((session) => session.server)
      sessions.clear()
      await Promise.allSettled(activeServers.map((server) => server.close()))
      await new Promise<void>((resolve, reject) => {
        httpServer.close((err) => {
          if (err) reject(err)
          else resolve()
        })
      })
    },
  }
}

function sameIdentity(
  context: CreationContext,
  identity: {
    actor: CreationActor
    ownerId: string | null
    workspaceId: string | null
  },
): boolean {
  return (
    context.actor.kind === identity.actor.kind &&
    context.actor.id === identity.actor.id &&
    context.ownerId === identity.ownerId &&
    context.workspaceId === identity.workspaceId
  )
}

function createHttpGuard(options: {
  authToken?: string
  allowedOrigins: string[]
  rateLimitPerMinute: number
}): (req: IncomingMessage, res: ServerResponse) => boolean {
  const buckets = new Map<string, { count: number; resetAt: number }>()
  const allowedOrigins = new Set(
    options.allowedOrigins
      .map(normalizeOrigin)
      .filter((origin): origin is string => origin !== null),
  )

  return (req, res) => {
    const origin = req.headers.origin
    if (origin && !isOriginAllowed(origin, req.headers.host, allowedOrigins)) {
      sendJson(res, 403, { error: 'origin_not_allowed' })
      return false
    }

    applyCors(req, res, allowedOrigins)

    if (req.method === 'OPTIONS') {
      res.writeHead(204).end()
      return false
    }

    const pathname = req.url ? new URL(req.url, 'http://localhost').pathname : '/'
    if (pathname !== '/mcp' && pathname !== '/health') {
      sendJson(res, 404, { error: 'not_found' })
      return false
    }

    if (options.authToken) {
      const supplied = bearerToken(req) ?? headerValue(req.headers['x-pascal-mcp-token'])
      if (!(supplied && safeEqual(supplied, options.authToken))) {
        sendJson(res, 401, { error: 'unauthorized' })
        return false
      }
    }

    if (pathname === '/mcp' && options.rateLimitPerMinute > 0) {
      const now = Date.now()
      const key = req.socket.remoteAddress ?? 'unknown'
      const bucket = buckets.get(key)
      if (!bucket || bucket.resetAt <= now) {
        buckets.set(key, { count: 1, resetAt: now + WINDOW_MS })
      } else {
        bucket.count++
        if (bucket.count > options.rateLimitPerMinute) {
          res.setHeader('Retry-After', Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)))
          sendJson(res, 429, { error: 'rate_limited' })
          return false
        }
      }
    }

    return true
  }
}

function applyCors(req: IncomingMessage, res: ServerResponse, allowedOrigins: Set<string>): void {
  const origin = req.headers.origin
  if (origin && isOriginAllowed(origin, req.headers.host, allowedOrigins)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Vary', 'Origin')
  }
  res.setHeader('Access-Control-Allow-Methods', ALLOWED_METHODS)
  res.setHeader('Access-Control-Allow-Headers', ALLOWED_HEADERS)
  res.setHeader('X-Content-Type-Options', 'nosniff')
}

function isOriginAllowed(
  origin: string,
  requestHost: string | undefined,
  allowedOrigins: Set<string>,
): boolean {
  const normalized = normalizeOrigin(origin)
  if (!normalized) return false
  const parsed = new URL(normalized)
  if (isLoopbackHost(parsed.hostname)) return true
  if (requestHost && normalized === normalizeOrigin(`http://${requestHost}`)) return true
  if (requestHost && normalized === normalizeOrigin(`https://${requestHost}`)) return true
  return allowedOrigins.has(normalized)
}

function bearerToken(req: IncomingMessage): string | null {
  const header = headerValue(req.headers.authorization)
  if (!header) return null
  const match = header.match(/^Bearer\s+(.+)$/i)
  return match?.[1] ?? null
}

function headerValue(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) return value[0] ?? null
  return value ?? null
}

function sendJson(res: ServerResponse, status: number, payload: unknown): void {
  if (!res.hasHeader('Content-Type')) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
  }
  res.writeHead(status).end(JSON.stringify(payload))
}

function sendJsonRpcError(
  res: ServerResponse,
  status: number,
  code: number,
  message: string,
): void {
  sendJson(res, status, {
    jsonrpc: '2.0',
    error: { code, message },
    id: null,
  })
}

function safeEqual(a: string, b: string): boolean {
  const aBuffer = Buffer.from(a)
  const bBuffer = Buffer.from(b)
  if (aBuffer.length !== bBuffer.length) return false
  return timingSafeEqual(aBuffer, bBuffer)
}

function envAllowedOrigins(): string[] {
  return (process.env.PASCAL_MCP_HTTP_ORIGINS ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
}

function normalizeOrigin(origin: string): string | null {
  try {
    const url = new URL(origin)
    return `${url.protocol}//${url.host}`.toLowerCase()
  } catch {
    return null
  }
}

function isLoopbackHost(host: string): boolean {
  const h = stripPort(host).toLowerCase()
  return h === 'localhost' || h.endsWith('.localhost') || h === '127.0.0.1' || h === '::1'
}

function stripPort(host: string): string {
  if (host.startsWith('[')) {
    const end = host.indexOf(']')
    return end === -1 ? host : host.slice(1, end)
  }
  return host.split(':')[0] ?? host
}
