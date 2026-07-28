import type { CabinetModuleNode } from '@pascal-app/core'
import {
  addApplianceCompartment,
  addCooktopCompartment,
  addDishwasherCompartment,
  addFridgeCompartment,
  addPullOutPantryCompartment,
  addRangeHoodCompartment,
  addSinkCompartment,
  type CabinetSlotId,
  type CabinetSlotMaterials,
  sinkBowls,
} from '@pascal-app/nodes/cabinet-geometry'
import { Group, type Material } from 'three'
import { type MagicStyleContext, magicMaterial } from './materials'
import type { SlotPainter } from './painter'
import type { MagicCabinetComponentNode } from './schema'
import type { MagicSlotId } from './slots'

/**
 * The Babylon designer draws appliances from GLB models
 * (`applianceAssetManifest`); the deterministic engine emits only a box, so a
 * straight port of the MVP would need an async loader inside `def.geometry` —
 * which cannot work, because `GeometrySystem` moves the returned children into
 * a live group and empties the builder's own group synchronously.
 *
 * Pascal already solves this the other way: `packages/nodes/src/cabinet/`
 * builds every one of these appliances parametrically, synchronously, in the
 * same three.js primitives we are already emitting. So the port target for an
 * appliance is Pascal's builder, not the MVP's GLB — same visual promise, no
 * asset pipeline, and it stays a pure function of the node.
 *
 * The engine stays authoritative: it owns the appliance's position, footprint
 * and dimensions, and those dimensions are what drive the builder below.
 */

/**
 * Magic Cabinet appliance categories → Pascal compartment kinds.
 *
 * MC has two category unions and the small one is the tempting one:
 * `AppliancePlacement.category` is the four-value layout *input*, while the
 * 2020-import classifier resolves eight. This maps the eight, which is what
 * actually reaches `KitchenComponent.subtype`.
 *
 * `wine-cooler` and `trash-compactor` have no Pascal compartment and are
 * deliberately absent — they fall through to the engine's own box.
 */
export type NativeAppliance =
  | {
      kind: 'fridge'
      compartment:
        | 'fridge-single'
        | 'fridge-double'
        | 'fridge-top-freezer'
        | 'fridge-bottom-freezer'
    }
  | { kind: 'appliance'; compartment: 'oven' | 'microwave' }
  | { kind: 'dishwasher' }
  | { kind: 'hood'; compartment: 'hood-pyramid' | 'hood-curved-glass' }
  | { kind: 'cooktop'; compartment: 'cooktop-gas' | 'cooktop-induction' }
  | { kind: 'sink'; layout: 'single' | 'double' | 'double-offset' }
  | { kind: 'pantry' }

/** A range is a cooktop *and* an oven — MC models it as one component. */
const RANGE: NativeAppliance[] = [
  { kind: 'appliance', compartment: 'oven' },
  { kind: 'cooktop', compartment: 'cooktop-gas' },
]

export function nativeAppliancesFor(node: MagicCabinetComponentNode): NativeAppliance[] {
  const subtype = node.subtype.toLowerCase()
  if (node.componentKind === 'appliance') {
    if (subtype === 'refrigerator') return [{ kind: 'fridge', compartment: fridgeKind(node) }]
    if (subtype === 'range') return RANGE
    if (subtype === 'dishwasher') return [{ kind: 'dishwasher' }]
    if (subtype === 'hood') return [{ kind: 'hood', compartment: 'hood-pyramid' }]
    if (subtype === 'microwave') return [{ kind: 'appliance', compartment: 'microwave' }]
    if (subtype === 'sink') return [{ kind: 'sink', layout: sinkLayout(node) }]
    return []
  }
  if (node.componentKind === 'cabinet' && subtype === 'pull-out-pantry') return [{ kind: 'pantry' }]
  return []
}

/**
 * MC does not tell us the freezer arrangement, so pick it from the box the
 * engine sized. American side-by-sides are wide; anything at or above a 33"
 * opening reads as a double, and everything narrower gets the bottom-freezer
 * that dominates the rest of the market.
 */
const SIDE_BY_SIDE_MIN_WIDTH_M = 33 * 0.0254

function fridgeKind(node: MagicCabinetComponentNode) {
  return node.dimensions[0] >= SIDE_BY_SIDE_MIN_WIDTH_M
    ? ('fridge-double' as const)
    : ('fridge-bottom-freezer' as const)
}

/** A 33"+ sink base is where the trade stops fitting one bowl. */
const DOUBLE_BOWL_MIN_WIDTH_M = 33 * 0.0254

function sinkLayout(node: MagicCabinetComponentNode) {
  return node.dimensions[0] >= DOUBLE_BOWL_MIN_WIDTH_M ? ('double' as const) : ('single' as const)
}

/**
 * Pascal's builders read a handful of scalar construction fields off the node
 * they are given and nothing else — no children, no scene, no store. So an MC
 * component can present itself as one, sized from the engine's own dimensions.
 */
function asCabinetNode(node: MagicCabinetComponentNode): CabinetModuleNode {
  const [width, height, depth] = node.dimensions
  return {
    object: 'node',
    id: `cabinet-module-${node.engineComponentId}`,
    type: 'cabinet-module',
    parentId: null,
    name: node.subtype,
    visible: true,
    metadata: {},
    position: [0, 0, 0],
    rotation: 0,
    width,
    depth,
    carcassHeight: height,
    operationState: 0,
    plinthHeight: 0,
    toeKickDepth: 0,
    boardThickness: 0.018,
    countertopThickness: 0,
    countertopOverhang: 0,
    countertopBackOverhang: 0,
    withFinishedBack: false,
    frontThickness: 0.019,
    frontGap: 0.003,
    frontStyle: node.doorStyle === 'shaker' ? 'shaker' : 'slab',
    handleStyle: node.handleStyle === 'edge' ? 'cutout' : node.handleStyle,
    handlePosition: 'auto',
    frontOverlay: 'full',
    withBottomPanel: true,
    showPlinth: false,
    withCountertop: false,
    moduleKind: 'standard',
  } as unknown as CabinetModuleNode
}

/**
 * Pascal's cabinet frame is centred on x and fronts toward `+z`; the engine's
 * component frame is corner-anchored (`x ∈ [0, W]`) and fronts toward `-z`
 * after the adapter's handedness flip. A half-turn about Y carries one into
 * the other — it is a rotation, not a reflection, so a right-hinged fridge
 * stays right-hinged to a viewer standing in the room.
 */
function nativeFrame(node: MagicCabinetComponentNode): Group {
  const [width, , depth] = node.dimensions
  const frame = new Group()
  frame.name = `magic-native-appliance:${node.subtype}`
  frame.position.set(width / 2, 0, -depth / 2)
  frame.rotation.y = Math.PI
  return frame
}

const SLOT_MATERIAL_KEYS: Record<CabinetSlotId, string> = {
  front: 'appliance',
  carcass: 'cabinet-panel:plywood',
  countertop: 'countertop:quartz',
  plinth: 'cabinet-panel:plywood',
  hardware: 'hardware',
  glass: 'glass',
  appliance: 'appliance',
  applianceInterior: 'appliance-interior',
}

const SLOT_COLORS: Partial<Record<CabinetSlotId, string>> = {
  appliance: '#c8ccd1',
  front: '#c8ccd1',
  applianceInterior: '#2a2c30',
  glass: '#b9d6df',
  hardware: '#17181a',
}

/**
 * The seam where the MVP's look meets Pascal's geometry: the builders take a
 * plain `Record<slotId, Material>`, so they render with the ported Babylon
 * finishes rather than Pascal's own `library:*` presets.
 *
 * With a `painter`, a slot the user has painted resolves through
 * `node.slots` first — which is what makes the interior of a native appliance
 * repaintable. The builders stamp their own meshes with these same slot ids
 * (`stampSlot`), so the painter can read a hit off a fridge liner or a hob
 * without the plugin ever walking a subtree it did not build.
 */
export function magicSlotMaterials(
  style: MagicStyleContext,
  painter?: SlotPainter,
): CabinetSlotMaterials {
  const entries = Object.entries(SLOT_MATERIAL_KEYS) as [CabinetSlotId, string][]
  return Object.fromEntries(
    entries.map(([slotId, key]) => {
      const request = { key, explicit: SLOT_COLORS[slotId], style }
      // The two slot vocabularies are the same set by construction — see
      // `slots.ts` — so the cast is a naming formality, not a mapping.
      return [
        slotId,
        painter ? painter.material(slotId as MagicSlotId, request) : magicMaterial(request),
      ]
    }),
  ) as unknown as Record<CabinetSlotId, Material>
}

/**
 * Draw the Pascal-native appliances for one MC component, or return `false`
 * when the component has no native target and should keep its engine boxes.
 */
export function addNativeAppliances(
  group: Group,
  node: MagicCabinetComponentNode,
  style: MagicStyleContext,
  painter?: SlotPainter,
): boolean {
  const appliances = nativeAppliancesFor(node)
  if (appliances.length === 0) return false

  const cabinet = asCabinetNode(node)
  const materials = magicSlotMaterials(style, painter)
  const frame = nativeFrame(node)
  const [width, height, depth] = node.dimensions

  // Opening dimensions: what is left of the box once the carcass walls the
  // builders expect are taken off. They clamp internally, so a shallow
  // appliance (a sink basin at 8" tall) still produces sane geometry.
  const board = cabinet.boardThickness
  const openingWidth = Math.max(0.05, width - board * 2)
  const openingDepth = Math.max(0.08, depth - board)
  const faceWidth = Math.max(0.05, width - cabinet.frontGap * 2)
  const frontZ = depth / 2

  appliances.forEach((appliance, index) => {
    switch (appliance.kind) {
      case 'fridge':
        addFridgeCompartment(
          frame,
          cabinet,
          materials,
          appliance.compartment,
          faceWidth,
          height,
          height / 2,
          openingWidth,
          openingDepth,
          frontZ,
          index,
        )
        break
      case 'appliance': {
        // A range's oven occupies the lower two-thirds; a standalone oven or
        // microwave gets the whole face.
        const isRange = appliances.length > 1
        const faceHeight = isRange ? height * 0.66 : height
        addApplianceCompartment(
          frame,
          cabinet,
          materials,
          appliance.compartment,
          faceWidth,
          faceHeight,
          faceHeight / 2,
          openingWidth,
          openingDepth,
          frontZ,
          index,
        )
        break
      }
      case 'dishwasher':
        addDishwasherCompartment(
          frame,
          cabinet,
          materials,
          faceWidth,
          height,
          height / 2,
          openingWidth,
          openingDepth,
          frontZ,
          index,
        )
        break
      case 'hood':
        addRangeHoodCompartment(
          frame,
          cabinet,
          materials,
          appliance.compartment,
          0,
          height,
          undefined,
          index,
        )
        break
      case 'cooktop':
        addCooktopCompartment(
          frame,
          cabinet,
          { type: appliance.compartment, cooktopLayout: 'gas-4burner' } as never,
          appliance.compartment,
          height,
          index,
        )
        break
      case 'sink': {
        const bowls = sinkBowls(appliance.layout, openingWidth, openingDepth)
        // The engine sizes a sink component as the basin itself, so its own
        // top face is the countertop plane the rim sits in.
        addSinkCompartment(frame, bowls, 0, 0, height, 0.038, index, materials.appliance)
        break
      }
      case 'pantry':
        addPullOutPantryCompartment(
          frame,
          cabinet,
          materials,
          faceWidth,
          height,
          height / 2,
          openingWidth,
          openingDepth,
          frontZ,
          { type: 'pull-out-pantry' } as never,
          index,
        )
        break
    }
  })

  group.add(frame)
  return true
}
