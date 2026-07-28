import { type GenerateKitchenInput, generateKitchen, validateKitchen } from '@magic-cabinet/engine'
import type { AnyNode } from '@pascal-app/core'
import type { SceneGraph } from '@pascal-app/core/clone-scene-graph'
import { adaptKitchenResult } from './adapter'
import { MAGIC_CABINET_PLUGIN_ID } from './constants'
import { createMagicKitchenHouseShell, MAGIC_PILOT_LEVEL_ID } from './house-shell'

/**
 * The kitchen the Babylon MVP paints on mount — not the engine's `PILOT_KITCHEN_INPUT`
 * bench, which is a hand-authored one-wall demo run with appliances pinned at explicit
 * centimetre offsets. Mirrors `magic-cabinet/mvp`:
 *
 * - room: `toRoomDef(DEFAULT_FLOORPLAN, islandOn, peninsulaOn)`
 *   (`apps/web/src/lib/simple-designer/design-generation.ts:67`), where
 *   `DEFAULT_FLOORPLAN` is l-shape 120×120 with a 96" ceiling
 *   (`apps/web/src/components/FloorplanEditor/types.ts:71`)
 * - island/peninsula: both `useState(true)`
 *   (`apps/web/src/components/SimpleKitchenDesigner.tsx:308,311`)
 * - seed: `DEFAULT_DESIGN_SEED` (`design-generation.ts:38`), passed to the mount solve
 *   at `SimpleKitchenDesigner.tsx:512`
 *
 * The MVP also passes a `weights` argument, which is `useState({})` at mount
 * (`SimpleKitchenDesigner.tsx:340`) and merges over `DEFAULT_WEIGHTS` — so an absent
 * weights field here is the same input, not a simplification of it.
 *
 * `island` is carried explicitly and must stay that way: the engine defaults it to
 * **true**, so omitting it reads as "on" while `false` drops the island's five
 * components. `peninsula` is inert for this room (true and false produce
 * byte-identical output) and is carried only to mirror the MVP call.
 *
 * The `/demo/:code` showroom is a *different* kitchen (144×132, seed `0x44454d4f`) and
 * is not solved live — it ships as a frozen literal in `apps/web/src/lib/demo-fixture.ts`.
 */
export const MAGIC_KITCHEN_DEFAULT_INPUT: GenerateKitchenInput = Object.freeze({
  room: Object.freeze({
    layout: 'l-shape',
    widthIn: 120,
    depthIn: 120,
    ceilingHeightIn: 96,
    island: true,
    peninsula: true,
  }),
  seed: 0x4d434142, // "MCAB"
}) as GenerateKitchenInput

/**
 * Seats the kitchen's two cabinet runs onto real house walls.
 *
 * The kitchen zone is `x −6…−0.8, z −4.5…−0.7` (`house-shell.ts`), and `adapter.ts`
 * maps world z as `roomOrigin.z − engineZ` under `invertZ`, so the engine's north wall
 * (max z) and east wall (max x) land at `roomOrigin.z − depth` and `roomOrigin.x + width`.
 *
 * The one-wall pilot exploited this to pin its back run to the north exterior wall
 * (`−0.7 − 3.800 = −4.5`) and simply centred its width. An L-shape needs a real corner
 * instead, so both runs are anchored: the north run onto `wall_magic_north` (z = −4.5)
 * and the east run onto `wall_magic_kitchen_side` (x = −0.8), seating the L into the
 * corner those two walls form. 120" = 3.048 m, hence −4.5 + 3.048 and −0.8 − 3.048.
 */
const MAGIC_KITCHEN_ROOM_ORIGIN: [number, number, number] = [-3.848, 0.05, -1.452]

export function createMagicKitchenPilotScene(): SceneGraph {
  const scene = createMagicKitchenHouseShell()
  const result = generateKitchen(MAGIC_KITCHEN_DEFAULT_INPUT)
  const validation = validateKitchen(result)
  if (!validation.valid) {
    throw new Error(
      `Magic Cabinet pilot engine result is invalid: ${validation.issues
        .map((issue) => issue.message)
        .join('; ')}`,
    )
  }

  const kitchen = adaptKitchenResult(result, {
    parentId: MAGIC_PILOT_LEVEL_ID,
    roomOrigin: MAGIC_KITCHEN_ROOM_ORIGIN,
    invertZ: true,
  })

  const level = scene.nodes[MAGIC_PILOT_LEVEL_ID] as AnyNode & { children: string[] }
  level.children.push(kitchen.layout.id, ...kitchen.components.map((component) => component.id))
  scene.nodes[kitchen.layout.id as keyof typeof scene.nodes] = kitchen.layout as unknown as AnyNode
  for (const component of kitchen.components) {
    scene.nodes[component.id as keyof typeof scene.nodes] = component as unknown as AnyNode
  }

  return {
    ...scene,
    installedPlugins: [MAGIC_CABINET_PLUGIN_ID],
  }
}
