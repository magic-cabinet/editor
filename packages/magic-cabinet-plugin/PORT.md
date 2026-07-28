# Porting the Babylon designer to Pascal

What crosses from `magic-cabinet/mvp`'s Babylon designer (`apps/web/src`, ~12k lines
across 26 files importing `@babylonjs`) into this plugin, what does not, and why.

The engine is not part of this. `packages/magic-cabinet-engine` is a vendored build
artifact of the MVP solver and its `PROVENANCE.md` is explicit: *do not fork the solver
in the Pascal adapter.* Layout, collision, pinning, BOM and SKU identity stay there. The
port is everything the Babylon renderer does **on top of** `componentsFromScene()`.

## The seam

```
KitchenConfig ─┬─→ KitchenAssembly.tsx          (Babylon, apps/web)   ← the MVP designer
               └─→ componentsFromScene()
                     → KitchenComponent[]
                       → adapter.ts → magic-cabinet:{layout,component} nodes
                         → geometry.ts → three.js                     ← this plugin
```

Every geometry family in `componentsFromScene` crosses: cabinets, countertops,
appliances, appliance openings, doors, windows, corner fillers, island panels, fridge
cover boards, end-panel cover boards, crown molding, ceiling filler panels.

## What was ported, and where it lives

| MVP surface | MVP source | Here |
|---|---|---|
| Finish textures + PBR | `cabinet-scene-mesh.ts`, `createCabinetMaterialRegistry` | `materials.ts` |
| Texture tables + `repeatSizeInches` | `kitchen/constants.ts` | `style.ts` |
| Shaker rails/stiles | `cabinet-mesh-construction.ts:158-192` (`addShakerFrame`) | `geometry.ts` (`addShakerFrame`) |
| Floor, backsplash, work light | `KitchenAssembly.tsx` | `geometry.ts` (`buildMagicLayoutGeometry`) |
| Appliance models | `applianceAssetManifest` (GLB) | `appliances.ts` — **not** a GLB port; see below |
| Style controls | `FinishPicker`, config props | `parametrics.ts` (`def.parametrics`) |

The 28 jpgs in `apps/editor/public/textures` are the same bytes the MVP serves, and the
tiling is its `repeatSizeInches` verbatim, so a material reads at the same physical
scale in Pascal as it does in the designer.

## Three decisions worth knowing

**1. Style knobs are plugin-owned node fields, not engine fields.** `doorStyle`,
`cabinetTexture`, `countertopMaterial`, `floorType`, `backsplashMaterial` sit on the
Pascal nodes beside the `finish` / `handleStyle` that were already there. This mirrors
the MVP: `addShakerFrame` lives in a *renderer* file there too — the solver never sees a
door style. No engine change, no re-vendor.

**2. Appliances are ported to Pascal's builders, not to GLB loading.** `def.geometry` is
synchronous and `GeometrySystem` moves the returned children into a live group
immediately, so an async GLB load inside a builder lands on a discarded object;
`renderer: { kind: 'glb' }` is declared in `core/registry/types.ts` but has no viewer
implementation. Pascal already solves this the other way — `packages/nodes/src/cabinet/`
builds fridges, ovens, cooktops, hoods, dishwashers, sinks and pantries parametrically
and synchronously. `appliances.ts` maps MC's eight appliance categories onto those
builders and drives them from the engine's own dimensions.

That import goes through `@pascal-app/nodes/cabinet-geometry`, **never the package
barrel**: the barrel reaches `shelf/definition` → `floorplan-affordances` →
`@pascal-app/editor`, which is client-only React, and a Next.js App Route that touches
the plugin's node definitions cannot bundle it. For the same reason server code imports
`@magic-cabinet/pascal-plugin/schemas` (schemas only, no geometry) — see
`apps/editor/lib/graph-schema.ts`.

**3. The MVP's materials, on Pascal's geometry.** Pascal's builders take a plain
`Record<slotId, Material>`, so `magicSlotMaterials()` hands them the ported Babylon
finishes instead of Pascal's `library:*` presets. This is also the only compliant route:
Plugin API v1 does not let a plugin add types to Pascal's global material store, but
nothing stops it building its own three.js materials.

## Frames — the part that keeps producing invisible bugs

Three coordinate conventions meet in this plugin, and every mismatch so far has been
well-typed, validator-green, and wrong.

| frame | x | y | z | front |
|---|---|---|---|---|
| engine component-local | `0 → +W` | `0 → +H` | `0 → −D` (after the handedness flip) | `−D` |
| engine world-anchored (`planOutline`, `space:'world'`) | room inches, **rotation already baked in** | — | — | — |
| Pascal cabinet-native | centred, `±W/2` | `0 → +H` | centred, `±D/2` | `+D/2` |

- World-anchored points are un-rotated into the component frame by
  `worldToComponentLocal` in `adapter.ts`. Skipping that double-applies the yaw, because
  both renderers apply the node's own rotation again.
- Native appliances are wrapped in a group at `(W/2, 0, −D/2)` with `rotation.y = π`.
  A half-turn is a rotation, not a reflection, so a right-hinged fridge stays
  right-hinged to a viewer standing in the room.

## The tests that actually discriminate

`bun test packages/magic-cabinet-plugin`

- `pilot.test.ts` — for every world-anchored point, pushing the stored node-local pair
  back through the node's own transform must land on the engine's coordinate. Runs over
  all four layouts (`galley` / `l-shape` / `u-shape` / `one-wall`), so east, west and
  south walls are covered rather than assumed, and it asserts the fixture contains a
  rotated component so a non-discriminating fixture fails loudly.
- `appliances.test.ts` — asserts the appliance's world bounding box lands inside the box
  the engine sized, and that the door furniture overhangs the **front**. Verified against
  negative controls: dropping the `rotation.y = π` fails the orientation test, dropping
  the `W/2` x-anchor fails the containment test.
- `materials.test.ts` — asserts the finish → texture *decision*. `TextureLoader` needs a
  DOM, so building real textured materials only works in a browser; `texture()` returns
  `null` headless and the material keeps its colour and PBR constants.
- `parametrics.test.ts` — asserts the layout→component style push-down fires for mirrored
  fields and does **not** fire for layout-only ones.

## Still not ported

- `wine-cooler` and `trash-compactor` have no Pascal compartment; they keep the engine's
  box. So do `wine-rack` and the blind-vs-diagonal corner discriminator.
- Assembly animation and quality tiers (SSAO, reflection probes, shadow tuning) — the
  host renderer's job, not the plugin's.
- `def.tool` / `def.preview`: no hand placement yet. The engine is the placement
  authority today; `plugin-trees` upstream is the reference if that changes.
