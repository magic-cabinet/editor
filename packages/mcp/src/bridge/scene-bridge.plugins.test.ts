import { expect, test } from 'bun:test'
import { BaseNode, nodeRegistry, nodeType, objectId, registerNode } from '@pascal-app/core'
import type { AnyNode } from '@pascal-app/core/schema'
import { z } from 'zod'
import { SceneBridge } from './scene-bridge'

const testKind = 'test:registered-widget'
const TestWidgetNode = BaseNode.extend({
  id: objectId('test-widget'),
  type: nodeType(testKind),
  position: z.tuple([z.number(), z.number(), z.number()]).default([0, 0, 0]),
  rotation: z.tuple([z.number(), z.number(), z.number()]).default([0, 0, 0]),
  width: z.number().positive(),
})

if (!nodeRegistry.has(testKind)) {
  registerNode({
    kind: testKind,
    schemaVersion: 1,
    schema: TestWidgetNode,
    category: 'furnish',
    defaults: () => ({
      object: 'node',
      parentId: null,
      visible: true,
      metadata: {},
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      width: 1,
    }),
    capabilities: {
      selectable: true,
      deletable: true,
    },
  })
}

test('SceneBridge validates and creates registered plugin node kinds', () => {
  const bridge = new SceneBridge()
  bridge.loadDefault()
  const widget = TestWidgetNode.parse({ width: 1.2 })

  const result = bridge.applyPatch([{ op: 'create', node: widget as unknown as AnyNode }])

  expect(result.createdIds).toEqual([widget.id])
  expect(bridge.getNode(widget.id as never)).toMatchObject({
    type: testKind,
    width: 1.2,
  })
  expect(bridge.validateScene()).toEqual({ valid: true, errors: [] })
})

test('SceneBridge rejects invalid registered plugin nodes without mutation', () => {
  const bridge = new SceneBridge()
  bridge.loadDefault()
  const before = bridge.exportJSON()

  expect(() =>
    bridge.applyPatch([
      {
        op: 'create',
        node: {
          object: 'node',
          id: 'test-widget_invalid',
          type: testKind,
          parentId: null,
          visible: true,
          metadata: {},
          position: [0, 0, 0],
          rotation: [0, 0, 0],
          width: -1,
        } as unknown as AnyNode,
      },
    ]),
  ).toThrow(/create node failed schema/)
  expect(bridge.exportJSON()).toEqual(before)
})
