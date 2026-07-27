import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import type { AnyNode, AnyNodeId } from '@pascal-app/core/schema'
import { CabinetModuleNode, CabinetNode } from '@pascal-app/core/schema'
import { z } from 'zod'
import type { SceneOperations } from '../operations'
import { ErrorCode, throwMcpError } from './errors'
import { publishLiveSceneSnapshot } from './live-sync'
import { measurement } from './measurement'
import { NodeIdSchema, Vec3Schema } from './schemas'

const cabinetModuleKind = z.enum(['door', 'drawers', 'sink', 'dishwasher', 'cooktop', 'open'])

const cabinetModuleSpec = z.object({
  width: measurement('length', 'm', {
    min: 0.2,
    max: 1.5,
    description: 'Module width.',
  }),
  kind: cabinetModuleKind.default('door'),
})

export const createCabinetRunInput = {
  levelId: NodeIdSchema,
  name: z.string().min(1).max(120).default('Magic Cabinet Surface'),
  position: Vec3Schema.default([0, 0, 0]),
  rotation: measurement('angle', 'rad', {
    description: 'Run rotation around the Y axis.',
  }).default(0),
  modules: z
    .array(cabinetModuleSpec)
    .min(1)
    .max(12)
    .default([
      { width: 0.6, kind: 'door' },
      { width: 0.6, kind: 'drawers' },
      { width: 0.6, kind: 'door' },
    ]),
  depth: measurement('length', 'm', {
    min: 0.3,
    max: 1.2,
    description: 'Cabinet carcass depth.',
  }).default(0.6),
  carcassHeight: measurement('length', 'm', {
    min: 0.4,
    max: 2.4,
    description: 'Cabinet carcass height above the plinth.',
  }).default(0.72),
  plinthHeight: measurement('length', 'm', {
    min: 0,
    max: 0.3,
    description: 'Plinth height below the modules.',
  }).default(0.1),
  countertopThickness: measurement('length', 'm', {
    min: 0.01,
    max: 0.08,
    description: 'Derived countertop surface thickness.',
  }).default(0.03),
  countertopOverhang: measurement('length', 'm', {
    min: 0,
    max: 0.12,
    description: 'Countertop front and exposed-end overhang.',
  }).default(0.03),
  island: z.boolean().default(false),
  seatingOverhang: measurement('length', 'm', {
    min: 0,
    max: 0.45,
    description: 'Extra countertop depth on the finished back of an island.',
  }).default(0.3),
  withWaterfall: z.boolean().default(false),
  frontStyle: z.enum(['slab', 'shaker', 'raised-arch']).default('slab'),
  handleStyle: z.enum(['none', 'bar', 'cutout', 'hole', 'knob']).default('bar'),
  materialPreset: z.string().min(1).max(120).optional(),
}

export const createCabinetRunOutput = {
  runId: z.string(),
  moduleIds: z.array(z.string()),
  totalWidth: z.number(),
  surfaceHeight: z.number(),
  surfaceDepth: z.number(),
  moduleCount: z.number(),
}

type ModuleKind = z.infer<typeof cabinetModuleKind>

function compartmentStack(kind: ModuleKind, index: number) {
  const id = `magic-cabinet-${index + 1}`
  switch (kind) {
    case 'drawers':
      return [{ id, type: 'drawer' as const, drawerCount: 3 }]
    case 'sink':
      return [{ id, type: 'sink' as const, sinkLayout: 'single' as const }]
    case 'dishwasher':
      return [{ id, type: 'dishwasher' as const }]
    case 'cooktop':
      return [
        {
          id,
          type: 'cooktop-induction' as const,
          cooktopLayout: 'induction-4zone' as const,
        },
      ]
    case 'open':
      return [{ id, type: 'shelf' as const, shelfCount: 2 }]
    default:
      return [{ id, type: 'door' as const, doorType: 'double' as const, shelfCount: 1 }]
  }
}

export function registerCabinetTools(server: McpServer, bridge: SceneOperations): void {
  server.registerTool(
    'create_cabinet_run',
    {
      title: 'Create cabinet run',
      description:
        'Create one parametric base-cabinet run with contiguous modules and a renderer-derived countertop surface. Supports doors, drawers, sinks, dishwashers, cooktops, open shelves, islands, seating overhangs, and waterfall ends.',
      inputSchema: createCabinetRunInput,
      outputSchema: createCabinetRunOutput,
    },
    async ({
      levelId,
      name,
      position,
      rotation,
      modules,
      depth,
      carcassHeight,
      plinthHeight,
      countertopThickness,
      countertopOverhang,
      island,
      seatingOverhang,
      withWaterfall,
      frontStyle,
      handleStyle,
      materialPreset,
    }) => {
      const parent = bridge.getNode(levelId as AnyNodeId)
      if (!parent) {
        throwMcpError(ErrorCode.InvalidParams, `Level not found: ${levelId}`)
      }
      if (parent.type !== 'level') {
        throwMcpError(
          ErrorCode.InvalidParams,
          `Node ${levelId} is a ${parent.type}, expected level`,
        )
      }
      if (
        typeof parent.metadata === 'object' &&
        parent.metadata !== null &&
        'role' in parent.metadata &&
        parent.metadata.role === 'roof'
      ) {
        throwMcpError(
          ErrorCode.InvalidParams,
          `Roof support level ${levelId} is not an occupied story; create cabinets on an occupied level instead`,
        )
      }

      const run = CabinetNode.parse({
        name,
        parentId: levelId,
        position: position as [number, number, number],
        rotation,
        runTier: 'base',
        depth,
        carcassHeight,
        plinthHeight,
        countertopThickness,
        countertopOverhang,
        countertopBackOverhang: island ? seatingOverhang : 0,
        withFinishedBack: island,
        withWaterfall,
        frontStyle,
        handleStyle,
        ...(materialPreset !== undefined ? { materialPreset } : {}),
        metadata: {
          mcpTool: 'create_cabinet_run',
          surfaceRole: 'cabinet-worktop',
        },
      })

      const totalWidth = modules.reduce((sum, module) => sum + module.width, 0)
      let cursor = -totalWidth / 2
      const moduleNodes = modules.map((module, index) => {
        const localX = cursor + module.width / 2
        cursor += module.width
        return CabinetModuleNode.parse({
          name: `${name} ${index + 1}`,
          parentId: run.id,
          position: [localX, plinthHeight, 0],
          width: module.width,
          depth,
          carcassHeight,
          plinthHeight,
          countertopThickness,
          countertopOverhang,
          showPlinth: false,
          withCountertop: false,
          frontStyle,
          handleStyle,
          stack: compartmentStack(module.kind, index),
          ...(materialPreset !== undefined ? { materialPreset } : {}),
          metadata: {
            mcpTool: 'create_cabinet_run',
            moduleIndex: index,
            moduleKind: module.kind,
          },
        })
      })

      const patches = [
        { op: 'create' as const, node: run as AnyNode, parentId: levelId as AnyNodeId },
        ...moduleNodes.map((node) => ({
          op: 'create' as const,
          node: node as AnyNode,
          parentId: run.id as AnyNodeId,
        })),
      ]

      try {
        bridge.applyPatch(patches)
        await publishLiveSceneSnapshot(bridge, 'create_cabinet_run')
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        throwMcpError(ErrorCode.InvalidParams, message)
      }

      const surfaceDepth = depth + countertopOverhang + (island ? seatingOverhang : 0)
      const payload = {
        runId: run.id as string,
        moduleIds: moduleNodes.map((node) => node.id as string),
        totalWidth,
        surfaceHeight: plinthHeight + carcassHeight + countertopThickness,
        surfaceDepth,
        moduleCount: moduleNodes.length,
      }
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(payload) }],
        structuredContent: payload,
      }
    },
  )
}
