import { describe, expect, test } from 'bun:test'
import {
  magicCabinetComponentParametrics,
  magicCabinetLayoutParametrics,
  mirroredStylePatch,
} from './parametrics'
import type { MagicCabinetLayoutNode } from './schema'

function layout(overrides: Partial<MagicCabinetLayoutNode> = {}): MagicCabinetLayoutNode {
  return {
    doorStyle: 'slab',
    cabinetTexture: 'none',
    countertopMaterial: 'quartz',
    applianceDetail: true,
    floorType: 'hardwood',
    backsplashMaterial: 'white-metro-tile',
    componentIds: ['a', 'b', 'c'],
    ...overrides,
  } as MagicCabinetLayoutNode
}

describe('layout style pushes down to components', () => {
  /**
   * `GeometrySystem` re-runs a builder only for the node it marked dirty, so a
   * component that read `doorStyle` off its layout would keep stale geometry
   * until something else touched it. The value has to be mirrored down. These
   * assert the push-down actually fires — and, just as importantly, that it
   * does NOT fire for the fields the layout keeps to itself.
   */
  test('a mirrored field patches every component once', () => {
    const patches = magicCabinetLayoutParametrics.reconcile?.(
      layout(),
      layout({ doorStyle: 'shaker' }),
    )
    expect(patches).toHaveLength(3)
    expect(patches?.map((p) => p.id)).toEqual(['a', 'b', 'c'])
    for (const patch of patches ?? []) expect(patch.data).toEqual({ doorStyle: 'shaker' })
  })

  test('several fields at once collapse into one patch per component', () => {
    const patch = mirroredStylePatch(
      layout(),
      layout({ doorStyle: 'shaker', countertopMaterial: 'marble', applianceDetail: false }),
    )
    expect(patch).toEqual({
      doorStyle: 'shaker',
      countertopMaterial: 'marble',
      applianceDetail: false,
    })
  })

  test('layout-only fields never rewrite 44 nodes', () => {
    // The floor and backsplash are drawn by the layout's own builder. Pushing
    // them down would dirty every component for nothing.
    for (const change of [
      { floorType: 'tile' },
      { backsplashMaterial: 'marble' },
      { counterHeight: 0.92 },
    ] as Partial<MagicCabinetLayoutNode>[]) {
      expect(mirroredStylePatch(layout(), layout(change))).toEqual({})
      expect(magicCabinetLayoutParametrics.reconcile?.(layout(), layout(change))).toEqual([])
    }
  })
})

describe('the component inspector', () => {
  test("does not expose dimensions — those are the engine's output", () => {
    const keys = magicCabinetComponentParametrics.groups.flatMap((group) =>
      group.fields.map((field) => String(field.key)),
    )
    expect(keys).not.toContain('dimensions')
    // A cabinet resized here would disagree with its own SKU and BOM line the
    // moment the solver ran again; resizing belongs to `update_magic_kitchen`.
    expect(keys).toContain('finish')
    expect(keys).toContain('handleStyle')
  })

  test('kind-specific controls stay hidden on the wrong kind', () => {
    const field = (key: string) =>
      magicCabinetComponentParametrics.groups
        .flatMap((group) => group.fields)
        .find((f) => String(f.key) === key)

    const doorStyle = field('doorStyle')
    const applianceDetail = field('applianceDetail')
    expect(doorStyle?.visibleIf?.({ componentKind: 'cabinet' } as never)).toBe(true)
    expect(doorStyle?.visibleIf?.({ componentKind: 'countertop' } as never)).toBe(false)
    expect(applianceDetail?.visibleIf?.({ componentKind: 'appliance' } as never)).toBe(true)
    expect(applianceDetail?.visibleIf?.({ componentKind: 'trim' } as never)).toBe(false)
  })

  test('a stale engine result is flagged, not silently drawn', () => {
    const issues = magicCabinetComponentParametrics.invariants?.[0]?.({
      subtype: 'base',
      dimensions: [0.6, 0, 0.6],
    } as never)
    expect(issues).toHaveLength(1)
    expect(issues?.[0]?.severity).toBe('error')
    expect(
      magicCabinetComponentParametrics.invariants?.[0]?.({
        subtype: 'base',
        dimensions: [0.6, 0.88, 0.6],
      } as never),
    ).toHaveLength(0)
  })
})
