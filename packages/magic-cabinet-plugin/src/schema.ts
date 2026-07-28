import { BaseNode, nodeType, objectId } from '@pascal-app/core'
import { z } from 'zod'

const Vec3 = z.tuple([z.number(), z.number(), z.number()])
const Rotation = Vec3

const BoxPrimitive = z.object({
  kind: z.literal('box'),
  dimensionsM: Vec3,
  positionM: Vec3,
  rotationRad: Rotation,
  materialKey: z.string(),
  color: z.string().optional(),
})

const PolygonPrismPrimitive = z.object({
  kind: z.literal('polygon-prism'),
  outlineM: z.array(z.tuple([z.number(), z.number()])),
  holesM: z.array(z.array(z.tuple([z.number(), z.number()]))).default([]),
  heightM: z.number().positive(),
  baseYM: z.number(),
  materialKey: z.string(),
  color: z.string().optional(),
})

const TriangleMeshPrimitive = z.object({
  kind: z.literal('triangle-mesh'),
  positionsM: z.array(z.number()),
  indices: z.array(z.number().int().nonnegative()),
  positionM: Vec3,
  rotationRad: Rotation,
  materialKey: z.string(),
  color: z.string().optional(),
})

export const MagicGeometryPrimitive = z.discriminatedUnion('kind', [
  BoxPrimitive,
  PolygonPrismPrimitive,
  TriangleMeshPrimitive,
])
export type MagicGeometryPrimitive = z.infer<typeof MagicGeometryPrimitive>

export const MagicCatalogIdentity = z.object({
  productId: z.string(),
  sku: z.string(),
  canonicalCode: z.string(),
  manufacturerCode: z.string(),
  finishCode: z.string(),
})

export const MagicCabinetLayoutNode = BaseNode.extend({
  id: objectId('magic-cabinet-layout'),
  type: nodeType('magic-cabinet:layout'),
  position: Vec3.default([0, 0, 0]),
  rotation: Rotation.default([0, 0, 0]),
  width: z.number().positive().default(4.1),
  depth: z.number().positive().default(0.6),
  counterHeight: z.number().positive().default(0.88),
  backsplashHeight: z.number().positive().default(0.6),
  engineVersion: z.string(),
  /** Opaque, exact renderer-neutral result used by MCP reconciliation. */
  engineResult: z.json(),
  engineState: z.json(),
  engineInput: z.json(),
  relationships: z.json(),
  diagnostics: z.json(),
  pinnedComponentIds: z.array(z.string()).default([]),
  componentIds: z.array(z.string()).default([]),
  validationState: z.enum(['valid', 'warning', 'error']).default('valid'),
  activePresentation: z
    .enum(['hero', 'workwall', 'detail', 'plan', 'elevation', 'breakaway'])
    .default('hero'),
  palette: z.enum(['sage-oak', 'oak-white', 'midnight', 'warm-minimal']).default('sage-oak'),
})
export type MagicCabinetLayoutNode = z.infer<typeof MagicCabinetLayoutNode>

export const MagicCabinetComponentNode = BaseNode.extend({
  id: objectId('magic-cabinet-component'),
  type: nodeType('magic-cabinet:component'),
  position: Vec3.default([0, 0, 0]),
  rotation: Rotation.default([0, 0, 0]),
  dimensions: Vec3.default([0.6, 0.88, 0.6]),
  layoutId: z.string(),
  engineComponentId: z.string(),
  componentKind: z.enum([
    'cabinet',
    'countertop',
    'appliance',
    'appliance-opening',
    'door',
    'window',
    'panel',
    'filler',
    'trim',
  ]),
  subtype: z.string(),
  wall: z.enum(['north', 'south', 'east', 'west', 'angled']).nullable(),
  geometry: z.array(MagicGeometryPrimitive).default([]),
  planOutline: z.array(z.tuple([z.number(), z.number()])).optional(),
  catalog: MagicCatalogIdentity.optional(),
  catalogState: z
    .enum(['catalog-product', 'render-only', 'pending', 'unresolved', 'error'])
    .optional(),
  manuallyPinned: z.boolean().default(false),
  finish: z.enum(['sage', 'oak', 'quartz', 'black', 'white']).default('sage'),
  handleStyle: z.enum(['bar', 'knob', 'edge', 'none']).default('bar'),
})
export type MagicCabinetComponentNode = z.infer<typeof MagicCabinetComponentNode>
