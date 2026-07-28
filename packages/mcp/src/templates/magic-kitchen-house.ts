import { createMagicKitchenHouseShell } from '@magic-cabinet/pascal-plugin/house-shell'
import type { SceneGraph } from '@pascal-app/core/clone-scene-graph'

/**
 * Roofless 12 × 9 m base house for the Magic Cabinet pilot.
 *
 * The MCP template stays architectural-only so it validates against Pascal's
 * core AnyNode union. The editor's Magic plugin deterministically installs the
 * generated kitchen components when the showroom scene loads.
 */
export const template: SceneGraph = createMagicKitchenHouseShell()

export const metadata = {
  id: 'magic-kitchen-house',
  name: 'Magic Kitchen House',
  description:
    'Roofless 12 × 9 m cabinet showroom with a kitchen threshold, compact living room, separated bedroom, service rooms, gallery, porch, native doors, and windows.',
} as const
