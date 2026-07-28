import {
  BoxGeometry,
  BufferGeometry,
  Color,
  ExtrudeGeometry,
  Float32BufferAttribute,
  Group,
  Mesh,
  MeshStandardMaterial,
  Path,
  Shape,
  SphereGeometry,
} from 'three'
import type { MagicCabinetComponentNode, MagicCabinetLayoutNode } from './schema'

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

function materialColor(key: string, explicit: string | undefined, finish: string): string {
  if (explicit) return explicit
  const normalized = key.toLowerCase()
  for (const [token, color] of Object.entries(MATERIAL_COLORS)) {
    if (normalized.includes(token)) return color
  }
  return MATERIAL_COLORS[finish] ?? '#9b9b83'
}

function material(
  key: string,
  explicit: string | undefined,
  finish: string,
  emissive = false,
): MeshStandardMaterial {
  const color = materialColor(key, explicit, finish)
  return new MeshStandardMaterial({
    color,
    emissive: emissive ? new Color('#ffcc78') : new Color('#000000'),
    emissiveIntensity: emissive ? 2.4 : 0,
    metalness: key.toLowerCase().includes('hardware') ? 0.72 : 0.05,
    roughness: key.toLowerCase().includes('quartz') ? 0.32 : 0.68,
  })
}

function addPolygonPrimitive(
  group: Group,
  primitive: Extract<MagicCabinetComponentNode['geometry'][number], { kind: 'polygon-prism' }>,
  finish: string,
): void {
  if (primitive.outlineM.length < 3) return
  const [first, ...rest] = primitive.outlineM
  if (!first) return
  const shape = new Shape()
  shape.moveTo(first[0], first[1])
  for (const point of rest) shape.lineTo(point[0], point[1])
  shape.closePath()
  for (const holePoints of primitive.holesM) {
    const [holeFirst, ...holeRest] = holePoints
    if (!holeFirst) continue
    const hole = new Path()
    hole.moveTo(holeFirst[0], holeFirst[1])
    for (const point of holeRest) hole.lineTo(point[0], point[1])
    hole.closePath()
    shape.holes.push(hole)
  }
  const mesh = new Mesh(
    new ExtrudeGeometry(shape, {
      bevelEnabled: false,
      depth: primitive.heightM,
      steps: 1,
    }),
    material(primitive.materialKey, primitive.color, finish),
  )
  mesh.name = 'magic-polygon-prism'
  mesh.rotation.x = Math.PI / 2
  mesh.position.y = primitive.baseYM + primitive.heightM
  group.add(mesh)
}

export function buildMagicComponentGeometry(node: MagicCabinetComponentNode): Group {
  const group = new Group()
  group.name = `magic-component:${node.engineComponentId}`

  for (const primitive of node.geometry) {
    const isHardware = primitive.materialKey.toLowerCase().includes('hardware')
    if (isHardware && node.handleStyle !== 'bar') continue
    if (primitive.kind === 'box') {
      const mesh = new Mesh(
        new BoxGeometry(...primitive.dimensionsM),
        material(primitive.materialKey, primitive.color, node.finish),
      )
      mesh.name = `magic-box:${primitive.materialKey}`
      mesh.position.set(...primitive.positionM)
      mesh.rotation.set(...primitive.rotationRad)
      group.add(mesh)
      continue
    }
    if (primitive.kind === 'polygon-prism') {
      addPolygonPrimitive(group, primitive, node.finish)
      continue
    }
    const geometry = new BufferGeometry()
    geometry.setAttribute('position', new Float32BufferAttribute(primitive.positionsM, 3))
    geometry.setIndex(primitive.indices)
    geometry.computeVertexNormals()
    const mesh = new Mesh(geometry, material(primitive.materialKey, primitive.color, node.finish))
    mesh.name = `magic-triangle-mesh:${primitive.materialKey}`
    mesh.position.set(...primitive.positionM)
    mesh.rotation.set(...primitive.rotationRad)
    group.add(mesh)
  }

  if (
    node.componentKind === 'cabinet' &&
    (node.handleStyle === 'knob' || node.handleStyle === 'edge')
  ) {
    const handle =
      node.handleStyle === 'knob'
        ? new Mesh(new SphereGeometry(0.026, 14, 10), material('hardware', '#202124', node.finish))
        : new Mesh(
            new BoxGeometry(Math.max(0.12, node.dimensions[0] * 0.62), 0.018, 0.024),
            material('hardware', '#202124', node.finish),
          )
    handle.name = `magic-${node.handleStyle}-handle`
    handle.position.set(
      node.handleStyle === 'knob' ? node.dimensions[0] * 0.3 : 0,
      node.dimensions[1] * 0.48,
      node.dimensions[2] / 2 + 0.018,
    )
    group.add(handle)
  }

  if (node.componentKind === 'cabinet' && node.subtype.includes('wall')) {
    const led = new Mesh(
      new BoxGeometry(Math.max(0.08, node.dimensions[0] - 0.04), 0.012, 0.018),
      material('shelf-light', '#ffe0a6', node.finish, true),
    )
    led.name = 'magic-shelf-led'
    led.position.set(0, 0.008, node.dimensions[2] / 2 + 0.012)
    group.add(led)
  }

  return group
}

export function buildMagicLayoutGeometry(node: MagicCabinetLayoutNode): Group {
  const group = new Group()
  group.name = 'magic-kitchen-layout'

  const backsplash = new Mesh(
    new BoxGeometry(node.width, node.backsplashHeight, 0.018),
    new MeshStandardMaterial({ color: '#efe8dc', roughness: 0.78 }),
  )
  backsplash.name = 'magic-backsplash'
  backsplash.position.set(
    node.width / 2,
    node.counterHeight + node.backsplashHeight / 2,
    -node.depth + 0.025,
  )
  group.add(backsplash)

  const led = new Mesh(
    new BoxGeometry(node.width, 0.014, 0.022),
    material('shelf-light', '#ffe0a6', 'white', true),
  )
  led.name = 'magic-layout-work-light'
  led.position.set(node.width / 2, node.counterHeight + node.backsplashHeight, -node.depth + 0.015)
  group.add(led)

  return group
}
