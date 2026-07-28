import { describe, expect, test } from 'bun:test'
import { generateKitchen, type KitchenResult } from '@magic-cabinet/engine'
import { Box3, Group, type Mesh, type Object3D, Vector3 } from 'three'
import { adaptKitchenResult } from './adapter'
import { buildMagicComponentGeometry } from './geometry'
import { MAGIC_KITCHEN_DEFAULT_INPUT } from './house'
import type { MagicCabinetComponentNode } from './schema'

/**
 * What the built model looks like, as opposed to where it sits — the four
 * defects a human spotted in a render that `appliance-placement.test.ts` had
 * already passed. Placement was correct in every one of these; the anatomy was
 * not, which is why seating assertions could not catch them:
 *
 *   1. The island slab was drawn half its own width off the island, because the
 *      engine gives a `countertop` box a min-corner position and the adapter
 *      read it as a centre.
 *   2. The refrigerator grew two through-the-door ice dispensers, because the
 *      door builder gated on door SIZE and a side-by-side's two doors are the
 *      same size.
 *   3. The range had a 12in band of nothing between the oven and the cooktop,
 *      because the oven face was sized to two-thirds of a box the cooktop
 *      builds upward from rather than into.
 *   4. The sink stood ON the worktop with the faucet in the air above it,
 *      because the rim was seated a full basin height above the counter plane —
 *      next to the hole the engine had already cut for it.
 *
 * Nothing below names a coordinate. Every bound is derived from the engine's
 * own output — the panels the slab sits on, the node's own envelope, the
 * countertop prism's declared top face, the cutout outline — so a change in
 * engine sizing moves the expectation with it rather than being re-approved.
 */
const INCH = 0.0254

function adapted(result: KitchenResult) {
  return adaptKitchenResult(result, { parentId: 'level_test', roomOrigin: [0, 0, 0] })
}

function worldBox(node: MagicCabinetComponentNode): Box3 {
  const group = new Group()
  group.add(buildMagicComponentGeometry(node))
  group.position.set(...node.position)
  group.rotation.set(...node.rotation)
  group.updateMatrixWorld(true)
  return new Box3().setFromObject(group)
}

/** Every mesh in a component's own frame, by name, so a part can be measured alone. */
function meshBoxes(node: MagicCabinetComponentNode): Map<string, Box3> {
  const group = buildMagicComponentGeometry(node)
  group.updateMatrixWorld(true)
  const boxes = new Map<string, Box3>()
  group.traverse((child: Object3D) => {
    if (!(child as Mesh).isMesh) return
    boxes.set(child.name, new Box3().setFromObject(child))
  })
  return boxes
}

/** The same, in Pascal world metres, for parts measured against another component. */
function worldMeshBoxes(node: MagicCabinetComponentNode): Map<string, Box3> {
  const group = new Group()
  group.add(buildMagicComponentGeometry(node))
  group.position.set(...node.position)
  group.rotation.set(...node.rotation)
  group.updateMatrixWorld(true)
  const boxes = new Map<string, Box3>()
  group.traverse((child: Object3D) => {
    if (!(child as Mesh).isMesh) return
    boxes.set(child.name, new Box3().setFromObject(child))
  })
  return boxes
}

function union(boxes: Box3[]): Box3 {
  const box = new Box3()
  for (const each of boxes) box.union(each)
  return box
}

function matching(boxes: Map<string, Box3>, pattern: RegExp): Box3[] {
  return [...boxes].filter(([name]) => pattern.test(name)).map(([, box]) => box)
}

describe('the island slab sits on the island', () => {
  /*
   * The engine emits the island top as a `box` at the component-local origin
   * while the L-run countertops are `polygon-prism`s in world space, so the
   * island is the only countertop that goes through the whole-box anchor at
   * all. Read bottom-up it landed 22.5in (half its width) to one side, 13.5in
   * (half its depth) forward and 0.75in (half its thickness) high.
   */
  const islandParts = () => {
    const { components } = adapted(generateKitchen(MAGIC_KITCHEN_DEFAULT_INPUT))
    const slab = components.find(
      (node) =>
        node.componentKind === 'countertop' && node.geometry.some((part) => part.kind === 'box'),
    )
    const panels = components.filter((node) => node.subtype === 'island-panel')
    return { slab, panels }
  }

  test('the slab covers the panels it rests on, rather than sitting beside them', () => {
    const { slab, panels } = islandParts()
    // Guards the premise — no island and this test proves nothing.
    expect(slab, 'no box-geometry countertop in the kitchen').toBeDefined()
    expect(panels.length).toBeGreaterThan(0)

    const top = worldBox(slab as MagicCabinetComponentNode)
    const base = union(panels.map((node) => worldBox(node)))

    // Overhang on all four sides, never a shortfall. The defect left the slab
    // 23.6in clear of the panels' far edge on +x.
    expect(base.min.x - top.min.x, 'slab short of the island on -x').toBeGreaterThan(-0.001)
    expect(top.max.x - base.max.x, 'slab short of the island on +x').toBeGreaterThan(-0.001)
    expect(base.min.z - top.min.z, 'slab short of the island on -z').toBeGreaterThan(-0.001)
    expect(top.max.z - base.max.z, 'slab short of the island on +z').toBeGreaterThan(-0.001)

    // And a worktop overhang, not a second island: the defect's displacement
    // was half the slab on every axis, far outside any real nosing.
    for (const [side, gap] of [
      ['-x', base.min.x - top.min.x],
      ['+x', top.max.x - base.max.x],
      ['-z', base.min.z - top.min.z],
      ['+z', top.max.z - base.max.z],
    ] as const) {
      expect(gap / INCH, `slab overhangs ${side} by more than a nosing`).toBeLessThan(4)
    }
  })

  test('the slab rests on the island rather than sinking into it or floating', () => {
    const { slab, panels } = islandParts()
    expect(slab).toBeDefined()
    const top = worldBox(slab as MagicCabinetComponentNode)
    const base = union(panels.map((node) => worldBox(node)))

    // A slab sits ON its cabinets: its underside is their top face. Reading the
    // box bottom-up floated it half its own thickness; reading it top-down (the
    // engine's own `baseYIn` convention, which the renderer disagrees with — see
    // `adaptPolygon`) buried it a full thickness into the panels below.
    expect(top.min.y / INCH, 'island slab underside is not on the panel tops').toBeCloseTo(
      base.max.y / INCH,
      1,
    )
  })
})

describe('every worktop is one plane, seated on the cabinets', () => {
  /*
   * Anchored to the base cabinets on purpose. The engine's countertop export is
   * a slab too low (`adaptPolygon`), and it is low CONSISTENTLY — so any check
   * that measures the counter against something equally displaced (the faucet
   * it carries, the other counter next to it) passes while the whole worktop
   * sits inside the cabinet run. Cabinet height does not move with that bug.
   */
  const worktops = (components: MagicCabinetComponentNode[]) =>
    components.filter((node) => node.componentKind === 'countertop')

  const baseCabinetTopM = (components: MagicCabinetComponentNode[]) => {
    const bases = components.filter(
      (node) => node.componentKind === 'cabinet' && /base/.test(String(node.subtype)),
    )
    expect(bases.length, 'no base cabinets to seat a worktop on').toBeGreaterThan(0)
    return union(bases.map((node) => worldBox(node))).max.y
  }

  test('the worktop underside sits on the base cabinets, not inside them', () => {
    const { components } = adapted(generateKitchen(MAGIC_KITCHEN_DEFAULT_INPUT))
    const slabs = worktops(components)
    expect(slabs.length, 'no countertops in the kitchen').toBeGreaterThan(0)
    const cabinetTop = baseCabinetTopM(components)

    for (const slab of slabs) {
      const box = worldBox(slab)
      expect(box.min.y / INCH, `${slab.id} underside is not on the cabinet tops`).toBeCloseTo(
        cabinetTop / INCH,
        1,
      )
      // And it is a worktop above them, not a skin flattened onto them.
      expect(box.max.y, `${slab.id} has no thickness above the cabinets`).toBeGreaterThan(
        cabinetTop,
      )
    }
  })

  test('the island slab and the perimeter run share one top face', () => {
    // The two arrive by different routes — the island as a whole-component box,
    // the L-run as world-space polygon prisms — so they are the port's two
    // separate chances to get worktop height wrong, and a step between them is
    // visible in any render of the room.
    const { components } = adapted(generateKitchen(MAGIC_KITCHEN_DEFAULT_INPUT))
    const byForm = new Map<string, number[]>()
    for (const slab of worktops(components)) {
      const form = slab.geometry.some((part) => part.kind === 'box') ? 'box' : 'polygon-prism'
      byForm.set(form, [...(byForm.get(form) ?? []), worldBox(slab).max.y])
    }
    // Guards the premise: with only one form present this proves nothing.
    expect([...byForm.keys()].sort(), 'kitchen lacks both countertop forms').toEqual([
      'box',
      'polygon-prism',
    ])

    const tops = [...byForm.values()].flat()
    for (const top of tops) {
      expect(top / INCH, 'worktop tops are not one plane').toBeCloseTo(tops[0]! / INCH, 1)
    }
  })
})

describe('the refrigerator has one through-the-door dispenser', () => {
  const DISPENSER = /water-dispenser|ice-spout|drip-tray/

  function fridgeOf(widthIn?: number) {
    const node = adapted(generateKitchen(MAGIC_KITCHEN_DEFAULT_INPUT)).components.find(
      (each) => each.subtype === 'refrigerator',
    )
    expect(node, 'no refrigerator in the kitchen').toBeDefined()
    if (widthIn === undefined) return node as MagicCabinetComponentNode
    const [, height, depth] = (node as MagicCabinetComponentNode).dimensions
    return {
      ...(node as MagicCabinetComponentNode),
      dimensions: [widthIn * INCH, height, depth],
    } as MagicCabinetComponentNode
  }

  function dispenserNames(node: MagicCabinetComponentNode) {
    return [...meshBoxes(node).keys()].filter((name) => DISPENSER.test(name))
  }

  test('the default side-by-side draws exactly one, on the freezer door', () => {
    // Two doors of identical size both passed the builder's size gate, so the
    // fridge came out with an ice dispenser on each half of its face.
    const names = dispenserNames(fridgeOf())
    // Guards the premise in the direction that matters: a fix that deleted the
    // dispenser outright would satisfy "no more than one".
    expect(names.length, 'the fridge lost its dispenser entirely').toBeGreaterThan(0)

    const doors = new Set(names.map((name) => name.replace(/^(.*-door-[^-]+)-.*$/, '$1')))
    expect([...doors], 'dispenser parts are split across doors').toHaveLength(1)

    // `fridgeDoorLayout` gives a side-by-side a `left` freezer and a `right`
    // fresh-food door; a real side-by-side dispenses through the freezer.
    expect([...doors][0], 'dispenser is not on the freezer door').toMatch(/-door-left$/)
  })

  test('a narrower fridge still draws exactly one', () => {
    // Below the side-by-side threshold the port picks `fridge-bottom-freezer`,
    // whose short freezer door fails the size gate. That produced one dispenser
    // by luck before the fix; it must still be one by rule, and still present.
    const names = dispenserNames(fridgeOf(30))
    expect(names.length, 'a bottom-freezer lost its dispenser').toBeGreaterThan(0)
    const doors = new Set(names.map((name) => name.replace(/^(.*-door-[^-]+)-.*$/, '$1')))
    expect([...doors], 'a bottom-freezer grew a second dispenser').toHaveLength(1)
  })
})

describe('the range has no hole through its face', () => {
  test('the oven face meets the cooktop with no band of nothing between them', () => {
    const range = adapted(generateKitchen(MAGIC_KITCHEN_DEFAULT_INPUT)).components.find(
      (node) => node.subtype === 'range',
    )
    expect(range, 'no range in the kitchen').toBeDefined()

    const boxes = meshBoxes(range as MagicCabinetComponentNode)
    const oven = matching(boxes, /oven/)
    const cooktop = matching(boxes, /cooktop/)
    // Guards the premise — either half missing and the gap is unmeasurable.
    expect(oven.length, 'the range drew no oven').toBeGreaterThan(0)
    expect(cooktop.length, 'the range drew no cooktop').toBeGreaterThan(0)

    const ovenTop = Math.max(...oven.map((box) => box.max.y))
    const cooktopBottom = Math.min(...cooktop.map((box) => box.min.y))

    // `addCooktopCompartment` builds UPWARD from the height it is handed, so
    // the oven owns everything below it. Reserving two-thirds of the box for
    // the oven left 12.4in of wall visible through the middle of the range.
    expect((ovenTop - cooktopBottom) / INCH, 'gap between oven and cooktop').toBeGreaterThan(-0.01)

    // And the oven reaches the top of the range's own envelope, so the check
    // cannot be satisfied by a cooktop that sagged down to meet a short oven.
    const [, height] = (range as MagicCabinetComponentNode).dimensions
    expect(ovenTop / INCH, 'the oven face falls short of the range envelope').toBeCloseTo(
      height / INCH,
      1,
    )
  })
})

describe('the sink is undermounted, not stood on the worktop', () => {
  /**
   * The top face of the cut worktop AS ADAPTED AND BUILT — deliberately not
   * `baseYIn + heightIn` off the raw export, which is the very field
   * `adaptPolygon` has to correct. Measuring the sink against the raw number
   * would move the reference plane in lockstep with the defect: rim and
   * worktop would agree at 34.5in with the whole assembly a slab too low.
   */
  function worktopPlaneM(components: MagicCabinetComponentNode[]): number | undefined {
    const cut = components.find(
      (node) =>
        node.componentKind === 'countertop' &&
        node.geometry.some((part) => part.kind === 'polygon-prism' && (part.holesM ?? []).length),
    )
    return cut ? worldBox(cut).max.y : undefined
  }

  /** The cutout footprint, in the same Pascal world metres as a rendered node. */
  function cutoutBox(result: KitchenResult): Box3 | undefined {
    for (const component of result.components) {
      for (const primitive of component.geometry) {
        if (primitive.kind !== 'polygon-prism') continue
        for (const hole of primitive.holesIn ?? []) {
          const box = new Box3()
          for (const point of hole.outlineIn) {
            box.expandByPoint(new Vector3(point.x * INCH, 0, -point.z * INCH))
          }
          return box
        }
      }
    }
    return undefined
  }

  test('the basin hangs below the worktop plane it is cut into', () => {
    const { components } = adapted(generateKitchen(MAGIC_KITCHEN_DEFAULT_INPUT))
    const worktop = worktopPlaneM(components)
    const sink = components.find((node) => node.subtype === 'sink')
    // Guards the premise on both sides — no cutout, or no sink, proves nothing.
    expect(worktop, 'no cut countertop to reference').toBeDefined()
    expect(sink, 'no sink in the kitchen').toBeDefined()

    const boxes = worldMeshBoxes(sink as MagicCabinetComponentNode)
    const basin = union(matching(boxes, /-basin-/))
    const faucet = union(matching(boxes, /-faucet-/))
    expect(basin.isEmpty(), 'the sink drew no basin').toBe(false)
    expect(faucet.isEmpty(), 'the sink drew no faucet').toBe(false)

    const plane = worktop as number

    // An undermount: the bowl passes through the slab, so no part of it stands
    // proud of the worktop. The defect put the rim a full basin height (8in)
    // above the counter, on top of the quartz.
    expect((basin.max.y - plane) / INCH, 'basin stands above the worktop').toBeLessThan(0.01)
    expect((plane - basin.min.y) / INCH, 'basin does not hang below the worktop').toBeGreaterThan(1)

    // The faucet is deck-mounted: it starts at the worktop's top face, not at
    // the underside the basin is bonded to. This is the assertion that catches
    // a sink seated correctly relative to a counter that is itself a slab low.
    expect((faucet.min.y - plane) / INCH, 'faucet deck is not on the worktop').toBeCloseTo(0, 1)
  })

  test('the basin lands inside the hole cut for it', () => {
    const result = generateKitchen(MAGIC_KITCHEN_DEFAULT_INPUT)
    const cutout = cutoutBox(result)
    const sink = adapted(result).components.find((node) => node.subtype === 'sink')
    expect(cutout, 'no cutout to land in').toBeDefined()
    expect(sink).toBeDefined()

    const node = sink as MagicCabinetComponentNode
    const group = new Group()
    group.add(buildMagicComponentGeometry(node))
    group.position.set(...node.position)
    group.rotation.set(...node.rotation)
    group.updateMatrixWorld(true)
    const basin = new Box3()
    group.traverse((child: Object3D) => {
      if (!(child as Mesh).isMesh || !/-basin-/.test(child.name)) return
      basin.union(new Box3().setFromObject(child))
    })
    expect(basin.isEmpty()).toBe(false)

    const hole = cutout as Box3
    // The bowl passes through the worktop, so its footprint has to be within
    // the opening. Half an inch of slack: the engine insets the hole 0.5in per
    // side off the sink footprint and the basin's far wall runs to that
    // footprint, so it overruns the opening's far edge by that inset.
    const slack = 0.5 * INCH + 0.001
    expect((basin.min.x - hole.min.x) / INCH, 'basin escapes the cutout on -x').toBeGreaterThan(
      -slack / INCH,
    )
    expect((hole.max.x - basin.max.x) / INCH, 'basin escapes the cutout on +x').toBeGreaterThan(
      -slack / INCH,
    )
    expect((basin.min.z - hole.min.z) / INCH, 'basin escapes the cutout on -z').toBeGreaterThan(
      -slack / INCH,
    )
    expect((hole.max.z - basin.max.z) / INCH, 'basin escapes the cutout on +z').toBeGreaterThan(
      -slack / INCH,
    )
  })
})
