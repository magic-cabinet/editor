# `@magic-cabinet/engine`

Renderer-neutral entrypoint for Magic Cabinet's deterministic kitchen rules.
It wraps the existing `apps/web/src/lib/layout` solver instead of copying it,
and bundles that pure dependency graph for consumption by Pascal or another
viewer.

```ts
import {
  generateKitchen,
  reconcileKitchen,
  validateKitchen,
  buildCommerceContext,
} from "@magic-cabinet/engine";
```

All dimensions are inches and all rotations are degrees. Geometry primitives
declare whether their transforms are component-local or world-space. The
`engineState` is opaque, JSON-serializable state that consumers must round-trip
to `reconcileKitchen`.

Catalog resolution is an input from the authenticated catalog service.
`buildCommerceContext` emits verified product identity and quantities only.
It deliberately cannot calculate a payable price; a server quote remains
required.

## Local development

From this directory:

```sh
bun run typecheck
bun run test
bun run build
```

Build before linking the package into Pascal. A future private-package publish
uses the bundled `dist/index.js` plus the stable declarations in
`src/public.d.ts`; Babylon and React are not part of the bundle.
