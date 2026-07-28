import type { ZodType } from 'zod'
import { MagicCabinetComponentNode, MagicCabinetLayoutNode } from './schema'

/**
 * The plugin's node schemas, with no geometry attached.
 *
 * The API routes validate an untrusted `SceneGraph` against the plugin's zod
 * schemas (`apps/editor/lib/graph-schema.ts`). Reaching them through the
 * package barrel pulls `definitions` → `geometry` → three.js and, since the
 * appliance builders came from `@pascal-app/nodes`, the editor's client-only
 * React as well — which a Next.js App Route cannot bundle.
 *
 * Validation never needs a mesh. This entry point is the boundary: server code
 * imports `@magic-cabinet/pascal-plugin/schemas`, the viewer imports the full
 * definitions, and neither drags in the other.
 */
export const magicCabinetSchemas: ReadonlyArray<{ kind: string; schema: ZodType }> = [
  { kind: 'magic-cabinet:layout', schema: MagicCabinetLayoutNode },
  { kind: 'magic-cabinet:component', schema: MagicCabinetComponentNode },
]

export { MagicCabinetComponentNode, MagicCabinetLayoutNode }
