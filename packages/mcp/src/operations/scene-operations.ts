import type { SceneGraph } from '@pascal-app/core/clone-scene-graph'
import type { AnyNode, AnyNodeId, AnyNodeType } from '@pascal-app/core/schema'
import type { ActiveSceneMeta, Patch, SceneBridge, ValidationResult } from '../bridge/scene-bridge'
import {
  type CommandEnvelope,
  type CommandTarget,
  type CreationContext,
  createCommandEnvelope,
  createLocalCreationContext,
  freezeCreationContext,
} from '../context'
import type {
  ProjectCreateOptions,
  ProjectStatus,
  SceneCommitOptions,
  SceneEvent,
  SceneEventAppendOptions,
  SceneEventListOptions,
  SceneListOptions,
  SceneMeta,
  SceneMutateOptions,
  SceneSaveOptions,
  SceneStore,
  SceneWithGraph,
} from '../storage/types'
import { SceneAccessDeniedError } from '../storage/types'

export type CreateSceneOperationsOptions = {
  bridge?: SceneBridge
  store?: SceneStore
  context?: CreationContext
}

export interface SceneOperations {
  readonly context: CreationContext
  readonly hasBridge: boolean
  readonly hasStore: boolean
  readonly hasSceneEvents: boolean
  readonly canAppendSceneEvents: boolean
  readonly canListSceneEvents: boolean
  readonly canCreateProject: boolean
  readonly canGetProjectStatus: boolean
  readonly canCommitScene: boolean
  readonly storeBackend: SceneStore['backend'] | null

  commandEnvelope(operation: string, target?: CommandTarget): CommandEnvelope

  setActiveScene(meta: ActiveSceneMeta): void
  getActiveScene(): ActiveSceneMeta | null
  clearActiveScene(): void
  loadDefault(): void
  setScene(nodes: Record<AnyNodeId, AnyNode>, rootNodeIds: AnyNodeId[]): void
  exportJSON(): SceneGraph & { collections: Record<string, unknown> }
  exportSceneGraph(): SceneGraph
  loadJSON(json: string | SceneGraph): void
  getNode(id: AnyNodeId): AnyNode | null
  getNodes(): Record<AnyNodeId, AnyNode>
  getRootNodeIds(): AnyNodeId[]
  getChildren(parentId: AnyNodeId): AnyNode[]
  getAncestry(id: AnyNodeId): AnyNode[]
  findNodes(filter: {
    type?: AnyNodeType
    parentId?: AnyNodeId | null
    levelId?: AnyNodeId
  }): AnyNode[]
  resolveLevelId(id: AnyNodeId): AnyNodeId | null
  createNode(node: AnyNode, parentId?: AnyNodeId): AnyNodeId
  updateNode(id: AnyNodeId, data: Partial<AnyNode>): void
  deleteNode(id: AnyNodeId, cascade?: boolean): string[]
  applyPatch(patches: Patch[]): {
    appliedOps: number
    deletedIds: AnyNodeId[]
    createdIds: AnyNodeId[]
  }
  undo(steps?: number): number
  redo(steps?: number): number
  validateScene(): ValidationResult
  flushDirty(): string[]
  getHistory(): { pastCount: number; futureCount: number }
  clearHistory(): void

  createProject(options: ProjectCreateOptions): Promise<ProjectStatus>
  getProjectStatus(id: string): Promise<ProjectStatus | null>
  saveScene(options: SceneSaveOptions): Promise<SceneMeta>
  commitScene(options: SceneCommitOptions): Promise<{ meta: SceneMeta; event: SceneEvent | null }>
  loadStoredScene(id: string): Promise<SceneWithGraph | null>
  listScenes(options?: SceneListOptions): Promise<SceneMeta[]>
  deleteStoredScene(id: string, options?: SceneMutateOptions): Promise<boolean>
  renameStoredScene(id: string, newName: string, options?: SceneMutateOptions): Promise<SceneMeta>
  appendSceneEvent(options: SceneEventAppendOptions): Promise<SceneEvent | null>
  listSceneEvents(id: string, options?: SceneEventListOptions): Promise<SceneEvent[]>
}

export function createSceneOperations(options: CreateSceneOperationsOptions): SceneOperations {
  return new SceneOperationsFacade(options)
}

class SceneOperationsFacade implements SceneOperations {
  readonly #bridge?: SceneBridge
  readonly #store?: SceneStore
  readonly context: CreationContext

  constructor(options: CreateSceneOperationsOptions) {
    this.#bridge = options.bridge
    this.#store = options.store
    this.context = freezeCreationContext(options.context ?? createLocalCreationContext())
  }

  get hasBridge(): boolean {
    return this.#bridge !== undefined
  }

  get hasStore(): boolean {
    return this.#store !== undefined
  }

  get hasSceneEvents(): boolean {
    return this.canAppendSceneEvents && this.canListSceneEvents
  }

  get canAppendSceneEvents(): boolean {
    return typeof this.#store?.appendSceneEvent === 'function'
  }

  get canListSceneEvents(): boolean {
    return typeof this.#store?.listSceneEvents === 'function'
  }

  get canCreateProject(): boolean {
    return typeof this.#store?.createProject === 'function'
  }

  get canGetProjectStatus(): boolean {
    return typeof this.#store?.getProjectStatus === 'function'
  }

  get canCommitScene(): boolean {
    return typeof this.#store?.commitScene === 'function'
  }

  get storeBackend(): SceneStore['backend'] | null {
    return this.#store?.backend ?? null
  }

  commandEnvelope(operation: string, target: CommandTarget = {}): CommandEnvelope {
    const active = this.#bridge?.getActiveScene() ?? null
    return createCommandEnvelope(this.context, operation, {
      projectId: target.projectId === undefined ? (active?.projectId ?? null) : target.projectId,
      sceneId: target.sceneId === undefined ? (active?.id ?? null) : target.sceneId,
      baseRevision:
        target.baseRevision === undefined ? (active?.version ?? null) : target.baseRevision,
    })
  }

  setActiveScene(meta: ActiveSceneMeta): void {
    this.requireBridge().setActiveScene(meta)
  }

  getActiveScene(): ActiveSceneMeta | null {
    return this.requireBridge().getActiveScene()
  }

  clearActiveScene(): void {
    this.requireBridge().clearActiveScene()
  }

  loadDefault(): void {
    this.requireBridge().loadDefault()
  }

  setScene(nodes: Record<AnyNodeId, AnyNode>, rootNodeIds: AnyNodeId[]): void {
    this.requireBridge().setScene(nodes, rootNodeIds)
  }

  exportJSON(): SceneGraph & { collections: Record<string, unknown> } {
    return this.requireBridge().exportJSON()
  }

  exportSceneGraph(): SceneGraph {
    const exported = this.exportJSON()
    return {
      nodes: exported.nodes,
      rootNodeIds: exported.rootNodeIds,
      collections: exported.collections as SceneGraph['collections'],
      installedPlugins: exported.installedPlugins,
    }
  }

  loadJSON(json: string | SceneGraph): void {
    this.requireBridge().loadJSON(json)
  }

  getNode(id: AnyNodeId): AnyNode | null {
    return this.requireBridge().getNode(id)
  }

  getNodes(): Record<AnyNodeId, AnyNode> {
    return this.requireBridge().getNodes()
  }

  getRootNodeIds(): AnyNodeId[] {
    return this.requireBridge().getRootNodeIds()
  }

  getChildren(parentId: AnyNodeId): AnyNode[] {
    return this.requireBridge().getChildren(parentId)
  }

  getAncestry(id: AnyNodeId): AnyNode[] {
    return this.requireBridge().getAncestry(id)
  }

  findNodes(filter: {
    type?: AnyNodeType
    parentId?: AnyNodeId | null
    levelId?: AnyNodeId
  }): AnyNode[] {
    return this.requireBridge().findNodes(filter)
  }

  resolveLevelId(id: AnyNodeId): AnyNodeId | null {
    return this.requireBridge().resolveLevelId(id)
  }

  createNode(node: AnyNode, parentId?: AnyNodeId): AnyNodeId {
    return this.requireBridge().createNode(node, parentId)
  }

  updateNode(id: AnyNodeId, data: Partial<AnyNode>): void {
    this.requireBridge().updateNode(id, data)
  }

  deleteNode(id: AnyNodeId, cascade?: boolean): string[] {
    return this.requireBridge().deleteNode(id, cascade)
  }

  applyPatch(patches: Patch[]): {
    appliedOps: number
    deletedIds: AnyNodeId[]
    createdIds: AnyNodeId[]
  } {
    return this.requireBridge().applyPatch(patches)
  }

  undo(steps?: number): number {
    return this.requireBridge().undo(steps)
  }

  redo(steps?: number): number {
    return this.requireBridge().redo(steps)
  }

  validateScene(): ValidationResult {
    return this.requireBridge().validateScene()
  }

  flushDirty(): string[] {
    return this.requireBridge().flushDirty()
  }

  getHistory(): { pastCount: number; futureCount: number } {
    return this.requireBridge().getHistory()
  }

  clearHistory(): void {
    this.requireBridge().clearHistory()
  }

  async createProject(options: ProjectCreateOptions): Promise<ProjectStatus> {
    const store = this.requireStore()
    if (!store.createProject) {
      throw new Error('create_project_unavailable')
    }
    return store.createProject({
      ...options,
      ownerId: this.context.ownerId ?? options.ownerId,
      workspaceId: this.context.workspaceId ?? options.workspaceId,
    })
  }

  async getProjectStatus(id: string): Promise<ProjectStatus | null> {
    const store = this.requireStore()
    if (store.getProjectStatus) {
      const status = await store.getProjectStatus(id)
      if (status) this.assertAccess(status)
      return status
    }
    const scene = await store.load(id)
    if (!scene) return null
    this.assertAccess(scene)
    const editorUrl = scene.editorUrl ?? `/scene/${scene.id}`
    return {
      id: scene.id,
      projectId: scene.projectId ?? scene.id,
      name: scene.name,
      editorUrl,
      url: editorUrl,
      ownerId: scene.ownerId,
      workspaceId: scene.workspaceId,
      thumbnailUrl: scene.thumbnailUrl,
      publishedVersion: scene.published === false ? null : scene.version,
      latestVersion: scene.version,
      draftVersion: null,
      browserVisibleVersion: scene.version,
      version: scene.version,
      isEmpty: scene.nodeCount === 0,
      sizeBytes: scene.sizeBytes,
      nodeCount: scene.nodeCount,
      graphHash: scene.graphHash ?? null,
      createdAt: scene.createdAt,
      updatedAt: scene.updatedAt,
    }
  }

  async saveScene(options: SceneSaveOptions): Promise<SceneMeta> {
    const prepared = await this.prepareSaveOptions(options)
    return this.requireStore().save(prepared)
  }

  async commitScene(
    options: SceneCommitOptions,
  ): Promise<{ meta: SceneMeta; event: SceneEvent | null }> {
    const store = this.requireStore()
    const prepared = await this.prepareSaveOptions(options)
    if (store.commitScene) {
      return store.commitScene({ ...prepared, eventKind: options.eventKind })
    }
    const meta = await store.save(prepared)
    const event = await this.appendSceneEvent({
      sceneId: meta.id,
      version: meta.version,
      kind: options.eventKind,
      graph: prepared.graph,
      command: meta.command ?? prepared.command,
    })
    return { meta, event }
  }

  private async prepareSaveOptions(options: SceneSaveOptions): Promise<SceneSaveOptions> {
    const store = this.requireStore()
    const existing = options.id ? await store.load(options.id) : null
    if (existing) this.assertAccess(existing)

    const projectId = options.projectId ?? existing?.projectId ?? null
    const command =
      options.command ??
      this.commandEnvelope(options.operation ?? 'save_scene', {
        projectId,
        sceneId: existing?.id ?? null,
        baseRevision: options.expectedVersion ?? existing?.version ?? 0,
      })
    this.assertCommandContext(command)
    this.assertCommandTarget(
      command,
      {
        operation: options.operation ?? 'save_scene',
        projectId,
        sceneId: existing?.id ?? null,
        baseRevision: options.expectedVersion ?? existing?.version ?? 0,
      },
      { allowMissingScene: !existing },
    )

    return {
      ...options,
      projectId,
      ownerId: existing?.ownerId ?? this.context.ownerId ?? options.ownerId,
      workspaceId: this.context.workspaceId ?? options.workspaceId,
      command,
    }
  }

  async loadStoredScene(id: string): Promise<SceneWithGraph | null> {
    const scene = await this.requireStore().load(id)
    if (scene) this.assertAccess(scene)
    return scene
  }

  async listScenes(options?: SceneListOptions): Promise<SceneMeta[]> {
    if (this.context.workspaceId !== null) {
      return this.requireStore().list({
        ...options,
        ownerId: undefined,
        workspaceId: this.context.workspaceId,
      })
    }
    return this.requireStore().list({
      ...options,
      ownerId: this.context.ownerId ?? options?.ownerId,
      workspaceId: options?.workspaceId,
    })
  }

  async deleteStoredScene(id: string, options?: SceneMutateOptions): Promise<boolean> {
    const store = this.requireStore()
    const scene = await store.load(id)
    if (scene) this.assertAccess(scene)
    const command =
      options?.command ??
      this.commandEnvelope('delete_scene', {
        projectId: scene?.projectId ?? null,
        sceneId: id,
        baseRevision: options?.expectedVersion ?? scene?.version ?? null,
      })
    this.assertCommandContext(command)
    this.assertCommandTarget(command, {
      operation: 'delete_scene',
      projectId: scene?.projectId ?? null,
      sceneId: id,
      baseRevision: options?.expectedVersion ?? scene?.version ?? null,
    })
    return store.delete(id, { ...options, command })
  }

  async renameStoredScene(
    id: string,
    newName: string,
    options?: SceneMutateOptions,
  ): Promise<SceneMeta> {
    const store = this.requireStore()
    const scene = await store.load(id)
    if (scene) this.assertAccess(scene)
    const command =
      options?.command ??
      this.commandEnvelope('rename_scene', {
        projectId: scene?.projectId ?? null,
        sceneId: id,
        baseRevision: options?.expectedVersion ?? scene?.version ?? null,
      })
    this.assertCommandContext(command)
    this.assertCommandTarget(command, {
      operation: 'rename_scene',
      projectId: scene?.projectId ?? null,
      sceneId: id,
      baseRevision: options?.expectedVersion ?? scene?.version ?? null,
    })
    return store.rename(id, newName, { ...options, command })
  }

  async appendSceneEvent(options: SceneEventAppendOptions): Promise<SceneEvent | null> {
    const store = this.requireStore()
    if (!store.appendSceneEvent) return null
    const scene = await store.load(options.sceneId)
    if (scene) this.assertAccess(scene)
    const command =
      options.command ??
      this.commandEnvelope(options.kind, {
        projectId: scene?.projectId ?? null,
        sceneId: options.sceneId,
        baseRevision: Math.max(0, options.version - 1),
      })
    this.assertCommandContext(command)
    this.assertCommandTarget(
      command,
      {
        operation: options.kind,
        projectId: scene?.projectId ?? null,
        sceneId: options.sceneId,
        baseRevision: Math.max(0, options.version - 1),
      },
      { allowMissingProject: true },
    )
    return store.appendSceneEvent({ ...options, command })
  }

  async listSceneEvents(id: string, options?: SceneEventListOptions): Promise<SceneEvent[]> {
    const store = this.requireStore()
    if (!store.listSceneEvents) {
      throw new Error('scene_events_unavailable')
    }
    const scene = await store.load(id)
    if (scene) this.assertAccess(scene)
    return store.listSceneEvents(id, options)
  }

  private assertAccess(subject: { ownerId: string | null; workspaceId?: string | null }): void {
    const workspaceId = this.context.workspaceId
    if (workspaceId !== null) {
      if ((subject.workspaceId ?? null) !== workspaceId) throw new SceneAccessDeniedError()
      return
    }
    const ownerId = this.context.ownerId
    if (ownerId !== null && subject.ownerId !== ownerId) {
      throw new SceneAccessDeniedError()
    }
    if (ownerId === null && this.context.actor.kind !== 'local') {
      throw new SceneAccessDeniedError()
    }
  }

  private assertCommandContext(command: CommandEnvelope): void {
    const context = this.context
    if (
      command.sessionId !== context.sessionId ||
      command.workspaceId !== context.workspaceId ||
      command.ownerId !== context.ownerId ||
      command.source !== context.source ||
      command.actor.kind !== context.actor.kind ||
      command.actor.id !== context.actor.id
    ) {
      throw new SceneAccessDeniedError('Command identity does not match the MCP session')
    }
  }

  private assertCommandTarget(
    command: CommandEnvelope,
    target: {
      operation: string
      projectId: string | null
      sceneId: string | null
      baseRevision: number | null
    },
    options: { allowMissingProject?: boolean; allowMissingScene?: boolean } = {},
  ): void {
    const projectMatches =
      command.projectId === target.projectId ||
      (options.allowMissingProject && command.projectId === null)
    const sceneMatches =
      command.sceneId === target.sceneId || (options.allowMissingScene && command.sceneId === null)
    if (
      command.operation !== target.operation ||
      !projectMatches ||
      !sceneMatches ||
      command.baseRevision !== target.baseRevision
    ) {
      throw new SceneAccessDeniedError('Command target does not match the requested mutation')
    }
  }

  private requireBridge(): SceneBridge {
    if (!this.#bridge) {
      throw new Error('scene_bridge_unavailable')
    }
    return this.#bridge
  }

  private requireStore(): SceneStore {
    if (!this.#store) {
      throw new Error('scene_store_unavailable')
    }
    return this.#store
  }
}
