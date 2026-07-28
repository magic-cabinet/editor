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
finishes instead of Pascal's `library:*` presets. Plugin API v1 does not let a plugin add
types to Pascal's global material store, but nothing stops it building its own three.js
materials.

## Paint mode

The ported finishes are the *default*, not the ceiling. Every component declares
`capabilities.slots` + `capabilities.paint`, so Pascal's own painter repaints an MC
kitchen surface by surface. `selection-manager.tsx` dispatches purely through
`nodeRegistry.get(node.type)?.capabilities?.paint` — no kind allowlist — which is why a
plugin node participates on the same terms as a built-in cabinet.

Three pieces make it work, and the second is the one that buys the most:

- **`slots.ts` uses Pascal's slot ids, not a new vocabulary.** The painter resolves a
  click through `hitObject.userData.slotId`, and the appliance builders in
  `@pascal-app/nodes/cabinet-geometry` already stamp their meshes with those ids
  (`stampSlot`). Sharing the set means the inside of a fridge is paintable without the
  plugin walking a subtree it never assembled. What is *not* adopted is
  `cabinetSlots()`'s `library:*` defaults — those render a Pascal-looking kitchen.
- **`slotForMaterialKey`** translates the engine's manufacturing vocabulary
  (`cabinet-panel:mdf`, `countertop:quartz`) into a painting one. Door fronts are the one
  case the key can't decide — an `mdf` panel is a door or a carcass side depending on
  where it sits — so `geometry.ts` decides those from `isCabinetFacade`.
- **`painter.ts`** resolves `node.slots[slotId]` against `ctx.materials`, which
  `GeometrySystem` populates for exactly this purpose (see the field's doc comment in
  `core/registry/types.ts` — note it is `undefined` for `def.floorplan`, so a future
  slot-aware 2D view cannot reuse this path as-is). Both `MaterialRef` forms resolve,
  `library:<id>` and `scene:<id>`, plus a flat `#rrggbb` — see the divergence below. A
  dangling ref falls back to the ported finish, so deleting a scene material is safe.

### One deliberate divergence: flat hex in a slot

Hex is **not** a `MaterialRef`. `ParsedMaterialRef` is exactly `library | scene`, and
`SlotDeclaration.default` documents hex as the alternative *to* a ref — "either a
`MaterialRef` (`library:<id>` / `scene:<id>`) **or** a `#rrggbb` colour". So
`resolveMaterialRef` matches its own type; it is not narrower than it.

The gap is one layer up. `slots` is `z.record(z.string(), z.string())` on **14** node
kinds — unvalidated — and **10** built-in kinds resolve it through the two-form parser
with an `if (resolved) return` fall-through (`cabinet/geometry/shared.ts:82`, `slab`,
`column`, `stair`, `wall`, `fence`, `shelf`, `item`, `elevator`, `duct-segment`). A hex
value written by the Scene API or a hand-authored scene therefore validates, persists,
and renders as the unpainted default — silently, on every built-in kind.

This plugin renders it instead. That is better behaviour and it is what the schema
permits, but the cost is real and worth naming: **the same hex in the same scene paints
an MC component and is ignored on a native cabinet.** `painter.test.ts` pins the upstream
half of that — it asserts `resolveMaterialRef` returns `null` for hex, with the two real
forms as controls — so if upstream closes the gap the test fails and `HEX_COLOR` can be
deleted rather than quietly outliving its reason.

Found by Bumble, who also spotted that this and the inert `glb` / `instanced-glb`
`RendererSource` kinds are the same shape: a declared surface wider than the
implementation consuming it, failing by returning `null` instead of loudly. Upstream
issue draft: `OUTBOX/PASCAL_UPSTREAM_ISSUE_SILENT_NULLS.md`.

Verified live: `PUT /api/scenes/:id` writing `slots: {front: '#1f6feb'}` onto the pilot's
14 cabinets turned every door blue and left carcass, countertop, backsplash, cooktop
glass and sink basins untouched.

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
- `painter.test.ts` — asserts every emitted mesh carries a slot id (an unstamped mesh is
  invisible to paint mode, with no error), that a door face and its carcass side land on
  different slots, and that both `MaterialRef` forms plus a flat hex resolve. Verified
  against two negative controls: removing the stamp fails three tests, ignoring the
  override fails one. It also pins the hex divergence against upstream's own behaviour,
  so the workaround is self-retiring.

## Still not ported

- `wine-cooler` and `trash-compactor` have no Pascal compartment; they keep the engine's
  box. So do `wine-rack` and the blind-vs-diagonal corner discriminator.
- Assembly animation and quality tiers (SSAO, reflection probes, shadow tuning) — the
  host renderer's job, not the plugin's.
- `def.tool` / `def.preview`: no hand placement yet. The engine is the placement
  authority today; `plugin-trees` upstream is the reference if that changes.
