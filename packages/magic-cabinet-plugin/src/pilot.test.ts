import { describe, expect, test } from 'bun:test'
import {
  type GenerateKitchenInput,
  generateKitchen,
  type KitchenComponent,
  PILOT_KITCHEN_INPUT,
  validateKitchen,
} from '@magic-cabinet/engine'
import { getMaterialPresetByRef } from '@pascal-app/core'
import { adaptKitchenResult } from './adapter'
import { createMagicKitchenPilotScene } from './house'
import { createMagicKitchenHouseShell } from './house-shell'
import { magicCabinetPlugin } from './index'
import { getMagicPilotPresentation, MAGIC_PILOT_PRESENTATIONS } from './presentation'
import type { MagicCabinetComponentNode } from './schema'

describe('Magic Cabinet Pascal adapter', () => {
  test('preserves the exact deterministic result and converts geometry to metres', () => {
    const result = generateKitchen(PILOT_KITCHEN_INPUT)
    const adapted = adaptKitchenResult(result, {
      parentId: 'level_test',
      roomOrigin: [-5.45, 0.05, -0.7],
    })

    expect(validateKitchen(result).valid).toBe(true)
    expect(adapted.layout.engineResult).toEqual(JSON.parse(JSON.stringify(result)))
    expect(adapted.layout.width).toBeCloseTo(result.input.room.widthIn * 0.0254)
    expect(adapted.components).toHaveLength(result.components.length)
    expect(adapted.layout.componentIds).toHaveLength(result.components.length)
    expect(
      adapted.components.every((component) => component.type === 'magic-cabinet:component'),
    ).toBe(true)
    expect(
      adapted.components
        .flatMap((component) => component.geometry)
        .every((primitive) => {
          const values =
            primitive.kind === 'box'
              ? [...primitive.dimensionsM, ...primitive.positionM]
              : primitive.kind === 'triangle-mesh'
                ? [...primitive.positionsM, ...primitive.positionM]
                : [...primitive.outlineM.flat(), primitive.heightM, primitive.baseYM]
          return values.every(Number.isFinite)
        }),
    ).toBe(true)
  })

  /**
   * Both renderers place a component's children by rotating node-local points
   * with the node yaw: `<group rotation={node.rotation}>` in 3D and
   * `rotate(-yaw)` in `buildMagicComponentFloorplan`. So for any engine point
   * that arrives in room-world inches, this has to hold:
   *
   *   nodePosition + R(yaw) * nodeLocalPoint === roomOrigin + convert(worldPoint)
   *
   * It fails if the yaw is applied twice, if the handedness flip is missing or
   * doubled, or if the inch conversion is wrong — the three ways this adapter
   * can silently produce plausible geometry.
   */
  const worldAnchoredPoints = (component: KitchenComponent) => [
    ...(component.planOutlineIn ?? []).map((point, index) => ({
      label: `planOutline[${index}]`,
      point,
    })),
    ...component.geometry.flatMap((primitive, primitiveIndex) =>
      primitive.kind === 'polygon-prism'
        ? [
            ...primitive.outlineIn.map((point, index) => ({
              label: `geometry[${primitiveIndex}].outlineM[${index}]`,
              point,
            })),
            ...(primitive.holesIn ?? []).flatMap((hole, holeIndex) =>
              hole.outlineIn.map((point, index) => ({
                label: `geometry[${primitiveIndex}].holesM[${holeIndex}][${index}]`,
                point,
              })),
            ),
          ]
        : [],
    ),
  ]

  const nodeLocalPoints = (node: MagicCabinetComponentNode) => [
    ...(node.planOutline ?? []),
    ...node.geometry.flatMap((primitive) =>
      primitive.kind === 'polygon-prism' ? [...primitive.outlineM, ...primitive.holesM.flat()] : [],
    ),
  ]

  const roomOrigin: [number, number, number] = [-5.45, 0.05, -0.7]

  for (const layout of ['galley', 'l-shape', 'u-shape', 'one-wall'] as const) {
    test(`places world-anchored outlines at their engine coordinates (${layout})`, () => {
      const input: GenerateKitchenInput = {
        ...PILOT_KITCHEN_INPUT,
        room: { ...PILOT_KITCHEN_INPUT.room, layout },
      }
      const result = generateKitchen(input)
      const adapted = adaptKitchenResult(result, { parentId: 'level_test', roomOrigin })
      const nodesByEngineId = new Map(
        adapted.components.map((component) => [component.engineComponentId, component]),
      )

      let checked = 0
      const yaws = new Set<number>()
      for (const component of result.components) {
        const node = nodesByEngineId.get(component.id)
        expect(node).toBeDefined()
        if (!node) continue

        const expected = worldAnchoredPoints(component)
        const actual = nodeLocalPoints(node)
        expect(actual).toHaveLength(expected.length)
        if (expected.length === 0) continue
        yaws.add(component.transform.rotationDeg.y)

        const yaw = node.rotation[1]
        for (const [index, { label, point }] of expected.entries()) {
          const [localX, localZ] = actual[index] as [number, number]
          const worldX = node.position[0] + localX * Math.cos(yaw) + localZ * Math.sin(yaw)
          const worldZ = node.position[2] - localX * Math.sin(yaw) + localZ * Math.cos(yaw)

          expect(`${component.id}.${label}.x=${worldX.toFixed(6)}`).toBe(
            `${component.id}.${label}.x=${(roomOrigin[0] + point.x * 0.0254).toFixed(6)}`,
          )
          expect(`${component.id}.${label}.z=${worldZ.toFixed(6)}`).toBe(
            `${component.id}.${label}.z=${(roomOrigin[2] - point.z * 0.0254).toFixed(6)}`,
          )
          checked += 1
        }
      }

      // Guards the guard: a fixture with no world-anchored points, or only
      // unrotated ones, cannot tell a correct adapter from a broken one.
      expect(checked).toBeGreaterThan(0)
      expect([...yaws].some((value) => value % 360 !== 0)).toBe(true)
    })
  }

  test('publishes an API v1 plugin with only Magic Cabinet node kinds', () => {
    expect(magicCabinetPlugin.apiVersion).toBe(1)
    expect(magicCabinetPlugin.nodes?.map((definition) => definition.kind)).toEqual([
      'magic-cabinet:layout',
      'magic-cabinet:component',
    ])
  })
})

describe('Magic Kitchen House pilot', () => {
  test('has a roofless 12 by 9 metre house, real rooms, porch, and native openings', () => {
    const shell = createMagicKitchenHouseShell()
    const nodes = Object.values(shell.nodes)
    const walls = nodes.filter((node) => node.type === 'wall')
    const zones = nodes.filter((node) => node.type === 'zone')

    expect(walls).toHaveLength(12)
    expect(zones).toHaveLength(7)
    expect(nodes.filter((node) => node.type === 'door')).toHaveLength(4)
    expect(nodes.filter((node) => node.type === 'window')).toHaveLength(5)
    expect(nodes.some((node) => node.type === 'slab' && node.name === 'Timber porch')).toBe(true)
    expect(nodes.some((node) => node.type === 'spawn')).toBe(true)
    expect(nodes.some((node) => node.type === 'roof' || node.type === 'column')).toBe(false)

    const exteriorPoints = walls
      .filter((node) => node.name?.includes('exterior'))
      .flatMap((node) => {
        const wall = node as typeof node & { start: [number, number]; end: [number, number] }
        return [wall.start, wall.end]
      })
    expect(
      Math.max(...exteriorPoints.map(([x]) => x)) - Math.min(...exteriorPoints.map(([x]) => x)),
    ).toBe(12)
    expect(
      Math.max(...exteriorPoints.map(([, z]) => z)) - Math.min(...exteriorPoints.map(([, z]) => z)),
    ).toBe(9)
  })

  test('installs the valid engine kitchen into the architectural shell', () => {
    const scene = createMagicKitchenPilotScene()
    const nodes = Object.values(scene.nodes)
    const layout = nodes.find(
      (node) => (node as { type: string }).type === 'magic-cabinet:layout',
    ) as unknown as { width: number; engineResult: unknown; activePresentation: string }

    expect(scene.installedPlugins).toEqual(['magic-cabinet:pilot'])
    expect(layout.width).toBeCloseTo(4.1, 1)
    expect(layout.engineResult).toBeTruthy()
    expect(layout.activePresentation).toBe('hero')
    expect(
      nodes.filter((node) => (node as { type: string }).type === 'magic-cabinet:component').length,
    ).toBeGreaterThan(30)
  })

  /**
   * A dangling `library:<id>` is invisible at runtime. `resolveMaterialRef`
   * returns null for an unknown id exactly as it does for an unsupported ref
   * shape, and every consumer treats null as "use the declared slot default" —
   * so a mistyped floor finish still renders as a floor, with no error and no
   * blank surface. `library:wood-flooring-oak` shipped that way and collapsed
   * the porch onto the house floor's plank for the life of the plugin.
   *
   * This sweeps what the plugin actually emits, so the next typo fails here
   * rather than rendering plausibly.
   */
  test('every library: slot ref the plugin emits names a real catalog material', () => {
    const refs = Object.values(createMagicKitchenPilotScene().nodes)
      .flatMap((node) =>
        Object.entries((node as { slots?: Record<string, string> }).slots ?? {}).map(
          ([slotId, ref]) => ({ node: node.id, slotId, ref }),
        ),
      )
      .filter(({ ref }) => ref.startsWith('library:'))

    // Controls — an empty sweep and a lookup that never returns null both pass
    // this test vacuously, which is the failure mode the ref itself had.
    expect(refs.length).toBeGreaterThan(0)
    expect(getMaterialPresetByRef('library:not-a-real-material')).toBeNull()

    expect(refs.filter(({ ref }) => getMaterialPresetByRef(ref) === null)).toEqual([])
  })
})

describe('showroom presentations', () => {
  test('covers the semantic MCP camera contract with free-navigation poses', () => {
    expect(MAGIC_PILOT_PRESENTATIONS.map((presentation) => presentation.id)).toEqual([
      'hero',
      'workwall',
      'detail',
      'plan',
      'elevation',
      'breakaway',
    ])
    expect(getMagicPilotPresentation('plan').pose.projection).toBe('orthographic')
    expect(getMagicPilotPresentation('plan').viewMode).toBe('2d')
    expect(getMagicPilotPresentation('detail').sceneTheme).toBe('twilight')
    expect(
      MAGIC_PILOT_PRESENTATIONS.every((presentation) =>
        [...presentation.pose.position, ...presentation.pose.target].every(Number.isFinite),
      ),
    ).toBe(true)
  })
})
