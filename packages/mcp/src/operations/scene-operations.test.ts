import { afterEach, beforeEach, describe, expect, test } from 'bun:test'
import * as fs from 'node:fs/promises'
import * as os from 'node:os'
import * as path from 'node:path'
import type { SceneGraph } from '@pascal-app/core/clone-scene-graph'
import { SceneBridge } from '../bridge/scene-bridge'
import type { CreationContext } from '../context'
import { SqliteSceneStore } from '../storage/sqlite-scene-store'
import { SceneAccessDeniedError } from '../storage/types'
import { createSceneOperations } from './scene-operations'

function makeGraph(): SceneGraph {
  return {
    nodes: {
      site_abc: {
        object: 'node',
        id: 'site_abc',
        type: 'site',
        parentId: null,
        visible: true,
        metadata: {},
      },
    } as SceneGraph['nodes'],
    rootNodeIds: ['site_abc'] as SceneGraph['rootNodeIds'],
  }
}

describe('SceneOperationsFacade scene events', () => {
  let rootDir: string
  let store: SqliteSceneStore

  beforeEach(async () => {
    rootDir = await fs.mkdtemp(path.join(os.tmpdir(), 'pascal-scene-ops-test-'))
    store = new SqliteSceneStore({ databasePath: path.join(rootDir, 'pascal.db') })
  })

  afterEach(async () => {
    store.close()
    await fs.rm(rootDir, { recursive: true, force: true })
  })

  // Regression: appendSceneEvent/listSceneEvents were detached from the store
  // before invocation, so `this` was undefined inside store methods that rely
  // on it (e.g. SqliteSceneStore.withWriteTransaction).
  test('appendSceneEvent and listSceneEvents preserve the store receiver', async () => {
    const operations = createSceneOperations({ store })
    const graph = makeGraph()
    const meta = await store.save({ id: 'live', name: 'Live', graph })

    const appended = await operations.appendSceneEvent({
      sceneId: meta.id,
      version: meta.version,
      kind: 'save_scene',
      graph,
    })
    expect(appended?.sceneId).toBe(meta.id)

    const events = await operations.listSceneEvents(meta.id)
    expect(events.map((event) => event.kind)).toEqual(['save_scene'])
  })

  test('appendSceneEvent returns null and listSceneEvents throws when the store lacks scene events', async () => {
    const operations = createSceneOperations({
      store: {
        ...store,
        backend: 'sqlite',
        appendSceneEvent: undefined,
        listSceneEvents: undefined,
      } as never,
    })

    expect(
      await operations.appendSceneEvent({
        sceneId: 'live',
        version: 1,
        kind: 'save_scene',
        graph: makeGraph(),
      }),
    ).toBeNull()
    await expect(operations.listSceneEvents('live')).rejects.toThrow('scene_events_unavailable')
  })

  test('authenticated context owns saves and rejects caller-supplied owner identity', async () => {
    const context: CreationContext = {
      actor: { kind: 'agent', id: 'pascal-agent' },
      ownerId: 'user-1',
      workspaceId: 'workspace-1',
      sessionId: 'session-1',
      source: 'mcp',
    }
    const operations = createSceneOperations({ store, context })
    const meta = await operations.saveScene({
      id: 'owned',
      name: 'Owned',
      graph: makeGraph(),
      ownerId: 'spoofed-user',
      workspaceId: 'spoofed-workspace',
      operation: 'create_scene',
    })

    expect(meta.ownerId).toBe('user-1')
    expect(meta.workspaceId).toBe('workspace-1')
    expect(meta.command).toMatchObject({
      sessionId: 'session-1',
      actor: context.actor,
      workspaceId: 'workspace-1',
      sceneId: 'owned',
      operation: 'create_scene',
    })
  })

  test('new scenes record the canonical stored id instead of an active or unsanitized id', async () => {
    const bridge = new SceneBridge()
    bridge.setActiveScene({
      id: 'active-scene',
      name: 'Active',
      projectId: 'active-project',
      ownerId: null,
      workspaceId: null,
      thumbnailUrl: null,
      version: 4,
    })
    const operations = createSceneOperations({ bridge, store })
    const meta = await operations.saveScene({
      id: 'New Scene',
      name: 'New',
      graph: makeGraph(),
    })

    expect(meta.id).toBe('new-scene')
    expect(meta.projectId).toBeNull()
    expect(meta.command?.sceneId).toBe('new-scene')
    expect(meta.command?.projectId).toBeNull()
    expect(meta.command?.sceneId).not.toBe('active-scene')
  })

  test('owner and workspace scopes fail closed across MCP operation facades', async () => {
    const ownerContext: CreationContext = {
      actor: { kind: 'user', id: 'user-1' },
      ownerId: 'user-1',
      workspaceId: 'workspace-1',
      sessionId: 'session-owner',
      source: 'mcp',
    }
    const intruderContext: CreationContext = {
      actor: { kind: 'user', id: 'user-2' },
      ownerId: 'user-2',
      workspaceId: 'workspace-2',
      sessionId: 'session-intruder',
      source: 'mcp',
    }
    const owner = createSceneOperations({ store, context: ownerContext })
    const intruder = createSceneOperations({ store, context: intruderContext })

    await owner.saveScene({ id: 'private-scene', name: 'Private', graph: makeGraph() })

    await expect(intruder.loadStoredScene('private-scene')).rejects.toThrow(SceneAccessDeniedError)
    await expect(
      intruder.renameStoredScene('private-scene', 'Stolen', { expectedVersion: 1 }),
    ).rejects.toThrow(SceneAccessDeniedError)
    expect(await intruder.listScenes()).toEqual([])
  })

  test('revision and live event persist the same command envelope', async () => {
    const context: CreationContext = {
      actor: { kind: 'agent', id: 'pascal-agent' },
      ownerId: 'user-1',
      workspaceId: 'workspace-1',
      sessionId: 'session-provenance',
      source: 'mcp',
    }
    const operations = createSceneOperations({ store, context })
    const graph = makeGraph()
    const meta = await operations.saveScene({
      id: 'provenance',
      name: 'Provenance',
      graph,
      operation: 'create_scene',
    })
    await operations.appendSceneEvent({
      sceneId: meta.id,
      version: meta.version,
      kind: 'create_scene',
      graph,
      command: meta.command,
    })

    const events = await operations.listSceneEvents(meta.id)
    expect(events).toHaveLength(1)
    expect(events[0]!.command).toEqual(meta.command)
  })

  test('rejects a command envelope aimed at another scene without mutating', async () => {
    const context: CreationContext = {
      actor: { kind: 'user', id: 'user-1' },
      ownerId: 'user-1',
      workspaceId: null,
      sessionId: 'session-target',
      source: 'mcp',
    }
    const operations = createSceneOperations({ store, context })
    const graph = makeGraph()
    await operations.saveScene({ id: 'target-a', name: 'A', graph })
    const forged = operations.commandEnvelope('save_scene', {
      sceneId: 'target-b',
      baseRevision: 1,
    })

    await expect(
      operations.saveScene({
        id: 'target-a',
        name: 'Changed',
        graph,
        expectedVersion: 1,
        command: forged,
      }),
    ).rejects.toThrow(SceneAccessDeniedError)
    expect((await store.load('target-a'))?.version).toBe(1)
  })

  test('rejects command operation and base revision mismatches', async () => {
    const context: CreationContext = {
      actor: { kind: 'user', id: 'user-1' },
      ownerId: 'user-1',
      workspaceId: null,
      sessionId: 'session-command-target',
      source: 'mcp',
    }
    const operations = createSceneOperations({ store, context })
    const graph = makeGraph()
    await operations.saveScene({ id: 'command-target', name: 'Target', graph })

    const wrongOperation = operations.commandEnvelope('rename_scene', {
      sceneId: 'command-target',
      baseRevision: 1,
    })
    await expect(
      operations.saveScene({
        id: 'command-target',
        name: 'Changed',
        graph,
        expectedVersion: 1,
        command: wrongOperation,
      }),
    ).rejects.toThrow(SceneAccessDeniedError)

    const wrongRevision = operations.commandEnvelope('save_scene', {
      sceneId: 'command-target',
      baseRevision: 0,
    })
    await expect(
      operations.saveScene({
        id: 'command-target',
        name: 'Changed',
        graph,
        expectedVersion: 1,
        command: wrongRevision,
      }),
    ).rejects.toThrow(SceneAccessDeniedError)
    expect((await store.load('command-target'))?.version).toBe(1)
  })

  test('workspace scope allows collaboration without requiring the same owner', async () => {
    await store.save({
      id: 'shared',
      name: 'Shared',
      graph: makeGraph(),
      ownerId: 'user-1',
      workspaceId: 'workspace-shared',
    })
    const collaborator = createSceneOperations({
      store,
      context: {
        actor: { kind: 'user', id: 'user-2' },
        ownerId: 'user-2',
        workspaceId: 'workspace-shared',
        sessionId: 'session-collaborator',
        source: 'mcp',
      },
    })

    expect((await collaborator.loadStoredScene('shared'))?.id).toBe('shared')
    expect((await collaborator.listScenes()).map((scene) => scene.id)).toEqual(['shared'])

    const updated = await collaborator.saveScene({
      id: 'shared',
      name: 'Shared update',
      graph: makeGraph(),
      expectedVersion: 1,
    })
    expect(updated.ownerId).toBe('user-1')
    expect(updated.workspaceId).toBe('workspace-shared')
    expect(updated.command?.ownerId).toBe('user-2')
  })
})
