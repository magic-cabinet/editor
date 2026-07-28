'use client'

import { useScene } from '@pascal-app/core'
import { MagicCabinetComponentNode, type MagicCabinetLayoutNode } from './schema'

type ManualCabinetSpec = {
  label: string
  subtype: string
  dimensions: [number, number, number]
  y: number
  finish: 'sage' | 'oak'
}

const MANUAL_CABINETS: ManualCabinetSpec[] = [
  {
    label: 'Add base cabinet',
    subtype: 'manual-base',
    dimensions: [0.6, 0.88, 0.6],
    y: 0.44,
    finish: 'oak',
  },
  {
    label: 'Add wall cabinet',
    subtype: 'manual-wall',
    dimensions: [0.6, 0.72, 0.36],
    y: 1.78,
    finish: 'sage',
  },
]

function findLayout(
  nodes: ReturnType<typeof useScene.getState>['nodes'],
): MagicCabinetLayoutNode | undefined {
  return Object.values(nodes).find(
    (node) => (node as { type: string }).type === 'magic-cabinet:layout',
  ) as unknown as MagicCabinetLayoutNode | undefined
}

export default function MagicCabinetCatalogPanel() {
  const nodes = useScene((state) => state.nodes)
  const layout = findLayout(nodes)

  const addCabinet = (spec: ManualCabinetSpec) => {
    const scene = useScene.getState()
    const activeLevel = Object.values(scene.nodes).find((node) => node.type === 'level')?.id
    if (!activeLevel) return

    const position: [number, number, number] = layout
      ? [
          layout.position[0] + layout.width / 2,
          layout.position[1] + spec.y,
          layout.position[2] + 0.9,
        ]
      : [0, spec.y, 0]
    const node = MagicCabinetComponentNode.parse({
      name: spec.subtype === 'manual-base' ? 'Custom base cabinet' : 'Custom wall cabinet',
      parentId: activeLevel,
      position,
      dimensions: spec.dimensions,
      layoutId: layout?.id ?? 'manual',
      engineComponentId: `manual-${crypto.randomUUID()}`,
      componentKind: 'cabinet',
      subtype: spec.subtype,
      wall: null,
      catalogState: 'render-only',
      manuallyPinned: true,
      finish: spec.finish,
      geometry: [
        {
          kind: 'box',
          dimensionsM: spec.dimensions,
          positionM: [0, 0, 0],
          rotationRad: [0, 0, 0],
          materialKey: spec.finish,
        },
      ],
    })
    scene.createNode(node as never, activeLevel)
  }

  return (
    <div className="flex flex-col gap-4 p-4 text-sidebar-foreground">
      <div>
        <p className="font-semibold text-sm">Magic Cabinet</p>
        <p className="mt-1 text-sidebar-foreground/60 text-xs">
          Deterministic cabinets stay connected to the kitchen engine. Custom additions use the same
          Pascal move, rotate, snapping, and selection HUD.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {MANUAL_CABINETS.map((spec) => (
          <button
            className="rounded-xl border border-sidebar-border bg-sidebar-accent/40 p-3 text-left text-xs transition hover:bg-sidebar-accent"
            key={spec.subtype}
            onClick={() => addCabinet(spec)}
            type="button"
          >
            <span
              aria-hidden
              className="mb-2 block h-12 rounded-md border border-black/10"
              style={{ background: spec.finish === 'oak' ? '#bc8751' : '#9b9b83' }}
            />
            {spec.label}
          </button>
        ))}
      </div>

      {layout && (
        <div className="rounded-lg border border-sidebar-border px-3 py-2 text-left text-xs">
          Select generated kitchen
          <span className="mt-0.5 block text-sidebar-foreground/50">
            {layout.componentIds.length} deterministic parts · {layout.validationState}
          </span>
        </div>
      )}
    </div>
  )
}
