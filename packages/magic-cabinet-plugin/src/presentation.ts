import type { CameraPose } from '@pascal-app/core'

export type MagicPresentationId =
  | 'hero'
  | 'workwall'
  | 'detail'
  | 'plan'
  | 'elevation'
  | 'breakaway'

export type MagicPilotPresentation = {
  id: MagicPresentationId
  label: string
  viewMode: '2d' | '3d'
  pose: CameraPose
  sceneTheme: 'paper' | 'sunset' | 'twilight'
  wallMode: 'up' | 'cutaway' | 'down'
  levelMode: 'solo'
}

export const MAGIC_PILOT_PRESENTATIONS: readonly MagicPilotPresentation[] = [
  {
    id: 'hero',
    label: 'Hero',
    viewMode: '3d',
    pose: {
      position: [-2.65, 2.1, 2.4],
      target: [-3.25, 1.05, -3.45],
      projection: 'perspective',
      fov: 43,
    },
    sceneTheme: 'paper',
    wallMode: 'cutaway',
    levelMode: 'solo',
  },
  {
    id: 'workwall',
    label: 'Work wall',
    viewMode: '3d',
    pose: {
      position: [-3.25, 1.6, 1.25],
      target: [-3.25, 1.15, -4.0],
      projection: 'orthographic',
      viewWidth: 5.2,
    },
    sceneTheme: 'paper',
    wallMode: 'down',
    levelMode: 'solo',
  },
  {
    id: 'detail',
    label: 'Detail',
    viewMode: '3d',
    pose: {
      position: [-1.35, 1.65, -1.9],
      target: [-2.05, 1.45, -4.05],
      projection: 'perspective',
      fov: 38,
    },
    sceneTheme: 'twilight',
    wallMode: 'down',
    levelMode: 'solo',
  },
  {
    id: 'plan',
    label: 'Plan',
    viewMode: '2d',
    pose: {
      position: [0, 15, 0],
      target: [0, 0, 0],
      projection: 'orthographic',
      viewWidth: 14,
    },
    sceneTheme: 'paper',
    wallMode: 'down',
    levelMode: 'solo',
  },
  {
    id: 'elevation',
    label: 'Elevation',
    viewMode: '3d',
    pose: {
      position: [-3.25, 1.45, 2.5],
      target: [-3.25, 1.35, -4.1],
      projection: 'orthographic',
      viewWidth: 4.6,
    },
    sceneTheme: 'paper',
    wallMode: 'down',
    levelMode: 'solo',
  },
  {
    id: 'breakaway',
    label: 'Rooms',
    viewMode: '3d',
    pose: {
      position: [8.7, 10.4, 10.2],
      target: [0, 0.3, 0],
      projection: 'perspective',
      fov: 42,
    },
    sceneTheme: 'sunset',
    wallMode: 'cutaway',
    levelMode: 'solo',
  },
]

export function getMagicPilotPresentation(id: MagicPresentationId): MagicPilotPresentation {
  return MAGIC_PILOT_PRESENTATIONS.find((presentation) => presentation.id === id)!
}
