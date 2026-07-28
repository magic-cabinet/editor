import { describe, expect, test } from 'bun:test'
import { MAGIC_PILOT_PRESENTATIONS } from './presentation'

/**
 * `wallMode` decides whether the house is on screen at all, not how it looks.
 * `packages/viewer/src/systems/wall/wall-cutout.tsx:36-40`:
 *
 *   'up'      -> hideWall = false      every wall drawn
 *   'down'    -> hideWall = true       every wall hidden, unconditionally
 *   'cutaway' -> hide walls facing away from the camera
 *
 * Four of six presets shipped as `'down'`, so a session drew the kitchen in an
 * open field: 12 walls, 4 doors and 5 windows all in the graph, all suppressed
 * at draw time. That is a whole-house regression hiding inside a table of
 * camera poses, which is why it gets its own test.
 */
describe('presentation presets keep the house on screen', () => {
  test('no 3D preset hides every wall', () => {
    const blind = MAGIC_PILOT_PRESENTATIONS.filter(
      (p) => p.viewMode === '3d' && p.wallMode === 'down',
    )
    expect(blind.map((p) => p.id)).toEqual([])
  })

  test('only the 2D floor plan uses down', () => {
    for (const preset of MAGIC_PILOT_PRESENTATIONS) {
      if (preset.wallMode === 'down') expect(preset.viewMode).toBe('2d')
    }
  })

  test('elevation shows its wall, because an elevation is a view of a wall', () => {
    const elevation = MAGIC_PILOT_PRESENTATIONS.find((p) => p.id === 'elevation')
    expect(elevation?.wallMode).toBe('up')
  })

  test('hero — the default presentation — draws the whole house', () => {
    const hero = MAGIC_PILOT_PRESENTATIONS.find((p) => p.id === 'hero')
    expect(hero?.wallMode).toBe('up')
  })
})
