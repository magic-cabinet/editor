import {
  Color,
  MeshStandardMaterial,
  RepeatWrapping,
  SRGBColorSpace,
  type Texture,
  TextureLoader,
} from 'three'
import {
  BACKSPLASH_TEXTURES,
  type BacksplashMaterial,
  CABINET_TEXTURE_TILING,
  CABINET_TEXTURE_URLS,
  type CabinetTexture,
  COUNTERTOP_TEXTURES,
  type CountertopMaterial,
  FLOOR_TEXTURES,
  type FloorType,
  type SurfaceTexture,
  TEXTURE_ROOT,
} from './style'

const INCH_TO_METER = 0.0254

/**
 * Every MVP texture is created with `anisotropicFilteringLevel = maxAnisotropy`
 * (`cabinet-scene-mesh.ts:207,230,312`); three defaults to 1, which is the
 * classic shimmer-at-a-grazing-angle artifact on a floor or a long counter run.
 *
 * The MVP can ask its engine for the real maximum because it builds materials
 * with a `Scene` in hand. `def.geometry` has no renderer, so we ask for the
 * WebGPU spec ceiling and let three clamp: the WebGL path takes
 * `min(texture.anisotropy, capabilities.getMaxAnisotropy())`
 * (`WebGLTextures.js:702`) and the WebGPU path passes it to the sampler
 * descriptor, whose own maximum is 16.
 */
const MAX_ANISOTROPY = 16

const MATERIAL_COLORS: Record<string, string> = {
  appliance: '#18191b',
  black: '#18191b',
  cabinet: '#9b9b83',
  countertop: '#eee8dc',
  filler: '#9b9b83',
  glass: '#b9d6df',
  hardware: '#17181a',
  oak: '#bc8751',
  panel: '#9b9b83',
  quartz: '#eee8dc',
  sage: '#9b9b83',
  trim: '#9b9b83',
  // MVP `CABINET_FINISHES.white.color` (`design-options.ts:36`) — the default
  // design's cabinet colour, and the one value with no entry here before.
  white: '#f5f5f0',
}

/**
 * The tint for one primitive.
 *
 * Order matters, and it used to be wrong. The token scan below matches on
 * substrings of the *material key*, and the engine names cabinet parts
 * `cabinet-panel:mdf`, `panel:mdf`, `trim:mdf` — so `cabinet` / `panel` /
 * `trim` all hit the generic `#9b9b83` before `finish` was ever consulted.
 * The effect was that `finish` did not tint anything a user can see: every
 * door, panel and trim in the kitchen came out sage whatever the finish said,
 * and only the *texture* half of the finish (wood grain vs paint) responded.
 *
 * A surface that takes the body finish now asks the finish first. The token
 * scan keeps the surfaces the MVP excludes from `takesBodyColor` — glass,
 * hardware, appliance shells — which is exactly what it is good for.
 */
export function materialColor(key: string, explicit: string | undefined, finish: string): string {
  if (explicit) return explicit
  if (takesBodyFinish(key)) return MATERIAL_COLORS[finish] ?? '#9b9b83'
  const normalized = key.toLowerCase()
  for (const [token, color] of Object.entries(MATERIAL_COLORS)) {
    if (normalized.includes(token)) return color
  }
  return MATERIAL_COLORS[finish] ?? '#9b9b83'
}

// PBR constants ported from the web MVP's single-cabinet Babylon showcase
// (`apps/web/src/components/cabinet-scene-mesh.ts`) — same jpgs, same
// roughness tiers, same normal-map strengths.
/**
 * The oak grain photo.
 *
 * The two texture *directories* are mislabeled at the asset level: the photo
 * in `wood-light/` is a dark walnut and the photo in `wood-dark/` is a light
 * oak. The MVP says so in caps (`cabinet-colors.ts:31`) and inverts its own
 * finish→directory map to compensate — `oak` and `natural` both resolve to
 * `wood-dark/color.jpg`. We inherited the label without the compensation, so
 * `oak` was wearing the walnut photo: mean luminance of the two served files
 * is 34.9 (`wood-light`) against 147.5 (`wood-dark`), a 4.2× gap.
 *
 * Named for what the directory *contains* so the inversion cannot be
 * reintroduced by reading the path.
 */
const WOOD_OAK = `${TEXTURE_ROOT}/finishes/wood-dark`
const PAINT_ALBEDO = `${TEXTURE_ROOT}/cabinets/painted.jpg`
const PAINT_NORMAL = `${TEXTURE_ROOT}/finishes/paint-normal.jpg`

// MVP `getFinishContext`: gloss 0.3 / matte 0.8 / paint 0.55 / wood 0.42.
const WOOD_ROUGHNESS = 0.42
const PAINT_ROUGHNESS = 0.55
// MVP `applyWoodMaterial`: `bump.level = isDarkWalnut ? 0.16 : 0.26`, and
// `isDarkWalnut` tests the *directory* (`/wood-light/`). The oak photo is the
// other branch, so it takes 0.26.
const WOOD_NORMAL_SCALE = 0.26
const PAINT_NORMAL_SCALE = 0.2
// MVP derives the cabinet-body UV repeat from panel size in inches over a 46"
// reference, then swaps u/v and rotates 90° to run the grain along the panel.
const UV_REFERENCE_M = 46 * INCH_TO_METER
// `applyWoodMaterial` gives the oak photo a coarser reference than the paint
// base: `max(0.15, panel.width / 58)` where `isLightOak`.
const WOOD_UV_REFERENCE_M = 58 * INCH_TO_METER
const WOOD_UV_MIN = 0.15
// `applyPaintBump` sizes the brushed-paint normal against the panel in inches
// over 5", floored at 3 — deliberately independent of the albedo repeat, and
// 5–15× finer than it. Reusing the albedo repeat here is what made painted
// fronts read blotchy instead of finely brushed.
const PAINT_BUMP_REFERENCE_M = 5 * INCH_TO_METER
const PAINT_BUMP_MIN = 3

type FinishSurface = { kind: 'wood'; dir: string } | { kind: 'paint' } | { kind: 'bare' }

/** Which physical surface a `finish` enum value represents. */
function finishSurface(finish: string): FinishSurface {
  if (finish === 'oak') return { kind: 'wood', dir: WOOD_OAK }
  // `black` is a *painted* finish in the MVP, not a wood one — `cabinet-colors.ts`
  // resolves it to `/textures/cabinets/painted.jpg` like every other paint. It
  // used to map to a wood directory here, which put grain on a black cabinet.
  // (Appliances also carry `finish: 'black'`, but their material keys are
  // excluded by `takesBodyFinish`, so this never reached them.)
  if (finish === 'black' || finish === 'sage' || finish === 'white') return { kind: 'paint' }
  return { kind: 'bare' }
}

export type MagicMaterialPlan = {
  map: string | null
  normalMap: string | null
  normalScale: number
  roughnessMap: string | null
  roughness: number
  metalness: number
  /**
   * When set, UVs tile at this physical size instead of being derived from
   * the panel's own dimensions. Surfaces the kitchen designer owns (floor,
   * countertop, backsplash) carry the MVP's `repeatSizeInches` so a marble
   * slab reads at the same scale in Pascal as it does in the designer.
   */
  tilingM: [number, number] | null
  /**
   * How the normal map tiles.
   *
   * `panel` reuses the albedo repeat, which is right for wood — the MVP's
   * `configureTexture` applies one repeat to the albedo, normal and roughness
   * siblings together. `paint-bump` is the MVP's `applyPaintBump`, which sizes
   * the brushed-paint normal on its own much finer scale and does *not* take
   * the u/v swap or the 90° rotation the cabinet-body albedo takes.
   */
  normalTiling: 'panel' | 'paint-bump'
  /**
   * Per-surface override of the albedo repeat reference and floor, for the one
   * surface that has them: the oak photo tiles over 58" with a 0.15 floor
   * where everything else uses 46" and 0.2.
   */
  uvReferenceM: number
  uvMin: number
}

export type MagicStyleContext = {
  finish: string
  cabinetTexture: CabinetTexture
  countertopMaterial: CountertopMaterial
}

function planFor(texture: SurfaceTexture, roughness: number): MagicMaterialPlan {
  return {
    map: texture.url,
    normalMap: null,
    normalScale: 1,
    roughnessMap: null,
    roughness,
    metalness: 0,
    tilingM: [texture.tiling.widthIn * INCH_TO_METER, texture.tiling.depthIn * INCH_TO_METER],
    normalTiling: 'panel',
    uvReferenceM: UV_REFERENCE_M,
    uvMin: 0.2,
  }
}

/**
 * The texture/PBR decision for one primitive, as data. Split out from material
 * construction so the mapping can be asserted without a WebGL context — three's
 * `TextureLoader` needs a DOM, so a test that builds real materials can only
 * run in a browser.
 */
export function magicMaterialPlan(
  materialKey: string,
  style: MagicStyleContext,
): MagicMaterialPlan {
  const normalized = materialKey.toLowerCase()
  const isHardware = normalized.includes('hardware')
  const plan: MagicMaterialPlan = {
    map: null,
    normalMap: null,
    normalScale: 1,
    roughnessMap: null,
    roughness: normalized.includes('quartz') ? 0.32 : 0.68,
    metalness: isHardware ? 0.72 : 0,
    tilingM: null,
    normalTiling: 'panel',
    uvReferenceM: UV_REFERENCE_M,
    uvMin: 0.2,
  }

  if (normalized.startsWith('countertop:')) {
    // A countertop never wears the cabinet finish — falling through to the
    // body finish would put oak grain on a slab of granite. The engine names
    // the slab material in the key, but the designer's `countertopMaterial`
    // is what the user picks, so that wins.
    const texture = COUNTERTOP_TEXTURES[style.countertopMaterial]
    if (texture) return planFor(texture, style.countertopMaterial === 'quartz' ? 0.32 : 0.5)
    return plan
  }
  if (!takesBodyFinish(materialKey)) return plan

  // MVP `KitchenAssembly` offers a flat cabinet texture that overrides the
  // finish colour entirely (`createCabinetMaterialRegistry`: when
  // `cabinetTexture` is set the diffuse colour is forced to near-white and
  // the jpg carries the look).
  const cabinetTextureUrl = CABINET_TEXTURE_URLS[style.cabinetTexture]
  if (cabinetTextureUrl) {
    plan.map = cabinetTextureUrl
    plan.roughness = WOOD_ROUGHNESS
    plan.tilingM = [
      CABINET_TEXTURE_TILING.widthIn * INCH_TO_METER,
      CABINET_TEXTURE_TILING.depthIn * INCH_TO_METER,
    ]
    return plan
  }

  const surface = finishSurface(style.finish)
  if (surface.kind === 'wood') {
    plan.map = `${surface.dir}/color.jpg`
    plan.normalMap = `${surface.dir}/normal.jpg`
    plan.normalScale = WOOD_NORMAL_SCALE
    plan.roughnessMap = `${surface.dir}/roughness.jpg`
    plan.roughness = WOOD_ROUGHNESS
    plan.uvReferenceM = WOOD_UV_REFERENCE_M
    plan.uvMin = WOOD_UV_MIN
  } else if (surface.kind === 'paint') {
    plan.map = PAINT_ALBEDO
    plan.normalMap = PAINT_NORMAL
    plan.normalScale = PAINT_NORMAL_SCALE
    plan.roughness = PAINT_ROUGHNESS
    plan.normalTiling = 'paint-bump'
  }
  return plan
}

/** Floor and backsplash are whole surfaces, not per-primitive materials. */
export function floorMaterialPlan(floorType: FloorType): MagicMaterialPlan {
  return planFor(FLOOR_TEXTURES[floorType], 0.72)
}

export function backsplashMaterialPlan(material: BacksplashMaterial): MagicMaterialPlan | null {
  const texture = BACKSPLASH_TEXTURES[material]
  return texture ? planFor(texture, 0.38) : null
}

/**
 * Panels that never take the body finish — MVP `createMaterialFactory`
 * excludes exactly these from `takesBodyColor`.
 */
function takesBodyFinish(key: string): boolean {
  const normalized = key.toLowerCase()
  return !(
    normalized.includes('back_panel') ||
    normalized.includes('glass') ||
    normalized.includes('appliance') ||
    normalized.includes('hardware')
  )
}

// One decode + one GPU upload per image, then a light clone per distinct UV
// scale. Without this the pilot builds ~120 materials and stalls the first
// frame compiling a program for each.
const textureCache = new Map<string, Texture>()
let loader: TextureLoader | null = null

function texture(
  url: string,
  repeatU: number,
  repeatV: number,
  srgb: boolean,
  rotate: boolean,
  rotationRad: number,
): Texture | null {
  // three's `ImageLoader` reaches for `document.createElementNS`. `def.geometry`
  // only ever runs in the browser, but the same builders are called headless by
  // the geometry tests (and would be by any SSR pass) — where the right answer
  // is an untextured material, not a crash. Colour and PBR constants survive;
  // only the image is dropped.
  if (typeof document === 'undefined') return null
  const cacheKey = `${url}|${repeatU.toFixed(3)}|${repeatV.toFixed(3)}|${rotate}|${rotationRad}`
  const cached = textureCache.get(cacheKey)
  if (cached) return cached
  loader ??= new TextureLoader()
  const map = loader.load(url)
  map.wrapS = RepeatWrapping
  map.wrapT = RepeatWrapping
  // MVP swaps u/v and sets wAng = PI/2 together for cabinet bodies; the swap
  // is what the rotation undoes, so the pair has to move together or the
  // grain runs across the door. Surfaces with an explicit tiling size don't
  // take the swap — their repeat is already in surface axes.
  map.repeat.set(rotate ? repeatV : repeatU, rotate ? repeatU : repeatV)
  map.rotation = rotate ? Math.PI / 2 : rotationRad
  map.center.set(0.5, 0.5)
  map.anisotropy = MAX_ANISOTROPY
  if (srgb) map.colorSpace = SRGBColorSpace
  textureCache.set(cacheKey, map)
  return map
}

/** MVP: `uScale = max(0.2, panel.width / 46)`, same for height. */
export function uvRepeat(
  size: readonly [number, number],
  plan: MagicMaterialPlan,
): [number, number] {
  const { tilingM } = plan
  if (tilingM) return [size[0] / tilingM[0], size[1] / tilingM[1]]
  return [
    Math.max(plan.uvMin, size[0] / plan.uvReferenceM),
    Math.max(plan.uvMin, size[1] / plan.uvReferenceM),
  ]
}

/** MVP `applyPaintBump`: `uScale = max(3, panel.width / 5)`, same for height. */
export function paintBumpRepeat(size: readonly [number, number]): [number, number] {
  return [
    Math.max(PAINT_BUMP_MIN, size[0] / PAINT_BUMP_REFERENCE_M),
    Math.max(PAINT_BUMP_MIN, size[1] / PAINT_BUMP_REFERENCE_M),
  ]
}

const materialCache = new Map<string, MeshStandardMaterial>()

export type MaterialRequest = {
  key: string
  explicit?: string | undefined
  style: MagicStyleContext
  emissive?: boolean
  /** Physical size of the surface being mapped, in metres. */
  size?: readonly [number, number]
  /** Pre-resolved plan for whole surfaces (floor, backsplash). */
  plan?: MagicMaterialPlan
  /** Flat colour override used with `plan` (floor fallback colours). */
  color?: string
  rotationRad?: number
}

export function magicMaterial(request: MaterialRequest): MeshStandardMaterial {
  const {
    key,
    explicit,
    style,
    emissive = false,
    size = [UV_REFERENCE_M, UV_REFERENCE_M],
    rotationRad = 0,
  } = request
  const plan = request.plan ?? magicMaterialPlan(key, style)
  const color = request.color ?? materialColor(key, explicit, style.finish)
  const [repeatU, repeatV] = uvRepeat(size, plan)
  const rotate = plan.tilingM === null
  // The paint bump's repeat is floored at 3 where the albedo's is floored at
  // 0.2, so two panels can share an albedo repeat and need different bumps.
  const paintBump = plan.normalTiling === 'paint-bump'
  const [normalU, normalV] = paintBump ? paintBumpRepeat(size) : [repeatU, repeatV]
  const cacheKey = [
    key,
    color,
    style.finish,
    style.cabinetTexture,
    style.countertopMaterial,
    emissive,
    plan.map ?? '',
    repeatU.toFixed(3),
    repeatV.toFixed(3),
    normalU.toFixed(3),
    normalV.toFixed(3),
    rotationRad,
  ].join('|')
  const cached = materialCache.get(cacheKey)
  if (cached) return cached

  const built = new MeshStandardMaterial({
    color,
    emissive: emissive ? new Color('#ffcc78') : new Color('#000000'),
    emissiveIntensity: emissive ? 2.4 : 0,
    metalness: plan.metalness,
    roughness: plan.roughness,
  })
  if (plan.map) built.map = texture(plan.map, repeatU, repeatV, true, rotate, rotationRad)
  if (plan.normalMap) {
    // The brushed-paint normal is sized on its own scale and takes neither the
    // u/v swap nor the 90° rotation — `applyPaintBump` sets `uScale` from the
    // panel width directly and never touches `wAng`. Wood keeps the albedo's
    // repeat and rotation, which is what `configureTexture` applies to the
    // colour, normal and roughness siblings together.
    const normal = texture(
      plan.normalMap,
      normalU,
      normalV,
      false,
      paintBump ? false : rotate,
      paintBump ? 0 : rotationRad,
    )
    if (normal) {
      built.normalMap = normal
      built.normalScale.setScalar(plan.normalScale)
    }
  }
  // Babylon reads roughness out of the green channel
  // (`useRoughnessFromMetallicTextureGreen`); three does the same.
  if (plan.roughnessMap) {
    built.roughnessMap = texture(plan.roughnessMap, repeatU, repeatV, false, rotate, rotationRad)
  }

  materialCache.set(cacheKey, built)
  return built
}
