import type { GeometryContext } from '@pascal-app/core'
import { resolveMaterialRef, resolveSlotDefaultMaterial } from '@pascal-app/viewer'
import type { Material, Mesh } from 'three'
import { type MaterialRequest, magicMaterial } from './materials'
import type { MagicCabinetComponentNode } from './schema'
import { type MagicSlotId, slotForMaterialKey } from './slots'

/**
 * Resolves the material for one surface, with a user's paint override taking
 * precedence over the ported MVP finish.
 *
 * `def.geometry` is handed a `GeometryContext` whose `materials` field is the
 * scene's shared material library, passed — per its own doc comment in
 * `core/registry/types.ts` — "so a pure geometry builder can resolve
 * `scene:<id>` slot refs without importing `useScene`". That is exactly this.
 * The builder stays a pure function of `(node, ctx)`; nothing here reaches for
 * a store.
 *
 * Precedence, highest first:
 *
 *   1. `node.slots[slotId]` — what the painter wrote. `library:<id>` resolves
 *      against the static catalog, `scene:<id>` against `ctx.materials`.
 *   2. the ported MVP finish from `materials.ts`.
 *
 * A dangling ref resolves to `null` and falls through to (2) rather than
 * throwing or rendering an untextured surface — `resolveMaterialRef` is
 * documented never to throw, and this is the behaviour that makes deleting a
 * scene material safe.
 */
const HEX_COLOR = /^#[0-9a-fA-F]{6}$/

export type SlotPainter = {
  /** Material for a surface, honouring any paint override on its slot. */
  material: (slotId: MagicSlotId, request: MaterialRequest) => Material
  /** Same, choosing the slot from the engine's material key. */
  forKey: (request: MaterialRequest) => { material: Material; slotId: MagicSlotId }
  /** Stamp the slot id the painter reads back off a pointer hit. */
  stamp: <T extends Mesh>(mesh: T, slotId: MagicSlotId) => T
}

export function createSlotPainter(
  node: MagicCabinetComponentNode,
  ctx: GeometryContext | undefined,
): SlotPainter {
  const overrides = node.slots ?? {}

  const material = (slotId: MagicSlotId, request: MaterialRequest): Material => {
    const ref = overrides[slotId]
    if (ref) {
      const painted = resolveMaterialRef(ref, ctx?.materials, 'rendered')
      if (painted) return painted
      // `resolveMaterialRef` only parses the two prefixed forms, but a
      // `MaterialRef` has three — a flat `#rrggbb` is legal and is what a
      // hand-authored scene or an MCP write is most likely to carry. Without
      // this it would silently fall through to the unpainted finish, which
      // reads as "paint mode is broken" rather than "that ref is unsupported".
      if (HEX_COLOR.test(ref)) return resolveSlotDefaultMaterial(ref, 'rendered', 0.6)
    }
    return magicMaterial(request)
  }

  return {
    material,
    forKey: (request) => {
      const slotId = slotForMaterialKey(request.key)
      return { material: material(slotId, request), slotId }
    },
    stamp: (mesh, slotId) => {
      mesh.userData.slotId = slotId
      return mesh
    },
  }
}
