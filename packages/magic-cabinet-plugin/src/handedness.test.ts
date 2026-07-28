import { describe, expect, test } from 'bun:test'
import {
  generateKitchen,
  type KitchenComponent,
  type KitchenResult,
  PILOT_KITCHEN_INPUT,
  type TriangleMeshGeometry,
} from '@magic-cabinet/engine'
import { type AdaptedMagicKitchen, adaptKitchenResult } from './adapter'

// The Magic Cabinet engine is left-handed (+X east, +Y up, +Z north — Babylon's
// convention); Pascal is three.js, which is right-handed. `invertZ` is that
// conversion, and it has three legs: negate Z, negate yaw, reverse triangle
// winding. Every leg is a sign, a wrong sign mirrors the kitchen instead of
// throwing, and nothing else in the suite asserts any of them — `pilot.test.ts`
// checks scale on X and `Number.isFinite`, both of which pass either way.
//
// So every test here is written to FAIL under `invertZ: false`, and each one
// carries that run as an explicit negative control.

const INCH_TO_METER = 0.0254
const ROOM_ORIGIN: [number, number, number] = [-5.45, 0.05, -0.7]

function adapt(result: KitchenResult, invertZ?: boolean): AdaptedMagicKitchen {
  return adaptKitchenResult(result, {
    parentId: 'level_test',
    roomOrigin: ROOM_ORIGIN,
    ...(invertZ === undefined ? {} : { invertZ }),
  })
}

function nodeFor(adapted: AdaptedMagicKitchen, engineComponentId: string) {
  const node = adapted.components.find(
    (component) => component.engineComponentId === engineComponentId,
  )
  if (!node) throw new Error(`no adapted node for ${engineComponentId}`)
  return node
}

describe('invertZ — left-handed engine to right-handed Pascal', () => {
  const result = generateKitchen(PILOT_KITCHEN_INPUT)

  test('the pilot fixture is actually chiral, so these tests can discriminate', () => {
    // A symmetric fixture is invariant under the flip and would let every
    // assertion below pass for the wrong reason.
    const northWall = result.components.filter(
      (component) => component.wall === 'north' && component.transform.positionIn.z > 0,
    )
    const yawed = result.components.filter(
      (component) => Math.abs(component.transform.rotationDeg.y % 180) > 0,
    )
    expect(northWall.length).toBeGreaterThan(0)
    expect(yawed.length).toBeGreaterThan(0)
  })

  test('north-wall components land on the negative-Z side of the room origin', () => {
    // North is +Z at max depth in the engine; after the flip it must be the
    // near side of the origin in Pascal, not the far side.
    const source = result.components.find(
      (component) => component.wall === 'north' && component.transform.positionIn.z > 0,
    ) as KitchenComponent
    const flipped = nodeFor(adapt(result), source.id)
    const control = nodeFor(adapt(result, false), source.id)

    expect(flipped.position[2]).toBeCloseTo(
      ROOM_ORIGIN[2] - source.transform.positionIn.z * INCH_TO_METER,
      6,
    )
    expect(flipped.position[2]).toBeLessThan(ROOM_ORIGIN[2])
    expect(control.position[2]).toBeGreaterThan(ROOM_ORIGIN[2])
  })

  test('a 90-degree engine yaw becomes -pi/2 radians in Pascal', () => {
    // 180 and 0 are invariant under yaw negation, so only an off-axis
    // component can tell the two conversions apart.
    const source = result.components.find(
      (component) => component.transform.rotationDeg.y === 90,
    ) as KitchenComponent
    const flipped = nodeFor(adapt(result), source.id)
    const control = nodeFor(adapt(result, false), source.id)

    expect(flipped.rotation[1]).toBeCloseTo(-Math.PI / 2, 6)
    expect(control.rotation[1]).toBeCloseTo(Math.PI / 2, 6)
  })

  test('countertop plan outlines are mirrored in Z, not copied', () => {
    const source = result.components.find(
      (component) =>
        component.planOutlineIn?.some(
          (point) => Math.abs(point.z - component.transform.positionIn.z) > 1e-6,
        ) ?? false,
    ) as KitchenComponent
    const outline = source.planOutlineIn ?? []
    const flipped = nodeFor(adapt(result), source.id).planOutline ?? []
    const control = nodeFor(adapt(result, false), source.id).planOutline ?? []

    expect(flipped).toHaveLength(outline.length)
    for (const [index, point] of outline.entries()) {
      const localZ = (point.z - source.transform.positionIn.z) * INCH_TO_METER
      expect(flipped[index]?.[1]).toBeCloseTo(-localZ, 6)
      expect(control[index]?.[1]).toBeCloseTo(localZ, 6)
    }
    expect(flipped).not.toEqual(control)
  })

  test('invertZ defaults to true, so callers cannot get the unflipped frame by omission', () => {
    expect(adapt(result).components.map((component) => component.position)).toEqual(
      adapt(result, true).components.map((component) => component.position),
    )
  })
})

describe('invertZ — triangle winding', () => {
  // The pilot emits only box and polygon-prism primitives, so the winding
  // reversal in `adaptTriangle` runs on no shipped data today. Extruded
  // polygons are safe either way (three's ExtrudeGeometry normalises winding),
  // but a raw triangle mesh is not: mirroring without reversing the index
  // order turns every face inside out, which is invisible to schema
  // validation and to a 200 from the editor.

  // Outward-facing tetrahedron, in inches, wound CCW-from-outside.
  const TETRA_POSITIONS = [0, 0, 0, 10, 0, 0, 0, 10, 0, 0, 0, 10]
  const TETRA_INDICES = [0, 2, 1, 0, 1, 3, 0, 3, 2, 1, 2, 3]

  // Divergence theorem: sign is positive when faces are wound outward.
  function signedVolume(positions: readonly number[], indices: readonly number[]): number {
    let total = 0
    for (let index = 0; index < indices.length; index += 3) {
      const a = (indices[index] ?? 0) * 3
      const b = (indices[index + 1] ?? 0) * 3
      const c = (indices[index + 2] ?? 0) * 3
      const ax = positions[a] ?? 0
      const ay = positions[a + 1] ?? 0
      const az = positions[a + 2] ?? 0
      const bx = positions[b] ?? 0
      const by = positions[b + 1] ?? 0
      const bz = positions[b + 2] ?? 0
      const cx = positions[c] ?? 0
      const cy = positions[c + 1] ?? 0
      const cz = positions[c + 2] ?? 0
      total += ax * (by * cz - bz * cy) - ay * (bx * cz - bz * cx) + az * (bx * cy - by * cx)
    }
    return total / 6
  }

  function withTetrahedron(): KitchenResult {
    const result = generateKitchen(PILOT_KITCHEN_INPUT)
    const target = result.components[0] as KitchenComponent
    const tetra: TriangleMeshGeometry = {
      kind: 'triangle-mesh',
      space: 'component-local',
      positionsIn: [...TETRA_POSITIONS],
      indices: [...TETRA_INDICES],
      transform: {
        positionIn: { x: 0, y: 0, z: 0 },
        rotationDeg: { x: 0, y: 0, z: 0 },
      },
      materialKey: 'cabinet-panel',
    }
    return {
      ...result,
      components: result.components.map((component, index) =>
        index === 0 ? { ...component, geometry: [tetra] } : component,
      ),
    } as KitchenResult
  }

  test('the fixture itself is wound outward', () => {
    expect(signedVolume(TETRA_POSITIONS, TETRA_INDICES)).toBeGreaterThan(0)
  })

  test('mirroring Z and reversing the index order preserves outward faces', () => {
    const result = withTetrahedron()
    const targetId = (result.components[0] as KitchenComponent).id
    const primitive = nodeFor(adapt(result), targetId).geometry[0]
    if (primitive?.kind !== 'triangle-mesh') throw new Error('expected a triangle mesh')

    // The mirror flips the volume sign and the winding reversal flips it back,
    // so a correct conversion lands on the same sign it started with.
    expect(signedVolume(primitive.positionsM, primitive.indices)).toBeGreaterThan(0)

    // Control: the same mirrored vertices read with the ORIGINAL index order —
    // i.e. what the adapter would emit if the winding leg were dropped. If this
    // is not inside out, the assertion above is not discriminating.
    expect(signedVolume(primitive.positionsM, TETRA_INDICES)).toBeLessThan(0)
  })

  test('leaving the frame left-handed leaves the winding alone', () => {
    const result = withTetrahedron()
    const targetId = (result.components[0] as KitchenComponent).id
    const primitive = nodeFor(adapt(result, false), targetId).geometry[0]
    if (primitive?.kind !== 'triangle-mesh') throw new Error('expected a triangle mesh')

    expect(primitive.indices).toEqual(TETRA_INDICES)
    expect(signedVolume(primitive.positionsM, primitive.indices)).toBeGreaterThan(0)
  })
})
