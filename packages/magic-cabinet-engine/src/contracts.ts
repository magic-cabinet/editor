export type KitchenWall = "north" | "south" | "east" | "west";
export type KitchenLayout = "galley" | "l-shape" | "u-shape" | "one-wall";

export interface KitchenDoorInput {
  id: string;
  wall: KitchenWall;
  offsetIn: number;
  widthIn: number;
  hingeSide?: "start" | "end";
  swingDirection?: "inward" | "outward";
}

export interface KitchenWindowInput {
  id: string;
  wall: KitchenWall;
  offsetIn: number;
  widthIn: number;
  heightIn: number;
  fromFloorIn: number;
}

export interface KitchenApplianceInput {
  id: string;
  category: "sink" | "range" | "refrigerator" | "dishwasher";
  wall: KitchenWall;
  offsetIn: number;
}

export interface KitchenRoomInput {
  layout: KitchenLayout;
  widthIn: number;
  depthIn: number;
  ceilingHeightIn: number;
  island?: boolean;
  peninsula?: boolean;
  dishwasher?: boolean;
  doors?: readonly KitchenDoorInput[];
  windows?: readonly KitchenWindowInput[];
  appliances?: readonly KitchenApplianceInput[];
  lRoomNotchWidthIn?: number;
  lRoomNotchDepthIn?: number;
}

export interface CatalogResolvedProduct {
  canonicalCode: string;
  quantity: number;
  productId: string;
  sku: string;
  name: string;
  cabinetType?: string | null;
  listPriceCents: number;
  widthIn?: number | null;
  heightIn?: number | null;
  depthIn?: number | null;
}

export interface CatalogUnresolvedProduct {
  canonicalCode: string;
  quantity: number;
  reason: string;
}

/**
 * A snapshot returned by the authenticated catalog resolver. The engine accepts
 * this identity snapshot but never computes a payable price.
 */
export interface CatalogResolution {
  manufacturerCode: string;
  finishCode: string;
  manufacturerName: string;
  finishName: string;
  resolved: CatalogResolvedProduct[];
  unresolved: CatalogUnresolvedProduct[];
}

export interface GenerateKitchenInput {
  room: KitchenRoomInput;
  seed?: number;
  allowedSpecIds?: readonly string[];
  catalog?: CatalogResolution;
}

export interface KitchenComponentEdit {
  positionIn?: Partial<Vector3>;
  rotationYDeg?: number;
  wall?: KitchenWall | null;
}

export interface ReconcileKitchenRequest {
  room?: Partial<KitchenRoomInput>;
  seed?: number;
  allowedSpecIds?: string[];
  /** `null` deliberately clears the previous catalog scope. */
  catalog?: CatalogResolution | null;
  componentEdits?: Record<string, KitchenComponentEdit>;
}

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface Transform {
  positionIn: Vector3;
  rotationDeg: Vector3;
}

export interface BoxGeometry {
  kind: "box";
  space: "component-local" | "world";
  dimensionsIn: Vector3;
  transform: Transform;
  materialKey: string;
  color?: string;
}

export interface PolygonPrismGeometry {
  kind: "polygon-prism";
  space: "world";
  outlineIn: Array<{ x: number; z: number }>;
  heightIn: number;
  baseYIn: number;
  materialKey: string;
  color?: string;
  holesIn?: Array<{
    id: string;
    kind: "sink" | "cooktop" | "other";
    outlineIn: Array<{ x: number; z: number }>;
  }>;
}

export interface TriangleMeshGeometry {
  kind: "triangle-mesh";
  space: "component-local" | "world";
  positionsIn: number[];
  indices: number[];
  transform: Transform;
  materialKey: string;
  color?: string;
}

export type GeometryPrimitive =
  | BoxGeometry
  | PolygonPrismGeometry
  | TriangleMeshGeometry;

export type KitchenComponentKind =
  | "cabinet"
  | "countertop"
  | "appliance"
  | "appliance-opening"
  | "door"
  | "window"
  | "panel"
  | "filler"
  | "trim";

export interface KitchenCatalogIdentity {
  productId: string;
  sku: string;
  canonicalCode: string;
  manufacturerCode: string;
  finishCode: string;
}

export interface KitchenComponent {
  id: string;
  kind: KitchenComponentKind;
  subtype: string;
  name: string;
  transform: Transform;
  dimensionsIn: Vector3;
  wall: KitchenWall | "angled" | null;
  geometry: GeometryPrimitive[];
  planOutlineIn?: Array<{ x: number; z: number }>;
  catalog?: KitchenCatalogIdentity;
  catalogState?: "catalog-product" | "render-only" | "pending" | "unresolved" | "error";
  assemblyId?: string;
}

export interface KitchenRelationship {
  id: string;
  kind:
    | "hosted-by"
    | "paired-with"
    | "creates-cutout"
    | "reserves-opening"
    | "attached-to"
    | "generated-from";
  sourceComponentId: string;
  targetComponentId: string;
  role?: string;
}

export type KitchenDiagnosticCode =
  | "invalid-input"
  | "duplicate-component-id"
  | "non-finite-geometry"
  | "scene-integrity"
  | "cabinet-collision"
  | "pin-not-found"
  | "pin-out-of-bounds"
  | "pin-placement-conflict"
  | "pin-assembly-member-unsupported"
  | "catalog-incomplete";

export interface KitchenDiagnostic {
  code: KitchenDiagnosticCode;
  message: string;
  componentIds?: string[];
  severity: "error" | "warning";
}

export interface KitchenEngineState {
  schemaVersion: 1;
  /** Opaque, JSON-serializable engine state. Consumers must round-trip it. */
  scene: unknown;
}

export interface KitchenResult {
  schemaVersion: 1;
  engineVersion: string;
  input: Required<Pick<GenerateKitchenInput, "room" | "seed">>
    & Pick<GenerateKitchenInput, "allowedSpecIds" | "catalog">;
  components: KitchenComponent[];
  relationships: KitchenRelationship[];
  diagnostics: KitchenDiagnostic[];
  pinnedComponentIds: string[];
  engineState: KitchenEngineState;
}

export interface KitchenValidation {
  valid: boolean;
  geometryValid: boolean;
  sceneValid: boolean;
  commerceReady: boolean;
  issues: KitchenDiagnostic[];
}

export interface KitchenCommerceItem {
  productId: string;
  sku: string;
  canonicalCode: string;
  quantity: number;
}

/**
 * Identity-only payload for a server quote. It intentionally carries no
 * client-computed unit price, subtotal, tax, shipping, or payable total.
 */
export interface KitchenCommerceContext {
  schemaVersion: 1;
  pricingAuthority: "server";
  requiresServerQuote: true;
  manufacturerCode: string;
  finishCode: string;
  items: KitchenCommerceItem[];
}

export interface PilotRunSegment {
  id: "fridge" | "dishwasher" | "sink" | "oven" | "storage";
  widthCm: number;
}

export interface PilotReference {
  runWidthCm: 410;
  cabinetDepthCm: 60;
  counterTopCm: 88;
  plinthCm: 10;
  backsplashGapCm: 60;
  upperHeightCm: 72;
  upperTopCm: 220;
  envelopeHeightCm: 240;
  segments: readonly PilotRunSegment[];
}
