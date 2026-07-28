import {
  type AnyNode,
  type AnyNodeId,
  BuildingNode,
  DoorNode,
  LevelNode,
  SiteNode,
  SlabNode,
  SpawnNode,
  WallNode,
  WindowNode,
  ZoneNode,
} from '@pascal-app/core'
import type { SceneGraph } from '@pascal-app/core/clone-scene-graph'

const SITE_ID = 'site_magic_pilot'
const BUILDING_ID = 'building_magic_pilot'
export const MAGIC_PILOT_LEVEL_ID = 'level_magic_ground'

type Point = [number, number]

function wall(
  id: string,
  name: string,
  start: Point,
  end: Point,
  children: string[] = [],
): AnyNode {
  return WallNode.parse({
    id,
    name,
    parentId: MAGIC_PILOT_LEVEL_ID,
    children,
    thickness: 0.12,
    height: 2.7,
    start,
    end,
    frontSide: 'interior',
    backSide: 'exterior',
  }) as AnyNode
}

function door(id: string, name: string, wallId: string, alongWall: number): AnyNode {
  return DoorNode.parse({
    id,
    name,
    parentId: wallId,
    wallId,
    position: [alongWall, 1.05, 0],
    width: 0.9,
    height: 2.1,
    threshold: false,
    hingesSide: 'left',
    swingDirection: 'inward',
  }) as AnyNode
}

function windowNode(
  id: string,
  name: string,
  wallId: string,
  alongWall: number,
  width = 1.6,
): AnyNode {
  return WindowNode.parse({
    id,
    name,
    parentId: wallId,
    wallId,
    position: [alongWall, 1.35, 0],
    width,
    height: 1.3,
    rowRatios: [1],
    columnRatios: [1, 1],
    windowType: 'fixed',
  }) as AnyNode
}

function zone(id: string, name: string, polygon: Point[], color: string): AnyNode {
  return ZoneNode.parse({
    id,
    name,
    parentId: MAGIC_PILOT_LEVEL_ID,
    polygon,
    color,
    spaceRole: 'room',
    enclosureStatus: 'enclosed',
    clearDimensionPolicy: 'inside-faces',
    ceilingHeight: 2.7,
  }) as AnyNode
}

export function createMagicKitchenHouseShell(): SceneGraph {
  const walls = [
    wall(
      'wall_magic_north',
      'North exterior',
      [-6, -4.5],
      [6, -4.5],
      ['window_magic_kitchen', 'window_magic_living'],
    ),
    wall('wall_magic_east', 'East exterior', [6, -4.5], [6, 4.5], ['window_magic_bedroom_east']),
    wall(
      'wall_magic_south',
      'South exterior',
      [6, 4.5],
      [-6, 4.5],
      ['door_magic_front', 'window_magic_entry'],
    ),
    wall('wall_magic_west', 'West exterior', [-6, 4.5], [-6, -4.5], ['window_magic_kitchen_west']),
    // Kitchen threshold: two wing walls leave a generous 1.6 m opening.
    wall('wall_magic_kitchen_left', 'Kitchen threshold left', [-6, -0.7], [-4, -0.7]),
    wall('wall_magic_kitchen_right', 'Kitchen threshold right', [-2.4, -0.7], [-0.8, -0.7]),
    wall('wall_magic_kitchen_side', 'Kitchen living separation', [-0.8, -4.5], [-0.8, 0.5]),
    wall(
      'wall_magic_rear_partition',
      'Bedroom separation',
      [-0.8, 0.5],
      [6, 0.5],
      ['door_magic_bedroom'],
    ),
    wall(
      'wall_magic_service_partition',
      'Service bedroom separation',
      [1.8, 0.5],
      [1.8, 4.5],
      ['door_magic_bath'],
    ),
    wall(
      'wall_magic_utility_partition',
      'Bath utility separation',
      [-0.8, 2.8],
      [1.8, 2.8],
      ['door_magic_utility'],
    ),
    // Small gallery walls keep the living room compact while leaving an open passage.
    wall('wall_magic_gallery_north', 'Gallery opening north', [3, -4.5], [3, -2.4]),
    wall('wall_magic_gallery_south', 'Gallery opening south', [3, -1.1], [3, 0.5]),
  ]

  const doors = [
    door('door_magic_front', 'Front door', 'wall_magic_south', 8.9),
    door('door_magic_bedroom', 'Bedroom door', 'wall_magic_rear_partition', 4.8),
    door('door_magic_bath', 'Bath door', 'wall_magic_service_partition', 1.15),
    door('door_magic_utility', 'Utility door', 'wall_magic_utility_partition', 1.3),
  ]

  const windows = [
    windowNode('window_magic_kitchen', 'Kitchen window', 'wall_magic_north', 2.8, 1.8),
    windowNode('window_magic_living', 'Living window', 'wall_magic_north', 8.8, 1.8),
    windowNode('window_magic_bedroom_east', 'Bedroom window', 'wall_magic_east', 6.8, 1.8),
    windowNode('window_magic_entry', 'Entry window', 'wall_magic_south', 3.2, 1.4),
    windowNode('window_magic_kitchen_west', 'Kitchen side window', 'wall_magic_west', 6.8, 1.5),
  ]

  const slabs = [
    SlabNode.parse({
      id: 'slab_magic_floor',
      name: 'House floor',
      parentId: MAGIC_PILOT_LEVEL_ID,
      polygon: [
        [-6, -4.5],
        [6, -4.5],
        [6, 4.5],
        [-6, 4.5],
      ],
      elevation: 0.05,
      thickness: 0.16,
    }) as AnyNode,
    SlabNode.parse({
      id: 'slab_magic_porch',
      name: 'Timber porch',
      parentId: MAGIC_PILOT_LEVEL_ID,
      polygon: [
        [-5.6, 4.5],
        [5.6, 4.5],
        [5.6, 5.7],
        [-5.6, 5.7],
      ],
      elevation: 0.09,
      thickness: 0.14,
      slots: { surface: 'library:wood-flooring-oak' },
    }) as AnyNode,
  ]

  const zones = [
    zone(
      'zone_magic_kitchen',
      'Magic Cabinet Kitchen',
      [
        [-6, -4.5],
        [-0.8, -4.5],
        [-0.8, -0.7],
        [-6, -0.7],
      ],
      '#b6b49b',
    ),
    zone(
      'zone_magic_living',
      'Compact Living',
      [
        [-0.8, -4.5],
        [3, -4.5],
        [3, 0.5],
        [-0.8, 0.5],
      ],
      '#d9c7aa',
    ),
    zone(
      'zone_magic_gallery',
      'Cabinet Gallery',
      [
        [3, -4.5],
        [6, -4.5],
        [6, 0.5],
        [3, 0.5],
      ],
      '#d2b48c',
    ),
    zone(
      'zone_magic_bedroom',
      'Bedroom',
      [
        [1.8, 0.5],
        [6, 0.5],
        [6, 4.5],
        [1.8, 4.5],
      ],
      '#b9cbd0',
    ),
    zone(
      'zone_magic_bath',
      'Bath',
      [
        [-0.8, 0.5],
        [1.8, 0.5],
        [1.8, 2.8],
        [-0.8, 2.8],
      ],
      '#cad7d5',
    ),
    zone(
      'zone_magic_utility',
      'Utility',
      [
        [-0.8, 2.8],
        [1.8, 2.8],
        [1.8, 4.5],
        [-0.8, 4.5],
      ],
      '#c8c2b8',
    ),
    zone(
      'zone_magic_entry',
      'Entry and Dining',
      [
        [-6, -0.7],
        [-0.8, -0.7],
        [-0.8, 4.5],
        [-6, 4.5],
      ],
      '#d4b8a6',
    ),
  ]

  const spawn = SpawnNode.parse({
    id: 'spawn_magic_kitchen_threshold',
    name: 'Kitchen threshold',
    parentId: MAGIC_PILOT_LEVEL_ID,
    position: [-3.2, 0.05, -0.1],
    rotation: Math.PI,
    supportSlabId: 'slab_magic_floor',
  }) as AnyNode

  const levelChildren = [
    ...walls.map((node) => node.id),
    ...slabs.map((node) => node.id),
    ...zones.map((node) => node.id),
    spawn.id,
  ]
  const level = LevelNode.parse({
    id: MAGIC_PILOT_LEVEL_ID,
    name: 'Ground floor',
    parentId: BUILDING_ID,
    level: 0,
    height: 2.8,
    children: levelChildren,
  }) as AnyNode
  const building = BuildingNode.parse({
    id: BUILDING_ID,
    name: 'Magic Kitchen House',
    parentId: SITE_ID,
    children: [MAGIC_PILOT_LEVEL_ID],
  }) as AnyNode
  const site = SiteNode.parse({
    id: SITE_ID,
    name: 'Magic Cabinet pilot site',
    children: [BUILDING_ID],
    polygon: {
      type: 'polygon',
      points: [
        [-12, -10],
        [12, -10],
        [12, 10],
        [-12, 10],
      ],
    },
  }) as AnyNode

  const nodes = {} as Record<AnyNodeId, AnyNode>
  for (const node of [
    site,
    building,
    level,
    ...walls,
    ...doors,
    ...windows,
    ...slabs,
    ...zones,
    spawn,
  ]) {
    nodes[node.id] = node
  }
  return {
    nodes,
    rootNodeIds: [site.id],
  }
}
