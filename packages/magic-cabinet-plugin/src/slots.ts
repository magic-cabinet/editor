import type { SlotDeclaration } from '@pascal-app/core'

/**
 * The paintable surfaces of a Magic Cabinet component.
 *
 * These are deliberately **Pascal's slot ids**, not a new vocabulary. Two
 * reasons, and the second is the one that made the decision:
 *
 * 1. Pascal's painter resolves a click through `hitObject.userData.slotId`,
 *    so sharing the ids is what makes an MC kitchen paintable at all.
 * 2. The appliance builders in `@pascal-app/nodes/cabinet-geometry` already
 *    stamp their meshes with these exact ids (`stampSlot`). Adopting the same
 *    set means the fridge doors, hob glass and faucet inside a native
 *    appliance become paintable for free, without the plugin walking a
 *    subtree it did not build.
 *
 * What is *not* adopted is `cabinetSlots()`'s `library:*` defaults. Those give
 * a Pascal-looking kitchen; the port owes a Magic Cabinet-looking one. So the
 * defaults below are flat `#rrggbb` swatches matching the ported MVP finishes,
 * and the real appearance comes from `materials.ts` — the slot default only
 * decides what the picker shows as "unpainted" and what a dangling ref falls
 * back to.
 *
 * A slot the user *does* paint is stored as `node.slots[slotId]`, which
 * `MaterialRef` allows in three forms (`core/registry/types.ts`):
 * `library:<id>` (the global catalog), `scene:<id>` (a scene-scoped material
 * the painter mints), or `#rrggbb`. All three are resolved by
 * `resolveMaterialRef` against `ctx.materials`, so an override beats the
 * ported finish and a missing one silently doesn't.
 */
export const MAGIC_SLOT_IDS = [
  'front',
  'carcass',
  'countertop',
  'plinth',
  'hardware',
  'glass',
  'appliance',
  'applianceInterior',
] as const

export type MagicSlotId = (typeof MAGIC_SLOT_IDS)[number]

/** Unpainted swatches, matching the MVP finishes `materials.ts` builds. */
const SLOT_SWATCH: Record<MagicSlotId, string> = {
  front: '#9b9b83',
  carcass: '#9b9b83',
  countertop: '#eee8dc',
  plinth: '#9b9b83',
  hardware: '#17181a',
  glass: '#b9d6df',
  appliance: '#c8ccd1',
  applianceInterior: '#2a2c30',
}

const SLOT_LABEL: Record<MagicSlotId, string> = {
  front: 'Door front',
  carcass: 'Carcass',
  countertop: 'Countertop',
  plinth: 'Toe kick',
  hardware: 'Hardware',
  glass: 'Glass',
  appliance: 'Appliance',
  applianceInterior: 'Appliance interior',
}

export function magicCabinetSlots(): SlotDeclaration[] {
  return MAGIC_SLOT_IDS.map((slotId) => ({
    slotId,
    label: SLOT_LABEL[slotId],
    default: SLOT_SWATCH[slotId],
  }))
}

/**
 * Which slot an engine material key paints.
 *
 * The engine names materials by what they are made of (`cabinet-panel:mdf`,
 * `countertop:quartz`, `hardware:pull`), not by which face they present — so
 * this is the one place that translates a manufacturing vocabulary into a
 * painting one. Door fronts are separated from carcass panels by the caller,
 * which knows the panel's geometry; everything else is decidable from the key.
 */
export function slotForMaterialKey(key: string): MagicSlotId {
  const normalized = key.toLowerCase()
  if (normalized.includes('hardware')) return 'hardware'
  if (normalized.includes('glass')) return 'glass'
  if (normalized.includes('appliance')) return 'appliance'
  if (normalized.startsWith('countertop')) return 'countertop'
  if (normalized.includes('toe') || normalized.includes('plinth')) return 'plinth'
  return 'carcass'
}
