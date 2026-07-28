/**
 * The kitchen style model, ported from the web MVP's Babylon designer.
 *
 * These are the knobs `KitchenAssembly.tsx` exposes that the deterministic
 * engine has no field for: finish textures, door construction, floor, counter
 * and backsplash materials. The engine is a *vendored build artifact* here
 * (`packages/magic-cabinet-engine/PROVENANCE.md`: "do not fork the solver in
 * the Pascal adapter"), and in the MVP these are renderer state too — the
 * shaker frame is built in `cabinet-mesh-construction.ts`, not the solver. So
 * they live on the Pascal nodes next to the `finish` / `handleStyle` fields
 * that were already plugin-owned.
 *
 * Texture paths and `repeatSizeInches` are copied verbatim from the MVP's
 * `apps/web/src/components/kitchen/constants.ts` so a material tiles at the
 * same physical scale in Pascal as it does in the designer. The jpgs
 * themselves are the same bytes, served from `apps/editor/public/textures`.
 */

export const TEXTURE_ROOT = '/textures'

/** Size of one texture repeat, in inches. Matches MVP `repeatSizeInches`. */
export type TextureTiling = { widthIn: number; depthIn: number }

export type SurfaceTexture = {
  url: string
  tiling: TextureTiling
  /** Flat colour used when the jpg is unavailable. */
  fallbackColor: string
  rotationRad?: number
}

// ─── Floors ──────────────────────────────────────────────────────────
// MVP `FLOOR_TEXTURES`. Note `tile` maps to the slate jpg — that naming
// mismatch is the MVP's, kept so a saved MVP config reads identically.

export const FLOOR_TYPES = [
  'hardwood',
  'tile',
  'vinyl',
  'travertine',
  'white-tile',
  'checkered',
] as const
export type FloorType = (typeof FLOOR_TYPES)[number]

export const FLOOR_TEXTURES: Record<FloorType, SurfaceTexture> = {
  vinyl: {
    url: `${TEXTURE_ROOT}/floors/vinyl.jpg`,
    fallbackColor: '#c4b8a8',
    tiling: { widthIn: 54, depthIn: 54 },
  },
  tile: {
    url: `${TEXTURE_ROOT}/floors/slate.jpg`,
    fallbackColor: '#6b7b8a',
    tiling: { widthIn: 120, depthIn: 120 },
  },
  hardwood: {
    url: `${TEXTURE_ROOT}/floors/hardwood.jpg`,
    fallbackColor: '#a67c52',
    tiling: { widthIn: 77, depthIn: 58 },
  },
  travertine: {
    url: `${TEXTURE_ROOT}/floors/travertine.jpg`,
    fallbackColor: '#d4c4a8',
    tiling: { widthIn: 36, depthIn: 36 },
  },
  'white-tile': {
    url: `${TEXTURE_ROOT}/floors/white-tile.jpg`,
    fallbackColor: '#e8e8e8',
    tiling: { widthIn: 36, depthIn: 36 },
  },
  checkered: {
    url: `${TEXTURE_ROOT}/floors/checkered.jpg`,
    fallbackColor: '#888888',
    tiling: { widthIn: 54, depthIn: 54 },
    rotationRad: Math.PI / 4,
  },
}

// ─── Countertops ─────────────────────────────────────────────────────
// MVP `COUNTERTOP_TEXTURES`, minus its duplicate camelCase aliases
// (`blackGranite` / `butcherBlock` / `brownGranite` are the same three jpgs
// under a second spelling). `laminate` has no shipped jpg in either repo, so
// it resolves to flat colour rather than a 404 — same as the MVP, where the
// missing file just fails to load.

export const COUNTERTOP_MATERIALS = [
  'quartz',
  'granite',
  'brown-granite',
  'marble',
  'concrete',
  'butcher-block',
  'laminate',
] as const
export type CountertopMaterial = (typeof COUNTERTOP_MATERIALS)[number]

export const COUNTERTOP_TEXTURES: Record<CountertopMaterial, SurfaceTexture | null> = {
  quartz: {
    url: `${TEXTURE_ROOT}/countertops/quartz.jpg`,
    fallbackColor: '#eee8dc',
    tiling: { widthIn: 24, depthIn: 24 },
  },
  granite: {
    url: `${TEXTURE_ROOT}/countertops/granite.jpg`,
    fallbackColor: '#3c3b39',
    tiling: { widthIn: 48, depthIn: 48 },
  },
  'brown-granite': {
    url: `${TEXTURE_ROOT}/countertops/brown-granite.jpg`,
    fallbackColor: '#6b503a',
    tiling: { widthIn: 36, depthIn: 36 },
  },
  marble: {
    url: `${TEXTURE_ROOT}/countertops/marble.jpg`,
    fallbackColor: '#f0efeb',
    tiling: { widthIn: 96, depthIn: 96 },
  },
  concrete: {
    url: `${TEXTURE_ROOT}/countertops/concrete.jpg`,
    fallbackColor: '#9d9c99',
    tiling: { widthIn: 48, depthIn: 48 },
  },
  'butcher-block': {
    url: `${TEXTURE_ROOT}/countertops/butcher-block.jpg`,
    fallbackColor: '#b4854c',
    tiling: { widthIn: 48, depthIn: 24 },
  },
  // No jpg ships for laminate in either repo — flat colour is the honest
  // result, and it keeps the texture loader from requesting a 404.
  laminate: null,
}

// ─── Backsplash ──────────────────────────────────────────────────────
// MVP `BACKSPLASH_TEXTURES`, plus the `'none'` sentinel `KitchenAssembly`
// carries in `backsplashMaterial` (`backsplashVisible = material !== "none"`).

export const BACKSPLASH_MATERIALS = [
  'none',
  'white-metro-tile',
  'white-herringbone',
  'calacatta-herringbone',
  'marble',
  'butcher-block',
] as const
export type BacksplashMaterial = (typeof BACKSPLASH_MATERIALS)[number]

export const BACKSPLASH_TEXTURES: Record<BacksplashMaterial, SurfaceTexture | null> = {
  none: null,
  'butcher-block': {
    url: `${TEXTURE_ROOT}/backsplash/butcher-block.jpg`,
    fallbackColor: '#b4854c',
    tiling: { widthIn: 24, depthIn: 12 },
  },
  'calacatta-herringbone': {
    url: `${TEXTURE_ROOT}/backsplash/calacatta-herringbone.jpg`,
    fallbackColor: '#e9e6df',
    tiling: { widthIn: 36, depthIn: 28.5 },
  },
  marble: {
    url: `${TEXTURE_ROOT}/backsplash/marble.jpg`,
    fallbackColor: '#f0efeb',
    tiling: { widthIn: 96, depthIn: 96 },
  },
  'white-herringbone': {
    url: `${TEXTURE_ROOT}/backsplash/white-herringbone.jpg`,
    fallbackColor: '#efece6',
    tiling: { widthIn: 31, depthIn: 31 },
  },
  'white-metro-tile': {
    url: `${TEXTURE_ROOT}/backsplash/white-metro-tile.jpg`,
    fallbackColor: '#f2f1ee',
    tiling: { widthIn: 29, depthIn: 29 },
  },
}

// ─── Cabinet bodies ──────────────────────────────────────────────────
// Two sources converge here. `KitchenAssembly` offers a flat `cabinetTexture`
// (MVP `CABINET_TEXTURE_PATHS` — oak.jpg / walnut.jpg over a colour-tinted
// StandardMaterial). The single-cabinet showcase `cabinet-scene-mesh.ts` has
// the richer PBR set — albedo + normal + roughness with per-tone normal
// strengths. three is PBR-native like Babylon's `PBRMaterial`, so the finish
// enum takes the PBR path and `cabinetTexture` overrides it with the
// designer's flat wood jpg when the user picks one.

export const CABINET_TEXTURES = ['none', 'oak', 'walnut'] as const
export type CabinetTexture = (typeof CABINET_TEXTURES)[number]

export const CABINET_TEXTURE_URLS: Record<CabinetTexture, string | null> = {
  none: null,
  oak: `${TEXTURE_ROOT}/cabinets/oak.jpg`,
  walnut: `${TEXTURE_ROOT}/cabinets/walnut.jpg`,
}

/** MVP `createCabinetMaterialRegistry`: `textureRepeat = {width: 24, height: 36}`. */
export const CABINET_TEXTURE_TILING: TextureTiling = { widthIn: 24, depthIn: 36 }

// ─── Doors ───────────────────────────────────────────────────────────

export const DOOR_STYLES = ['slab', 'shaker'] as const
export type DoorStyle = (typeof DOOR_STYLES)[number]

/**
 * MVP `addShakerFrame`: a 3" frame standing 0.4" proud of the door face, with
 * the recessed centre panel set back 0.25". All inches.
 */
export const SHAKER_FRAME = {
  frameWidthIn: 3,
  frameDepthIn: 0.4,
  recessDepthIn: 0.25,
} as const

// ─── Appliances ──────────────────────────────────────────────────────
// MVP `appliance-render-plan.ts` — `APPLIANCE_ASSETS` keyed by engine
// category. The parametric box stays authoritative; the GLB is presentation
// only, exactly as the MVP states ("exact parametric geometry remains
// authoritative for every appliance").

export const APPLIANCE_MODELS = ['oven', 'fridge', 'sink', 'dishwasher'] as const
export type ApplianceModel = (typeof APPLIANCE_MODELS)[number]

export const APPLIANCE_MODEL_URLS: Record<ApplianceModel, string> = {
  oven: '/models/oven.glb',
  fridge: '/models/fridge.glb',
  sink: '/models/sink.glb',
  dishwasher: '/models/dishwasher.glb',
}

/**
 * MVP `applianceModelPlacements` maps engine categories to model kinds. Pascal
 * reads the engine `subtype` rather than a `category` field — same values.
 */
export function applianceModelForSubtype(subtype: string): ApplianceModel | null {
  if (subtype === 'range') return 'oven'
  if (subtype === 'refrigerator') return 'fridge'
  if (subtype === 'sink') return 'sink'
  if (subtype === 'dishwasher') return 'dishwasher'
  return null
}

/**
 * MVP `configureRoot` — per-model corrective scale and offset that normalise
 * each GLB into room space. The MVP works in `INCH_TO_UNIT = 0.1` units where
 * `39.37 * INCH_TO_UNIT` is one metre; Pascal is metres, so the same factor
 * is `39.37 * 0.0254 = 1`. Offsets are MVP scene units → metres via the same
 * ratio (`0.0254 / 0.1`).
 */
const MVP_UNIT_TO_METER = 0.0254 / 0.1

export type ApplianceModelTransform = {
  scale: [number, number, number]
  offset: [number, number, number]
}

export const APPLIANCE_MODEL_TRANSFORMS: Record<ApplianceModel, ApplianceModelTransform> = {
  oven: {
    scale: [1.18 * 1.25, 1.18, 1.18 * 0.95],
    offset: [-0.34 * MVP_UNIT_TO_METER, 0, 0.05 * MVP_UNIT_TO_METER],
  },
  fridge: {
    scale: [1.7 * 1.3, 1.7 * 0.97, 1.7],
    offset: [-0.55 * MVP_UNIT_TO_METER, 0, -0.2 * MVP_UNIT_TO_METER],
  },
  sink: {
    // MVP sets an absolute scaling here rather than a multiple of the metre
    // factor: `new Vector3(0.143, 0.13, 0.13)` in 0.1-unit space.
    scale: [0.143 * MVP_UNIT_TO_METER, 0.13 * MVP_UNIT_TO_METER, 0.13 * MVP_UNIT_TO_METER],
    offset: [0, 0.15 * MVP_UNIT_TO_METER, 0.2 * MVP_UNIT_TO_METER],
  },
  dishwasher: { scale: [1, 1, 1], offset: [0, 0, 0] },
}
