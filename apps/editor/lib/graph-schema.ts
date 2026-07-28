import { magicCabinetDefinitions } from '@magic-cabinet/pascal-plugin'
import { nodeRegistry } from '@pascal-app/core/registry'
import { AnyNode } from '@pascal-app/core/schema'
import { z } from 'zod'

const bundledPluginSchemas = new Map(
  magicCabinetDefinitions.map((definition) => [definition.kind, definition.schema]),
)

function schemaForNode(node: unknown) {
  if (typeof node !== 'object' || node === null || !('type' in node)) return AnyNode

  const type = (node as { type?: unknown }).type
  if (typeof type !== 'string') return AnyNode

  return nodeRegistry.get(type)?.schema ?? bundledPluginSchemas.get(type) ?? AnyNode
}

/**
 * Validates a SceneGraph at an untrusted API boundary. Re-runs
 * the registered or bundled plugin schema on plugin nodes and
 * `AnyNode.safeParse` on built-in nodes. The built-in path enforces the
 * `AssetUrl` allowlist in core (closes the Phase 3 SSRF / arbitrary-URL
 * risk on scan/guide/item/material fields).
 *
 * Shared between `POST /api/scenes` and `PUT /api/scenes/[id]` so neither
 * route can silently accept malicious URLs via the `graph` payload.
 *
 * Phase 8 P4 found the POST bypass; Phase 10 A2 found the PUT bypass.
 */
export const apiGraphSchema = z
  .object({
    nodes: z.record(z.string(), z.unknown()),
    rootNodeIds: z.array(z.string()),
    collections: z.unknown().optional(),
    installedPlugins: z.array(z.string().min(1)).optional(),
  })
  .superRefine((value, ctx) => {
    for (const [nodeId, node] of Object.entries(value.nodes)) {
      const res = schemaForNode(node).safeParse(node)
      if (!res.success) {
        for (const issue of res.error.issues) {
          ctx.addIssue({
            code: 'custom',
            path: ['nodes', nodeId, ...issue.path],
            message: issue.message,
          })
        }
      }
    }
  })
