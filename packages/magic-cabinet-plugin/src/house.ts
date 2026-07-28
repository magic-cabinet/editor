import { generateKitchen, PILOT_KITCHEN_INPUT, validateKitchen } from '@magic-cabinet/engine'
import type { AnyNode } from '@pascal-app/core'
import type { SceneGraph } from '@pascal-app/core/clone-scene-graph'
import { adaptKitchenResult } from './adapter'
import { MAGIC_CABINET_PLUGIN_ID } from './constants'
import { createMagicKitchenHouseShell, MAGIC_PILOT_LEVEL_ID } from './house-shell'

export function createMagicKitchenPilotScene(): SceneGraph {
  const scene = createMagicKitchenHouseShell()
  const result = generateKitchen(PILOT_KITCHEN_INPUT)
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
    roomOrigin: [-5.45, 0.05, -0.7],
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
