import type {
  BoxGeometry,
  GeometryPrimitive,
  KitchenComponent,
  KitchenResult,
  PolygonPrismGeometry,
  TriangleMeshGeometry,
} from '@magic-cabinet/engine'
import type { AnyNodeId } from '@pascal-app/core'
import {
  MagicCabinetComponentNode,
  MagicCabinetLayoutNode,
  type MagicGeometryPrimitive,
} from './schema'

const INCH_TO_METER = 0.0254

export type MagicKitchenPlacement = {
  parentId: AnyNodeId | string
  roomOrigin: [number, number, number]
  invertZ?: boolean
}

export type AdaptedMagicKitchen = {
  layout: MagicCabinetLayoutNode
  components: MagicCabinetComponentNode[]
}

function meters(value: number): number {
  return value * INCH_TO_METER
}

function jsonValue(value: unknown): unknown {
  return JSON.parse(JSON.stringify(value))
}

function rotationRad(
  value: { x: number; y: number; z: number },
  invertZ: boolean,
): [number, number, number] {
  const d = Math.PI / 180
  return [value.x * d, (invertZ ? -value.y : value.y) * d, value.z * d]
}

/**
 * The corner an engine component's local frame rotates about, in room-world
 * inches — which is NOT `transform.positionIn` for an appliance.
 *
 * The engine carries two anchor conventions, and reading one across put every
 * appliance a full footprint into the room:
 *
 *   - A **cabinet** is corner-anchored in its own frame. `positionIn` is the
 *     corner the yaw turns the `x ∈ [0, W], z ∈ [0, D]` footprint about, so an
 *     east-wall cabinet at yaw 270 grows to -x, away from the wall it stands
 *     on (`mvp .../lib/layout/countertops.ts:19 getCabinetBounds`).
 *   - An **appliance** is anchored on the world axis-aligned MINIMUM corner,
 *     and its extents swap on a quarter turn — the yaw orients the model
 *     without being applied to the anchor offset
 *     (`countertops.ts:43 getFridgeBounds`, and again in
 *     `components/kitchen/appliance-render-plan.ts:80-82`).
 *
 * The MVP never has to reconcile them because it never draws the engine's
 * appliance box: it drops a GLB at the centre that second rule gives. The
 * mismatch is invisible upstream and only bites a renderer that places the
 * component frame itself, like ours.
 *
 * So convert once, here, and let the rest of the adapter stay on one
 * convention. Solving `getCabinetBounds(anchor) === getFridgeBounds(component)`
 * for the anchor gives a per-corner shift that the `Math.min` form below
 * expresses for any yaw (it is the AABB-minimum of the rotated footprint):
 *
 *     yaw       0      90        180             270
 *     shift     none   z += W    x += W, z += D  x += D
 *
 * Checked against the solver's own output for the default kitchen — every one
 * exact, in inches, against `getFridgeBounds`:
 *
 *     refrigerator  yaw 270  x[ 90.50, 120.50]  z[ 0.00,  36.00]
 *     range         yaw 270  x[ 94.00, 120.50]  z[51.00,  81.00]
 *     hood          yaw 270  x[100.50, 120.50]  z[51.00,  81.00]
 *     sink          yaw 180  x[ 36.00,  66.00]  z[96.00, 118.00]
 *
 * `appliance-opening` is deliberately NOT included. It is a gap the cabinet run
 * leaves rather than a placed appliance, and `KitchenAssembly.tsx:535` routes
 * it through `getCabinetBounds` — the dishwasher lands in its 24in slot at
 * x ∈ [12, 36] only under the cabinet rule.
 */
function componentAnchorIn(component: KitchenComponent): { x: number; y: number; z: number } {
  const p = component.transform.positionIn
  const shift = applianceAnchorShiftIn(
    component.kind,
    component.dimensionsIn,
    component.transform.rotationDeg.y,
  )
  return { x: p.x + shift.x, y: p.y, z: p.z + shift.z }
}

/**
 * The shift `componentAnchorIn` applies, in engine inches, exported so anything
 * writing a node position back to the engine can undo it.
 *
 * `pinnedEdits` (`packages/mcp .../magic-kitchen-tools.ts`) hands a dragged or
 * pinned node's world position straight back as `positionIn`. Without the
 * inverse there, every `update_magic_kitchen` on an appliance walks it another
 * footprint — the shift compounds on each round trip.
 *
 * Zero for every other kind, so callers do not have to branch.
 */
export function applianceAnchorShiftIn(
  componentKind: string,
  dimensionsIn: { x: number; z: number },
  rotationYDeg: number,
): { x: number; z: number } {
  if (componentKind !== 'appliance') return { x: 0, z: 0 }
  const theta = (rotationYDeg * Math.PI) / 180
  const cos = Math.cos(theta)
  const sin = Math.sin(theta)
  const width = dimensionsIn.x
  const depth = dimensionsIn.z
  return {
    x: -(Math.min(0, width * cos) + Math.min(0, depth * sin)),
    z: -(Math.min(0, -width * sin) + Math.min(0, depth * cos)),
  }
}

/**
 * Engine points that are already in room-world inches — `space: 'world'`
 * primitives and `planOutlineIn` — carry the component yaw baked in. The
 * Pascal node re-applies that yaw to its children (`<group rotation>` in 3D,
 * `rotate(-yaw)` in the floor plan), so a world point has to be un-rotated
 * back into the component frame first or the rotation lands twice. Only
 * asymmetric shapes show the difference: a centred box maps onto itself.
 */
function worldToComponentLocal(
  point: { x: number; z: number },
  component: KitchenComponent,
): { x: number; z: number } {
  const c = componentAnchorIn(component)
  const theta = (component.transform.rotationDeg.y * Math.PI) / 180
  const dx = point.x - c.x
  const dz = point.z - c.z
  return {
    x: dx * Math.cos(theta) - dz * Math.sin(theta),
    z: dx * Math.sin(theta) + dz * Math.cos(theta),
  }
}

function componentPosition(
  component: KitchenComponent,
  roomOrigin: [number, number, number],
  invertZ: boolean,
): [number, number, number] {
  const p = componentAnchorIn(component)
  return [
    roomOrigin[0] + meters(p.x),
    roomOrigin[1] + meters(p.y),
    roomOrigin[2] + meters(invertZ ? -p.z : p.z),
  ]
}

/**
 * Some components arrive as their whole envelope in one box sitting at the
 * component-local origin (`packages/engine .../index.ts:404`) — but a box's
 * transform is its CENTRE everywhere else in this contract, and the component
 * frame is corner-anchored (`appliances.ts:180 nativeFrame` builds against
 * `x ∈ [0, W]`, `y ∈ [0, H]`). Taken literally, a 66in refrigerator renders
 * `y ∈ [-33, +33]`: half of it below the floor, and half a footprint out of
 * the wall it is supposed to stand against, and the island slab lands half its
 * own width to one side of the island it belongs on. Babylon reads the same
 * `positionIn` as a min corner in X/Z — `KitchenAssembly.tsx:855-859` centres
 * the box at `position.x + width / 2`, `position.z + depth / 2` — so corner in
 * X/Z is not a guess either.
 *
 * `WHOLE_BOX_VERTICAL_ANCHOR` says which face of the box `positionIn.y` names,
 * because the engine does not use one rule. The reference is the Babylon
 * renderer at the engine's provenance commit (`69ac3d37`), NOT the engine's own
 * export — see `adaptPolygon` for why that distinction matters.
 *
 *   - `bottom` — a floor-standing appliance is at `positionIn.y = 0`, and the
 *     hood at 66in is the underside of its canopy.
 *   - `bottom` — the `countertop` island slab is at 34.5in for a 1.5in box, and
 *     34.5in is the top of the base cabinets, not the top of the slab.
 *     `KitchenAssembly.tsx:857` centres that same box at
 *     `position.y + thickness / 2`, and its comment says so outright: "y is top
 *     of base cabinets + half thickness". So the slab spans 34.5..36.0in — the
 *     36in finished counter height — seated ON the 34.5in cabinet run.
 *   - `top` — the `sink` is at 34.5in for an 8in box, and by the rule above
 *     34.5in is now the countertop's UNDERSIDE. Hanging the envelope down from
 *     there is an undermount basin dropping into the sink base, which is what
 *     the opening the engine cuts for it (`holesIn`, the sink footprint inset
 *     0.5in per side) is for. Bottom-up would be a basin standing on the
 *     worktop next to its own unused hole.
 *
 * Narrow on purpose: it fires only for the exact shape observed — the whole
 * component, in component-local space, at the origin. `panel` is deliberately
 * absent even though every island panel has that shape: a panel's `positionIn`
 * really is its centre (an island panel is at `y = 17.25` for a 34.5in box), so
 * re-seating one would break what already renders correctly.
 */
const WHOLE_BOX_VERTICAL_ANCHOR: Record<string, 'top' | 'bottom'> = {
  appliance: 'bottom',
  'appliance:sink': 'top',
  countertop: 'bottom',
}

function wholeBoxVerticalAnchor(component: KitchenComponent): 'top' | 'bottom' | undefined {
  return (
    WHOLE_BOX_VERTICAL_ANCHOR[`${component.kind}:${component.subtype}`] ??
    WHOLE_BOX_VERTICAL_ANCHOR[component.kind]
  )
}

function isWholeComponentBoxAtOrigin(primitive: BoxGeometry, component: KitchenComponent): boolean {
  if (primitive.space !== 'component-local') return false
  const p = primitive.transform.positionIn
  if (p.x !== 0 || p.y !== 0 || p.z !== 0) return false
  const d = primitive.dimensionsIn
  const e = component.dimensionsIn
  return d.x === e.x && d.y === e.y && d.z === e.z
}

function primitiveLocalPosition(
  primitive: BoxGeometry | TriangleMeshGeometry,
  component: KitchenComponent,
  invertZ: boolean,
): [number, number, number] {
  const p = primitive.transform.positionIn
  const c = componentAnchorIn(component)
  const local = primitive.space === 'world' ? worldToComponentLocal(p, component) : p
  const y = primitive.space === 'world' ? p.y - c.y : p.y
  const anchor = wholeBoxVerticalAnchor(component)
  if (primitive.kind === 'box' && anchor && isWholeComponentBoxAtOrigin(primitive, component)) {
    const e = component.dimensionsIn
    return [
      meters(e.x / 2),
      meters(anchor === 'top' ? -e.y / 2 : e.y / 2),
      meters((invertZ ? -1 : 1) * (e.z / 2)),
    ]
  }
  return [meters(local.x), meters(y), meters(invertZ ? -local.z : local.z)]
}

function adaptBox(
  primitive: BoxGeometry,
  component: KitchenComponent,
  invertZ: boolean,
  panelId?: string,
): MagicGeometryPrimitive {
  return {
    kind: 'box',
    dimensionsM: [
      meters(primitive.dimensionsIn.x),
      meters(primitive.dimensionsIn.y),
      meters(primitive.dimensionsIn.z),
    ],
    positionM: primitiveLocalPosition(primitive, component, invertZ),
    rotationRad: rotationRad(primitive.transform.rotationDeg, invertZ),
    materialKey: primitive.materialKey,
    ...(primitive.color ? { color: primitive.color } : {}),
    ...(panelId ? { panelId } : {}),
  }
}

/**
 * The one place the vendored engine's own export is wrong and has to be
 * corrected rather than copied.
 *
 * `componentsFromScene` emits a countertop prism at
 * `baseYIn = countertop.position.y - countertop.thickness`
 * (`packages/engine/src/index.ts:361` @ `69ac3d37`), i.e. one slab BELOW the
 * component origin. Every consumer on the Babylon side reads the same field the
 * other way — the slab starts at `position.y` and rises:
 *
 *   - `mesh-builders.ts:473` — `createExtrudedPolygon` puts the top at
 *     `y + thickness`, having extruded down from it.
 *   - `KitchenAssembly.tsx:857` — the box branch centres at
 *     `position.y + thickness / 2`.
 *   - `KitchenAssembly.tsx:943` — wall cabinets hang off
 *     `position.y + thickness`, the worktop's top face.
 *   - `placement.ts:443`, `cross-view-matrix.ts:378`, `render-room-svg.ts:581`
 *     — all three bound the counter `position.y .. position.y + thickness`.
 *
 * Six sites against one. Copying `baseYIn` faithfully sinks every perimeter
 * counter 1.5in into the top of its own cabinets and leaves a 34.5in finished
 * counter instead of the 36in the cabinet run is built for. Re-basing to the
 * component anchor restores Babylon's span without touching the outline, the
 * holes, or the thickness.
 *
 * Gated on `countertop` because that is the only shape measured against the
 * renderer, and — as of `69ac3d37` — the only kind the engine emits a
 * polygon-prism for at all (one `kind: "polygon-prism"` in `index.ts`). A
 * future prism from some other kind should be checked, not silently re-based.
 */
function adaptPolygon(
  primitive: PolygonPrismGeometry,
  component: KitchenComponent,
  invertZ: boolean,
): MagicGeometryPrimitive {
  const c = componentAnchorIn(component)
  const localPoint = (point: { x: number; z: number }): [number, number] => {
    const local = worldToComponentLocal(point, component)
    return [meters(local.x), meters(invertZ ? -local.z : local.z)]
  }
  return {
    kind: 'polygon-prism',
    outlineM: primitive.outlineIn.map(localPoint),
    holesM: (primitive.holesIn ?? []).map((hole) => hole.outlineIn.map(localPoint)),
    heightM: meters(primitive.heightIn),
    baseYM: component.kind === 'countertop' ? 0 : meters(primitive.baseYIn - c.y),
    materialKey: primitive.materialKey,
    ...(primitive.color ? { color: primitive.color } : {}),
  }
}

function adaptTriangle(
  primitive: TriangleMeshGeometry,
  component: KitchenComponent,
  invertZ: boolean,
): MagicGeometryPrimitive {
  const positionsM: number[] = []
  for (let index = 0; index < primitive.positionsIn.length; index += 3) {
    positionsM.push(
      meters(primitive.positionsIn[index] ?? 0),
      meters(primitive.positionsIn[index + 1] ?? 0),
      meters((invertZ ? -1 : 1) * (primitive.positionsIn[index + 2] ?? 0)),
    )
  }
  return {
    kind: 'triangle-mesh',
    positionsM,
    indices: invertZ
      ? primitive.indices.flatMap((value, index, values) => {
          if (index % 3 !== 0) return []
          return [value, values[index + 2] ?? value, values[index + 1] ?? value]
        })
      : [...primitive.indices],
    positionM: primitiveLocalPosition(primitive, component, invertZ),
    rotationRad: rotationRad(primitive.transform.rotationDeg, invertZ),
    materialKey: primitive.materialKey,
    ...(primitive.color ? { color: primitive.color } : {}),
  }
}

function adaptPrimitive(
  primitive: GeometryPrimitive,
  component: KitchenComponent,
  invertZ: boolean,
  panelId?: string,
): MagicGeometryPrimitive {
  if (primitive.kind === 'box') return adaptBox(primitive, component, invertZ, panelId)
  if (primitive.kind === 'polygon-prism') return adaptPolygon(primitive, component, invertZ)
  return adaptTriangle(primitive, component, invertZ)
}

/**
 * Panel ids, per component, read out of the engine's own scene state.
 *
 * `KitchenEngineState.scene` is declared `unknown` and documented "opaque,
 * consumers must round-trip it", so this read is deliberately defensive: it
 * only claims a mapping when the cabinet's panel list lines up one-for-one
 * with the component's primitive list, and it hands back nothing at all if the
 * shape is not what we expect. `geometry.ts` falls back to its geometric test
 * for any primitive that arrives without an id.
 *
 * The clean fix lives upstream — `panelId` belongs on the public
 * `BoxGeometry`, which would delete this function. See PORT.md.
 */
function panelIdsByComponent(result: KitchenResult): Map<string, string[]> {
  const byComponent = new Map<string, string[]>()
  const scene = result.engineState?.scene as { cabinets?: unknown } | undefined
  const cabinets = scene?.cabinets
  if (!Array.isArray(cabinets)) return byComponent

  const lengthById = new Map(result.components.map((c) => [c.id, c.geometry.length]))
  for (const cabinet of cabinets) {
    const id = (cabinet as { id?: unknown }).id
    const panels = (cabinet as { panels?: unknown }).panels
    if (typeof id !== 'string' || !Array.isArray(panels)) continue
    // Index alignment is the whole load-bearing assumption. Refuse the mapping
    // rather than mislabel panels if the counts ever drift apart.
    if (lengthById.get(id) !== panels.length) continue
    const ids = panels.map((panel) => (panel as { id?: unknown }).id)
    if (!ids.every((value): value is string => typeof value === 'string')) continue
    byComponent.set(id, ids)
  }
  return byComponent
}

/**
 * The body finish a component wears out of the box.
 *
 * The MVP has no per-component finish: `DesignerCanvas.tsx:292` hands
 * `KitchenAssembly` one `cabinetColor` for the whole kitchen, and the default
 * design picks `cabinetFinish: "white"` (`design-generation.ts:42`). So every
 * cabinet, panel, filler and trim is the same colour, and only the surfaces
 * the MVP excludes from `takesBodyColor` — countertops and appliances — differ.
 *
 * This used to split bases onto `oak` and everything else onto `sage`, which
 * is Pascal's own showroom palette rather than the designer's default. That is
 * the espresso-base / sage-wall kitchen in the showroom frame; Babylon's is
 * uniformly white.
 */
function componentFinish(component: KitchenComponent): MagicCabinetComponentNode['finish'] {
  if (component.kind === 'countertop') return 'quartz'
  if (component.kind === 'appliance' || component.kind === 'appliance-opening') return 'black'
  return 'white'
}

export function adaptKitchenResult(
  result: KitchenResult,
  placement: MagicKitchenPlacement,
): AdaptedMagicKitchen {
  const invertZ = placement.invertZ ?? true
  const layout = MagicCabinetLayoutNode.parse({
    name: 'Magic Cabinet kitchen',
    parentId: placement.parentId,
    position: placement.roomOrigin,
    width: meters(result.input.room.widthIn),
    depth: meters(result.input.room.depthIn),
    counterHeight: 0.88,
    backsplashHeight: 0.6,
    engineVersion: result.engineVersion,
    engineResult: jsonValue(result),
    engineState: jsonValue(result.engineState),
    engineInput: jsonValue(result.input),
    relationships: jsonValue(result.relationships),
    diagnostics: jsonValue(result.diagnostics),
    pinnedComponentIds: result.pinnedComponentIds,
    validationState: result.diagnostics.some((d) => d.severity === 'error')
      ? 'error'
      : result.diagnostics.length > 0
        ? 'warning'
        : 'valid',
  })

  const panelIds = panelIdsByComponent(result)

  const components = result.components.map((component) =>
    MagicCabinetComponentNode.parse({
      name: component.name,
      parentId: placement.parentId,
      position: componentPosition(component, placement.roomOrigin, invertZ),
      rotation: rotationRad(component.transform.rotationDeg, invertZ),
      dimensions: [
        meters(component.dimensionsIn.x),
        meters(component.dimensionsIn.y),
        meters(component.dimensionsIn.z),
      ],
      layoutId: layout.id,
      engineComponentId: component.id,
      componentKind: component.kind,
      subtype: component.subtype,
      wall: component.wall,
      geometry: component.geometry.map((primitive, index) =>
        adaptPrimitive(primitive, component, invertZ, panelIds.get(component.id)?.[index]),
      ),
      planOutline: component.planOutlineIn?.map((point) => {
        const local = worldToComponentLocal(point, component)
        return [meters(local.x), meters(invertZ ? -local.z : local.z)]
      }),
      catalog: component.catalog,
      catalogState: component.catalogState,
      manuallyPinned: result.pinnedComponentIds.includes(component.id),
      finish: componentFinish(component),
    }),
  )

  return {
    layout: MagicCabinetLayoutNode.parse({
      ...layout,
      componentIds: components.map((component) => component.id),
    }),
    components,
  }
}
