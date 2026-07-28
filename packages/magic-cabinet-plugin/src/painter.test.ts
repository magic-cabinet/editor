import { describe, expect, test } from 'bun:test'
import type { GeometryContext } from '@pascal-app/core'
import { resolveMaterialRef } from '@pascal-app/viewer'
import type { Mesh } from 'three'
import { buildMagicComponentGeometry } from './geometry'
import { magicCabinetPaint } from './paint'
import { createSlotPainter } from './painter'
import type { MagicCabinetComponentNode } from './schema'
import { MAGIC_SLOT_IDS, magicCabinetSlots, slotForMaterialKey } from './slots'

const STYLE = { finish: 'sage', cabinetTexture: 'none', countertopMaterial: 'quartz' } as const

function component(overrides: Partial<MagicCabinetComponentNode> = {}): MagicCabinetComponentNode {
  return {
    object: 'node',
    id: 'magic-cabinet-component-test',
    type: 'magic-cabinet:component',
    parentId: null,
    visible: true,
    metadata: {},
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    dimensions: [0.6, 0.88, 0.62],
    layoutId: 'layout',
    engineComponentId: 'test',
    componentKind: 'cabinet',
    subtype: 'base',
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

/** A door face: 3/4" thick `mdf` reaching the carcass front plane. */
const FACADE = {
  kind: 'box' as const,
  dimensionsM: [0.58, 0.7, 0.01905] as [number, number, number],
  positionM: [0.3, 0.4, -0.610475] as [number, number, number],
  rotationRad: [0, 0, 0] as [number, number, number],
  materialKey: 'cabinet-panel:mdf',
}

/** A carcass side, well behind the front plane. */
const SIDE = {
  kind: 'box' as const,
  dimensionsM: [0.018, 0.7, 0.58] as [number, number, number],
  positionM: [0.01, 0.4, -0.31] as [number, number, number],
  rotationRad: [0, 0, 0] as [number, number, number],
  materialKey: 'cabinet-panel:plywood',
}

const ctxWith = (materials: Record<string, unknown>) =>
  ({ materials }) as unknown as GeometryContext

/**
 * A scene material the painter would have minted for a one-off colour.
 * `MaterialSchema` nests the PBR values under `properties` — a flat `{color}`
 * silently renders as the default grey, which is exactly the failure mode
 * these tests exist to catch.
 */
const sceneMaterial = (id: string, color: string) => ({
  [id]: {
    id,
    name: 'Painted',
    material: {
      preset: 'custom' as const,
      properties: {
        color,
        roughness: 0.5,
        metalness: 0,
        opacity: 1,
        transparent: false,
        side: 'front' as const,
      },
    },
  },
})

describe('engine material key → paintable slot', () => {
  test('the vocabulary translation is total and lands in the declared set', () => {
    // The engine names materials by what they're MADE OF; the painter needs to
    // know what face they PRESENT. Every key has to land somewhere, or a
    // surface silently becomes unpaintable.
    const keys = [
      'cabinet-panel:mdf',
      'cabinet-panel:plywood',
      'cabinet-panel:back_panel',
      'cabinet-panel:glass',
      'countertop:quartz',
      'countertop:marble',
      'appliance:refrigerator',
      'hardware:pull',
      'toe-kick',
      'crown-molding',
      'something-the-engine-has-not-invented-yet',
    ]
    for (const key of keys) {
      expect(MAGIC_SLOT_IDS, `${key} left the declared set`).toContain(slotForMaterialKey(key))
    }
    expect(slotForMaterialKey('hardware:pull')).toBe('hardware')
    expect(slotForMaterialKey('cabinet-panel:glass')).toBe('glass')
    expect(slotForMaterialKey('countertop:marble')).toBe('countertop')
    expect(slotForMaterialKey('appliance:refrigerator')).toBe('appliance')
    expect(slotForMaterialKey('toe-kick')).toBe('plinth')
    // Anything unrecognised is carcass, not a crash and not `undefined`.
    expect(slotForMaterialKey('brand-new-key')).toBe('carcass')
  })

  test('every declared slot has a label and an unpainted swatch', () => {
    const declared = magicCabinetSlots()
    expect(declared).toHaveLength(MAGIC_SLOT_IDS.length)
    for (const slot of declared) {
      expect(MAGIC_SLOT_IDS).toContain(slot.slotId as (typeof MAGIC_SLOT_IDS)[number])
      expect(slot.label.length).toBeGreaterThan(0)
      // A `#rrggbb` default, deliberately — `library:*` would render a
      // Pascal-looking kitchen where the port owes a Magic Cabinet one.
      expect(slot.default).toMatch(/^#[0-9a-f]{6}$/)
    }
  })
})

describe('paint override precedence', () => {
  test('a scene material wins over the ported MVP finish', () => {
    const node = component({ slots: { carcass: 'scene:mat_1' } })
    const painter = createSlotPainter(node, ctxWith(sceneMaterial('mat_1', '#ff0000')))
    const painted = painter.material('carcass', { key: 'cabinet-panel:plywood', style: STYLE })
    const unpainted = createSlotPainter(component(), undefined).material('carcass', {
      key: 'cabinet-panel:plywood',
      style: STYLE,
    })
    expect((painted as { color: { getHexString(): string } }).color.getHexString()).toBe('ff0000')
    expect(painted).not.toBe(unpainted)
  })

  test('an unpainted slot is untouched by another slot being painted', () => {
    const node = component({ slots: { carcass: 'scene:mat_1' } })
    const painter = createSlotPainter(node, ctxWith(sceneMaterial('mat_1', '#ff0000')))
    const hardware = painter.material('hardware', { key: 'hardware:pull', style: STYLE })
    expect((hardware as { color: { getHexString(): string } }).color.getHexString()).not.toBe(
      'ff0000',
    )
  })

  test('a flat hex slot value paints, though it is not a MaterialRef', () => {
    // `slots` is `z.record(z.string(), z.string())` — unvalidated — so hex
    // reaches this code from the Scene API or a hand-authored scene. Verified
    // live: painting 14 cabinet fronts `#1f6feb` through `PUT /api/scenes/:id`
    // showed nothing until this case was handled.
    const node = component({ slots: { front: '#1f6feb' } })
    const material = createSlotPainter(node, undefined).material('front', {
      key: 'cabinet-panel:mdf',
      style: STYLE,
    })
    expect((material as { color: { getHexString(): string } }).color.getHexString()).toBe('1f6feb')
  })

  test('…and that is a deliberate divergence from every built-in kind', () => {
    // The pin. Hex is NOT a `MaterialRef`: `ParsedMaterialRef` is exactly
    // `library` | `scene`, and `SlotDeclaration.default` documents hex as the
    // alternative *to* a ref, not a third form of one. Ten built-in kinds
    // resolve `node.slots` through this parser and drop what it returns null
    // for, so the same hex in the same scene paints an MC component and is
    // ignored on a native cabinet.
    //
    // Asserting the upstream behaviour — rather than only our own — is what
    // makes the workaround self-retiring: if upstream teaches the parser hex,
    // this fails and `HEX_COLOR` in `painter.ts` can be deleted instead of
    // quietly outliving its reason.
    expect(resolveMaterialRef('#1f6feb', {}, 'rendered')).toBeNull()
    expect(resolveMaterialRef('#FFF', {}, 'rendered')).toBeNull()
    // Control: the two real forms must still parse, or the negative above
    // would prove nothing.
    expect(resolveMaterialRef('library:preset-softwhite', {}, 'rendered')).not.toBeNull()
    expect(
      resolveMaterialRef('scene:mat_1', sceneMaterial('mat_1', '#ff0000') as never, 'rendered'),
    ).not.toBeNull()
  })

  test('a dangling ref falls back rather than throwing or rendering blank', () => {
    // This is what makes deleting a scene material safe. `resolveMaterialRef`
    // is documented never to throw and to return null on a dangling ref; the
    // painter has to actually use that fallback rather than pass null through.
    const node = component({ slots: { carcass: 'scene:deleted' } })
    const withEmptyScene = createSlotPainter(node, ctxWith({}))
    const withNoCtx = createSlotPainter(node, undefined)
    const request = { key: 'cabinet-panel:plywood', style: STYLE }
    const expected = createSlotPainter(component(), undefined).material('carcass', request)
    expect(withEmptyScene.material('carcass', request)).toBe(expected)
    expect(withNoCtx.material('carcass', request)).toBe(expected)
  })
})

describe('slot stamping — what the painter reads off a click', () => {
  const slotIdsOf = (node: MagicCabinetComponentNode) => {
    const group = buildMagicComponentGeometry(node)
    const ids: unknown[] = []
    group.traverse((child) => {
      if ((child as Mesh).isMesh) ids.push(child.userData.slotId)
    })
    return ids
  }

  test('every emitted mesh carries a slot id', () => {
    const ids = slotIdsOf(component({ geometry: [FACADE, SIDE], handleStyle: 'knob' }))
    expect(ids.length).toBeGreaterThan(0)
    for (const id of ids) expect(MAGIC_SLOT_IDS).toContain(id as never)
    // An unstamped mesh is invisible to paint mode — `resolveRole` returns
    // null and the user gets a not-allowed cursor with no explanation.
    expect(ids).not.toContain(undefined)
  })

  test('a door face stamps `front`, its carcass side stamps `carcass`', () => {
    // Both are the same material family to the engine, so nothing but the
    // geometry can tell them apart — and painting a door should not repaint
    // the box behind it.
    const ids = slotIdsOf(component({ geometry: [FACADE, SIDE], handleStyle: 'none' }))
    expect(ids).toContain('front')
    expect(ids).toContain('carcass')
  })

  test('shaker rails paint with the door, not the carcass', () => {
    const ids = slotIdsOf(
      component({ geometry: [FACADE], doorStyle: 'shaker', handleStyle: 'none' }),
    )
    // Four rails/stiles plus the recessed centre panel, all `front`.
    expect(ids.filter((id) => id === 'front').length).toBe(5)
    expect(ids).not.toContain('carcass')
  })

  test("a native appliance stamps through Pascal's own builders", () => {
    const ids = slotIdsOf(
      component({
        componentKind: 'appliance',
        subtype: 'refrigerator',
        dimensions: [0.914, 1.8, 0.66],
      }),
    )
    expect(ids.length).toBeGreaterThan(10)
    for (const id of ids) expect(MAGIC_SLOT_IDS).toContain(id as never)
    // The interior liner is the proof the shared vocabulary works: the plugin
    // never touched that mesh, `stampSlot` did.
    expect(ids).toContain('applianceInterior')
  })
})

describe('the paint capability', () => {
  test('resolves a role from the stamped hit, and only from a stamped hit', () => {
    expect(
      magicCabinetPaint.resolveRole({ hitObject: { userData: { slotId: 'front' } } } as never),
    ).toBe('front')
    expect(magicCabinetPaint.resolveRole({ hitObject: { userData: {} } } as never)).toBeNull()
    expect(magicCabinetPaint.resolveRole({ hitObject: undefined } as never)).toBeNull()
  })

  test('a paint writes one slot and clearing it removes the key', () => {
    const node = component({ slots: { carcass: 'scene:old' } })
    const set = magicCabinetPaint.buildPatch({
      node,
      role: 'front',
      materialPreset: 'library:wood-oak',
    } as never) as { slots: Record<string, string> }
    expect(set.slots).toEqual({ carcass: 'scene:old', front: 'library:wood-oak' })

    const cleared = magicCabinetPaint.buildPatch({ node, role: 'carcass' } as never) as {
      slots: Record<string, string>
    }
    expect(cleared.slots).toEqual({})
  })

  test('MC components share the cabinet toolbar target', () => {
    // An MC kitchen is a cabinet run to the user, whatever node kind is under
    // it — a separate target would split the picker for no reason.
    expect(magicCabinetPaint.materialTarget).toBe('cabinet')
  })
})
