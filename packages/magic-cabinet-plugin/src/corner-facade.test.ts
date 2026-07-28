import { describe, expect, test } from 'bun:test'
import { generateKitchen } from '@magic-cabinet/engine'
import { adaptKitchenResult } from './adapter'
import { isCabinetFacade, isEnginePull } from './geometry'
import { MAGIC_KITCHEN_DEFAULT_INPUT } from './house'
import { isShakerFacadePanel } from './panel-classification'
import type { MagicCabinetComponentNode } from './schema'

const LAYOUTS = ['one-wall', 'galley', 'l-shape', 'u-shape'] as const

function kitchen(layout: (typeof LAYOUTS)[number]) {
  const input = MAGIC_KITCHEN_DEFAULT_INPUT
  return adaptKitchenResult(generateKitchen({ ...input, room: { ...input.room, layout } }), {
    parentId: 'level_test',
    roomOrigin: [0, 0, 0],
  })
}

function frameOf(node: MagicCabinetComponentNode) {
  return { width: node.dimensions[0], height: node.dimensions[1], depth: node.dimensions[2] }
}

function primitivesWithPanels(components: MagicCabinetComponentNode[]) {
  return components.flatMap((node) =>
    node.geometry.flatMap((primitive) =>
      primitive.kind === 'box' && primitive.panelId
        ? [{ node, primitive, panelId: primitive.panelId }]
        : [],
    ),
  )
}

describe('panel ids survive the adapter', () => {
  // The whole fix rests on reading `engineState.scene.cabinets[].panels[]`,
  // which the engine contract declares opaque. If that shape ever changes the
  // adapter degrades to its geometric fallback *silently* — this is the alarm.
  test.each(LAYOUTS)('%s carries panel ids onto cabinet primitives', (layout) => {
    const { components } = kitchen(layout)
    const cabinets = components.filter((node) => node.componentKind === 'cabinet')
    expect(cabinets.length).toBeGreaterThan(0)

    const withIds = cabinets.filter((node) =>
      node.geometry.some((primitive) => primitive.kind === 'box' && primitive.panelId),
    )
    expect(withIds.length).toBe(cabinets.length)

    // Ids are per-primitive, not a single id smeared across the component.
    for (const node of cabinets) {
      const ids = node.geometry.flatMap((p) => (p.kind === 'box' && p.panelId ? [p.panelId] : []))
      expect(new Set(ids).size).toBe(ids.length)
    }
  })
})

describe('the diagonal corner door is a facade', () => {
  test('corner cabinets exist in the default kitchen at all', () => {
    const { components } = kitchen('l-shape')
    const corners = components.filter((node) => node.subtype.includes('corner'))
    expect(corners.map((node) => node.subtype).sort()).toEqual(['corner-base', 'corner-wall'])
  })

  test.each(['l-shape', 'u-shape'] as const)('%s diagonal doors classify as facades', (layout) => {
    const { components } = kitchen(layout)
    const corners = components.filter((node) => node.subtype.includes('corner'))
    expect(corners.length).toBeGreaterThan(0)

    for (const node of corners) {
      const doors = node.geometry.filter(
        (primitive) => primitive.kind === 'box' && primitive.panelId?.endsWith('-door'),
      )
      expect(doors.length).toBe(1)
      for (const door of doors) {
        // Yawed 45° — this is the property that defeated the front-plane test.
        expect(door.kind === 'box' && Math.abs(door.rotationRad[1])).toBeCloseTo(Math.PI / 4, 6)
        expect(isCabinetFacade(door, frameOf(node))).toBe(true)
      }
    }
  })

  test('the front-plane test alone would still get it wrong', () => {
    // Mutation check: strip the panel id and the fallback must fail, otherwise
    // this suite would pass with the fix reverted and pin nothing.
    const { components } = kitchen('l-shape')
    const node = components.find((n) => n.subtype === 'corner-base')
    expect(node).toBeDefined()
    const door = node!.geometry.find(
      (primitive) => primitive.kind === 'box' && primitive.panelId?.endsWith('-door'),
    )
    expect(door).toBeDefined()

    const withoutId = { ...door!, panelId: undefined }
    expect(isCabinetFacade(withoutId, frameOf(node!))).toBe(false)
    expect(isCabinetFacade(door!, frameOf(node!))).toBe(true)
  })
})

describe('MVP parity on the panels a geometric test misreads', () => {
  test.each(LAYOUTS)('%s agrees with isShakerFacadePanel on every cabinet panel', (layout) => {
    const { components } = kitchen(layout)
    const rows = primitivesWithPanels(components)
    expect(rows.length).toBeGreaterThan(0)

    for (const { node, primitive, panelId } of rows) {
      // `isCabinetFacade` also gates on 3/4" mdf; the MVP predicate does not,
      // so compare only where the material/thickness gate lets a panel reach it.
      const isMdf = primitive.materialKey.toLowerCase().includes('mdf')
      if (!isMdf) continue
      const thick = Math.abs(primitive.dimensionsM[2] - 0.75 * 0.0254) <= 0.01 * 0.0254
      if (!thick) continue
      expect({ panelId, facade: isCabinetFacade(primitive, frameOf(node)) }).toEqual({
        panelId,
        facade: isShakerFacadePanel(panelId),
      })
    }
  })

  test('the sink tilt-front is not a facade, and it is at the front plane', () => {
    const { components } = kitchen('l-shape')
    const sink = components.find((node) => node.subtype === 'sink-base')
    expect(sink).toBeDefined()
    const tilt = sink!.geometry.find(
      (primitive) => primitive.kind === 'box' && primitive.panelId?.includes('tilt-front'),
    )
    expect(tilt).toBeDefined()

    expect(isCabinetFacade(tilt!, frameOf(sink!))).toBe(false)
    // Control: it *would* pass the geometric fallback, so this is a real
    // behaviour change and not a panel that was already being skipped.
    expect(isCabinetFacade({ ...tilt!, panelId: undefined }, frameOf(sink!))).toBe(true)
  })

  test('filler strips stay carcass, by id and by geometry alike', () => {
    const { components } = kitchen('one-wall')
    const fillers = components.filter((node) => node.subtype === 'filler')
    expect(fillers.length).toBeGreaterThan(0)
    for (const node of fillers) {
      for (const primitive of node.geometry) {
        expect(isCabinetFacade(primitive, frameOf(node))).toBe(false)
        expect(isCabinetFacade({ ...primitive, panelId: undefined }, frameOf(node))).toBe(false)
      }
    }
  })

  test('drawer pulls are pulls, not facades', () => {
    const { components } = kitchen('l-shape')
    const rows = primitivesWithPanels(components).filter((row) => row.panelId.includes('pull'))
    expect(rows.length).toBeGreaterThan(0)
    for (const { node, primitive } of rows) {
      expect(isEnginePull(primitive, frameOf(node))).toBe(true)
      expect(isCabinetFacade(primitive, frameOf(node))).toBe(false)
    }
  })
})
