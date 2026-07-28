import {
  buildCommerceContext,
  type KitchenComponentEdit,
  type KitchenResult,
  type ReconcileKitchenRequest,
  reconcileKitchen,
  validateKitchen,
} from '@magic-cabinet/engine'
import {
  adaptKitchenResult,
  createMagicKitchenPilotScene,
  getMagicPilotPresentation,
  MagicCabinetComponentNode,
  MagicCabinetLayoutNode,
  type MagicCabinetComponentNode as MagicComponent,
  type MagicCabinetLayoutNode as MagicLayout,
  type MagicPresentationId,
  magicCabinetPlugin,
} from '@magic-cabinet/pascal-plugin'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { nodeRegistry, registerNode } from '@pascal-app/core/registry'
import type { AnyNode, AnyNodeId } from '@pascal-app/core/schema'
import { z } from 'zod'
import type { SceneOperations } from '../operations'
import { ErrorCode, throwMcpError } from './errors'
import { publishLiveSceneSnapshot } from './live-sync'

const presentationSchema = z.enum(['hero', 'workwall', 'detail', 'plan', 'elevation', 'breakaway'])
const paletteSchema = z.enum(['sage-oak', 'oak-white', 'midnight', 'warm-minimal'])
const handleSchema = z.enum(['bar', 'knob', 'edge', 'none'])

type Palette = z.infer<typeof paletteSchema>

const roomPatchSchema = z
  .object({
    layout: z.enum(['galley', 'l-shape', 'u-shape', 'one-wall']).optional(),
    widthIn: z.number().positive().optional(),
    depthIn: z.number().positive().optional(),
    ceilingHeightIn: z.number().positive().optional(),
    island: z.boolean().optional(),
    peninsula: z.boolean().optional(),
    dishwasher: z.boolean().optional(),
  })
  .optional()

const componentEditSchema = z.object({
  positionIn: z
    .object({
      x: z.number().optional(),
      y: z.number().optional(),
      z: z.number().optional(),
    })
    .optional(),
  rotationYDeg: z.number().optional(),
  wall: z.enum(['north', 'south', 'east', 'west']).nullable().optional(),
})

function ensureMagicDefinitions(): void {
  for (const definition of magicCabinetPlugin.nodes ?? []) {
    if (!nodeRegistry.has(definition.kind)) registerNode(definition)
  }
}

function findLayout(operations: SceneOperations): MagicLayout {
  const node = (Object.values(operations.getNodes()) as unknown[]).find(
    (candidate) => (candidate as { type?: string }).type === 'magic-cabinet:layout',
  )
  if (!node) {
    throwMcpError(
      ErrorCode.InvalidRequest,
      'magic_kitchen_not_started: call start_magic_kitchen_session first',
    )
  }
  return MagicCabinetLayoutNode.parse(node)
}

function componentsForLayout(operations: SceneOperations, layoutId: string): MagicComponent[] {
  return (Object.values(operations.getNodes()) as unknown[])
    .filter(
      (node) =>
        (node as { type?: string }).type === 'magic-cabinet:component' &&
        (node as unknown as MagicComponent).layoutId === layoutId,
    )
    .map((node) => MagicCabinetComponentNode.parse(node))
}

function componentFinish(component: MagicComponent, palette: Palette): MagicComponent['finish'] {
  if (component.componentKind === 'appliance' || component.componentKind === 'appliance-opening') {
    return 'black'
  }
  if (component.componentKind === 'countertop') return 'quartz'

  const wallMounted = component.subtype.includes('wall') || component.position[1] > 1.2
  if (palette === 'midnight') return 'black'
  if (palette === 'oak-white') return wallMounted ? 'white' : 'oak'
  if (palette === 'warm-minimal') return wallMounted ? 'oak' : 'white'
  return wallMounted ? 'sage' : 'oak'
}

function palettePatches(
  operations: SceneOperations,
  layout: MagicLayout,
  palette: Palette,
): Array<{ op: 'update'; id: AnyNodeId; data: Partial<AnyNode> }> {
  return [
    {
      op: 'update',
      id: layout.id as AnyNodeId,
      data: { palette } as unknown as Partial<AnyNode>,
    },
    ...componentsForLayout(operations, layout.id).map((component) => ({
      op: 'update' as const,
      id: component.id as AnyNodeId,
      data: { finish: componentFinish(component, palette) } as unknown as Partial<AnyNode>,
    })),
  ]
}

function pinnedEdits(
  layout: MagicLayout,
  components: MagicComponent[],
  pinnedIds: readonly string[],
): Record<string, KitchenComponentEdit> {
  const edits: Record<string, KitchenComponentEdit> = {}
  const metersToInches = 1 / 0.0254
  const pinned = new Set(pinnedIds)
  for (const component of components) {
    if (!pinned.has(component.engineComponentId)) continue
    edits[component.engineComponentId] = {
      positionIn: {
        x: (component.position[0] - layout.position[0]) * metersToInches,
        y: (component.position[1] - layout.position[1]) * metersToInches,
        z: -(component.position[2] - layout.position[2]) * metersToInches,
      },
      rotationYDeg: -(component.rotation[1] * 180) / Math.PI,
      wall: component.wall === 'angled' ? null : component.wall,
    }
  }
  return edits
}

function movedComponentIds(
  layout: MagicLayout,
  components: MagicComponent[],
  previous: KitchenResult,
): string[] {
  const expected = adaptKitchenResult(previous, {
    parentId: layout.parentId ?? '',
    roomOrigin: layout.position,
    invertZ: true,
  })
  const expectedByEngineId = new Map(
    expected.components.map((component) => [component.engineComponentId, component]),
  )
  const moved: string[] = []
  for (const component of components) {
    const baseline = expectedByEngineId.get(component.engineComponentId)
    if (!baseline) continue
    const positionDelta = Math.max(
      ...component.position.map((value, index) => Math.abs(value - baseline.position[index]!)),
    )
    const rotationDelta = Math.max(
      ...component.rotation.map((value, index) => Math.abs(value - baseline.rotation[index]!)),
    )
    if (positionDelta > 0.001 || rotationDelta > Math.PI / 360) {
      moved.push(component.engineComponentId)
    }
  }
  return moved
}

function replaceKitchen(
  operations: SceneOperations,
  layout: MagicLayout,
  result: KitchenResult,
): { layout: MagicLayout; components: MagicComponent[] } {
  const previousComponents = componentsForLayout(operations, layout.id)
  const previousByEngineId = new Map(
    previousComponents.map((component) => [component.engineComponentId, component]),
  )
  const adapted = adaptKitchenResult(result, {
    parentId: layout.parentId ?? '',
    roomOrigin: layout.position,
    invertZ: true,
  })

  const nextComponents = adapted.components.map((component) => {
    const previous = previousByEngineId.get(component.engineComponentId)
    return MagicCabinetComponentNode.parse({
      ...component,
      ...(previous ? { id: previous.id, handleStyle: previous.handleStyle } : {}),
      layoutId: layout.id,
    })
  })
  const nextLayout = MagicCabinetLayoutNode.parse({
    ...adapted.layout,
    id: layout.id,
    parentId: layout.parentId,
    position: layout.position,
    rotation: layout.rotation,
    activePresentation: layout.activePresentation,
    palette: layout.palette,
    componentIds: nextComponents.map((component) => component.id),
  })

  const nextIds = new Set(nextComponents.map((component) => component.id))
  const patches: Array<
    | { op: 'create'; node: AnyNode; parentId?: AnyNodeId }
    | { op: 'update'; id: AnyNodeId; data: Partial<AnyNode> }
    | { op: 'delete'; id: AnyNodeId; cascade?: boolean }
  > = []

  for (const previous of previousComponents) {
    if (!nextIds.has(previous.id)) {
      patches.push({ op: 'delete', id: previous.id as AnyNodeId })
    }
  }
  for (const component of nextComponents) {
    if (previousComponents.some((previous) => previous.id === component.id)) {
      patches.push({
        op: 'update',
        id: component.id as AnyNodeId,
        data: component as unknown as Partial<AnyNode>,
      })
    } else {
      patches.push({
        op: 'create',
        node: component as unknown as AnyNode,
        parentId: (layout.parentId ?? undefined) as AnyNodeId | undefined,
      })
    }
  }
  patches.push({
    op: 'update',
    id: layout.id as AnyNodeId,
    data: nextLayout as unknown as Partial<AnyNode>,
  })

  if (layout.parentId) {
    const parent = operations.getNode(layout.parentId as AnyNodeId)
    if (parent?.type === 'level') {
      const previousIds = new Set<string>(previousComponents.map((component) => component.id))
      const children = (parent.children as unknown as string[]).filter((id) => !previousIds.has(id))
      if (!children.includes(layout.id)) children.push(layout.id)
      for (const component of nextComponents) {
        if (!children.includes(component.id)) {
          children.push(component.id)
        }
      }
      patches.push({
        op: 'update',
        id: parent.id,
        data: { children } as Partial<AnyNode>,
      })
    }
  }

  operations.applyPatch(patches)
  operations.applyPatch(palettePatches(operations, nextLayout, nextLayout.palette))
  return {
    layout: MagicCabinetLayoutNode.parse(operations.getNode(layout.id as AnyNodeId)),
    components: componentsForLayout(operations, layout.id),
  }
}

function toolResult(payload: Record<string, unknown>) {
  return {
    content: [{ type: 'text' as const, text: JSON.stringify(payload) }],
    structuredContent: payload,
  }
}

export function registerMagicKitchenTools(server: McpServer, operations: SceneOperations): void {
  ensureMagicDefinitions()

  server.registerTool(
    'start_magic_kitchen_session',
    {
      title: 'Start Magic Kitchen session',
      description:
        'Instantiate the roofless 12 m × 9 m Magic Kitchen House with a deterministic 4.10 m cabinet run, native doors and rooms, 2D floor plan, and showroom camera presets.',
      inputSchema: {
        name: z.string().min(1).max(200).default('Magic Kitchen House'),
        isPrivate: z.boolean().default(true),
        presentation: presentationSchema.default('hero'),
        palette: paletteSchema.default('sage-oak'),
      },
    },
    async ({ name, isPrivate, presentation, palette }) => {
      const scene = createMagicKitchenPilotScene()
      const rawLayout = (Object.values(scene.nodes) as unknown[]).find(
        (node) => (node as { type?: string }).type === 'magic-cabinet:layout',
      )
      if (!rawLayout) {
        throwMcpError(ErrorCode.InternalError, 'pilot_template_missing_layout')
      }
      const layout = MagicCabinetLayoutNode.parse({
        ...(rawLayout as Record<string, unknown>),
        activePresentation: presentation,
        palette,
      })
      scene.nodes[layout.id as AnyNodeId] = layout as unknown as AnyNode
      operations.loadJSON(scene)
      operations.applyPatch(palettePatches(operations, layout, palette))

      const validation = operations.validateScene()
      if (!validation.valid) {
        throwMcpError(ErrorCode.InternalError, 'pilot_scene_invalid', {
          errors: validation.errors,
        })
      }

      let sceneId: string | null = null
      let projectId: string | null = null
      let editorUrl: string | null = null
      let version: number | null = null
      if (operations.hasStore) {
        let ownerId: string | null = null
        if (operations.canCreateProject) {
          const project = await operations.createProject({ name, isPrivate })
          sceneId = project.id
          projectId = project.projectId
          ownerId = project.ownerId
        }
        const graph = operations.exportSceneGraph()
        const { meta } = await operations.commitScene({
          ...(sceneId ? { id: sceneId } : {}),
          name,
          projectId,
          ownerId,
          graph,
          saveMode: 'draft',
          publish: false,
          operation: 'start_magic_kitchen_session',
          eventKind: 'start_magic_kitchen_session',
        })
        operations.setActiveScene(meta)
        sceneId = meta.id
        projectId = meta.projectId
        editorUrl = meta.editorUrl ?? meta.url ?? `/scene/${meta.id}`
        version = meta.version
      }

      return toolResult({
        sceneId,
        projectId,
        editorUrl,
        version,
        layoutId: layout.id,
        componentCount: componentsForLayout(operations, layout.id).length,
        presentation,
        palette,
        valid: true,
      })
    },
  )

  server.registerTool(
    'update_magic_kitchen',
    {
      title: 'Update Magic Kitchen',
      description:
        'Reconcile the active Magic kitchen through the deterministic engine while preserving explicitly pinned cabinet transforms.',
      inputSchema: {
        room: roomPatchSchema,
        seed: z.number().int().nonnegative().optional(),
        allowedSpecIds: z.array(z.string().min(1)).optional(),
        componentEdits: z.record(z.string(), componentEditSchema).optional(),
        pinnedComponentIds: z.array(z.string().min(1)).optional(),
      },
    },
    async ({ room, seed, allowedSpecIds, componentEdits, pinnedComponentIds }) => {
      const layout = findLayout(operations)
      const previous = layout.engineResult as unknown as KitchenResult
      const currentComponents = componentsForLayout(operations, layout.id)
      const pinned =
        pinnedComponentIds ??
        Array.from(
          new Set([
            ...layout.pinnedComponentIds,
            ...movedComponentIds(layout, currentComponents, previous),
          ]),
        )
      const request: ReconcileKitchenRequest = {
        ...(room ? { room } : {}),
        ...(seed !== undefined ? { seed } : {}),
        ...(allowedSpecIds ? { allowedSpecIds } : {}),
        componentEdits: {
          ...pinnedEdits(layout, currentComponents, pinned),
          ...(componentEdits as Record<string, KitchenComponentEdit> | undefined),
        },
      }
      const result = reconcileKitchen(previous, request, pinned)
      const validation = validateKitchen(result)
      const replaced = replaceKitchen(operations, layout, result)
      await publishLiveSceneSnapshot(operations, 'update_magic_kitchen')
      return toolResult({
        layoutId: replaced.layout.id,
        componentCount: replaced.components.length,
        pinnedComponentIds: result.pinnedComponentIds,
        valid: validation.valid,
        commerceReady: validation.commerceReady,
        issues: validation.issues,
        version: operations.getActiveScene()?.version ?? null,
      })
    },
  )

  server.registerTool(
    'set_kitchen_palette',
    {
      title: 'Set kitchen palette',
      description:
        'Apply a curated Magic Cabinet finish palette to the active deterministic kitchen.',
      inputSchema: { palette: paletteSchema },
    },
    async ({ palette }) => {
      const layout = findLayout(operations)
      const patches = palettePatches(operations, layout, palette)
      operations.applyPatch(patches)
      await publishLiveSceneSnapshot(operations, 'set_kitchen_palette')
      return toolResult({
        layoutId: layout.id,
        palette,
        updatedComponents: patches.length - 1,
        version: operations.getActiveScene()?.version ?? null,
      })
    },
  )

  server.registerTool(
    'set_kitchen_handles',
    {
      title: 'Set kitchen handles',
      description: 'Set the handle style on every cabinet component in the active Magic kitchen.',
      inputSchema: { handleStyle: handleSchema },
    },
    async ({ handleStyle }) => {
      const layout = findLayout(operations)
      const cabinets = componentsForLayout(operations, layout.id).filter(
        (component) => component.componentKind === 'cabinet',
      )
      operations.applyPatch(
        cabinets.map((component) => ({
          op: 'update' as const,
          id: component.id as AnyNodeId,
          data: { handleStyle } as unknown as Partial<AnyNode>,
        })),
      )
      await publishLiveSceneSnapshot(operations, 'set_kitchen_handles')
      return toolResult({
        layoutId: layout.id,
        handleStyle,
        updatedComponents: cabinets.length,
        version: operations.getActiveScene()?.version ?? null,
      })
    },
  )

  server.registerTool(
    'set_kitchen_camera',
    {
      title: 'Set kitchen camera',
      description:
        'Trigger one authored showroom move. The camera travels smoothly, then returns free navigation to the visitor.',
      inputSchema: { presentation: presentationSchema },
    },
    async ({ presentation }) => {
      const layout = findLayout(operations)
      operations.applyPatch([
        {
          op: 'update',
          id: layout.id as AnyNodeId,
          data: { activePresentation: presentation } as unknown as Partial<AnyNode>,
        },
      ])
      await publishLiveSceneSnapshot(operations, 'set_kitchen_camera')
      const preset = getMagicPilotPresentation(presentation as MagicPresentationId)
      return toolResult({
        layoutId: layout.id,
        presentation,
        viewMode: preset.viewMode,
        sceneTheme: preset.sceneTheme,
        wallMode: preset.wallMode,
        pose: preset.pose,
        version: operations.getActiveScene()?.version ?? null,
      })
    },
  )

  server.registerTool(
    'get_kitchen_bom',
    {
      title: 'Get kitchen BOM',
      description:
        'Return canonical catalog identities for a server-authoritative quote. This tool never computes payable client prices.',
      inputSchema: {},
    },
    async () => {
      const layout = findLayout(operations)
      const context = buildCommerceContext(layout.engineResult as unknown as KitchenResult)
      return toolResult({
        layoutId: layout.id,
        pricingAuthority: 'server',
        requiresServerQuote: true,
        commerceReady: context !== null,
        manufacturerCode: context?.manufacturerCode ?? null,
        finishCode: context?.finishCode ?? null,
        items: context?.items ?? [],
        reason: context ? null : 'Catalog identities are incomplete; resolve through Magic API.',
      })
    },
  )

  server.registerTool(
    'validate_magic_kitchen_session',
    {
      title: 'Validate Magic Kitchen session',
      description:
        'Validate deterministic engine geometry, catalog readiness, and the complete Pascal scene graph.',
      inputSchema: {},
    },
    async () => {
      const layout = findLayout(operations)
      const engine = validateKitchen(layout.engineResult as unknown as KitchenResult)
      const scene = operations.validateScene()
      return toolResult({
        layoutId: layout.id,
        valid: engine.valid && scene.valid,
        engine: {
          valid: engine.valid,
          geometryValid: engine.geometryValid,
          sceneValid: engine.sceneValid,
          commerceReady: engine.commerceReady,
          issues: engine.issues,
        },
        pascal: scene,
      })
    },
  )
}
