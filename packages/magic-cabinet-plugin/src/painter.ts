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
 *   2. a flat `#rrggbb` in the same slot — see `HEX_COLOR` below.
 *   3. the ported MVP finish from `materials.ts`.
 *
 * A dangling ref resolves to `null` and falls through rather than throwing or
 * rendering an untextured surface — `resolveMaterialRef` is documented never
 * to throw, and this is the behaviour that makes deleting a scene material
 * safe.
 */

/**
 * Hex is not a `MaterialRef` — and handling it here is a deliberate
 * divergence from every built-in kind.
 *
 * `MaterialRef` is `string` and `ParsedMaterialRef` is exactly two kinds,
 * `library` | `scene` (`core/material-library.ts`). Hex belongs to the *slot
 * default* vocabulary, not the *override* one: `SlotDeclaration.default` is
 * documented as "either a `MaterialRef` (`library:<id>` / `scene:<id>`) **or**
 * a `#rrggbb` colour" — contrasting the two, not listing three forms of one.
 * So `resolveMaterialRef` is not narrower than its type; it matches it.
 *
 * The gap is one layer up. `slots` is `z.record(z.string(), z.string())` on
 * **14** node kinds — unvalidated strings — and **10** built-in kinds resolve
 * them through the two-form parser with this same `if (resolved) return`
 * fall-through (`cabinet/geometry/shared.ts:82`, `slab`, `column`, `stair`,
 * `wall`, `fence`, `shelf`, `item`, `elevator`, `duct-segment`). So a hex
 * value written into `node.slots` by the Scene API or a hand-authored scene
 * validates, persists, and renders as the unpainted default — silently.
 *
 * We render it. That is better behaviour and it is what the schema permits,
 * but it means the same hex in the same scene paints an MC component and is
 * ignored on a native cabinet. The divergence is intentional and pinned by
 * `painter.test.ts`, which asserts the upstream behaviour this compensates
 * for — so if upstream closes the gap, that test fails and this branch can be
 * deleted rather than quietly outliving its reason.
 *
 * Three *and* six digits, because six-only would reproduce the very defect
 * this branch exists to avoid, one character narrower. The default position
 * this delegates to does no validation at all — `resolveSlotDefaultMaterial`
 * hands anything non-`library:` straight to `THREE.Color.setStyle`, which
 * accepts `#fff` (→ `ffffff`), `#1f6` (→ `11ff66`) and CSS names like
 * `rebeccapurple`. So `#fff` as a slot *default* renders and, under a
 * six-digit-only test, the same `#fff` as an *override* silently fell back.
 *
 * Not widened all the way to `setStyle`'s grammar, though: an unrecognised
 * string there does not throw. `THREE.Color` logs "Unknown color" and leaves
 * the colour white, so accepting names would turn a typo'd ref into a white
 * surface instead of the ported finish — a worse failure than the one being
 * fixed. Hex is self-validating; names are not. That asymmetry is the whole
 * reason for the bound.
 */
const HEX_COLOR = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/

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
      // Not a `library:`/`scene:` ref. A flat colour is still legal in this
      // record and is what a hand-authored scene or an MCP write carries, so
      // render it rather than falling through — see `HEX_COLOR`.
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
