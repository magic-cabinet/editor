/**
 * Verbatim port of the MVP's panel classifier —
 * `magic-cabinet/mvp` `apps/web/src/lib/render/panel-classification.ts`.
 *
 * The MVP decides "is this a door" from the panel's *id*, never from its
 * geometry, and `cabinet-mesh-construction.ts:192` gates the shaker frame on
 * `isShakerFacadePanel(panel.id)`. Any geometric stand-in disagrees with it on
 * two real panels the engine emits (measured across all four layouts):
 *
 *   - `…-panel-6-door` on a corner cabinet is yawed 45°, so it never reaches
 *     the carcass front plane on either axis — a front-plane test calls the
 *     diagonal corner door carcass.
 *   - `…-panel-5-tilt-front` on a sink base sits exactly at the front plane in
 *     3/4" mdf and is indistinguishable from a drawer face, but the MVP does
 *     not shaker-frame it.
 *
 * Neither is decidable from `materialKey` + dimensions, which is why the ids
 * are carried through the adapter rather than re-derived here.
 */

export function isPullPanel(panelId: string): boolean {
  return panelId.includes('pull')
}

export function isDoorPanel(panelId: string): boolean {
  return panelId.includes('door')
}

export function isDrawerFacePanel(panelId: string): boolean {
  return panelId.includes('drawer') && !isPullPanel(panelId)
}

export function isShakerFacadePanel(panelId: string): boolean {
  return isDoorPanel(panelId) || isDrawerFacePanel(panelId)
}
