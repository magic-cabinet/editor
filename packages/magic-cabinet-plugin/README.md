# Magic Cabinet Pascal plugin

Pascal `apiVersion: 1` plugin for deterministic Magic Cabinet kitchens.

The plugin consumes `KitchenResult` from `@magic-cabinet/engine`, converts its
inch-based renderer-neutral primitives into Pascal nodes, and contributes:

- `magic-cabinet:layout`
- `magic-cabinet:component`
- 3D and 2D geometry
- native Pascal selection, movement, snapping, handles, and inspector fields
- the `magic-kitchen-house@1` pilot shell and authored showroom scenes

Magic Cabinet remains the source of truth for kitchen rules, catalog identity,
and commerce readiness. This package owns only the Pascal representation.
