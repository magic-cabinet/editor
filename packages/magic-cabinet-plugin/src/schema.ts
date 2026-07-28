import { BaseNode, nodeType, objectId } from '@pascal-app/core'
import { z } from 'zod'
import {
  BACKSPLASH_MATERIALS,
  CABINET_TEXTURES,
  COUNTERTOP_MATERIALS,
  DOOR_STYLES,
  FLOOR_TYPES,
} from './style'

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

/**
 * The style knobs the Babylon designer owns and the deterministic engine has
 * no field for. Shared verbatim between the layout node (where the user edits
 * them, kitchen-wide) and every component node (where the geometry builder
 * reads them, per-node). The layout's `reconcile` pushes an edit down to the
 * components in the same gesture — see `parametrics.ts`.
 */
export const MagicKitchenStyle = {
  doorStyle: z.enum(DOOR_STYLES).default('slab'),
  cabinetTexture: z.enum(CABINET_TEXTURES).default('none'),
  countertopMaterial: z.enum(COUNTERTOP_MATERIALS).default('quartz'),
  /**
   * Draw appliances with Pascal's own parametric builders (real fridge doors,
   * hobs, faucets) instead of the engine's grey box. Off restores the box,
   * which is what a BOM screenshot wants — the engine's dimensions are
   * authoritative either way, they are what size the appliance.
   */
  applianceDetail: z.boolean().default(true),
} as const

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
  // Designer style. The layout owns the kitchen-wide value; the three shared
  // keys are mirrored onto every component so geometry stays a pure function
  // of its own node (`GeometrySystem` only re-runs a builder for the node it
  // marked dirty, so reading these off the layout would not rebuild).
  ...MagicKitchenStyle,
  floorType: z.enum(FLOOR_TYPES).default('hardwood'),
  backsplashMaterial: z.enum(BACKSPLASH_MATERIALS).default('white-metro-tile'),
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
  ...MagicKitchenStyle,
  /**
   * Per-surface paint overrides, `slotId → MaterialRef`. Written by Pascal's
   * own painter through `capabilities.paint`, and resolved in `def.geometry`
   * against `ctx.materials` — a `scene:<id>` material the painter minted, a
   * `library:<id>` catalog finish, or a flat `#rrggbb`.
   *
   * Absent by default, and an absent or dangling slot falls back to the
   * ported MVP finish. So the kitchen still ships looking like Magic Cabinet;
   * this only records where a human disagreed. See `slots.ts`.
   */
  slots: z.record(z.string(), z.string()).optional(),
})
export type MagicCabinetComponentNode = z.infer<typeof MagicCabinetComponentNode>
