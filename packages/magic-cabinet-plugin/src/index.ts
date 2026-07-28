import type { Plugin } from '@pascal-app/core'
import { MAGIC_CABINET_PLUGIN_ID } from './constants'
import { magicCabinetDefinitions } from './definitions'

export const magicCabinetPlugin: Plugin = {
  id: MAGIC_CABINET_PLUGIN_ID,
  apiVersion: 1,
  nodes: magicCabinetDefinitions,
}

export const magicCabinetHostPanel = {
  id: 'magic-cabinet:catalog',
  label: 'Cabinets',
  icon: { kind: 'url', src: '/icons/kitchen.webp' } as const,
  component: () => import('./catalog-panel'),
  kinds: ['magic-cabinet:layout', 'magic-cabinet:component'],
  workspaces: ['edit'],
  pluginId: MAGIC_CABINET_PLUGIN_ID,
  description: 'Magic Cabinet deterministic kitchen catalog and manual additions.',
  creator: { name: 'Magic Cabinet' },
  defaultInstalled: true,
}

export * from './adapter'
export * from './constants'
export * from './definitions'
export * from './house'
export * from './house-shell'
export * from './presentation'
export * from './schema'
