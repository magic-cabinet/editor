import { describe, expect, test } from 'bun:test'
import { SceneBridge } from './bridge/scene-bridge'
import type { CreationContext } from './context'
import { createSceneOperations } from './operations'
import { createPascalMcpServer } from './server'

const firstContext: CreationContext = {
  actor: { kind: 'agent', id: 'agent-1' },
  ownerId: 'user-1',
  workspaceId: 'workspace-1',
  sessionId: 'session-1',
  source: 'mcp',
}

describe('createPascalMcpServer identity', () => {
  test('retains an explicit creation context', async () => {
    const bridge = new SceneBridge()
    const operations = createSceneOperations({ bridge, context: firstContext })
    const server = createPascalMcpServer({ bridge, operations, context: firstContext })
    expect(operations.context).toEqual(firstContext)
    await server.close()
  })

  test('rejects a context that conflicts with supplied operations', () => {
    const bridge = new SceneBridge()
    const operations = createSceneOperations({ bridge, context: firstContext })

    expect(() =>
      createPascalMcpServer({
        bridge,
        operations,
        context: {
          ...firstContext,
          sessionId: 'session-2',
        },
      }),
    ).toThrow('operations_context_mismatch')
  })
})
