import { randomUUID } from 'node:crypto'
import { z } from 'zod'

export const CreationActorKind = z.enum(['user', 'agent', 'service', 'local'])
export type CreationActorKind = z.infer<typeof CreationActorKind>

export const CreationActor = z.object({
  kind: CreationActorKind,
  id: z.string().min(1).nullable(),
})
export type CreationActor = z.infer<typeof CreationActor>

export const CreationSource = z.enum(['mcp', 'editor-api', 'cli', 'system'])
export type CreationSource = z.infer<typeof CreationSource>

export const CreationContext = z.object({
  actor: CreationActor,
  ownerId: z.string().min(1).nullable(),
  workspaceId: z.string().min(1).nullable(),
  sessionId: z.string().min(1),
  source: CreationSource,
})
export type CreationContext = z.infer<typeof CreationContext>

export const CommandEnvelope = z.object({
  commandId: z.string().min(1),
  sessionId: z.string().min(1),
  actor: CreationActor,
  ownerId: z.string().min(1).nullable(),
  workspaceId: z.string().min(1).nullable(),
  projectId: z.string().min(1).nullable(),
  sceneId: z.string().min(1).nullable(),
  baseRevision: z.number().int().nonnegative().nullable(),
  operation: z.string().min(1),
  issuedAt: z.string().datetime(),
  source: CreationSource,
})
export type CommandEnvelope = z.infer<typeof CommandEnvelope>

export type CommandTarget = {
  projectId?: string | null
  sceneId?: string | null
  baseRevision?: number | null
}

export function createLocalCreationContext(
  sessionId = randomUUID(),
  source: CreationSource = 'system',
): CreationContext {
  return {
    actor: {
      kind: 'local',
      id: null,
    },
    ownerId: null,
    workspaceId: null,
    sessionId,
    source,
  }
}

export function freezeCreationContext(context: CreationContext): CreationContext {
  const parsed = CreationContext.parse(context)
  Object.freeze(parsed.actor)
  return Object.freeze(parsed)
}

export function createCommandEnvelope(
  context: CreationContext,
  operation: string,
  target: CommandTarget = {},
): CommandEnvelope {
  return CommandEnvelope.parse({
    commandId: randomUUID(),
    sessionId: context.sessionId,
    actor: context.actor,
    ownerId: context.ownerId,
    workspaceId: context.workspaceId,
    projectId: target.projectId ?? null,
    sceneId: target.sceneId ?? null,
    baseRevision: target.baseRevision ?? null,
    operation,
    issuedAt: new Date().toISOString(),
    source: context.source,
  })
}
