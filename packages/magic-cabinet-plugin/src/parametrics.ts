import type { AnyNode, AnyNodeId, ParametricDescriptor } from '@pascal-app/core'
import type { MagicCabinetComponentNode, MagicCabinetLayoutNode } from './schema'
import {
  BACKSPLASH_MATERIALS,
  CABINET_TEXTURES,
  COUNTERTOP_MATERIALS,
  DOOR_STYLES,
  FLOOR_TYPES,
} from './style'

/**
 * The right-hand inspector. Without it the plugin is a viewer: you can look at
 * a Magic Cabinet kitchen and drive it over MCP, but you cannot select a
 * cabinet and change it — which is most of what the Babylon designer *is*.
 *
 * Two descriptors, because the two nodes answer different questions:
 *
 *  - the **layout** owns the kitchen-wide look (floor, backsplash, door style,
 *    counter material). Editing it there is the designer's own model: one
 *    control, whole kitchen.
 *  - a **component** owns its own finish and handle, so a single run can be
 *    picked out in oak against a painted kitchen.
 *
 * Layout edits reach the components through `reconcile` rather than by having
 * the geometry builder read up the tree: `GeometrySystem` only re-runs the
 * builder for the node it marked dirty, so a component that read the layout's
 * `floorType` would keep its stale geometry until something else touched it.
 * Pushing the value down makes every builder a pure function of its own node,
 * which is the contract the system actually enforces.
 */

const FINISHES = ['sage', 'oak', 'quartz', 'black', 'white'] as const
const HANDLE_STYLES = ['bar', 'knob', 'edge', 'none'] as const
const PALETTES = ['sage-oak', 'oak-white', 'midnight', 'warm-minimal'] as const

/** The style keys the layout mirrors onto every component it owns. */
const MIRRORED_STYLE_KEYS = [
  'doorStyle',
  'cabinetTexture',
  'countertopMaterial',
  'applianceDetail',
] as const

export type MirroredStyleKey = (typeof MIRRORED_STYLE_KEYS)[number]

/**
 * Which of the layout's style fields actually changed, as a patch to push onto
 * its components. Empty when the user edited something else (a dimension, the
 * floor) so an unrelated edit never rewrites 44 nodes.
 */
export function mirroredStylePatch(
  prev: MagicCabinetLayoutNode,
  next: MagicCabinetLayoutNode,
): Partial<MagicCabinetComponentNode> {
  const patch: Record<string, unknown> = {}
  for (const key of MIRRORED_STYLE_KEYS) {
    if (prev[key] !== next[key]) patch[key] = next[key]
  }
  return patch as Partial<MagicCabinetComponentNode>
}

export const magicCabinetLayoutParametrics: ParametricDescriptor<MagicCabinetLayoutNode> = {
  groups: [
    {
      label: 'Cabinets',
      fields: [
        { key: 'doorStyle', kind: 'enum', options: DOOR_STYLES, display: 'segmented' },
        { key: 'cabinetTexture', kind: 'enum', options: CABINET_TEXTURES },
        { key: 'palette', kind: 'enum', options: PALETTES },
      ],
    },
    {
      label: 'Surfaces',
      fields: [
        { key: 'countertopMaterial', kind: 'enum', options: COUNTERTOP_MATERIALS },
        { key: 'backsplashMaterial', kind: 'enum', options: BACKSPLASH_MATERIALS },
        { key: 'floorType', kind: 'enum', options: FLOOR_TYPES },
      ],
    },
    {
      label: 'Detail',
      fields: [
        { key: 'applianceDetail', kind: 'boolean' },
        {
          key: 'backsplashHeight',
          kind: 'number',
          unit: 'm',
          min: 0,
          max: 1.2,
          step: 0.05,
        },
        {
          key: 'counterHeight',
          kind: 'number',
          unit: 'm',
          min: 0.7,
          max: 1.1,
          step: 0.01,
        },
      ],
    },
    {
      label: 'Presentation',
      fields: [
        {
          key: 'activePresentation',
          kind: 'enum',
          options: ['hero', 'workwall', 'detail', 'plan', 'elevation', 'breakaway'],
        },
      ],
    },
  ],
  reconcile: (prev, next) => {
    const patch = mirroredStylePatch(prev, next)
    if (Object.keys(patch).length === 0) return []
    return next.componentIds.map((id) => ({
      id: id as AnyNodeId,
      data: patch as Partial<AnyNode>,
    }))
  },
}

export const magicCabinetComponentParametrics: ParametricDescriptor<MagicCabinetComponentNode> = {
  groups: [
    {
      label: 'Finish',
      fields: [
        { key: 'finish', kind: 'enum', options: FINISHES },
        { key: 'handleStyle', kind: 'enum', options: HANDLE_STYLES, display: 'segmented' },
        {
          key: 'doorStyle',
          kind: 'enum',
          options: DOOR_STYLES,
          display: 'segmented',
          visibleIf: (node) => node.componentKind === 'cabinet',
        },
        {
          key: 'countertopMaterial',
          kind: 'enum',
          options: COUNTERTOP_MATERIALS,
          visibleIf: (node) => node.componentKind === 'countertop',
        },
        {
          key: 'applianceDetail',
          kind: 'boolean',
          visibleIf: (node) => node.componentKind === 'appliance',
        },
      ],
    },
    {
      label: 'Placement',
      fields: [{ key: 'position', kind: 'vec3' }],
    },
  ],
  // Dimensions are deliberately absent: they are the engine's output, and a
  // cabinet resized in the inspector would disagree with its own SKU and its
  // BOM line the moment the solver ran again. Resizing belongs to
  // `update_magic_kitchen`, which re-solves.
  invariants: [
    (node) =>
      node.dimensions.some((value) => value <= 0)
        ? [
            {
              severity: 'error' as const,
              field: 'dimensions',
              msg: `${node.subtype} has a non-positive dimension — the engine result is stale.`,
            },
          ]
        : [],
  ],
}
