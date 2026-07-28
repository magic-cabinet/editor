import type { AnyNodeDefinition, HandleDescriptor, NodeDefinition } from '@pascal-app/core'
import { buildMagicComponentFloorplan, buildMagicLayoutFloorplan } from './floorplan'
import { buildMagicComponentGeometry, buildMagicLayoutGeometry } from './geometry'
import { magicCabinetPaint } from './paint'
import { magicCabinetComponentParametrics, magicCabinetLayoutParametrics } from './parametrics'
import {
  MagicCabinetComponentNode,
  type MagicCabinetComponentNode as MagicCabinetComponentNodeType,
  MagicCabinetLayoutNode,
} from './schema'
import { magicCabinetSlots } from './slots'

const componentMoveHandle: HandleDescriptor<MagicCabinetComponentNodeType> = {
  kind: 'tap-action',
  shape: 'move-cross',
  cursor: 'move',
  onActivate: (node, _scene, editor) => editor.engageMoveDrag(node as never),
  placement: {
    position: (node) => [
      -(node.dimensions[0] / 2 + 0.3),
      node.dimensions[1] / 2,
      node.dimensions[2] / 2 + 0.3,
    ],
  },
}

const componentRotateHandle: HandleDescriptor<MagicCabinetComponentNodeType> = {
  kind: 'arc-resize',
  axis: 'angular',
  shape: 'rotate',
  apply: (initial, delta) => {
    const [x, y, z] = initial.rotation
    return { rotation: [x, y - delta, z] }
  },
  placement: {
    position: (node) => [
      node.dimensions[0] / 2 + 0.3,
      node.dimensions[1] / 2,
      node.dimensions[2] / 2 + 0.3,
    ],
    rotationY: () => -Math.PI / 4,
  },
  decoration: {
    kind: 'ring',
    radius: (node) => Math.hypot(node.dimensions[0] / 2, node.dimensions[2] / 2) + 0.06,
    y: (node) => node.dimensions[1] / 2,
  },
}

export const magicCabinetLayoutDefinition: NodeDefinition<typeof MagicCabinetLayoutNode> = {
  kind: 'magic-cabinet:layout',
  schemaVersion: 1,
  schema: MagicCabinetLayoutNode,
  category: 'furnish',
  defaults: () => ({
    object: 'node',
    parentId: null,
    visible: true,
    metadata: {},
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    width: 4.1,
    depth: 3.8,
    counterHeight: 0.88,
    backsplashHeight: 0.6,
    engineVersion: 'unresolved',
    engineResult: {},
    engineState: {},
    engineInput: {},
    relationships: [],
    diagnostics: [],
    pinnedComponentIds: [],
    componentIds: [],
    validationState: 'valid',
    activePresentation: 'hero',
    palette: 'sage-oak',
    doorStyle: 'slab',
    cabinetTexture: 'none',
    countertopMaterial: 'quartz',
    applianceDetail: true,
    floorType: 'hardwood',
    backsplashMaterial: 'white-metro-tile',
  }),
  capabilities: {
    selectable: { hitVolume: 'bbox' },
    duplicable: false,
    deletable: false,
    presettable: false,
  },
  geometry: buildMagicLayoutGeometry,
  floorplan: buildMagicLayoutFloorplan,
  parametrics: magicCabinetLayoutParametrics,
  presentation: {
    label: 'Magic Kitchen',
    description: 'Deterministic Magic Cabinet kitchen layout and presentation state.',
    icon: { kind: 'url', src: '/icons/kitchen.webp' },
    paletteSection: 'furnish',
    paletteOrder: 10,
    hidden: true,
  },
  mcp: {
    description:
      'Magic Cabinet engine layout. Presentation and palette fields control the showroom.',
  },
}

export const magicCabinetComponentDefinition: NodeDefinition<typeof MagicCabinetComponentNode> = {
  kind: 'magic-cabinet:component',
  schemaVersion: 1,
  schema: MagicCabinetComponentNode,
  category: 'furnish',
  surfaceRole: 'furnishing',
  snapProfile: 'item',
  facingIndicator: true,
  defaults: () => ({
    object: 'node',
    parentId: null,
    visible: true,
    metadata: {},
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    dimensions: [0.6, 0.88, 0.6],
    layoutId: 'manual',
    engineComponentId: 'manual',
    componentKind: 'cabinet',
    subtype: 'base',
    wall: null,
    geometry: [],
    catalogState: 'render-only',
    manuallyPinned: true,
    finish: 'sage',
    handleStyle: 'bar',
    doorStyle: 'slab',
    cabinetTexture: 'none',
    countertopMaterial: 'quartz',
    applianceDetail: true,
  }),
  capabilities: {
    movable: { axes: ['x', 'z'], gridSnap: true },
    rotatable: {
      axes: ['y'],
      snapAngles: [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2],
    },
    selectable: { hitVolume: 'bbox' },
    duplicable: true,
    deletable: true,
    groupable: true,
    presettable: false,
    floorPlaced: {
      footprint: (rawNode) => {
        const node = rawNode as unknown as MagicCabinetComponentNodeType
        return { dimensions: node.dimensions, rotation: node.rotation }
      },
      collides: true,
    },
    // Paint mode. The slot ids are Pascal's own, so the native appliance
    // meshes inside a component are paintable through the same declaration.
    paint: magicCabinetPaint,
    slots: () => magicCabinetSlots(),
  },
  handles: [componentMoveHandle, componentRotateHandle],
  geometry: buildMagicComponentGeometry,
  floorplan: buildMagicComponentFloorplan,
  parametrics: magicCabinetComponentParametrics,
  presentation: {
    label: 'Magic Cabinet',
    description: 'Cabinet, worktop, appliance, panel, or trim from the Magic engine.',
    icon: { kind: 'url', src: '/icons/kitchen.webp' },
    paletteSection: 'furnish',
    paletteOrder: 20,
    hidden: true,
  },
  mcp: {
    description: 'Magic Cabinet engine component with deterministic geometry and catalog identity.',
  },
}

export const magicCabinetDefinitions = [
  magicCabinetLayoutDefinition,
  magicCabinetComponentDefinition,
] as AnyNodeDefinition[]
