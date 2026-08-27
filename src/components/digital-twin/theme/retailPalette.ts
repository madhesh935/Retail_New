/** Bright, neutral retail materials for the Digital Twin scene. */
export const RetailPalette = {
  // Environment
  sky: '#E8EEF4',
  ambientSky: '#F5F7FA',
  ambientGround: '#D6DCE4',
  floor: '#F2F0EB',
  floorGrout: '#E4E0D8',
  aisle: '#EDEAE3',
  wall: '#F7F8FA',
  wallTrim: '#CBD5E1',
  baseboard: '#94A3B8',

  // Fixtures
  shelfFrame: '#E2E8F0',
  shelfBoard: '#F8FAFC',
  shelfEdge: '#CBD5E1',
  coolerBody: '#E8ECF0',
  coolerInterior: '#F1F5F9',
  coolerGlass: '#B8D4E8',
  woodProduce: '#C4A882',
  woodDark: '#8B7355',
  checkoutBody: '#334155',
  checkoutTop: '#475569',
  conveyor: '#1E293B',
  stainless: '#94A3B8',
  stockroomSteel: '#64748B',
  stockroomOrange: '#EA580C',
  cardboard: '#C4A574',

  // Accents (subtle — not neon)
  brandTeal: '#0F766E',
  staffVest: '#0F766E',
  staffAccent: '#14B8A6',
  signFace: '#FFFFFF',
  signText: '#1E293B',

  // Status indicators (edge markers only)
  healthy: '#22C55E',
  low: '#F59E0B',
  critical: '#EF4444',
  unknown: '#94A3B8',
  hover: '#0F766E',
  selected: '#115E59',

  // Heatmap
  heatLow: 'rgba(15, 118, 110, ALPHA)',
  heatMed: 'rgba(180, 83, 9, ALPHA)',
  heatHigh: 'rgba(185, 28, 28, ALPHA)',
} as const

export const ISOMETRIC_CAMERA = {
  position: [-18, 26, 22] as [number, number, number],
  target: [0, 0, -1] as [number, number, number],
  fov: 42,
}

export const TOP_CAMERA = {
  position: [0, 42, 0.001] as [number, number, number],
  target: [0, 0, 0] as [number, number, number],
}

export const CAMERA_TRANSITION_MS = 900
