import { afterEach, beforeEach, describe, expect, test } from 'bun:test'
import type { MagicCabinetComponentNode } from '@magic-cabinet/pascal-plugin'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import type { AnyNodeId } from '@pascal-app/core/schema'
import { registerMagicKitchenTools } from './magic-kitchen-tools'
import { createTestSceneOperations } from './scene-lifecycle/test-utils'

describe('Magic Kitchen semantic tools', () => {
  let client: Client
  let server: McpServer
  let operations: ReturnType<typeof createTestSceneOperations>['operations']

  beforeEach(async () => {
    ;({ operations } = createTestSceneOperations())
    server = new McpServer({ name: 'test', version: '0.0.0' })
    registerMagicKitchenTools(server, operations)
    const [serverTransport, clientTransport] = InMemoryTransport.createLinkedPair()
    client = new Client({ name: 'test-client', version: '0.0.0' })
    await Promise.all([server.connect(serverTransport), client.connect(clientTransport)])
  })

  afterEach(async () => {
    await client.close()
    await server.close()
  })

  test('starts a persisted roofless pilot and returns its real browser route', async () => {
    const result = await client.callTool({
      name: 'start_magic_kitchen_session',
      arguments: {
        name: 'Sales pilot',
        presentation: 'hero',
        palette: 'sage-oak',
      },
    })

    expect(result.isError).toBeFalsy()
    expect(result.structuredContent).toMatchObject({
      sceneId: 'project_1',
      projectId: 'project_1',
      editorUrl: '/scene/project_1',
      componentCount: 44,
      presentation: 'hero',
      palette: 'sage-oak',
      valid: true,
    })
    expect(operations.validateScene()).toEqual({ valid: true, errors: [] })
    expect(Object.values(operations.getNodes()).some((node) => node.type === 'roof')).toBe(false)
  })

  test('controls presentation, palette, handles, validation, and BOM', async () => {
    await client.callTool({ name: 'start_magic_kitchen_session', arguments: {} })

    const camera = await client.callTool({
      name: 'set_kitchen_camera',
      arguments: { presentation: 'detail' },
    })
    expect(camera.structuredContent).toMatchObject({
      presentation: 'detail',
      sceneTheme: 'twilight',
      viewMode: '3d',
    })

    const palette = await client.callTool({
      name: 'set_kitchen_palette',
      arguments: { palette: 'midnight' },
    })
    expect((palette.structuredContent as { updatedComponents: number }).updatedComponents).toBe(44)

    const handles = await client.callTool({
      name: 'set_kitchen_handles',
      arguments: { handleStyle: 'edge' },
    })
    expect(
      (handles.structuredContent as { updatedComponents: number }).updatedComponents,
    ).toBeGreaterThan(0)

    const validation = await client.callTool({
      name: 'validate_magic_kitchen_session',
      arguments: {},
    })
    expect(validation.structuredContent).toMatchObject({
      valid: true,
      engine: { valid: true, geometryValid: true, sceneValid: true },
      pascal: { valid: true, errors: [] },
    })

    const bom = await client.callTool({ name: 'get_kitchen_bom', arguments: {} })
    expect(bom.structuredContent).toMatchObject({
      pricingAuthority: 'server',
      requiresServerQuote: true,
      commerceReady: false,
      items: [],
    })
  })

  test('reconciles through the engine and keeps the scene live-valid', async () => {
    await client.callTool({ name: 'start_magic_kitchen_session', arguments: {} })

    const update = await client.callTool({
      name: 'update_magic_kitchen',
      arguments: { seed: 20260728 },
    })

    expect(update.isError).toBeFalsy()
    expect(update.structuredContent).toMatchObject({
      valid: true,
    })
    expect((update.structuredContent as { componentCount: number }).componentCount).toBeGreaterThan(
      0,
    )
    expect(operations.validateScene()).toEqual({ valid: true, errors: [] })
  })

  test('automatically pins a cabinet moved with the native Pascal HUD', async () => {
    await client.callTool({ name: 'start_magic_kitchen_session', arguments: {} })
    const cabinet = (
      Object.values(operations.getNodes()) as unknown as MagicCabinetComponentNode[]
    ).find((node) => node.type === 'magic-cabinet:component' && node.componentKind === 'cabinet')!
    const movedPosition = [cabinet.position[0], cabinet.position[1], cabinet.position[2] + 1] as [
      number,
      number,
      number,
    ]
    operations.updateNode(
      cabinet.id as unknown as AnyNodeId,
      {
        position: movedPosition,
      } as never,
    )
    expect(
      (
        operations.getNode(
          cabinet.id as unknown as AnyNodeId,
        ) as unknown as MagicCabinetComponentNode
      ).position,
    ).toEqual(movedPosition)

    const update = await client.callTool({
      name: 'update_magic_kitchen',
      arguments: {},
    })

    expect(
      (update.structuredContent as { pinnedComponentIds: string[] }).pinnedComponentIds,
    ).toContain(cabinet.engineComponentId)
    expect(
      (
        operations.getNode(
          cabinet.id as unknown as AnyNodeId,
        ) as unknown as MagicCabinetComponentNode
      ).position,
    ).toEqual(movedPosition)
  })
})
