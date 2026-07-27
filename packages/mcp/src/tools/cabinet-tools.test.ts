import { afterEach, beforeEach, describe, expect, test } from 'bun:test'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { SceneBridge } from '../bridge/scene-bridge'
import { registerCabinetTools } from './cabinet-tools'

describe('cabinet tools', () => {
  let bridge: SceneBridge
  let client: Client
  let server: McpServer

  beforeEach(async () => {
    bridge = new SceneBridge()
    bridge.setScene({}, [])
    bridge.loadDefault()
    server = new McpServer({ name: 'test', version: '0.0.0' })
    registerCabinetTools(server, bridge)
    const [serverTransport, clientTransport] = InMemoryTransport.createLinkedPair()
    client = new Client({ name: 'test-client', version: '0.0.0' })
    await Promise.all([server.connect(serverTransport), client.connect(clientTransport)])
  })

  afterEach(async () => {
    await client.close()
    await server.close()
  })

  test('creates one contiguous parametric run and derived worktop surface', async () => {
    const level = Object.values(bridge.getNodes()).find((node) => node.type === 'level')!
    const result = await client.callTool({
      name: 'create_cabinet_run',
      arguments: {
        levelId: level.id,
        name: 'Magic Island',
        position: [1, 0, 1],
        rotation: '90°',
        modules: [
          { width: 0.6, kind: 'door' },
          { width: 0.8, kind: 'sink' },
          { width: 0.6, kind: 'dishwasher' },
        ],
        island: true,
        seatingOverhang: 0.35,
        withWaterfall: true,
        frontStyle: 'shaker',
      },
    })

    expect(result.isError).toBeFalsy()
    const payload = result.structuredContent as {
      runId: string
      moduleIds: string[]
      totalWidth: number
      surfaceHeight: number
      surfaceDepth: number
      moduleCount: number
    }
    expect(payload.moduleCount).toBe(3)
    expect(payload.totalWidth).toBeCloseTo(2)
    expect(payload.surfaceHeight).toBeCloseTo(0.85)
    expect(payload.surfaceDepth).toBeCloseTo(0.98)

    const run = bridge.getNode(payload.runId)
    expect(run?.type).toBe('cabinet')
    expect(run?.parentId).toBe(level.id)
    if (run?.type === 'cabinet') {
      expect(run.children).toEqual(payload.moduleIds)
      expect(run.position).toEqual([1, 0, 1])
      expect(run.rotation).toBeCloseTo(Math.PI / 2)
      expect(run.withFinishedBack).toBe(true)
      expect(run.withWaterfall).toBe(true)
      expect(run.countertopBackOverhang).toBe(0.35)
      expect(run.frontStyle).toBe('shaker')
    }

    const modules = payload.moduleIds.map((id) => bridge.getNode(id))
    expect(modules.map((module) => module?.type)).toEqual([
      'cabinet-module',
      'cabinet-module',
      'cabinet-module',
    ])
    expect(
      modules.map((module) => (module?.type === 'cabinet-module' ? module.position[0] : null)),
    ).toEqual([-0.7, 0, 0.7])
    expect(
      modules.map((module) => (module?.type === 'cabinet-module' ? module.stack?.[0]?.type : null)),
    ).toEqual(['door', 'sink', 'dishwasher'])
    expect(bridge.validateScene()).toEqual({ valid: true, errors: [] })

    expect(bridge.undo(1)).toBe(1)
    expect(bridge.getNode(payload.runId)).toBeNull()
    expect(payload.moduleIds.every((id) => bridge.getNode(id) === null)).toBe(true)
  })

  test('rejects a non-level parent without mutating the scene', async () => {
    const site = Object.values(bridge.getNodes()).find((node) => node.type === 'site')!
    const before = Object.keys(bridge.getNodes())
    const result = await client.callTool({
      name: 'create_cabinet_run',
      arguments: { levelId: site.id },
    })

    expect(result.isError).toBe(true)
    expect(Object.keys(bridge.getNodes())).toEqual(before)
  })
})
