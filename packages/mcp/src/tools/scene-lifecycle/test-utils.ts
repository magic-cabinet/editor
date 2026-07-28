import { SceneBridge } from '../../bridge/scene-bridge'
import type { CreationContext } from '../../context'
import { createSceneOperations, type SceneOperations } from '../../operations'
import {
  type ProjectCreateOptions,
  type ProjectStatus,
  type SceneListOptions,
  type SceneMeta,
  type SceneMutateOptions,
  SceneNotFoundError,
  type SceneSaveOptions,
  type SceneStore,
  SceneVersionConflictError,
  type SceneWithGraph,
} from '../../storage/types'
import { computeGraphHash, editorUrlFor } from './metadata'

export type StoredTextContent = { type: string; text: string }

export function parseToolText(content: StoredTextContent[]): Record<string, unknown> {
  return JSON.parse(content[0]!.text) as Record<string, unknown>
}

export function createTestSceneOperations(options?: {
  bridge?: SceneBridge
  store?: InMemorySceneStore
  context?: CreationContext
}): {
  bridge: SceneBridge
  store: InMemorySceneStore
  operations: SceneOperations
} {
  const bridge = options?.bridge ?? new SceneBridge()
  const store = options?.store ?? new InMemorySceneStore()
  const operations = createSceneOperations({ bridge, store, context: options?.context })
  return { bridge, store, operations }
}

/**
 * In-memory `SceneStore` for tests. Backed by a plain `Map` keyed by id.
 * Implements the full interface including optimistic concurrency via
 * `expectedVersion`.
 */
export class InMemorySceneStore implements SceneStore {
  readonly backend = 'sqlite' as const
  private readonly data = new Map<string, SceneWithGraph>()
  private readonly projects = new Map<
    string,
    {
      id: string
      name: string
      ownerId: string | null
      workspaceId: string | null
      isPrivate: boolean
      thumbnailUrl: string | null
      defaultSceneId: string | null
      createdAt: string
      updatedAt: string
    }
  >()
  private idCounter = 0
  private projectCounter = 0

  async createProject(opts: ProjectCreateOptions): Promise<ProjectStatus> {
    const id = opts.id ?? `project_${++this.projectCounter}`
    const now = new Date().toISOString()
    this.projects.set(id, {
      id,
      name: opts.name,
      ownerId: opts.ownerId ?? null,
      workspaceId: opts.workspaceId ?? null,
      isPrivate: opts.isPrivate ?? true,
      thumbnailUrl: null,
      defaultSceneId: null,
      createdAt: now,
      updatedAt: now,
    })
    return this.toProjectStatus(id)
  }

  async getProjectStatus(id: string): Promise<ProjectStatus | null> {
    if (this.projects.has(id)) return this.toProjectStatus(id)
    const scene = this.data.get(id)
    if (!scene?.projectId) return null
    return this.toProjectStatus(scene.projectId)
  }

  async save(opts: SceneSaveOptions): Promise<SceneMeta> {
    const existing = opts.id ? this.data.get(opts.id) : undefined
    if (existing) {
      if (opts.expectedVersion !== undefined && existing.version !== opts.expectedVersion) {
        throw new SceneVersionConflictError(
          `Expected version ${opts.expectedVersion}, have ${existing.version}`,
        )
      }
      const now = new Date().toISOString()
      const nodeCount = Object.keys(opts.graph.nodes ?? {}).length
      const serialized = JSON.stringify(opts.graph)
      const projectId = opts.projectId ?? existing.projectId ?? existing.id
      this.ensureProject(
        projectId,
        opts.name,
        opts.ownerId ?? existing.ownerId,
        opts.workspaceId ?? existing.workspaceId ?? null,
        now,
      )
      const updated: SceneWithGraph = {
        id: existing.id,
        name: opts.name,
        projectId,
        thumbnailUrl: opts.thumbnailUrl ?? existing.thumbnailUrl,
        version: existing.version + 1,
        createdAt: existing.createdAt,
        updatedAt: now,
        ownerId: opts.ownerId ?? existing.ownerId,
        workspaceId: opts.workspaceId ?? existing.workspaceId,
        sizeBytes: serialized.length,
        nodeCount,
        editorUrl: existing.editorUrl ?? `/scene/${existing.id}`,
        url: existing.url ?? `/scene/${existing.id}`,
        published: true,
        graphHash: computeGraphHash(opts.graph),
        command: opts.command,
        graph: opts.graph,
      }
      this.data.set(existing.id, updated)
      this.touchProject(projectId, existing.id, updated.updatedAt)
      if (existing.projectId && existing.projectId !== projectId) {
        this.refreshProjectDefault(existing.projectId)
      }
      return this.toMeta(updated)
    }

    if (opts.expectedVersion !== undefined) {
      throw new SceneVersionConflictError('Cannot pass expectedVersion for a new scene')
    }

    const id = opts.id ?? `scene_${++this.idCounter}`
    const now = new Date().toISOString()
    const serialized = JSON.stringify(opts.graph)
    const nodeCount = Object.keys(opts.graph.nodes ?? {}).length
    const projectId = opts.projectId ?? id
    this.ensureProject(projectId, opts.name, opts.ownerId ?? null, opts.workspaceId ?? null, now)
    const record: SceneWithGraph = {
      id,
      name: opts.name,
      projectId,
      thumbnailUrl: opts.thumbnailUrl ?? null,
      version: 1,
      createdAt: now,
      updatedAt: now,
      ownerId: opts.ownerId ?? null,
      workspaceId: opts.workspaceId ?? null,
      sizeBytes: serialized.length,
      nodeCount,
      editorUrl: `/scene/${id}`,
      url: `/scene/${id}`,
      published: true,
      graphHash: computeGraphHash(opts.graph),
      command: opts.command,
      graph: opts.graph,
    }
    this.data.set(id, record)
    this.touchProject(projectId, id, now)
    return this.toMeta(record)
  }

  async load(id: string): Promise<SceneWithGraph | null> {
    const rec = this.data.get(id)
    if (!rec) return null
    return {
      ...rec,
      graph: JSON.parse(JSON.stringify(rec.graph)),
    }
  }

  async list(opts?: SceneListOptions): Promise<SceneMeta[]> {
    let scenes = Array.from(this.data.values()).map((r) => this.toMeta(r))
    if (opts?.projectId !== undefined) {
      scenes = scenes.filter((s) => s.projectId === opts.projectId)
    }
    if (opts?.ownerId !== undefined) {
      scenes = scenes.filter((s) => s.ownerId === opts.ownerId)
    }
    if (opts?.workspaceId !== undefined) {
      scenes = scenes.filter((s) => s.workspaceId === opts.workspaceId)
    }
    scenes.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
    if (opts?.limit !== undefined) scenes = scenes.slice(0, opts.limit)
    return scenes
  }

  async delete(id: string, opts?: SceneMutateOptions): Promise<boolean> {
    const rec = this.data.get(id)
    if (!rec) throw new SceneNotFoundError(`Scene ${id} not found`)
    if (opts?.expectedVersion !== undefined && rec.version !== opts.expectedVersion) {
      throw new SceneVersionConflictError(
        `Expected version ${opts.expectedVersion}, have ${rec.version}`,
      )
    }
    const removed = this.data.delete(id)
    if (removed && rec.projectId) this.refreshProjectDefault(rec.projectId)
    return removed
  }

  async rename(id: string, newName: string, opts?: SceneMutateOptions): Promise<SceneMeta> {
    const rec = this.data.get(id)
    if (!rec) throw new SceneNotFoundError(`Scene ${id} not found`)
    if (opts?.expectedVersion !== undefined && rec.version !== opts.expectedVersion) {
      throw new SceneVersionConflictError(
        `Expected version ${opts.expectedVersion}, have ${rec.version}`,
      )
    }
    const updated: SceneWithGraph = {
      ...rec,
      name: newName,
      version: rec.version + 1,
      updatedAt: new Date().toISOString(),
    }
    this.data.set(id, updated)
    if (updated.projectId) this.touchProject(updated.projectId, id, updated.updatedAt)
    return this.toMeta(updated)
  }

  private ensureProject(
    id: string,
    name: string,
    ownerId: string | null,
    workspaceId: string | null,
    now: string,
  ): void {
    if (this.projects.has(id)) return
    this.projects.set(id, {
      id,
      name,
      ownerId,
      workspaceId,
      isPrivate: true,
      thumbnailUrl: null,
      defaultSceneId: null,
      createdAt: now,
      updatedAt: now,
    })
  }

  private touchProject(id: string, sceneId: string, updatedAt: string): void {
    const project = this.projects.get(id)
    if (!project) return
    this.projects.set(id, {
      ...project,
      defaultSceneId:
        sceneId === id || project.defaultSceneId === null ? sceneId : project.defaultSceneId,
      updatedAt,
    })
  }

  private refreshProjectDefault(id: string): void {
    const project = this.projects.get(id)
    if (!project) return
    const scenes = Array.from(this.data.values())
      .filter((scene) => scene.projectId === id)
      .sort((a, b) => {
        if (a.id === id) return -1
        if (b.id === id) return 1
        return a.updatedAt < b.updatedAt ? 1 : -1
      })
    this.projects.set(id, {
      ...project,
      defaultSceneId: scenes[0]?.id ?? null,
      updatedAt: new Date().toISOString(),
    })
  }

  private toMeta(rec: SceneWithGraph): SceneMeta {
    const editorUrl = editorUrlFor(rec)
    return {
      id: rec.id,
      name: rec.name,
      projectId: rec.projectId,
      thumbnailUrl: rec.thumbnailUrl,
      version: rec.version,
      createdAt: rec.createdAt,
      updatedAt: rec.updatedAt,
      ownerId: rec.ownerId,
      workspaceId: rec.workspaceId,
      sizeBytes: rec.sizeBytes,
      nodeCount: rec.nodeCount,
      editorUrl,
      url: editorUrl,
      published: rec.published ?? true,
      graphHash: rec.graphHash ?? computeGraphHash(rec.graph),
      command: rec.command,
    }
  }

  private toProjectStatus(id: string): ProjectStatus {
    const project = this.projects.get(id)
    const scenes = Array.from(this.data.values()).filter((scene) => scene.projectId === id)
    const scene =
      scenes.find((candidate) => candidate.id === project?.defaultSceneId) ??
      scenes.find((candidate) => candidate.id === id) ??
      scenes.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))[0]
    const now = new Date().toISOString()
    const defaultSceneId = scene?.id ?? null
    const editorUrl = `/scene/${defaultSceneId ?? id}`
    return {
      id,
      projectId: id,
      defaultSceneId,
      sceneCount: scenes.length,
      name: project?.name ?? scene?.name ?? id,
      editorUrl,
      url: editorUrl,
      ownerId: scene?.ownerId ?? project?.ownerId ?? null,
      workspaceId: scene?.workspaceId ?? project?.workspaceId ?? null,
      thumbnailUrl: scene?.thumbnailUrl ?? project?.thumbnailUrl ?? null,
      publishedVersion: scene?.version ?? null,
      latestVersion: scene?.version ?? null,
      draftVersion: null,
      browserVisibleVersion: scene?.version ?? null,
      version: scene?.version ?? 0,
      isEmpty: !scene || scene.nodeCount === 0,
      sizeBytes: scene?.sizeBytes ?? 0,
      nodeCount: scene?.nodeCount ?? 0,
      graphHash: scene?.graphHash ?? (scene ? computeGraphHash(scene.graph) : null),
      createdAt: scene?.createdAt ?? project?.createdAt ?? now,
      updatedAt: scene?.updatedAt ?? project?.updatedAt ?? now,
    }
  }
}
