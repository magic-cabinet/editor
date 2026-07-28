import { expect, test } from 'bun:test'
import { apiGraphSchema } from './graph-schema'

function graphWith(node: unknown) {
  return {
    nodes: { node: node },
    rootNodeIds: ['node'],
  }
}

test('accepts a valid bundled Magic Cabinet plugin node', () => {
  const result = apiGraphSchema.safeParse(
    graphWith({
      object: 'node',
      id: 'magic-cabinet-component_test',
      type: 'magic-cabinet:component',
      parentId: null,
      visible: true,
      metadata: {},
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      dimensions: [0.6, 0.88, 0.6],
      layoutId: 'magic-cabinet-layout_test',
      engineComponentId: 'base-01',
      componentKind: 'cabinet',
      subtype: 'base',
      wall: 'north',
      geometry: [],
      catalogState: 'render-only',
      manuallyPinned: false,
      finish: 'oak',
      handleStyle: 'bar',
    }),
  )

  expect(result.success).toBe(true)
})

test('rejects a Magic Cabinet plugin node that violates its schema', () => {
  const result = apiGraphSchema.safeParse(
    graphWith({
      object: 'node',
      id: 'magic-cabinet-component_test',
      type: 'magic-cabinet:component',
      componentKind: 'spaceship',
    }),
  )

  expect(result.success).toBe(false)
})

test('retains built-in asset URL security validation', () => {
  const result = apiGraphSchema.safeParse(
    graphWith({
      object: 'node',
      id: 'scan_test',
      type: 'scan',
      parentId: null,
      visible: true,
      metadata: {},
      url: 'http://169.254.169.254/latest/meta-data',
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: 1,
      opacity: 100,
    }),
  )

  expect(result.success).toBe(false)
})
