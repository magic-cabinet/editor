import type { GeometryContext } from '@pascal-app/core'
import {
  BoxGeometry,
  BufferGeometry,
  ExtrudeGeometry,
  Float32BufferAttribute,
  Group,
  Mesh,
  Path,
  Shape,
  SphereGeometry,
} from 'three'
import { addNativeAppliances } from './appliances'
import {
  backsplashMaterialPlan,
  floorMaterialPlan,
  type MagicStyleContext,
  magicMaterial,
} from './materials'
import { createSlotPainter, type SlotPainter } from './painter'
import { isPullPanel, isShakerFacadePanel } from './panel-classification'
import type { MagicCabinetComponentNode, MagicCabinetLayoutNode } from './schema'
import { slotForMaterialKey } from './slots'
import { FLOOR_TEXTURES, SHAKER_FRAME } from './style'

const INCH_TO_METER = 0.0254

/**
 * Engine component-local geometry is CORNER-anchored: primitives run
 * `0 → +width`, `0 → +height`, `0 → +depth`, and the adapter's handedness flip
 * negates z. So a component node's own frame spans x ∈ [0, W], y ∈ [0, H],
 * z ∈ [-D, 0] — the cabinet front is at `-D`, not at `+D/2`. Anything the
 * plugin adds on top of the engine primitives (handles, LEDs, shaker frames)
 * has to be placed in that frame.
 */
type ComponentFrame = { width: number; height: number; depth: number }

function frameOf(node: MagicCabinetComponentNode): ComponentFrame {
  return { width: node.dimensions[0], height: node.dimensions[1], depth: node.dimensions[2] }
}

function styleOf(node: MagicCabinetComponentNode): MagicStyleContext {
  return {
    finish: node.finish,
    cabinetTexture: node.cabinetTexture,
    countertopMaterial: node.countertopMaterial,
  }
}

type BoxPrimitive = Extract<MagicCabinetComponentNode['geometry'][number], { kind: 'box' }>

const FACADE_THICKNESS_M = 0.75 * INCH_TO_METER
const THICKNESS_TOLERANCE_M = 0.01 * INCH_TO_METER
// A panel counts as "at the front" when it reaches the carcass front plane.
// Sub-millimetre slack absorbs the inch→metre conversion.
const FRONT_PLANE_TOLERANCE_M = 0.0005

/**
 * Albedo tints for the two whole surfaces whose texture carries the look.
 *
 * Both renderers multiply map × colour, so a colour left at anything but a
 * neutral value re-tints the photo. The MVP picks a neutral grey below 1 on
 * purpose — "reduce albedo so shadows can darken" (`KitchenAssembly.tsx:2704`):
 * floor `Color3(0.7, 0.7, 0.7)`, backsplash `Color3(0.85, 0.85, 0.85)`.
 *
 * Those are linear values. three multiplies in linear too, but takes
 * `material.color` as sRGB and decodes it, so the hex here is the sRGB
 * encoding of the MVP's linear number — `1.055 * c^(1/2.4) - 0.055`, giving
 * 0.7 -> 0.854 -> #dadada and 0.85 -> 0.931 -> #ededed.
 *
 * Exact cross-renderer parity is not claimed: Babylon reaches these through
 * `StandardMaterial`, which is not the same shading model as three's
 * `MeshStandardMaterial`. What is claimed is the neutrality and the ratio.
 */
const FLOOR_ALBEDO_TINT = '#dadada'
const BACKSPLASH_ALBEDO_TINT = '#ededed'

/** How far a box reaches toward the room, in the node's own frame. */
function frontReach(primitive: BoxPrimitive): number {
  return -(primitive.positionM[2] - primitive.dimensionsM[2] / 2)
}

function isFrontOfCarcass(primitive: BoxPrimitive, frame: ComponentFrame): boolean {
  return frontReach(primitive) >= frame.depth - FRONT_PLANE_TOLERANCE_M
}

/**
 * Door and drawer fronts.
 *
 * The MVP decides this by panel id (`isShakerFacadePanel`), and the adapter now
 * carries those ids through, so when one is present it is authoritative — the
 * two renderers then agree by construction rather than by coincidence.
 *
 * The geometric test below is the fallback for primitives with no panel id
 * (trim, countertops, island panels — nothing the engine gives a panel list).
 * It is not a reliable stand-in for the id: `frontReach` measures along the
 * component's own z axis and so misreads any yawed panel, which is exactly
 * what a diagonal corner door is. Kept because it is strictly better than
 * treating an id-less mdf panel as carcass, not because it is equivalent.
 */
export function isCabinetFacade(
  primitive: MagicCabinetComponentNode['geometry'][number],
  frame: ComponentFrame,
): primitive is BoxPrimitive {
  if (primitive.kind !== 'box') return false
  if (!primitive.materialKey.toLowerCase().includes('mdf')) return false
  if (Math.abs(primitive.dimensionsM[2] - FACADE_THICKNESS_M) > THICKNESS_TOLERANCE_M) return false
  if (primitive.panelId !== undefined) return isShakerFacadePanel(primitive.panelId)
  return isFrontOfCarcass(primitive, frame)
}

/**
 * The slim dark bar the engine models in front of a drawer face — its built-in
 * pull. It shares the facade's `mdf` key but is much thinner and sits proud of
 * the door, so it is the one primitive `handleStyle` has to be able to remove.
 */
export function isEnginePull(
  primitive: MagicCabinetComponentNode['geometry'][number],
  frame: ComponentFrame,
): primitive is BoxPrimitive {
  if (primitive.kind !== 'box') return false
  if (!primitive.materialKey.toLowerCase().includes('mdf')) return false
  if (primitive.panelId !== undefined) return isPullPanel(primitive.panelId)
  if (primitive.dimensionsM[2] >= FACADE_THICKNESS_M - THICKNESS_TOLERANCE_M) return false
  return frontReach(primitive) > frame.depth + FRONT_PLANE_TOLERANCE_M
}

/**
 * MVP `addShakerFrame` — four rails and stiles 3" wide standing 0.4" proud of
 * the door, with the centre panel recessed 0.25" behind them. Emitted as
 * children of the door face's own position so the frame follows any facade the
 * engine places, on any wall.
 */
function addShakerFrame(
  group: Group,
  facade: BoxPrimitive,
  node: MagicCabinetComponentNode,
  painter: SlotPainter,
): void {
  const frameWidth = SHAKER_FRAME.frameWidthIn * INCH_TO_METER
  const frameDepth = SHAKER_FRAME.frameDepthIn * INCH_TO_METER
  const [width, height, thickness] = facade.dimensionsM
  // A door narrower or shorter than two frame members has no centre panel to
  // recess — the MVP would emit degenerate stiles, so leave it a slab.
  if (width <= frameWidth * 2 || height <= frameWidth * 2) return

  const parts: Array<[string, number, number, number, number]> = [
    ['top-rail', width, frameWidth, 0, height / 2 - frameWidth / 2],
    ['bottom-rail', width, frameWidth, 0, -height / 2 + frameWidth / 2],
    ['left-stile', frameWidth, height - frameWidth * 2, -width / 2 + frameWidth / 2, 0],
    ['right-stile', frameWidth, height - frameWidth * 2, width / 2 - frameWidth / 2, 0],
  ]

  for (const [partId, partWidth, partHeight, x, y] of parts) {
    // Rails and stiles are the door face, so they paint with it — not with the
    // carcass their `mdf` key would otherwise route them to.
    const part = painter.stamp(
      new Mesh(
        new BoxGeometry(partWidth, partHeight, thickness + frameDepth),
        painter.material('front', {
          key: facade.materialKey,
          explicit: facade.color,
          style: styleOf(node),
          size: [partWidth, partHeight],
        }),
      ),
      'front',
    )
    part.name = `magic-shaker-${partId}`
    // The frame stands proud of the door, which is toward the room — the
    // negative-z side of the component frame.
    part.position.set(
      facade.positionM[0] + x,
      facade.positionM[1] + y,
      facade.positionM[2] - frameDepth / 2,
    )
    part.rotation.set(...facade.rotationRad)
    group.add(part)
  }
}

function addPolygonPrimitive(
  group: Group,
  primitive: Extract<MagicCabinetComponentNode['geometry'][number], { kind: 'polygon-prism' }>,
  node: MagicCabinetComponentNode,
  painter: SlotPainter,
): void {
  if (primitive.outlineM.length < 3) return
  const [first, ...rest] = primitive.outlineM
  if (!first) return
  const shape = new Shape()
  shape.moveTo(first[0], first[1])
  for (const point of rest) shape.lineTo(point[0], point[1])
  shape.closePath()
  for (const holePoints of primitive.holesM) {
    const [holeFirst, ...holeRest] = holePoints
    if (!holeFirst) continue
    const hole = new Path()
    hole.moveTo(holeFirst[0], holeFirst[1])
    for (const point of holeRest) hole.lineTo(point[0], point[1])
    hole.closePath()
    shape.holes.push(hole)
  }
  const painted = painter.forKey({
    key: primitive.materialKey,
    explicit: primitive.color,
    style: styleOf(node),
    size: outlineSize(primitive.outlineM),
  })
  const mesh = painter.stamp(
    new Mesh(
      new ExtrudeGeometry(shape, {
        bevelEnabled: false,
        depth: primitive.heightM,
        steps: 1,
      }),
      painted.material,
    ),
    painted.slotId,
  )
  mesh.name = 'magic-polygon-prism'
  mesh.rotation.x = Math.PI / 2
  mesh.position.y = primitive.baseYM + primitive.heightM
  group.add(mesh)
}

/**
 * Whether a trim component is drawn at all.
 *
 * The engine emits crown molding and ceiling fillers for every wall run
 * regardless of style — 20 of the default kitchen's 55 components — because
 * they are geometry, not taste. Which of them a design actually wants is the
 * designer's call, and the MVP default wants neither
 * (`design-generation.ts:46-47`).
 */
export function isTrimVisible(node: MagicCabinetComponentNode): boolean {
  if (node.subtype === 'crown-molding') return node.crownMoldingEnabled
  if (node.subtype === 'ceiling-filler') return node.ceilingFillersEnabled
  return true
}

/** Bounding size of a plan outline, for the size-driven UV scale. */
function outlineSize(outline: readonly (readonly [number, number])[]): [number, number] {
  const xs = outline.map((point) => point[0])
  const ys = outline.map((point) => point[1])
  return [
    Math.max(1e-3, Math.max(...xs) - Math.min(...xs)),
    Math.max(1e-3, Math.max(...ys) - Math.min(...ys)),
  ]
}

export function buildMagicComponentGeometry(
  node: MagicCabinetComponentNode,
  ctx?: GeometryContext,
): Group {
  const group = new Group()
  group.name = `magic-component:${node.engineComponentId}`
  const frame = frameOf(node)
  const style = styleOf(node)
  const shaker = node.componentKind === 'cabinet' && node.doorStyle === 'shaker'
  const painter = createSlotPainter(node, ctx)

  // Suppressed trim stays a node — it is still in the engine result and still
  // on the BOM, and flipping the switch back on is a re-render, not a re-solve.
  // That is the MVP's own shape: `KitchenAssembly` keeps `crownMolding` and
  // `ceilingFillerPanels` in config and gates them at draw time
  // (`KitchenAssembly.tsx:1441`).
  if (!isTrimVisible(node)) return group

  // A detailed appliance replaces the engine's box rather than covering it —
  // two coincident faces would z-fight, and the engine's dimensions survive
  // regardless: they are the node's `dimensions`, which is what sizes both the
  // footprint used for collision and the appliance drawn here.
  if (node.applianceDetail && addNativeAppliances(group, node, style, painter)) return group

  for (const primitive of node.geometry) {
    const isHardware = primitive.materialKey.toLowerCase().includes('hardware')
    if (isHardware && node.handleStyle !== 'bar') continue
    if (primitive.kind === 'box') {
      // The engine's own drawer pull is a `mdf` bar, not a `hardware` key, so
      // it survived the filter above and `handleStyle: 'none'` still showed a
      // pull. Treat it as the bar handle it is.
      if (node.handleStyle !== 'bar' && isEnginePull(primitive, frame)) continue

      const facade = shaker && isCabinetFacade(primitive, frame)
      // MVP `constructPanel` thins the door by `recessDepth` and sets the
      // centre panel back by half of it, so the frame reads as proud.
      const recess = facade ? SHAKER_FRAME.recessDepthIn * INCH_TO_METER : 0
      const depth = primitive.dimensionsM[2] - recess
      // A door face and a carcass side are both `mdf`/`plywood` to the engine,
      // which names materials by what they're made of. Which one the user is
      // painting is a geometry question, so it's decided here — everything
      // else routes off the key.
      // Read the key up front: `isCabinetFacade` is a type guard, and inside
      // the `kind === 'box'` branch its false arm narrows to `never`.
      const materialKey = primitive.materialKey
      const slotId = isCabinetFacade(primitive, frame)
        ? ('front' as const)
        : slotForMaterialKey(materialKey)
      const mesh = painter.stamp(
        new Mesh(
          new BoxGeometry(primitive.dimensionsM[0], primitive.dimensionsM[1], depth),
          painter.material(slotId, {
            key: primitive.materialKey,
            explicit: primitive.color,
            style,
            size: [primitive.dimensionsM[0], primitive.dimensionsM[1]],
          }),
        ),
        slotId,
      )
      mesh.name = `magic-box:${primitive.materialKey}`
      mesh.position.set(
        primitive.positionM[0],
        primitive.positionM[1],
        primitive.positionM[2] + recess / 2,
      )
      mesh.rotation.set(...primitive.rotationRad)
      group.add(mesh)
      if (facade) addShakerFrame(group, primitive, node, painter)
      continue
    }
    if (primitive.kind === 'polygon-prism') {
      addPolygonPrimitive(group, primitive, node, painter)
      continue
    }
    const geometry = new BufferGeometry()
    geometry.setAttribute('position', new Float32BufferAttribute(primitive.positionsM, 3))
    geometry.setIndex(primitive.indices)
    geometry.computeVertexNormals()
    const painted = painter.forKey({
      key: primitive.materialKey,
      explicit: primitive.color,
      style,
    })
    const mesh = painter.stamp(new Mesh(geometry, painted.material), painted.slotId)
    mesh.name = `magic-triangle-mesh:${primitive.materialKey}`
    mesh.position.set(...primitive.positionM)
    mesh.rotation.set(...primitive.rotationRad)
    group.add(mesh)
  }

  if (
    node.componentKind === 'cabinet' &&
    (node.handleStyle === 'knob' || node.handleStyle === 'edge')
  ) {
    const hardware = painter.material('hardware', {
      key: 'hardware',
      explicit: '#202124',
      style,
    })
    const handle = painter.stamp(
      node.handleStyle === 'knob'
        ? new Mesh(new SphereGeometry(0.026, 14, 10), hardware)
        : new Mesh(new BoxGeometry(Math.max(0.12, frame.width * 0.62), 0.018, 0.024), hardware),
      'hardware',
    )
    handle.name = `magic-${node.handleStyle}-handle`
    // Corner-anchored frame: centre is `width / 2`, and the room-facing side
    // is `-depth`. The knob sits off-centre toward the opening edge.
    handle.position.set(
      node.handleStyle === 'knob' ? frame.width * 0.8 : frame.width / 2,
      frame.height * 0.48,
      -(frame.depth + 0.018),
    )
    group.add(handle)
  }

  if (node.componentKind === 'cabinet' && node.subtype.includes('wall')) {
    const led = new Mesh(
      new BoxGeometry(Math.max(0.08, frame.width - 0.04), 0.012, 0.018),
      magicMaterial({ key: 'shelf-light', explicit: '#ffe0a6', style, emissive: true }),
    )
    led.name = 'magic-shelf-led'
    // Under the cabinet (local y = 0 is its own underside) and just in front
    // of the doors.
    led.position.set(frame.width / 2, 0.008, -(frame.depth + 0.012))
    group.add(led)
  }

  return group
}

export function buildMagicLayoutGeometry(node: MagicCabinetLayoutNode): Group {
  const group = new Group()
  group.name = 'magic-kitchen-layout'
  const style: MagicStyleContext = {
    finish: 'white',
    cabinetTexture: node.cabinetTexture,
    countertopMaterial: node.countertopMaterial,
  }

  // MVP `KitchenAssembly` builds its own floor rather than inheriting the
  // shell's. It is laid a hair above the house slab so the two never z-fight.
  const floorPlan = floorMaterialPlan(node.floorType)
  const floor = new Mesh(
    new BoxGeometry(node.width, 0.004, node.depth),
    magicMaterial({
      key: `floor:${node.floorType}`,
      style,
      plan: floorPlan,
      // NOT `fallbackColor`. `style.ts` defines that field as the flat colour
      // used *when the jpg is unavailable*, and the MVP uses it in exactly one
      // place: the texture's onError callback (`KitchenAssembly.tsx:2693`).
      // When the texture does load, the MVP sets `diffuseColor` to a neutral
      // `Color3(0.7, 0.7, 0.7)` — "reduce albedo so shadows can darken". Wiring
      // the fallback in as a tint multiplied the oak floor photo by hardwood's
      // mid-brown `#a67c52`.
      color: FLOOR_ALBEDO_TINT,
      size: [node.width, node.depth],
      rotationRad: FLOOR_TEXTURES[node.floorType].rotationRad ?? 0,
    }),
  )
  floor.name = `magic-floor:${node.floorType}`
  // The slab is already flat — `BoxGeometry(w, 0.004, d)` is the floor plane —
  // so it takes no rotation; the plank direction is carried by the texture's
  // own `rotationRad` instead.
  floor.position.set(node.width / 2, 0.002, -node.depth / 2)
  group.add(floor)

  const backsplashPlan = backsplashMaterialPlan(node.backsplashMaterial)
  if (backsplashPlan) {
    const height = node.backsplashHeight
    const backsplash = new Mesh(
      new BoxGeometry(node.width, height, 0.018),
      magicMaterial({
        key: `backsplash:${node.backsplashMaterial}`,
        style,
        plan: backsplashPlan,
        // Without this the key falls through `materialColor`'s token scan to
        // its `#9b9b83` default and multiplies white metro tile by olive.
        color: BACKSPLASH_ALBEDO_TINT,
        size: [node.width, height],
      }),
    )
    backsplash.name = `magic-backsplash:${node.backsplashMaterial}`
    backsplash.position.set(node.width / 2, node.counterHeight + height / 2, -node.depth + 0.025)
    group.add(backsplash)
  }

  const led = new Mesh(
    new BoxGeometry(node.width, 0.014, 0.022),
    magicMaterial({ key: 'shelf-light', explicit: '#ffe0a6', style, emissive: true }),
  )
  led.name = 'magic-layout-work-light'
  led.position.set(node.width / 2, node.counterHeight + node.backsplashHeight, -node.depth + 0.015)
  group.add(led)

  return group
}
