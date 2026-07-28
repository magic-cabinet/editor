import { describe, expect, test } from 'bun:test'
import { generateKitchen, PILOT_KITCHEN_INPUT } from '@magic-cabinet/engine'
import { adaptKitchenResult } from './adapter'
import { type MagicStyleContext, magicMaterialPlan } from './materials'
import type { MagicCabinetComponentNode } from './schema'

/** The default designer style, varying only the finish under test. */
function style(finish: string): MagicStyleContext {
  return { finish, cabinetTexture: 'none', countertopMaterial: 'quartz' }
}

function styleOf(node: MagicCabinetComponentNode): MagicStyleContext {
  return {
    finish: node.finish,
    cabinetTexture: node.cabinetTexture,
    countertopMaterial: node.countertopMaterial,
  }
}

// The finish/texture mapping ported from the web MVP's Babylon designer
// (`apps/web/src/components/cabinet-scene-mesh.ts`). These assert the DECISION,
// not the render: three's `TextureLoader` needs a DOM, so building real
// materials only works in a browser. What can go wrong here is the mapping —
// a finish silently falling through to no texture, or a panel that should stay
// bare picking up wood grain.

describe('finish → texture mapping', () => {
  test('oak takes the full wood PBR set at the MVP normal strength', () => {
    const plan = magicMaterialPlan('cabinet-panel:plywood', style('oak'))
    expect(plan.map).toBe('/textures/finishes/wood-light/color.jpg')
    expect(plan.normalMap).toBe('/textures/finishes/wood-light/normal.jpg')
    expect(plan.roughnessMap).toBe('/textures/finishes/wood-light/roughness.jpg')
    expect(plan.normalScale).toBe(0.26)
    expect(plan.roughness).toBe(0.42)
  })

  test('black takes the dark wood set, which is a weaker normal', () => {
    const plan = magicMaterialPlan('cabinet-panel:mdf', style('black'))
    expect(plan.map).toBe('/textures/finishes/wood-dark/color.jpg')
    expect(plan.normalScale).toBe(0.16)
  })

  test('painted finishes take the paint albedo and the shared paint normal', () => {
    for (const finish of ['sage', 'white']) {
      const plan = magicMaterialPlan('cabinet-panel:mdf', style(finish))
      expect(plan.map).toBe('/textures/cabinets/painted.jpg')
      expect(plan.normalMap).toBe('/textures/finishes/paint-normal.jpg')
      expect(plan.normalScale).toBe(0.2)
      expect(plan.roughness).toBe(0.55)
    }
  })

  test('back panels, glass, appliances and hardware never take the body finish', () => {
    // MVP `createMaterialFactory` excludes exactly these from `takesBodyColor`.
    for (const key of [
      'cabinet-panel:back_panel',
      'cabinet-panel:glass',
      'appliance:refrigerator',
      'hardware:pull',
    ]) {
      const plan = magicMaterialPlan(key, style('oak'))
      expect(plan.map).toBeNull()
      expect(plan.normalMap).toBeNull()
    }
    expect(magicMaterialPlan('hardware:pull', style('oak')).metalness).toBe(0.72)
    expect(magicMaterialPlan('cabinet-panel:plywood', style('oak')).metalness).toBe(0)
  })

  test("a countertop takes the designer's slab, never the cabinet finish", () => {
    // The engine names a slab material in the key, but `countertopMaterial` is
    // what the user picks in the designer — so it wins. Falling through to the
    // body finish instead would put oak grain on a slab of granite, and
    // reading the key would make the picker do nothing.
    const marble: MagicStyleContext = { ...style('oak'), countertopMaterial: 'marble' }
    expect(magicMaterialPlan('countertop:quartz', marble).map).toBe(
      '/textures/countertops/marble.jpg',
    )
    // Even a key the engine never emits still resolves off the picker.
    expect(magicMaterialPlan('countertop:unobtanium', marble).map).toBe(
      '/textures/countertops/marble.jpg',
    )
    expect(magicMaterialPlan('countertop:marble', style('oak')).map).toBe(
      '/textures/countertops/quartz.jpg',
    )
    // Quartz is the polished tier; stone and block are matter.
    expect(magicMaterialPlan('countertop:quartz', style('oak')).roughness).toBe(0.32)
    expect(magicMaterialPlan('countertop:quartz', marble).roughness).toBe(0.5)
  })

  test('every primitive the pilot emits resolves to a texture or deliberate bare', () => {
    // Guards against a new engine material key silently landing on no texture.
    const result = generateKitchen(PILOT_KITCHEN_INPUT)
    const adapted = adaptKitchenResult(result, {
      parentId: 'level_test',
      roomOrigin: [-5.45, 0.05, -0.7],
    })
    const bare = new Set<string>()
    let textured = 0
    for (const node of adapted.components) {
      for (const primitive of node.geometry) {
        const plan = magicMaterialPlan(primitive.materialKey, styleOf(node))
        if (plan.map) textured += 1
        else bare.add(primitive.materialKey)
      }
    }
    expect(textured).toBeGreaterThan(0)
    // Whatever stays bare must be one of the four deliberate exclusions.
    for (const key of bare) {
      expect(
        /back_panel|glass|appliance|hardware/.test(key.toLowerCase()),
        `unmapped material key: ${key}`,
      ).toBe(true)
    }
  })
})
