export type PascalProductProfile = 'magic-cabinet' | 'pascal'

export function resolveProductProfile(value?: string): PascalProductProfile {
  return value?.toLowerCase() === 'pascal' ? 'pascal' : 'magic-cabinet'
}

export const activeProductProfile = resolveProductProfile(
  process.env.NEXT_PUBLIC_PASCAL_PRODUCT_PROFILE,
)

export const isMagicCabinetProfile = activeProductProfile === 'magic-cabinet'

const MAGIC_BUILD_ENTRIES = new Set(['wall', 'slab', 'door', 'window', 'spawn', 'painting'])

const MAGIC_SIDEBAR_TABS = new Set(['site', 'build', 'settings'])

export function isBuildPaletteEntryVisible(id: string): boolean {
  return !isMagicCabinetProfile || MAGIC_BUILD_ENTRIES.has(id)
}

export function isSidebarTabVisible(id: string): boolean {
  return !isMagicCabinetProfile || MAGIC_SIDEBAR_TABS.has(id)
}

export function shouldLoadTreesPlugin(): boolean {
  return !isMagicCabinetProfile
}
