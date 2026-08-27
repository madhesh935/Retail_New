/** Canonical 3D anchors for zones and fixtures — reuse across twin layers. */

export type TwinVec3 = [number, number, number]

export const ZONE_ANCHORS: Record<
  string,
  { position: TwinVec3; label: string; bounds: [number, number] }
> = {
  'zone-1': { position: [0, 0.01, -12], label: 'Entrance', bounds: [10, 5] },
  'zone-entrance': { position: [0, 0.01, -12], label: 'Entrance', bounds: [10, 5] },
  'zone-2': { position: [-9, 0.01, -5.5], label: 'Fresh Produce', bounds: [10, 7] },
  'zone-produce': { position: [-9, 0.01, -5.5], label: 'Fresh Produce', bounds: [10, 7] },
  'zone-3': { position: [1, 0.01, -5.5], label: 'Dairy & Chilled', bounds: [9, 7] },
  'zone-dairy': { position: [1, 0.01, -5.5], label: 'Dairy & Chilled', bounds: [9, 7] },
  'zone-4': { position: [14, 0.01, -4.5], label: 'Beverages', bounds: [8, 8] },
  'zone-beverages': { position: [14, 0.01, -4.5], label: 'Beverages', bounds: [8, 8] },
  'zone-5': { position: [-4, 0.01, 3.5], label: 'Household', bounds: [8, 6] },
  'zone-household': { position: [-4, 0.01, 3.5], label: 'Household', bounds: [8, 6] },
  'zone-6': { position: [3.5, 0.01, 5], label: 'Electronics', bounds: [7, 5] },
  'zone-elec': { position: [3.5, 0.01, 5], label: 'Electronics', bounds: [7, 5] },
  'zone-7': { position: [14.5, 0.01, 3.5], label: 'Checkout', bounds: [10, 6] },
  'zone-checkout': { position: [14.5, 0.01, 3.5], label: 'Checkout', bounds: [10, 6] },
  'zone-stockroom': { position: [0, 0.01, 12.5], label: 'Stockroom', bounds: [28, 5] },
}

export const SHELF_FOCUS: Record<string, TwinVec3> = {
  'shelf-a1': [-8, 0.65, -4.5],
  'shelf-a2': [-8, 0.65, -7.5],
  'shelf-b4': [14, 0.95, -4.5],
  'shelf-b3': [14, 0.95, -7.5],
  'shelf-b2': [14, 0.95, -1.5],
  'shelf-c1': [2, 1.15, -4.5],
  'shelf-c2': [2, 1.15, -7.5],
  'shelf-c3': [-3.5, 1.15, -7.5],
  'shelf-g1': [-3.5, 0.95, -1.5],
  'shelf-g2': [2.5, 0.95, -1.5],
  'shelf-g3': [8.5, 0.95, -1.5],
  'shelf-e1': [3.5, 0.6, 5.0],
  'shelf-d1': [-16, 0.95, -1.0],
}

export const CHECKOUT_FOCUS: Record<string, TwinVec3> = {
  'lane-1': [10.5, 0, 2.5],
  'lane-2': [13.2, 0, 2.5],
  'lane-3': [15.9, 0, 2.5],
  'lane-4': [18.6, 0, 2.5],
}

export const CAMERA_FOCUS: Record<string, TwinVec3> = {
  'cam-01': [0, 5.0, -12.5],
  'cam-02': [-8, 5.0, -5.5],
  'cam-03': [14, 5.0, -5.5],
  'cam-05': [14, 5.0, 3.5],
}

/** Resolve a zone id (including aliases) to a floor position. */
export function resolveZonePosition(zoneId?: string | null): TwinVec3 | null {
  if (!zoneId) return null
  const key = zoneId.toLowerCase()
  const hit = ZONE_ANCHORS[key] || ZONE_ANCHORS[zoneId]
  if (hit) return hit.position
  // Fuzzy match by keyword
  if (key.includes('produce')) return ZONE_ANCHORS['zone-2'].position
  if (key.includes('dairy') || key.includes('bakery')) return ZONE_ANCHORS['zone-3'].position
  if (key.includes('beverage') || key.includes('snack')) return ZONE_ANCHORS['zone-4'].position
  if (key.includes('household')) return ZONE_ANCHORS['zone-5'].position
  if (key.includes('elec')) return ZONE_ANCHORS['zone-6'].position
  if (key.includes('checkout') || key.includes('billing')) return ZONE_ANCHORS['zone-7'].position
  if (key.includes('entrance') || key.includes('lobby')) return ZONE_ANCHORS['zone-1'].position
  if (key.includes('stock')) return ZONE_ANCHORS['zone-stockroom'].position
  return null
}

export function resolveEntityFocus(
  type: string,
  id: string
): TwinVec3 | null {
  const lower = id.toLowerCase()
  if (type === 'shelf') return SHELF_FOCUS[lower] || SHELF_FOCUS[id] || null
  if (type === 'checkout' || type === 'lane') return CHECKOUT_FOCUS[lower] || CHECKOUT_FOCUS[id] || null
  if (type === 'camera' || type === 'cam') return CAMERA_FOCUS[lower] || CAMERA_FOCUS[id] || null
  if (type === 'zone') return resolveZonePosition(id)
  return null
}
