import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import type { SceneBridge } from './bridge/scene-bridge'
import type { CreationContext } from './context'
import { createSceneOperations, type SceneOperations } from './operations'
import { registerPrompts } from './prompts'
import { registerResources } from './resources'
import type { SceneStore } from './storage/types'
import { registerTools } from './tools'
import { registerVisionTools } from './tools/vision'

export type CreatePascalMcpServerOptions = {
  bridge: SceneBridge
  operations?: SceneOperations
  /** Required for persistence tools. Hosted apps and CLIs inject their own store. */
  store?: SceneStore
  context?: CreationContext
  name?: string
  version?: string
}

export function createPascalMcpServer(opts: CreatePascalMcpServerOptions): McpServer {
  if (opts.operations && opts.context) {
    const actual = opts.operations.context
    const expected = opts.context
    if (
      actual.sessionId !== expected.sessionId ||
      actual.source !== expected.source ||
      actual.ownerId !== expected.ownerId ||
      actual.workspaceId !== expected.workspaceId ||
      actual.actor.kind !== expected.actor.kind ||
      actual.actor.id !== expected.actor.id
    ) {
      throw new Error('operations_context_mismatch')
    }
  }
  const server = new McpServer({
    name: opts.name ?? 'pascal-mcp',
    version: opts.version ?? '0.1.0',
  })
  const operations =
    opts.operations ??
    createSceneOperations({ bridge: opts.bridge, store: opts.store, context: opts.context })
  registerTools(server, operations)
  registerVisionTools(server, operations)
  registerResources(server, operations)
  registerPrompts(server, operations)
  return server
}
