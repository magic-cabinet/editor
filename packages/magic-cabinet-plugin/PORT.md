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

**Where `HEX_COLOR`'s bound comes from.** Three *and* six digits, and nothing else.
`resolveSlotDefaultMaterial` does no validation — anything non-`library:` goes straight to
`THREE.Color.setStyle`, measured as accepting `#fff` → `ffffff`, `#1f6` → `11ff66`, and
CSS names like `rebeccapurple` → `663399`. So six-digit-only would have dropped `#fff` in
the *override* position while the identical string rendered in the *default* position —
this branch reproducing its own bug one character narrower. Names stay out for the
opposite reason: `setStyle` does not throw on an unknown string, it logs and leaves the
colour white, so accepting them converts a typo into a white surface instead of the ported
finish. Hex self-validates; names do not.

### Dangling library refs — the same silence, and it bit us first

A `library:<id>` naming a material that does not exist fails **identically** to the hex
case above: `getMaterialPresetByRef` → `getCatalogMaterialById(...)` → `null`
(`material-library.ts:4255`), which lands on the same `if (resolved) return resolved`
fall-through. Unknown id and unsupported ref shape are indistinguishable to every
consumer, and both read as "use the declared default."

`slab_magic_porch` carried `library:wood-flooring-oak` from the first commit of
`house-shell.ts`. That id is not among the catalog's 114. The reason nobody saw it is
worth more than the fix: the slab's own `SLAB_TOP_SLOT_DEFAULT` is
`library:wood-woodplank48` (`nodes/src/slab/slots.ts`), so the porch fell back to a wood
plank — a plausible timber porch, and **the same finish as `slab_magic_floor`**, which
declares no slots and takes that same default. (Separate geometry, so not the same pixels;
the same material, which is what the override existed to change.) It was inert for its
whole life while looking exactly like it was working. Now `library:wood-floorplank1`, a
real id that differs from the slab default — the only thing that makes the override
observable at all.

The durable half is in `pilot.test.ts`: it walks every node of
`createMagicKitchenPilotScene()`, collects each `library:` slot ref, and asserts all of
them resolve — with two controls, because an empty sweep or a lookup that never returns
null would pass vacuously in exactly the way the ref itself did. Both controls were
mutation-checked: restoring the bad id fails naming `slab_magic_porch`/`surface`, and
emptying `slots` fails on the sweep being empty.

Found by Bumble, sweeping all 24 `library:` refs in the tree against the real id set
rather than checking the one under suspicion — 16 resolve (the control that the query
finds real ones), 8 dangle, and 7 of those 8 are deliberate test fixtures. This was the
eighth. It is the strongest argument in the upstream issue: the silent fallback we are
asking upstream to make loud had already hidden a typo of ours through a full paint-mode
build, a 2645-test suite, and two rounds of mutual review.

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

## Panel ids decide facades, not geometry

`isCabinetFacade` used to answer "is this a door" from geometry: 3/4" `mdf` reaching the
carcass front plane. That is wrong on two panels the engine actually emits, and this entry
exists because the wrong version shipped.

`frontReach` measures along the component's own z axis, so it misreads any *yawed*
primitive. A diagonal corner door is yawed 45°:

```
corner-base  cabinet-north-7-panel-6-door   yaw −45°   axis reach 0.4735 m   carcass depth 0.6096 m  -> FAIL
corner-wall  cabinet-north-8-panel-6-door   yaw −45°   axis reach 0.4735 m   carcass depth 0.3048 m  -> pass
```

Identical panel, identical numbers, opposite verdicts — the corner-wall's *pass* was
decided entirely by the nominal depth it happened to be compared against, so the test was
never measuring what it claimed. The base-corner door rendered as a flat slab, took no
shaker frame, and painted as carcass in the default view.

The MVP never had this problem because it classifies by panel id
(`apps/web/src/lib/render/panel-classification.ts`, ported verbatim to
`panel-classification.ts`), and those ids **are** reachable from Pascal — at
`engineState.scene.cabinets[].panels[].id`. An earlier comment here claimed Pascal does
not receive them. It does. `adaptKitchenResult` now carries `panelId` onto each box
primitive and the classifier prefers it.

Two caveats worth keeping in view:

- **The read is into declared-opaque state.** `KitchenEngineState.scene` is typed
  `unknown` and documented "consumers must round-trip it", so `panelIdsByComponent` only
  claims a mapping when the cabinet's panel list matches the component's primitive list
  one-for-one, and yields nothing otherwise. Verified across all four layouts:
  `len-mismatch=0`, `dim-mismatch=0`. `corner-facade.test.ts` fails loudly if that shape
  ever moves — renaming the key drops 13 of 15 tests rather than degrading in silence.
  The real fix belongs upstream: put `panelId` on the public `BoxGeometry` and delete
  `panelIdsByComponent`.
- **It changed the sink tilt-front too.** `…-panel-5-tilt-front` sits exactly at the front
  plane in 3/4" mdf and is geometrically indistinguishable from a drawer face, but the MVP
  does not shaker-frame it. We now match. No public-contract heuristic could have.

Fillers and drawer pulls were already classified correctly and still are.

## The default kitchen wears the designer's default style, not ours

Porting the geometry correctly is not the same as shipping the same kitchen. Every knob
below was a *default* that had drifted onto this plugin's own showroom palette, and
together they are most of what made the Pascal scene unrecognisable next to
`dev.magiccabinetai.com`. Ground truth is `DEFAULT_DESIGN_STYLE`
(`mvp` `apps/web/src/lib/simple-designer/design-generation.ts:39-49`).

| | MVP default | was | now |
|---|---|---|---|
| cabinet colour | `white` `#f5f5f0` | `sage` walls, `oak` bases | `white` |
| `doorStyle` | `shaker` | `slab` | `shaker` |
| `crownMoldingStyle` | `none` → not drawn | drawn | `crownMoldingEnabled: false` |
| ceiling fillers | `false` → not drawn | drawn | `ceilingFillersEnabled: false` |
| `backsplashMaterial` | `none` | `white-metro-tile` | `none` |

Two of these are worth more than a table row.

**Crown molding and ceiling fillers are renderer state, not solver state.** The engine
emits them for every wall run regardless — 20 of the default kitchen's 55 components — and
the designer decides whether to draw them (`DesignerCanvas.tsx:298-300`). Drawing all of
them put stepped trim on top of every cabinet run in a scene whose reference has none.
They stay nodes when suppressed, so the engine result and the BOM are untouched and
turning them back on is a re-render rather than a re-solve.

**`finish` was inert for everything visible.** `materialColor` scanned the material key
for a token before consulting the finish, and the engine names cabinet parts
`cabinet-panel:mdf` / `panel:mdf` / `trim:mdf` — so `cabinet`, `panel` and `trim` each
matched a generic grey first and every door came out sage whatever the finish said. Only
the texture half of the finish (wood grain vs paint) responded, which is why bases read as
espresso. A surface that takes the body finish now asks the finish first; the token scan
still owns the surfaces the MVP excludes from `takesBodyColor` (glass, hardware,
appliance). Setting the palette alone would not have fixed the colour.

## Appliances: the box is the budget, and an opening is an appliance

- **The hood ran 1.7 m through the ceiling.** `addRangeHoodCompartment` sizes its flue from
  `resolveHoodDuctTopY`, which walks the scene for the real wall height — but the plugin
  synthesizes its cabinet node and has no `GeometryContext` to give it, so it fell back to
  `DEFAULT_CEILING_HEIGHT` measured from the component's *own* origin: a 2.5 m flue on a
  hood already 1.7 m up. The synthesized node now carries the y offset that makes the
  resolver return the component height, so the hood occupies exactly the 30x30x20in box the
  engine gave it — for any ceiling, not just this one.
- **An `appliance-opening` carries no geometry of its own.** `nativeAppliancesFor` gated on
  `componentKind === 'appliance'`, so the opening was not diverted to a native builder —
  and because an opening has no engine primitives either, that did not fall back to a box,
  it drew nothing. The default kitchen shipped with no dishwasher. The MVP makes no such
  distinction: `applianceAssetManifest(appliances, applianceOpenings)` models both lists.

`positionIn.y` is the component's **bottom**, not its centre — the wall cabinets settle it
(54in + 30in tall renders to 2.184 m, its top). The engine's *primitives* are centred about
that origin, which is why reading raw primitive extents suggests the range and fridge sit
half below the floor. They do not; the native builders bottom-anchor correctly.

## Still not ported

- `wine-cooler` and `trash-compactor` have no Pascal compartment; they keep the engine's
  box. So does `wine-rack`.
- Assembly animation and quality tiers (SSAO, reflection probes, shadow tuning) — the
  host renderer's job, not the plugin's.
- `def.tool` / `def.preview`: no hand placement yet. The engine is the placement
  authority today; `plugin-trees` upstream is the reference if that changes.
- **`walnut` / `espresso` finishes.** Pascal's finish enum is
  `sage | oak | quartz | black | white`; the MVP also has walnut, espresso, natural,
  navy, gray, sand and european. Only `oak` reaches a wood texture here.

  If a dark wood is added it must take **`wood-light/color-calm.jpg`, not
  `color.jpg`**. `color-calm` is the same grain pre-blended 55% toward a flat
  mid-brown, and the MVP switched to it deliberately: the raw photo's per-pixel
  variance gets amplified by sRGB→linear *and* the albedo lift into "a loud
  high-frequency zebra/exotic-veneer stripe instead of quiet walnut grain"
  (`cabinet-colors.ts:41-56`). Measured off the files we serve: HF energy 3.04 raw
  against 1.52 calm, channel σ 16.6/10.8/6.7 against 6.4/5.2/4.6 — the MVP's own
  "~2.5-3x" claim, independently confirmed. `color-calm.jpg` already ships in this
  repo and is referenced nowhere; `materials.test.ts` guards that no finish reaches
  the raw walnut photo.
- **The wood albedo lift.** `applyWoodMaterial` sets `albedoColor` *above white* when
  a wood texture carries the look — `Color3(1.05, 0.88, 0.68)` for the light oak,
  `(1.36, 1.58, 1.86)` for the dark walnut. Those cannot be expressed as a hex, so
  `materialColor` cannot currently produce them; `oak` renders without the lift and
  reads darker and warmer than Babylon's. Needs `MeshStandardMaterial.color.setRGB`
  in linear space, not a hex string. Not attempted — guessing a brightness constant
  across two different PBR models is how you get a second wrong number.
- **`environmentIntensity`.** The MVP lifts it per finish (1.4 painted, 2.3 dark
  non-walnut, 1.15 dark walnut). three's nearest equivalent is `envMapIntensity`, and
  the two are not 1:1 between Babylon PBR and three. Same reasoning as above: needs a
  side-by-side render to calibrate, not arithmetic.
- **Texture anisotropy is set but unasserted.** `materials.ts` now sets
  `anisotropy = 16` on every texture (the MVP uses `maxAnisotropy` throughout).
  It cannot be unit-tested here — `texture()` returns `null` without a DOM, so there
  is no `Texture` object to read it off. It is verifiable only in a render.
