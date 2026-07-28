import { syncAutoStairOpenings } from '@pascal-app/core/stair-openings'
import type { SceneOperations } from '../operations'
import { SceneVersionConflictError } from '../storage/types'
import { ErrorCode, throwMcpError } from './errors'

export function syncDerivedStairOpenings(operations: SceneOperations): number {
  const updates = syncAutoStairOpenings(operations.getNodes())
  if (updates.length === 0) return 0
  operations.applyPatch(
    updates.map((update) => ({
      op: 'update' as const,
      id: update.id,
      data: update.data,
    })),
  )
  return updates.length
}

/**
 * Persist the bridge's current graph to the active scene and append a live
 * event for browser subscribers. No-ops when the MCP session is not currently
 * bound to a saved scene.
 */
export async function publishLiveSceneSnapshot(
  operations: SceneOperations,
  kind: string,
): Promise<void> {
  syncDerivedStairOpenings(operations)

  const active = operations.getActiveScene()
  if (!(active && operations.canAppendSceneEvents)) return

  const graph = operations.exportSceneGraph()
  const command = operations.commandEnvelope(kind, {
    projectId: active.projectId,
    sceneId: active.id,
    baseRevision: active.version,
  })

  try {
    const { meta } = await operations.commitScene({
      id: active.id,
      name: active.name,
      projectId: active.projectId,
      ownerId: active.ownerId,
      thumbnailUrl: active.thumbnailUrl,
      graph,
      expectedVersion: active.version,
      saveMode: 'draft',
      publish: false,
      operation: kind,
      command,
      eventKind: kind,
    })
    operations.setActiveScene(meta)
  } catch (error) {
    if (error instanceof SceneVersionConflictError) {
      throwMcpError(ErrorCode.InvalidRequest, 'live_sync_version_conflict', {
        sceneId: active.id,
        expectedVersion: active.version,
      })
    }
    const message = error instanceof Error ? error.message : String(error)
    throwMcpError(ErrorCode.InternalError, `live_sync_failed: ${message}`)
  }
}
