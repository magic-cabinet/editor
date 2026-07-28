import type {
  BoxGeometry,
  GeometryPrimitive,
  KitchenComponent,
  KitchenResult,
  PolygonPrismGeometry,
  TriangleMeshGeometry,
} from '@magic-cabinet/engine'
import type { AnyNodeId } from '@pascal-app/core'
import {
  MagicCabinetComponentNode,
  MagicCabinetLayoutNode,
  type MagicGeometryPrimitive,
} from './schema'

const INCH_TO_METER = 0.0254

export type MagicKitchenPlacement = {
  parentId: AnyNodeId | string
  roomOrigin: [number, number, number]
  invertZ?: boolean
}

export type AdaptedMagicKitchen = {
  layout: MagicCabinetLayoutNode
  components: MagicCabinetComponentNode[]
}

function meters(value: number): number {
  return value * INCH_TO_METER
}

function jsonValue(value: unknown): unknown {
  return JSON.parse(JSON.stringify(value))
}

function rotationRad(
  value: { x: number; y: number; z: number },
  invertZ: boolean,
): [number, number, number] {
  const d = Math.PI / 180
  return [value.x * d, (invertZ ? -value.y : value.y) * d, value.z * d]
}

function componentPosition(
  component: KitchenComponent,
  roomOrigin: [number, number, number],
  invertZ: boolean,
): [number, number, number] {
  const p = component.transform.positionIn
  return [
    roomOrigin[0] + meters(p.x),
    roomOrigin[1] + meters(p.y),
    roomOrigin[2] + meters(invertZ ? -p.z : p.z),
  ]
}

function primitiveLocalPosition(
  primitive: BoxGeometry | TriangleMeshGeometry,
  component: KitchenComponent,
  invertZ: boolean,
): [number, number, number] {
  const p = primitive.transform.positionIn
  const c = component.transform.positionIn
  const x = primitive.space === 'world' ? p.x - c.x : p.x
  const y = primitive.space === 'world' ? p.y - c.y : p.y
  const z = primitive.space === 'world' ? p.z - c.z : p.z
  return [meters(x), meters(y), meters(invertZ ? -z : z)]
}

function adaptBox(
  primitive: BoxGeometry,
  component: KitchenComponent,
  invertZ: boolean,
): MagicGeometryPrimitive {
  return {
    kind: 'box',
    dimensionsM: [
      meters(primitive.dimensionsIn.x),
      meters(primitive.dimensionsIn.y),
      meters(primitive.dimensionsIn.z),
    ],
    positionM: primitiveLocalPosition(primitive, component, invertZ),
    rotationRad: rotationRad(primitive.transform.rotationDeg, invertZ),
    materialKey: primitive.materialKey,
    ...(primitive.color ? { color: primitive.color } : {}),
  }
}

function adaptPolygon(
  primitive: PolygonPrismGeometry,
  component: KitchenComponent,
  invertZ: boolean,
): MagicGeometryPrimitive {
  const c = component.transform.positionIn
  const localPoint = (point: { x: number; z: number }): [number, number] => [
    meters(point.x - c.x),
    meters(invertZ ? -(point.z - c.z) : point.z - c.z),
  ]
  return {
    kind: 'polygon-prism',
    outlineM: primitive.outlineIn.map(localPoint),
    holesM: (primitive.holesIn ?? []).map((hole) => hole.outlineIn.map(localPoint)),
    heightM: meters(primitive.heightIn),
    baseYM: meters(primitive.baseYIn - c.y),
    materialKey: primitive.materialKey,
    ...(primitive.color ? { color: primitive.color } : {}),
  }
}

function adaptTriangle(
  primitive: TriangleMeshGeometry,
  component: KitchenComponent,
  invertZ: boolean,
): MagicGeometryPrimitive {
  const positionsM: number[] = []
  for (let index = 0; index < primitive.positionsIn.length; index += 3) {
    positionsM.push(
      meters(primitive.positionsIn[index] ?? 0),
      meters(primitive.positionsIn[index + 1] ?? 0),
      meters((invertZ ? -1 : 1) * (primitive.positionsIn[index + 2] ?? 0)),
    )
  }
  return {
    kind: 'triangle-mesh',
    positionsM,
    indices: invertZ
      ? primitive.indices.flatMap((value, index, values) => {
          if (index % 3 !== 0) return []
          return [value, values[index + 2] ?? value, values[index + 1] ?? value]
        })
      : [...primitive.indices],
    positionM: primitiveLocalPosition(primitive, component, invertZ),
    rotationRad: rotationRad(primitive.transform.rotationDeg, invertZ),
    materialKey: primitive.materialKey,
    ...(primitive.color ? { color: primitive.color } : {}),
  }
}

function adaptPrimitive(
  primitive: GeometryPrimitive,
  component: KitchenComponent,
  invertZ: boolean,
): MagicGeometryPrimitive {
  if (primitive.kind === 'box') return adaptBox(primitive, component, invertZ)
  if (primitive.kind === 'polygon-prism') return adaptPolygon(primitive, component, invertZ)
  return adaptTriangle(primitive, component, invertZ)
}

function componentFinish(component: KitchenComponent): MagicCabinetComponentNode['finish'] {
  if (component.kind === 'countertop') return 'quartz'
  if (component.kind === 'appliance' || component.kind === 'appliance-opening') return 'black'
  if (component.subtype.includes('base') || component.subtype.includes('sink')) return 'oak'
  return 'sage'
}

export function adaptKitchenResult(
  result: KitchenResult,
  placement: MagicKitchenPlacement,
): AdaptedMagicKitchen {
  const invertZ = placement.invertZ ?? true
  const layout = MagicCabinetLayoutNode.parse({
    name: 'Magic Cabinet kitchen',
    parentId: placement.parentId,
    position: placement.roomOrigin,
    width: meters(result.input.room.widthIn),
    depth: meters(result.input.room.depthIn),
    counterHeight: 0.88,
    backsplashHeight: 0.6,
    engineVersion: result.engineVersion,
    engineResult: jsonValue(result),
    engineState: jsonValue(result.engineState),
    engineInput: jsonValue(result.input),
    relationships: jsonValue(result.relationships),
    diagnostics: jsonValue(result.diagnostics),
    pinnedComponentIds: result.pinnedComponentIds,
    validationState: result.diagnostics.some((d) => d.severity === 'error')
      ? 'error'
      : result.diagnostics.length > 0
        ? 'warning'
        : 'valid',
  })

  const components = result.components.map((component) =>
    MagicCabinetComponentNode.parse({
      name: component.name,
      parentId: placement.parentId,
      position: componentPosition(component, placement.roomOrigin, invertZ),
      rotation: rotationRad(component.transform.rotationDeg, invertZ),
      dimensions: [
        meters(component.dimensionsIn.x),
        meters(component.dimensionsIn.y),
        meters(component.dimensionsIn.z),
      ],
      layoutId: layout.id,
      engineComponentId: component.id,
      componentKind: component.kind,
      subtype: component.subtype,
      wall: component.wall,
      geometry: component.geometry.map((primitive) =>
        adaptPrimitive(primitive, component, invertZ),
      ),
      planOutline: component.planOutlineIn?.map((point) => [
        meters(point.x - component.transform.positionIn.x),
        meters(
          invertZ
            ? -(point.z - component.transform.positionIn.z)
            : point.z - component.transform.positionIn.z,
        ),
      ]),
      catalog: component.catalog,
      catalogState: component.catalogState,
      manuallyPinned: result.pinnedComponentIds.includes(component.id),
      finish: componentFinish(component),
    }),
  )

  return {
    layout: MagicCabinetLayoutNode.parse({
      ...layout,
      componentIds: components.map((component) => component.id),
    }),
    components,
  }
}
