import type { FloorplanGeometry, GeometryContext } from '@pascal-app/core'
import type { MagicCabinetComponentNode, MagicCabinetLayoutNode } from './schema'

const FINISH_COLORS: Record<MagicCabinetComponentNode['finish'], string> = {
  black: '#2b2c2f',
  oak: '#bc8751',
  quartz: '#eee8dc',
  sage: '#9b9b83',
  white: '#f4f1ea',
}

export function buildMagicLayoutFloorplan(
  node: MagicCabinetLayoutNode,
  ctx: GeometryContext,
): FloorplanGeometry {
  const selected = ctx.viewState?.selected ?? false
  return {
    kind: 'group',
    transform: {
      translate: [node.position[0], node.position[2]],
      rotate: -(node.rotation[1] ?? 0),
    },
    children: [
      {
        kind: 'rect',
        x: 0,
        y: -node.depth,
        width: node.width,
        height: node.depth,
        fill: 'transparent',
        stroke: selected ? (ctx.viewState?.palette.selectedStroke ?? '#2563eb') : '#8a806e',
        strokeWidth: selected ? 0.035 : 0.018,
        strokeDasharray: '0.12 0.08',
      },
      {
        kind: 'text',
        x: node.width / 2,
        y: -node.depth - 0.15,
        text: 'MAGIC KITCHEN',
        fontSize: 0.13,
        fill: '#6f6658',
        fontWeight: 700,
        textAnchor: 'middle',
        upright: true,
      },
    ],
  }
}

export function buildMagicComponentFloorplan(
  node: MagicCabinetComponentNode,
  ctx: GeometryContext,
): FloorplanGeometry {
  const selected = ctx.viewState?.selected ?? false
  const outline =
    node.planOutline && node.planOutline.length >= 3
      ? {
          kind: 'polygon' as const,
          points: node.planOutline,
          fill: FINISH_COLORS[node.finish],
          stroke: selected ? (ctx.viewState?.palette.selectedStroke ?? '#2563eb') : '#2d2924',
          strokeWidth: selected ? 0.035 : 0.015,
          opacity: 0.92,
        }
      : {
          kind: 'rect' as const,
          x: -node.dimensions[0] / 2,
          y: -node.dimensions[2] / 2,
          width: node.dimensions[0],
          height: node.dimensions[2],
          fill: FINISH_COLORS[node.finish],
          stroke: selected ? (ctx.viewState?.palette.selectedStroke ?? '#2563eb') : '#2d2924',
          strokeWidth: selected ? 0.035 : 0.015,
          opacity: 0.92,
        }
  return {
    kind: 'group',
    transform: {
      translate: [node.position[0], node.position[2]],
      rotate: -(node.rotation[1] ?? 0),
    },
    children: [
      outline,
      {
        kind: 'line',
        x1: -node.dimensions[0] / 2,
        y1: node.dimensions[2] / 2 - 0.035,
        x2: node.dimensions[0] / 2,
        y2: node.dimensions[2] / 2 - 0.035,
        stroke: '#151515',
        strokeWidth: 0.018,
      },
    ],
  }
}
