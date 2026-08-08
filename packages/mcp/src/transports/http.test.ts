import { afterEach, beforeEach, expect, test } from 'bun:test'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js'
import { SceneBridge } from '../bridge/scene-bridge'
import type { CreationContext } from '../context'
import { createPascalMcpServer } from '../server'
import { connectHttp, type HttpTransportHandle, type McpServerFactory } from './http'

let createServer: McpServerFactory
let handle: HttpTransportHandle | null = null

beforeEach(() => {
  createServer = () => {
    const bridge = new SceneBridge()
    bridge.loadDefault()
    return createPascalMcpServer({ bridge })
  }
})

afterEach(async () => {
  if (handle) {
    await handle.close()
    handle = null
  }
})

test('connectHttp listens on the given port and accepts MCP traffic', async () => {
  // Port 0 → OS assigns an ephemeral port.
  handle = await connectHttp(createServer, 0, { authToken: '' })
  expect(handle.port).toBeGreaterThan(0)

  const url = new URL(`http://127.0.0.1:${handle.port}/mcp`)
  const clientTransport = new StreamableHTTPClientTransport(url)
  const client = new Client({ name: 'http-test-client', version: '0.0.0' })

  try {
    await client.connect(clientTransport)
    const tools = await client.listTools()
    expect(Array.isArray(tools.tools)).toBe(true)
  } finally {
    await client.close()
  }
})

test('connectHttp accepts a fresh client after the previous session closes', async () => {
  handle = await connectHttp(createServer, 0, { authToken: '' })
  const url = new URL(`http://127.0.0.1:${handle.port}/mcp`)

  for (const name of ['first-client', 'second-client']) {
    const client = new Client({ name, version: '0.0.0' })
    await client.connect(new StreamableHTTPClientTransport(url))
    expect((await client.listTools()).tools.length).toBeGreaterThan(0)
    await client.close()
  }
})

test('connectHttp isolates concurrent MCP sessions', async () => {
  handle = await connectHttp(createServer, 0, { authToken: '' })
  const url = new URL(`http://127.0.0.1:${handle.port}/mcp`)
  const first = new Client({ name: 'first-client', version: '0.0.0' })
  const second = new Client({ name: 'second-client', version: '0.0.0' })

  try {
    await Promise.all([
      first.connect(new StreamableHTTPClientTransport(url)),
      second.connect(new StreamableHTTPClientTransport(url)),
    ])
    const [firstTools, secondTools] = await Promise.all([first.listTools(), second.listTools()])
    expect(firstTools.tools.length).toBeGreaterThan(0)
    expect(secondTools.tools.length).toBe(firstTools.tools.length)

    const firstSceneResult = await first.callTool({ name: 'get_scene', arguments: {} })
    const firstScene = JSON.parse(
      (firstSceneResult.content as Array<{ type: string; text: string }>)[0]!.text,
    ) as { nodes: Record<string, { id: string; type: string }> }
    const firstLevel = Object.values(firstScene.nodes).find((node) => node.type === 'level')!
    const created = await first.callTool({
      name: 'create_wall',
      arguments: { levelId: firstLevel.id, start: [0, 0], end: [2, 0] },
    })
    const wallId = (
      JSON.parse((created.content as Array<{ type: string; text: string }>)[0]!.text) as {
        wallId: string
      }
    ).wallId
    const secondSceneResult = await second.callTool({ name: 'get_scene', arguments: {} })
    const secondScene = JSON.parse(
      (secondSceneResult.content as Array<{ type: string; text: string }>)[0]!.text,
    ) as { nodes: Record<string, unknown> }
    expect(firstScene.nodes[wallId]).toBeUndefined()
    expect(secondScene.nodes[wallId]).toBeUndefined()

    const firstSceneAfter = await first.callTool({ name: 'get_scene', arguments: {} })
    const firstAfter = JSON.parse(
      (firstSceneAfter.content as Array<{ type: string; text: string }>)[0]!.text,
    ) as { nodes: Record<string, unknown> }
    expect(firstAfter.nodes[wallId]).toBeDefined()
  } finally {
    await Promise.all([first.close(), second.close()])
  }
})

test('connectHttp creates unique sessions with trusted resolved identity', async () => {
  const contexts: CreationContext[] = []
  createServer = (context) => {
    contexts.push(context)
    const bridge = new SceneBridge()
    bridge.loadDefault()
    return createPascalMcpServer({ bridge, context })
  }
  handle = await connectHttp(createServer, 0, {
    authToken: 'secret',
    resolveIdentity: () => ({
      actor: { kind: 'agent', id: 'pascal-agent' },
      ownerId: 'user-42',
      workspaceId: 'workspace-7',
    }),
  })
  const url = new URL(`http://127.0.0.1:${handle.port}/mcp`)
  const first = new Client({ name: 'identity-first', version: '0.0.0' })
  const second = new Client({ name: 'identity-second', version: '0.0.0' })

  try {
    await Promise.all([
      first.connect(
        new StreamableHTTPClientTransport(url, {
          requestInit: { headers: { authorization: 'Bearer secret' } },
        }),
      ),
      second.connect(
        new StreamableHTTPClientTransport(url, {
          requestInit: { headers: { authorization: 'Bearer secret' } },
        }),
      ),
    ])
    expect(contexts).toHaveLength(2)
    expect(contexts[0]).toMatchObject({
      actor: { kind: 'agent', id: 'pascal-agent' },
      ownerId: 'user-42',
      workspaceId: 'workspace-7',
    })
    expect(contexts[0]!.sessionId).not.toBe(contexts[1]!.sessionId)
  } finally {
    await Promise.all([first.close(), second.close()])
  }
})

test('connectHttp rejects a resumed session when the authenticated identity changes', async () => {
  handle = await connectHttp(createServer, 0, {
    authToken: 'secret',
    resolveIdentity: (request) => {
      const ownerId = String(request.headers['x-test-owner'] ?? '')
      return {
        actor: { kind: 'user', id: ownerId },
        ownerId,
        workspaceId: null,
      }
    },
  })
  const url = new URL(`http://127.0.0.1:${handle.port}/mcp`)
  const ownerTransport = new StreamableHTTPClientTransport(url, {
    requestInit: {
      headers: {
        authorization: 'Bearer secret',
        'x-test-owner': 'user-1',
      },
    },
  })
  const owner = new Client({ name: 'owner', version: '0.0.0' })
  await owner.connect(ownerTransport)

  const intruderTransport = new StreamableHTTPClientTransport(url, {
    sessionId: ownerTransport.sessionId,
    requestInit: {
      headers: {
        authorization: 'Bearer secret',
        'x-test-owner': 'user-2',
      },
    },
  })
  const intruder = new Client({ name: 'intruder', version: '0.0.0' })

  try {
    await intruder.connect(intruderTransport)
    await expect(intruder.listTools()).rejects.toThrow()
  } finally {
    await intruder.close()
    await owner.close()
  }
})

test('connectHttp can share an authenticated single-tenant local workspace', async () => {
  const contexts: CreationContext[] = []
  createServer = (context) => {
    contexts.push(context)
    const bridge = new SceneBridge()
    bridge.loadDefault()
    return createPascalMcpServer({ bridge, context })
  }
  handle = await connectHttp(createServer, 0, {
    authToken: 'secret',
    localWorkspace: true,
  })
  const client = new Client({ name: 'local-workspace', version: '0.0.0' })

  try {
    await client.connect(
      new StreamableHTTPClientTransport(new URL(`http://127.0.0.1:${handle.port}/mcp`), {
        requestInit: { headers: { authorization: 'Bearer secret' } },
      }),
    )
    expect(contexts).toHaveLength(1)
    expect(contexts[0]).toMatchObject({
      actor: { kind: 'local', id: null },
      ownerId: null,
      workspaceId: null,
      source: 'mcp',
    })
  } finally {
    await client.close()
  }
})

test('connectHttp close() stops the server', async () => {
  handle = await connectHttp(createServer, 0, { authToken: '' })
  const port = handle.port
  await handle.close()
  handle = null

  // A fresh fetch to the old port should fail (connection refused).
  let didConnect = false
  try {
    await fetch(`http://127.0.0.1:${port}/mcp`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{}',
      signal: AbortSignal.timeout(500),
    })
    didConnect = true
  } catch {
    didConnect = false
  }
  expect(didConnect).toBe(false)
})

test('connectHttp requires auth when binding a non-loopback host', async () => {
  await expect(connectHttp(createServer, 0, { host: '0.0.0.0', authToken: '' })).rejects.toThrow(
    /requires PASCAL_MCP_HTTP_TOKEN/,
  )
})

test('connectHttp rejects unauthenticated requests when a token is configured', async () => {
  handle = await connectHttp(createServer, 0, { authToken: 'secret' })

  const response = await fetch(`http://127.0.0.1:${handle.port}/mcp`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: '{}',
  })

  expect(response.status).toBe(401)
})

test('connectHttp handles allowed CORS preflight', async () => {
  handle = await connectHttp(createServer, 0, {
    authToken: 'secret',
    allowedOrigins: ['https://app.example'],
  })

  const response = await fetch(`http://127.0.0.1:${handle.port}/mcp`, {
    method: 'OPTIONS',
    headers: {
      origin: 'https://app.example',
      'access-control-request-method': 'POST',
    },
  })

  expect(response.status).toBe(204)
  expect(response.headers.get('access-control-allow-origin')).toBe('https://app.example')
})

test('connectHttp serves authenticated supervisor health', async () => {
  handle = await connectHttp(() => server, 0, {
    authToken: 'secret',
    health: { version: '1.2.3', instanceId: 'instance-1' },
  })

  const response = await fetch(`http://127.0.0.1:${handle.port}/health`, {
    headers: { authorization: 'Bearer secret' },
  })

  expect(response.status).toBe(200)
  expect(await response.json()).toEqual({
    status: 'ok',
    app: 'mcp',
    version: '1.2.3',
    instanceId: 'instance-1',
  })
})

test('connectHttp isolates simultaneous client sessions', async () => {
  handle = await connectHttp(() => {
    const sessionBridge = new SceneBridge()
    sessionBridge.loadDefault()
    return createPascalMcpServer({ bridge: sessionBridge })
  }, 0)
  const url = new URL(`http://127.0.0.1:${handle.port}/mcp`)
  const first = new Client({ name: 'first-client', version: '0.0.0' })
  const second = new Client({ name: 'second-client', version: '0.0.0' })

  try {
    await Promise.all([
      first.connect(new StreamableHTTPClientTransport(url)),
      second.connect(new StreamableHTTPClientTransport(url)),
    ])
    const [firstTools, secondTools] = await Promise.all([first.listTools(), second.listTools()])
    expect(firstTools.tools.length).toBeGreaterThan(0)
    expect(secondTools.tools.length).toBe(firstTools.tools.length)
  } finally {
    await Promise.all([first.close(), second.close()])
  }
})
