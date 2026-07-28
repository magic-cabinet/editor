import { describe, expect, test } from 'bun:test'
import { generateKitchen, PILOT_KITCHEN_INPUT } from '@magic-cabinet/engine'
import { Box3, Group, Vector3 } from 'three'
import { adaptKitchenResult } from './adapter'
import { addNativeAppliances, nativeAppliancesFor } from './appliances'
import { buildMagicComponentGeometry } from './geometry'
import type { MagicCabinetComponentNode } from './schema'

const STYLE = { finish: 'sage', cabinetTexture: 'none', countertopMaterial: 'quartz' } as const

function component(overrides: Partial<MagicCabinetComponentNode>): MagicCabinetComponentNode {
  return {
    object: 'node',
    id: 'magic-cabinet-component-test',
    type: 'magic-cabinet:component',
    parentId: null,
    visible: true,
    metadata: {},
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    dimensions: [0.6, 0.88, 0.6],
    layoutId: 'layout',
    engineComponentId: 'test',
    componentKind: 'appliance',
    subtype: 'dishwasher',
    wall: 'north',
    geometry: [],
    manuallyPinned: false,
    finish: 'sage',
    handleStyle: 'bar',
    doorStyle: 'slab',
    cabinetTexture: 'none',
    countertopMaterial: 'quartz',
    applianceDetail: true,
    ...overrides,
  } as MagicCabinetComponentNode
}

describe('MC appliance category → Pascal compartment', () => {
  test('the six categories with a native target all map', () => {
    const mapped = (subtype: string, dimensions: [number, number, number] = [0.6, 0.88, 0.6]) =>
      nativeAppliancesFor(component({ subtype, dimensions })).map((a) =>
        'compartment' in a ? a.compartment : a.kind,
      )

    expect(mapped('dishwasher')).toEqual(['dishwasher'])
    expect(mapped('microwave')).toEqual(['microwave'])
    expect(mapped('hood')).toEqual(['hood-pyramid'])
    expect(mapped('sink')).toEqual(['sink'])
    // A range is a cooktop *and* an oven; MC ships it as one component.
    expect(mapped('range')).toEqual(['oven', 'cooktop-gas'])
    // Freezer arrangement comes off the width the engine sized.
    expect(mapped('refrigerator', [0.914, 1.8, 0.6])).toEqual(['fridge-double'])
    expect(mapped('refrigerator', [0.762, 1.8, 0.6])).toEqual(['fridge-bottom-freezer'])
  })

  test('categories with no Pascal compartment keep the engine box', () => {
    // `wine-cooler` and `trash-compactor` are real MC categories with nothing
    // to map onto. Returning nothing is what makes the fallback work — the
    // builder then draws the engine's own primitives.
    for (const subtype of ['wine-cooler', 'trash-compactor']) {
      expect(nativeAppliancesFor(component({ subtype }))).toEqual([])
    }
    // And a cabinet is not an appliance, whatever its subtype looks like.
    expect(
      nativeAppliancesFor(component({ componentKind: 'cabinet', subtype: 'sink-base' })),
    ).toEqual([])
  })

  test('a wide sink base gets two bowls, a narrow one gets a single', () => {
    const layout = (width: number) => {
      const [first] = nativeAppliancesFor(
        component({ subtype: 'sink', dimensions: [width, 0.2, 0.6] }),
      )
      return first && 'layout' in first ? first.layout : null
    }
    expect(layout(0.914)).toBe('double')
    expect(layout(0.762)).toBe('single')
  })
})

describe('native appliance frame', () => {
  /**
   * The bug this exists to catch: Pascal's cabinet frame is centred on x and
   * fronts toward `+z`, while an MC component is corner-anchored and fronts
   * toward `-z`. Get the wrapper transform wrong and the fridge is built
   * beside the opening, or facing into the wall — and nothing in the type
   * system or either validator can see it. So assert the box, not the call.
   */
  const bounds = (node: MagicCabinetComponentNode) => {
    const group = new Group()
    expect(addNativeAppliances(group, node, STYLE)).toBe(true)
    group.updateMatrixWorld(true)
    return new Box3().setFromObject(group)
  }

  test('the appliance lands inside the box the engine sized', () => {
    const node = component({ subtype: 'refrigerator', dimensions: [0.914, 1.8, 0.66] })
    const box = bounds(node)
    const [width, height, depth] = node.dimensions
    // Engine frame: x ∈ [0, W], y ∈ [0, H], z ∈ [-D, 0]. Allow a small
    // tolerance for handles and door seals standing proud of the carcass.
    const proud = 0.08
    expect(box.min.x).toBeGreaterThan(-proud)
    expect(box.max.x).toBeLessThan(width + proud)
    expect(box.min.y).toBeGreaterThan(-proud)
    expect(box.max.y).toBeLessThan(height + proud)
    expect(box.min.z).toBeGreaterThan(-depth - proud)
    expect(box.max.z).toBeLessThan(proud)
  })

  test('the appliance faces the room, not the wall', () => {
    // A z-flip is the failure this whole wrapper exists to prevent, and it is
    // invisible in a bounding box alone — the box is nearly symmetric. The
    // asymmetry that betrays it is the door furniture: a fridge handle stands
    // proud of the FRONT face and nothing stands proud of the back. In the
    // engine frame the room is toward -z, so the overhang must be on -z.
    const node = component({ subtype: 'refrigerator', dimensions: [0.914, 1.8, 0.66] })
    const box = bounds(node)
    const depth = node.dimensions[2]
    const frontOverhang = -depth - box.min.z
    const backOverhang = box.max.z
    expect(frontOverhang).toBeGreaterThan(0.01)
    expect(backOverhang).toBeLessThan(0.005)
    // Flipped, these two swap — so assert the gap, not just the signs.
    expect(frontOverhang).toBeGreaterThan(backOverhang + 0.01)
  })

  test('every mapped appliance builds real geometry, not an empty group', () => {
    for (const subtype of ['refrigerator', 'range', 'dishwasher', 'hood', 'microwave', 'sink']) {
      const group = new Group()
      const node = component({ subtype, dimensions: [0.76, 0.88, 0.6] })
      expect(addNativeAppliances(group, node, STYLE)).toBe(true)
      const size = new Box3().setFromObject(group).getSize(new Vector3())
      expect(size.length(), `${subtype} produced no geometry`).toBeGreaterThan(0.05)
    }
  })

  test('applianceDetail off falls back to the engine primitives', () => {
    const box = {
      kind: 'box' as const,
      dimensionsM: [0.6, 0.85, 0.6] as [number, number, number],
      positionM: [0.3, 0.425, -0.3] as [number, number, number],
      rotationRad: [0, 0, 0] as [number, number, number],
      materialKey: 'appliance:dishwasher',
    }
    const on = buildMagicComponentGeometry(component({ geometry: [box], applianceDetail: true }))
    const off = buildMagicComponentGeometry(component({ geometry: [box], applianceDetail: false }))
    expect(off.children).toHaveLength(1)
    expect(off.children[0]?.name).toBe('magic-box:appliance:dishwasher')
    // On, the engine box is replaced rather than covered — two coincident
    // faces would z-fight.
    expect(on.children).toHaveLength(1)
    expect(on.children[0]?.name).toStartWith('magic-native-appliance:')
  })
})

describe('the pilot kitchen', () => {
  test('its appliances all resolve, and nothing else is diverted', () => {
    const result = generateKitchen(PILOT_KITCHEN_INPUT)
    const adapted = adaptKitchenResult(result, {
      parentId: 'level_test',
      roomOrigin: [-5.45, 0.05, -0.7],
    })
    const appliances = adapted.components.filter((node) => node.componentKind === 'appliance')
    expect(appliances.length).toBeGreaterThan(0)

    const diverted = adapted.components.filter(
      (node) => nativeAppliancesFor(node as MagicCabinetComponentNode).length > 0,
    )
    // Only appliances get the native treatment; cabinets, countertops, trim
    // and panels stay on the engine's own primitives.
    for (const node of diverted) {
      expect(node.componentKind, `${node.subtype} was diverted`).toBe('appliance')
    }
  })
})
