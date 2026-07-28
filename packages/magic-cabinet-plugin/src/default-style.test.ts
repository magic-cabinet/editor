import { describe, expect, test } from 'bun:test'
import { generateKitchen } from '@magic-cabinet/engine'
import { adaptKitchenResult } from './adapter'
import { magicCabinetComponentDefinition, magicCabinetLayoutDefinition } from './definitions'
import { isTrimVisible } from './geometry'
import { MAGIC_KITCHEN_DEFAULT_INPUT } from './house'
import { materialColor } from './materials'
import { MagicCabinetComponentNode } from './schema'

/**
 * The Pascal kitchen has to open looking like the Babylon designer's default,
 * because that is the kitchen the product ships. The MVP's default design is
 * `DEFAULT_DESIGN_STYLE` in
 * `magic-cabinet/mvp` `apps/web/src/lib/simple-designer/design-generation.ts:39-49`:
 *
 *   cabinetFinish "white" -> #f5f5f0   doorStyle "shaker"
 *   countertopMaterial "quartz"        flooringType "hardwood"
 *   backsplashMaterial "none"          crownMoldingStyle "none"
 *   ceilingFillersEnabled false
 *
 * Every default below is one of those values. They had drifted onto Pascal's
 * own showroom palette — sage walls, oak bases, slab doors, a metro-tile
 * splash and the engine's full trim — which is a different kitchen, not a
 * differently-lit one.
 */

const DEFAULT = adaptKitchenResult(generateKitchen(MAGIC_KITCHEN_DEFAULT_INPUT), {
  parentId: 'level_test',
  roomOrigin: [0, 0, 0],
})

const MVP_WHITE = '#f5f5f0'

describe('the default kitchen wears the MVP default style', () => {
  test('cabinets, panels, fillers and trim are all one white', () => {
    const bodies = DEFAULT.components.filter(
      (node) => node.componentKind !== 'countertop' && !node.componentKind.startsWith('appliance'),
    )
    expect(bodies.length).toBeGreaterThan(20)
    // The MVP has no per-component finish at all — one `cabinetColor` for the
    // kitchen. Any second body finish here is Pascal inventing a palette.
    expect([...new Set(bodies.map((node) => node.finish))]).toEqual(['white'])
  })

  test('countertops and appliances keep their own finishes', () => {
    const finishOf = (kind: string) =>
      new Set(DEFAULT.components.filter((n) => n.componentKind === kind).map((node) => node.finish))
    expect(finishOf('countertop')).toEqual(new Set(['quartz']))
    expect(finishOf('appliance')).toEqual(new Set(['black']))
  })

  test('doors are shaker and the splash is off', () => {
    // Two independent default paths, and the adapter uses the *schema* one:
    // `adaptKitchenResult` parses a layout literal with no style keys, so a
    // schema default is what the shipped kitchen actually wears. Asserting
    // only `defaults()` misses that entirely.
    expect(DEFAULT.layout.doorStyle).toBe('shaker')
    expect(DEFAULT.layout.backsplashMaterial).toBe('none')
    expect(DEFAULT.components.every((node) => node.doorStyle === 'shaker')).toBe(true)

    const layout = magicCabinetLayoutDefinition.defaults()
    expect(layout.doorStyle).toBe('shaker')
    expect(layout.backsplashMaterial).toBe('none')
    expect(layout.countertopMaterial).toBe('quartz')
    expect(layout.floorType).toBe('hardwood')
    // A component built by hand has to agree, or a manually-placed cabinet
    // lands slab-fronted next to 20 shaker ones.
    expect(magicCabinetComponentDefinition.defaults().doorStyle).toBe('shaker')
  })
})

describe('finish reaches the renderer as a colour', () => {
  // `materialColor` scans the material *key* for a token before consulting the
  // finish, and the engine names cabinet parts `cabinet-panel:mdf` /
  // `panel:mdf` / `trim:mdf`. Every one of those matched a generic grey first,
  // so `finish` tinted nothing a user could see. Each case below returned
  // #9b9b83 before the order was fixed.
  const BODY_KEYS = ['cabinet-panel:mdf', 'cabinet-door:paint', 'panel:mdf', 'trim:mdf']

  test.each(BODY_KEYS)('%s takes the body finish', (key) => {
    expect(materialColor(key, undefined, 'white')).toBe(MVP_WHITE)
    // Discrimination: a different finish must give a different colour, or the
    // assertion above passes on a constant.
    expect(materialColor(key, undefined, 'oak')).not.toBe(MVP_WHITE)
    expect(materialColor(key, undefined, 'sage')).not.toBe(MVP_WHITE)
  })

  test.each([
    'glass:tempered',
    'hardware:steel',
    'appliance:shell',
  ])('%s ignores the body finish', (key) => {
    // The MVP excludes exactly these from `takesBodyColor`. White cabinets
    // must not turn the fridge shell or the glass white.
    expect(materialColor(key, undefined, 'white')).not.toBe(MVP_WHITE)
  })

  test('an explicit primitive colour still wins', () => {
    expect(materialColor('cabinet-panel:mdf', '#123456', 'white')).toBe('#123456')
  })
})

describe('crown molding and ceiling fillers are engine output, not design intent', () => {
  const trim = (subtype: string) => DEFAULT.components.filter((node) => node.subtype === subtype)

  test('the engine emits them and the default hides them', () => {
    const crown = trim('crown-molding')
    const fillers = trim('ceiling-filler')
    // Guards the premise: if the engine stops emitting these the suppression
    // below would pass vacuously.
    expect(crown.length).toBeGreaterThan(0)
    expect(fillers.length).toBeGreaterThan(0)

    for (const node of [...crown, ...fillers]) expect(isTrimVisible(node)).toBe(false)
  })

  test('everything else still draws', () => {
    const hidden = DEFAULT.components.filter((node) => !isTrimVisible(node))
    const suppressed = new Set(['crown-molding', 'ceiling-filler'])
    expect(hidden.every((node) => suppressed.has(node.subtype))).toBe(true)
    // 20 of 55 in the default kitchen — over a third of the scene was trim the
    // Babylon default never draws.
    expect(hidden.length).toBe(20)
    expect(DEFAULT.components.length).toBe(55)
  })

  test('flipping the switch back on restores them', () => {
    const crown = trim('crown-molding')[0]
    expect(crown).toBeDefined()
    const on = MagicCabinetComponentNode.parse({ ...crown, crownMoldingEnabled: true })
    expect(isTrimVisible(on)).toBe(true)
  })
})
