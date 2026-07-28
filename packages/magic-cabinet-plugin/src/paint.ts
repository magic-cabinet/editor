import { createSlotPaintCapability, previewGeometrySlot } from '@pascal-app/nodes/slot-paint'

/**
 * Pascal's paint mode, on a Magic Cabinet kitchen.
 *
 * The whole capability is a resolve + a preview because the commit half is
 * kind-independent: `createSlotPaintCapability` writes `node.slots[role]`,
 * minting a `scene:<id>` material for a one-off colour, in a single undo step.
 * That is the same path the built-in cabinet takes (`nodes/src/cabinet/
 * paint.ts`), so an MC kitchen and a native cabinet repaint identically.
 *
 * `resolveRole` reads `userData.slotId`, which every mesh the plugin emits
 * carries (`SlotPainter.stamp`) and every mesh the native appliance builders
 * emit carries already (`stampSlot`). That shared convention is why painting
 * reaches inside a fridge the plugin never assembled.
 *
 * `materialTarget: 'cabinet'` puts MC components on the same toolbar target as
 * built-in cabinets — an MC kitchen is a cabinet run to the user, whatever
 * node kind is underneath.
 */
export const magicCabinetPaint = createSlotPaintCapability({
  materialTarget: 'cabinet',
  resolveRole: ({ hitObject }) => {
    const slotId = (hitObject?.userData as { slotId?: string | null } | undefined)?.slotId
    return typeof slotId === 'string' ? slotId : null
  },
  applyPreview: previewGeometrySlot,
})
