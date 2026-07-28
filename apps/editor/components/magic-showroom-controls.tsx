'use client'

import {
  getMagicPilotPresentation,
  MAGIC_PILOT_PRESENTATIONS,
  type MagicCabinetComponentNode,
  type MagicCabinetLayoutNode,
  type MagicPresentationId,
} from '@magic-cabinet/pascal-plugin'
import { emitter, useScene } from '@pascal-app/core'
import { triggerSFX, useEditor } from '@pascal-app/editor'
import { useViewer } from '@pascal-app/viewer'
import { useEffect } from 'react'

type Palette = MagicCabinetLayoutNode['palette']
type HandleStyle = MagicCabinetComponentNode['handleStyle']

const PALETTES: readonly { id: Palette; label: string; swatch: string }[] = [
  {
    id: 'sage-oak',
    label: 'Sage + oak',
    swatch: 'linear-gradient(135deg,#9b9b83 50%,#bc8751 50%)',
  },
  {
    id: 'oak-white',
    label: 'Oak + white',
    swatch: 'linear-gradient(135deg,#bc8751 50%,#f4f1ea 50%)',
  },
  { id: 'midnight', label: 'Midnight', swatch: '#242629' },
  {
    id: 'warm-minimal',
    label: 'Warm minimal',
    swatch: 'linear-gradient(135deg,#eee8dc 50%,#d2b48c 50%)',
  },
]

const HANDLE_STYLES: readonly HandleStyle[] = ['bar', 'knob', 'edge', 'none']

function applyPresentation(id: MagicPresentationId): void {
  const presentation = getMagicPilotPresentation(id)
  useEditor.getState().setViewMode(presentation.viewMode)
  const viewer = useViewer.getState()
  viewer.setSceneTheme(presentation.sceneTheme)
  viewer.setWallMode(presentation.wallMode)
  viewer.setLevelMode(presentation.levelMode)
  emitter.emit('camera-controls:apply-pose', presentation.pose)
}

function componentFinish(
  node: MagicCabinetComponentNode,
  palette: Palette,
): MagicCabinetComponentNode['finish'] {
  if (node.componentKind === 'countertop') return 'quartz'
  if (node.componentKind === 'appliance' || node.componentKind === 'appliance-opening') {
    return 'black'
  }
  const wallMounted = node.subtype.includes('wall') || node.position[1] > 1.2
  if (palette === 'midnight') return 'black'
  if (palette === 'warm-minimal') return wallMounted ? 'oak' : 'white'
  if (palette === 'oak-white') return wallMounted ? 'white' : 'oak'
  return wallMounted ? 'sage' : 'oak'
}

export function MagicShowroomControls() {
  const layout = useScene(
    (state) =>
      (
        Object.values(state.nodes) as unknown as (
          | MagicCabinetLayoutNode
          | MagicCabinetComponentNode
        )[]
      ).find((node) => node.type === 'magic-cabinet:layout') as MagicCabinetLayoutNode | undefined,
  )
  const currentHandle = useScene(
    (state) =>
      (Object.values(state.nodes) as unknown as MagicCabinetComponentNode[]).find(
        (node) => node.type === 'magic-cabinet:component' && node.componentKind === 'cabinet',
      )?.handleStyle ?? 'bar',
  )
  const activePresentation = layout?.activePresentation
  const activePalette = layout?.palette

  useEffect(() => {
    if (!activePresentation) return
    applyPresentation(activePresentation)
  }, [activePresentation])

  useEffect(() => {
    if (!activePalette) return
    const scene = useScene.getState()
    const updates = (Object.values(scene.nodes) as unknown as MagicCabinetComponentNode[])
      .filter((node) => node.type === 'magic-cabinet:component')
      .map((node) => {
        const component = node
        return {
          id: component.id,
          data: { finish: componentFinish(component, activePalette) },
        }
      })
    if (updates.length > 0) scene.updateNodes(updates as never)
  }, [activePalette])

  if (!layout) return null

  const setPresentation = (id: MagicPresentationId) => {
    triggerSFX('sfx:menu-click')
    useScene.getState().updateNode(layout.id as never, { activePresentation: id } as never)
  }

  const setPalette = (palette: Palette) => {
    triggerSFX('sfx:menu-click')
    useScene.getState().updateNode(layout.id as never, { palette } as never)
  }

  const setHandles = (handleStyle: HandleStyle) => {
    triggerSFX('sfx:menu-click')
    const scene = useScene.getState()
    scene.updateNodes(
      (Object.values(scene.nodes) as unknown as MagicCabinetComponentNode[])
        .filter((node) => node.type === 'magic-cabinet:component')
        .map((node) => ({ id: node.id, data: { handleStyle } })) as never,
    )
  }

  return (
    <div className="flex max-w-[min(76vw,900px)] items-center gap-1 overflow-x-auto rounded-2xl border border-white/10 bg-neutral-950/88 p-1.5 text-white shadow-xl backdrop-blur">
      {MAGIC_PILOT_PRESENTATIONS.map((presentation) => (
        <button
          className={`whitespace-nowrap rounded-xl px-2.5 py-1.5 text-xs transition ${
            layout.activePresentation === presentation.id
              ? 'bg-white text-neutral-950'
              : 'text-white/70 hover:bg-white/10 hover:text-white'
          }`}
          key={presentation.id}
          onClick={() => setPresentation(presentation.id)}
          type="button"
        >
          {presentation.label}
        </button>
      ))}
      <span className="mx-1 h-5 w-px shrink-0 bg-white/15" />
      {PALETTES.map((palette) => (
        <button
          aria-label={palette.label}
          className={`size-7 shrink-0 rounded-full border-2 ${
            layout.palette === palette.id ? 'border-white' : 'border-white/20'
          }`}
          key={palette.id}
          onClick={() => setPalette(palette.id)}
          style={{ background: palette.swatch }}
          title={palette.label}
          type="button"
        />
      ))}
      <span className="mx-1 h-5 w-px shrink-0 bg-white/15" />
      {HANDLE_STYLES.map((handle) => (
        <button
          className={`rounded-lg px-2 py-1 text-[11px] capitalize ${
            currentHandle === handle ? 'bg-white/20 text-white' : 'text-white/55 hover:text-white'
          }`}
          key={handle}
          onClick={() => setHandles(handle)}
          type="button"
        >
          {handle}
        </button>
      ))}
    </div>
  )
}
