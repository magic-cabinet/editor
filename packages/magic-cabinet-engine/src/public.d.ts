export * from './contracts'

import type {
  GenerateKitchenInput,
  KitchenCommerceContext,
  KitchenResult,
  KitchenValidation,
  PilotReference,
  ReconcileKitchenRequest,
} from './contracts'

export declare const ENGINE_VERSION: '0.1.0'
export declare const DEFAULT_ENGINE_SEED: 20260727
export declare const PILOT_REFERENCE: Readonly<PilotReference>
export declare const PILOT_KITCHEN_INPUT: Readonly<GenerateKitchenInput>

export declare function generateKitchen(input: GenerateKitchenInput): KitchenResult
export declare function reconcileKitchen(
  previous: KitchenResult,
  request: ReconcileKitchenRequest,
  pinnedIds: readonly string[],
): KitchenResult
export declare function validateKitchen(result: KitchenResult): KitchenValidation
export declare function buildCommerceContext(result: KitchenResult): KitchenCommerceContext | null
