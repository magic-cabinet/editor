/**
 * The cabinet's parametric appliance and front primitives, as a standalone
 * entry point.
 *
 * These are exported here rather than from the package barrel on purpose. The
 * barrel reaches `shelf/definition` → `floorplan-affordances` → `@pascal-app/
 * editor`, which is client-only React; a plugin that imported an appliance
 * builder through the barrel would drag the whole editor UI into any server
 * module that touches its node definitions, and a Next.js App Route build
 * fails on exactly that. This entry point pulls geometry and nothing else.
 *
 * The builders read only scalar construction fields off the node they are
 * given (`width`, `depth`, `boardThickness`, `frontThickness`, `frontGap`,
 * `frontStyle`, `handleStyle`) — no children, no scene, no store. So a plugin
 * that owns its own node kind can synthesise a `CabinetModuleNode` from its
 * own dimensions and get real fridges, hobs, ovens and faucets instead of
 * drawing grey boxes.
 */
export { addCooktopCompartment } from './geometry/cooktop'
export { addDishwasherCompartment } from './geometry/dishwasher'
export { addFridgeCompartment } from './geometry/fridge'
export { addBarHandle, buildFrontGeometry } from './geometry/fronts'
export { addRangeHoodCompartment } from './geometry/hood'
export { addApplianceCompartment } from './geometry/oven-microwave'
export { addPullOutPantryCompartment } from './geometry/pantry'
export {
  type CabinetGeometryNode,
  type CabinetSlotMaterials,
  createWorldScaleBoxGeometry,
} from './geometry/shared'
export { addSinkCompartment, sinkBowls } from './geometry/sink'
export { type CabinetSlotId, cabinetSlots } from './slots'
export type {
  CabinetCompartmentType,
  CabinetCooktopCompartmentType,
  CabinetFridgeCompartmentType,
  CabinetHoodCompartmentType,
} from './stack'
