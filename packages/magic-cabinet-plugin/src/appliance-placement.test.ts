import { describe, expect, test } from 'bun:test'
import { generateKitchen, type KitchenResult } from '@magic-cabinet/engine'
import { Box3, Group, Vector3 } from 'three'
import { adaptKitchenResult, applianceAnchorShiftIn } from './adapter'
import { buildMagicComponentGeometry } from './geometry'
import { MAGIC_KITCHEN_DEFAULT_INPUT } from './house'
import type { MagicCabinetComponentNode } from './schema'

/**
 * Where an appliance ends up, checked against the solver's own output rather
 * than against a restated frame.
 *
 * The bug these exist to catch: `KitchenComponent.transform.positionIn` is
 * corner-anchored in the component's own frame for a cabinet, but anchored on
 * the WORLD axis-aligned minimum corner for an appliance — the yaw orients the
 * model without being applied to the anchor offset. Reading the cabinet
 * convention across put the sink 36in from the hole cut for it, and drove the
 * refrigerator into a base cabinet.
 *
 * Neither assertion below names a coordinate. The cutout comes off the
 * countertop and the carcasses come off the cabinets, so if the engine ever
 * changes convention these fail rather than quietly re-approving.
 */
const INCH = 0.0254

function adapted(result: KitchenResult) {
  return adaptKitchenResult(result, { parentId: 'level_test', roomOrigin: [0, 0, 0] })
}

function worldBox(node: MagicCabinetComponentNode, carcassOnly = false): Box3 {
  const group = new Group()
  group.add(
    buildMagicComponentGeometry(
      carcassOnly ? ({ ...node, doorStyle: 'slab' } as MagicCabinetComponentNode) : node,
    ),
  )
  group.position.set(...node.position)
  group.rotation.set(...node.rotation)
  group.updateMatrixWorld(true)
  return new Box3().setFromObject(group)
}

/** Every hole the engine cuts in a countertop, in Pascal world metres. */
function countertopCutouts(result: KitchenResult): Box3[] {
  const holes: Box3[] = []
  for (const component of result.components) {
    for (const primitive of component.geometry) {
      if (primitive.kind !== 'polygon-prism') continue
      for (const hole of primitive.holesIn ?? []) {
        const box = new Box3()
        for (const point of hole.outlineIn) {
          box.expandByPoint(new Vector3(point.x * INCH, 0, -point.z * INCH))
        }
        holes.push(box)
      }
    }
  }
  return holes
}

describe('appliance placement', () => {
  test('the sink lands in the hole the countertop cuts for it', () => {
    const result = generateKitchen(MAGIC_KITCHEN_DEFAULT_INPUT)
    const cutouts = countertopCutouts(result)
    // Guards the premise — no cutout and this test proves nothing.
    expect(cutouts.length).toBeGreaterThan(0)

    const sink = adapted(result).components.find((node) => node.subtype === 'sink')
    expect(sink).toBeDefined()
    const centre = worldBox(sink as MagicCabinetComponentNode).getCenter(new Vector3())

    const nearest = Math.min(
      ...cutouts.map((hole) => {
        const holeCentre = hole.getCenter(new Vector3())
        return Math.hypot(centre.x - holeCentre.x, centre.z - holeCentre.z)
      }),
    )
    // 2in covers the faucet and bowl overhang skewing the rendered AABB; the
    // defect this replaces sat 36.49in out.
    expect(nearest / INCH).toBeLessThan(2)
  })

  test('no appliance is built inside a cabinet carcass', () => {
    const result = generateKitchen(MAGIC_KITCHEN_DEFAULT_INPUT)
    const { components } = adapted(result)
    const cabinets = components
      .filter((node) => node.componentKind === 'cabinet')
      .map((node) => ({ node, box: worldBox(node as MagicCabinetComponentNode, true) }))
    const appliances = components.filter((node) => node.componentKind === 'appliance')
    expect(cabinets.length).toBeGreaterThan(0)
    expect(appliances.length).toBeGreaterThan(0)

    for (const appliance of appliances) {
      // Shrink by a hair so a shared face is not an intersection.
      const box = worldBox(appliance as MagicCabinetComponentNode).expandByScalar(-0.006)
      for (const { node, box: carcass } of cabinets) {
        // A sink lives inside its own sink base — that is what the cutout is.
        if (appliance.subtype === 'sink' && node.subtype === 'sink-base') continue
        if (!carcass.intersectsBox(box)) continue
        const overlap = carcass.clone().intersect(box).getSize(new Vector3())
        if (overlap.x * overlap.y * overlap.z < 1e-5) continue
        throw new Error(
          `${appliance.subtype} overlaps ${node.subtype} by ` +
            `${(Math.max(overlap.x, overlap.z) / INCH).toFixed(1)}in`,
        )
      }
    }
  })

  test('an appliance-opening still anchors like the cabinet run it sits in', () => {
    // The dishwasher is a gap the base run leaves, not a placed appliance, so
    // it must NOT get the appliance anchor. It lands flush between its
    // neighbours only under the cabinet rule — assert the run tiles with no
    // gap and no overlap on the wall it shares.
    const result = generateKitchen(MAGIC_KITCHEN_DEFAULT_INPUT)
    const { components } = adapted(result)
    const dishwasher = components.find((node) => node.subtype === 'dishwasher')
    expect(dishwasher).toBeDefined()
    const box = worldBox(dishwasher as MagicCabinetComponentNode, true)

    const abutting = components
      .filter((node) => node.componentKind === 'cabinet')
      .map((node) => worldBox(node as MagicCabinetComponentNode, true))
      // Same wall: sharing the depth band the dishwasher occupies.
      .filter((other) => other.min.z < box.max.z - 0.05 && other.max.z > box.min.z + 0.05)
      .filter((other) => other.max.y < 1.1)

    const touchesLeft = abutting.some((other) => Math.abs(other.max.x - box.min.x) < 0.02)
    const touchesRight = abutting.some((other) => Math.abs(other.min.x - box.max.x) < 0.02)
    expect(touchesLeft || touchesRight, 'dishwasher does not abut its run').toBe(true)
  })
})

/**
 * The appliance's own frame, which is where "it doesn't touch the wall" lives.
 *
 * The engine's box is authoritative for an appliance, and the component frame
 * is corner-anchored: `x ∈ [0, W]`, `y ∈ [0, H]`, and `z ∈ [-D, 0]` after the
 * adapter's handedness flip — with `z = 0` the face against the wall.
 *
 * Nothing below names a coordinate: every bound comes off `node.dimensions`,
 * so a change in engine sizing moves the expectation with it.
 */
function localBox(node: MagicCabinetComponentNode, applianceDetail: boolean): Box3 {
  const group = new Group()
  group.add(buildMagicComponentGeometry({ ...node, applianceDetail } as MagicCabinetComponentNode))
  group.updateMatrixWorld(true)
  return new Box3().setFromObject(group)
}

function appliancesOf(result: KitchenResult) {
  return adapted(result).components.filter((node) => node.componentKind === 'appliance')
}

describe('an appliance fills the box the engine sized', () => {
  test('the native appliance stands against its wall, inside its own envelope', () => {
    // Pascal's compartment builders anchor their shell to the FRONT plane and
    // let every clearance fall out the back, which is right for an appliance
    // inside a carcass and wrong when the appliance IS the box: the
    // refrigerator stood 5.14in off the east wall and hung 2.72in out past the
    // counter line, the range 2.82in and 2.38in.
    const appliances = appliancesOf(generateKitchen(MAGIC_KITCHEN_DEFAULT_INPUT))
    expect(appliances.length).toBeGreaterThan(0)

    for (const node of appliances) {
      const [width, , depth] = node.dimensions
      const box = localBox(node, true)
      expect(box.isEmpty(), `${node.subtype} drew nothing`).toBe(false)

      // Inside the envelope on both axes it shares with the room.
      expect(box.min.x, `${node.subtype} overhangs its box on -x`).toBeGreaterThan(-0.001)
      expect(box.max.x, `${node.subtype} overhangs its box on +x`).toBeLessThan(width + 0.001)
      expect(box.min.z, `${node.subtype} overhangs its box at the front`).toBeGreaterThan(
        -depth - 0.001,
      )
      expect(box.max.z, `${node.subtype} overhangs its box at the wall`).toBeLessThan(0.001)

      // And actually near the wall rather than parked in the middle of it.
      // 2in is a real appliance's air gap; the defect sat at 5.14in.
      expect(-box.max.z / INCH, `${node.subtype} floats off its wall`).toBeLessThan(2)
    }
  })

  test('with the detail off, the engine box fills the frame exactly', () => {
    // The engine emits the whole envelope as one box at the component-local
    // origin, but a box transform is its CENTRE everywhere else in the
    // contract. Read literally, a 66in refrigerator renders y ∈ [-33, +33] —
    // half of it under the floor.
    for (const node of appliancesOf(generateKitchen(MAGIC_KITCHEN_DEFAULT_INPUT))) {
      const [width, height, depth] = node.dimensions
      const box = localBox(node, false)
      expect(box.min.x, `${node.subtype} -x`).toBeCloseTo(0, 6)
      expect(box.min.y, `${node.subtype} floor`).toBeCloseTo(0, 6)
      expect(box.min.z, `${node.subtype} front`).toBeCloseTo(-depth, 6)
      expect(box.max.x, `${node.subtype} +x`).toBeCloseTo(width, 6)
      expect(box.max.y, `${node.subtype} top`).toBeCloseTo(height, 6)
      expect(box.max.z, `${node.subtype} wall`).toBeCloseTo(0, 6)
    }
  })

  test('the anchor shift inverts, so a pinned edit does not walk the appliance', () => {
    // `pinnedEdits` writes a node's position back as `positionIn`. The adapter
    // moved that off the engine's own anchor for appliances, so without the
    // inverse every edit re-applies the shift and the appliance walks another
    // footprint.
    const result = generateKitchen(MAGIC_KITCHEN_DEFAULT_INPUT)
    const byId = new Map(result.components.map((component) => [component.id, component]))
    const { components } = adapted(result)
    let checked = 0

    for (const node of components) {
      const component = byId.get(node.engineComponentId)
      if (!component) continue
      const shift = applianceAnchorShiftIn(
        node.componentKind,
        {
          x: node.dimensions[0] / INCH,
          z: node.dimensions[2] / INCH,
        },
        -(node.rotation[1] * 180) / Math.PI,
      )
      const roundTripped = {
        x: node.position[0] / INCH - shift.x,
        z: -node.position[2] / INCH - shift.z,
      }
      expect(roundTripped.x).toBeCloseTo(component.transform.positionIn.x, 6)
      expect(roundTripped.z).toBeCloseTo(component.transform.positionIn.z, 6)
      if (node.componentKind === 'appliance') checked += 1
    }

    // Guards the premise: a kitchen with no appliances would pass vacuously.
    expect(checked).toBeGreaterThan(0)
    // And guards that the shift is not uniformly zero — that would make the
    // round trip trivially true while the appliances stayed misplaced.
    const shifted = components.filter((node) => {
      const shift = applianceAnchorShiftIn(
        node.componentKind,
        { x: node.dimensions[0] / INCH, z: node.dimensions[2] / INCH },
        -(node.rotation[1] * 180) / Math.PI,
      )
      return Math.abs(shift.x) > 0.001 || Math.abs(shift.z) > 0.001
    })
    expect(shifted.length).toBeGreaterThan(0)
  })
})
