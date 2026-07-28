import { beforeEach, describe, expect, test } from 'bun:test'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { registerCreateProject } from './create-project'
import { registerGetProjectStatus } from './get-project-status'
import {
  createTestSceneOperations,
  InMemorySceneStore,
  parseToolText,
  type StoredTextContent,
} from './test-utils'

describe('project lifecycle tools', () => {
  let client: Client
  let store: InMemorySceneStore

  beforeEach(async () => {
    store = new InMemorySceneStore()
    const { operations } = createTestSceneOperations({ store })
    const server = new McpServer({ name: 'test', version: '0.0.0' })
    registerCreateProject(server, operations)
    registerGetProjectStatus(server, operations)
    const [srvT, cliT] = InMemoryTransport.createLinkedPair()
    client = new Client({ name: 'test-client', version: '0.0.0' })
    await Promise.all([server.connect(srvT), client.connect(cliT)])
  })

  test('creates a project and returns an editor URL', async () => {
    const result = await client.callTool({
      name: 'create_project',
      arguments: { name: 'Dogfood house' },
    })
    expect(result.isError).toBeFalsy()
    const parsed = parseToolText(result.content as StoredTextContent[])
    expect(parsed.name).toBe('Dogfood house')
    expect(typeof parsed.projectId).toBe('string')
    expect(parsed.editorUrl).toBe(`/scene/${parsed.projectId}`)
    expect(parsed.nodeCount).toBe(0)
    expect(parsed.defaultSceneId).toBeNull()
    expect(parsed.sceneCount).toBe(0)
    expect(parsed.nextStep).toContain('save_scene')
  })

  test('reports status for an existing project', async () => {
    const project = await store.createProject({ name: 'Status house' })
    const result = await client.callTool({
      name: 'get_project_status',
      arguments: { id: project.projectId },
    })
    expect(result.isError).toBeFalsy()
    const parsed = parseToolText(result.content as StoredTextContent[])
    expect(parsed.projectId).toBe(project.projectId)
    expect(parsed.editorUrl).toBe(`/scene/${project.projectId}`)
    expect(parsed.nodeCount).toBe(0)
  })

  test('reports the default scene and count for a multi-scene project', async () => {
    await store.createProject({ id: 'party-project', name: 'Party project' })
    await store.save({
      id: 'party-project',
      name: 'Main scene',
      projectId: 'party-project',
      graph: { nodes: {}, rootNodeIds: [] },
    })
    await store.save({
      id: 'party-option',
      name: 'Option',
      projectId: 'party-project',
      graph: { nodes: {}, rootNodeIds: [] },
    })

    const result = await client.callTool({
      name: 'get_project_status',
      arguments: { id: 'party-project' },
    })
    expect(result.isError).toBeFalsy()
    const parsed = parseToolText(result.content as StoredTextContent[])
    expect(parsed.defaultSceneId).toBe('party-project')
    expect(parsed.sceneCount).toBe(2)
    expect(parsed.editorUrl).toBe('/scene/party-project')
  })
})
