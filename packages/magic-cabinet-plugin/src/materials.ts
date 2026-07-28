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
}

export function materialColor(key: string, explicit: string | undefined, finish: string): string {
  if (explicit) return explicit
  const normalized = key.toLowerCase()
  for (const [token, color] of Object.entries(MATERIAL_COLORS)) {
    if (normalized.includes(token)) return color
  }
  return MATERIAL_COLORS[finish] ?? '#9b9b83'
}

// PBR constants ported from the web MVP's single-cabinet Babylon showcase
// (`apps/web/src/components/cabinet-scene-mesh.ts`) — same jpgs, same
// roughness tiers, same normal-map strengths.
const WOOD_LIGHT = `${TEXTURE_ROOT}/finishes/wood-light`
const WOOD_DARK = `${TEXTURE_ROOT}/finishes/wood-dark`
const PAINT_ALBEDO = `${TEXTURE_ROOT}/cabinets/painted.jpg`
const PAINT_NORMAL = `${TEXTURE_ROOT}/finishes/paint-normal.jpg`

// MVP `getFinishContext`: gloss 0.3 / matte 0.8 / paint 0.55 / wood 0.42.
const WOOD_ROUGHNESS = 0.42
const PAINT_ROUGHNESS = 0.55
// MVP `applyWoodMaterial`: bump.level 0.26 light, 0.16 dark.
const WOOD_NORMAL_SCALE = { light: 0.26, dark: 0.16 }
const PAINT_NORMAL_SCALE = 0.2
// MVP derives the cabinet-body UV repeat from panel size in inches over a 46"
// reference, then swaps u/v and rotates 90° to run the grain along the panel.
const UV_REFERENCE_M = 46 * INCH_TO_METER

type FinishSurface =
  | { kind: 'wood'; dir: string; tone: 'light' | 'dark' }
  | { kind: 'paint' }
  | { kind: 'bare' }

/** Which physical surface a `finish` enum value represents. */
function finishSurface(finish: string): FinishSurface {
  if (finish === 'oak') return { kind: 'wood', dir: WOOD_LIGHT, tone: 'light' }
  if (finish === 'black') return { kind: 'wood', dir: WOOD_DARK, tone: 'dark' }
  if (finish === 'sage' || finish === 'white') return { kind: 'paint' }
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
    plan.normalScale = WOOD_NORMAL_SCALE[surface.tone]
    plan.roughnessMap = `${surface.dir}/roughness.jpg`
    plan.roughness = WOOD_ROUGHNESS
  } else if (surface.kind === 'paint') {
    plan.map = PAINT_ALBEDO
    plan.normalMap = PAINT_NORMAL
    plan.normalScale = PAINT_NORMAL_SCALE
    plan.roughness = PAINT_ROUGHNESS
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
  if (srgb) map.colorSpace = SRGBColorSpace
  textureCache.set(cacheKey, map)
  return map
}

/** MVP: `uScale = max(0.2, panel.width / 46)`, same for height. */
function uvRepeat(
  size: readonly [number, number],
  tilingM: [number, number] | null,
): [number, number] {
  if (tilingM) return [size[0] / tilingM[0], size[1] / tilingM[1]]
  return [Math.max(0.2, size[0] / UV_REFERENCE_M), Math.max(0.2, size[1] / UV_REFERENCE_M)]
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
  const [repeatU, repeatV] = uvRepeat(size, plan.tilingM)
  const rotate = plan.tilingM === null
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
    const normal = texture(plan.normalMap, repeatU, repeatV, false, rotate, rotationRad)
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
