import { describe, expect, test } from 'bun:test'
import { generateKitchen } from '@magic-cabinet/engine'
import type { Mesh, MeshStandardMaterial } from 'three'
import { adaptKitchenResult } from './adapter'
import { buildMagicLayoutGeometry } from './geometry'
import { MAGIC_KITCHEN_DEFAULT_INPUT } from './house'
import { type MagicStyleContext, magicMaterialPlan, paintBumpRepeat, uvRepeat } from './materials'

/**
 * How the ported material layer tiles and tints — the half of parity that is
 * not "which jpg" but "at what scale, and multiplied by what".
 *
 * Both renderers multiply map × colour and both take a per-texture repeat, so
 * these are the two ways a correct texture still renders wrong: tiled at the
 * wrong frequency, or tinted by a colour that was never meant to be a tint.
 *
 * Everything here asserts the DECISION rather than the render — three's
 * `TextureLoader` needs a DOM, so `magicMaterial` builds a real material with
 * a null map when run headless. The colour and the PBR constants survive that,
 * which is exactly what these tests read. Texture anisotropy does NOT survive
 * it (there is no `Texture` object to carry it), so it is verified in the
 * render rather than here.
 */

const INCH = 0.0254

function style(finish: string): MagicStyleContext {
  return { finish, cabinetTexture: 'none', countertopMaterial: 'quartz' }
}

describe('paint bump tiles on its own scale, not the albedo repeat', () => {
  // MVP `applyPaintBump` (`cabinet-scene-mesh.ts:197-212`):
  //   bump.uScale = Math.max(3, panel.width / 5)
  // against the painted albedo one branch above it:
  //   albedo.uScale = Math.max(0.2, panel.width / 46)
  // Two different references and two different floors. Reusing the albedo
  // repeat for the normal map — which is what this code did — stretches the
  // brushed-paint micro-normal 5-15x too coarse, and painted fronts read
  // blotchy instead of finely brushed.

  test('a cabinet door tiles its bump far finer than its albedo', () => {
    const plan = magicMaterialPlan('cabinet-panel:mdf', style('white'))
    expect(plan.normalTiling).toBe('paint-bump')

    // A 24" x 30" base door, in metres.
    const door: [number, number] = [24 * INCH, 30 * INCH]
    const [albedoU, albedoV] = uvRepeat(door, plan)
    const [bumpU, bumpV] = paintBumpRepeat(door)

    expect(albedoU).toBeCloseTo(24 / 46, 6)
    expect(albedoV).toBeCloseTo(30 / 46, 6)
    expect(bumpU).toBeCloseTo(24 / 5, 6)
    expect(bumpV).toBeCloseTo(30 / 5, 6)
    // The gap is the whole point: 46/5 = 9.2x on both axes here.
    expect(bumpU / albedoU).toBeCloseTo(46 / 5, 6)
  })

  test('the bump floor is 3, not the albedo floor of 0.2', () => {
    // A narrow filler strip: both repeats clamp, and they clamp to values an
    // order of magnitude apart.
    const filler: [number, number] = [3 * INCH, 4 * INCH]
    const plan = magicMaterialPlan('cabinet-panel:mdf', style('white'))
    expect(uvRepeat(filler, plan)).toEqual([0.2, 0.2])
    expect(paintBumpRepeat(filler)).toEqual([3, 3])
  })

  test('wood keeps one repeat across albedo, normal and roughness', () => {
    // MVP `configureTexture` is applied to all three siblings together, so
    // wood must NOT take the paint-bump treatment.
    const plan = magicMaterialPlan('cabinet-panel:plywood', style('oak'))
    expect(plan.normalTiling).toBe('panel')
  })
})

describe('whole surfaces are not tinted by their fallback colour', () => {
  const DEFAULT = adaptKitchenResult(generateKitchen(MAGIC_KITCHEN_DEFAULT_INPUT), {
    parentId: 'level_test',
    roomOrigin: [0, 0, 0],
  })

  function materialOf(name: string): MeshStandardMaterial {
    const group = buildMagicLayoutGeometry({ ...DEFAULT.layout, backsplashMaterial: 'marble' })
    const mesh = group.children.find((child) => child.name === name) as Mesh | undefined
    if (!mesh) throw new Error(`no mesh named ${name} — found ${group.children.map((c) => c.name)}`)
    return mesh.material as MeshStandardMaterial
  }

  test('the floor takes a neutral grey, not the brown hardwood fallback', () => {
    // `style.ts` documents `fallbackColor` as the flat colour used WHEN THE JPG
    // IS UNAVAILABLE, and the MVP uses it in exactly one place: the texture's
    // onError callback (`KitchenAssembly.tsx:2693`). On the success path it
    // sets `Color3(0.7, 0.7, 0.7)` — "reduce albedo so shadows can darken".
    // Wiring the fallback in as a tint multiplied the oak plank photo by
    // hardwood's `#a67c52`.
    const { color } = materialOf('magic-floor:hardwood')
    expect(color.getHexString()).not.toBe('a67c52')
    // Neutral: no channel may pull the photo toward a hue.
    expect(color.r).toBeCloseTo(color.g, 6)
    expect(color.g).toBeCloseTo(color.b, 6)
    // And below white, so shadows still have somewhere to go.
    expect(color.r).toBeLessThan(1)
    expect(color.r).toBeGreaterThan(0.5)
  })

  test('the backsplash takes a neutral grey, not the olive default', () => {
    // With no colour passed, the key `backsplash:marble` falls through
    // `materialColor`'s token scan to its `#9b9b83` default — white metro tile
    // multiplied by olive.
    const { color } = materialOf('magic-backsplash:marble')
    expect(color.getHexString()).not.toBe('9b9b83')
    expect(color.r).toBeCloseTo(color.g, 6)
    expect(color.g).toBeCloseTo(color.b, 6)
    // The MVP's backsplash sits a little brighter than its floor (0.85 vs 0.7).
    expect(color.r).toBeGreaterThan(materialOf('magic-floor:hardwood').color.r)
  })
})
