import { describe, expect, test } from 'bun:test'
import { createCommandEnvelope, createLocalCreationContext, freezeCreationContext } from './context'

describe('creation context', () => {
  test('creates a complete command envelope without conflating document identities', () => {
    const context = {
      actor: {
        kind: 'agent' as const,
        id: 'agent_pascal',
      },
      ownerId: 'user_42',
      workspaceId: 'workspace_magic',
      sessionId: 'session_1',
      source: 'mcp' as const,
    }

    const command = createCommandEnvelope(context, 'create_magic_kitchen', {
      projectId: 'project_1',
      sceneId: 'scene_2',
      baseRevision: 7,
    })

    expect(command).toMatchObject({
      actor: context.actor,
      workspaceId: 'workspace_magic',
      sessionId: 'session_1',
      projectId: 'project_1',
      sceneId: 'scene_2',
      baseRevision: 7,
      operation: 'create_magic_kitchen',
    })
    expect(command.commandId).not.toBe('')
    expect(Number.isNaN(Date.parse(command.issuedAt))).toBe(false)
  })

  test('local contexts remain ownerless and commands receive unique identities', () => {
    const context = createLocalCreationContext('local-session')
    const first = createCommandEnvelope(context, 'save_scene')
    const second = createCommandEnvelope(context, 'save_scene')

    expect(context.actor).toEqual({ kind: 'local', id: null })
    expect(context.ownerId).toBeNull()
    expect(first.commandId).not.toBe(second.commandId)
  })

  test('freezes a cloned identity instead of retaining mutable caller input', () => {
    const input = {
      actor: { kind: 'user' as const, id: 'user-1' },
      ownerId: 'user-1',
      workspaceId: null,
      sessionId: 'session-1',
      source: 'mcp' as const,
    }
    const frozen = freezeCreationContext(input)
    input.actor.id = 'user-2'
    input.ownerId = 'user-2'

    expect(frozen.actor.id).toBe('user-1')
    expect(frozen.ownerId).toBe('user-1')
    expect(Object.isFrozen(frozen)).toBe(true)
    expect(Object.isFrozen(frozen.actor)).toBe(true)
  })
})
