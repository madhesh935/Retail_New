export interface StoreNavigationNode {
  id: string
  code: string
  label: string
  type: string
  x: number
  y: number
  zoneId?: string | null
  shelfCode?: string | null
  productId?: string | null
  laneCode?: string | null
  accessible: boolean
  customerAccessible: boolean
  details: Record<string, unknown>
}

export interface StoreNavigationArea {
  id: string
  zoneId?: string | null
  code: string
  name: string
  type: string
  x: number
  y: number
  width: number
  height: number
  fillColor?: string | null
  customerAccessible: boolean
  details: Record<string, unknown>
}

export interface StoreLayout {
  id: string
  storeId: string
  name: string
  floorNumber: number
  width: number
  height: number
  coordinateUnit: string
  metersPerUnit: number
  entranceNodeId: string
  defaultCheckoutNodeId: string
  version: string
  areas: StoreNavigationArea[]
  nodes: StoreNavigationNode[]
}

export interface NavigationStop {
  sequence: number
  kind: 'ENTRANCE' | 'PRODUCT' | 'CHECKOUT'
  label: string
  productId?: string | null
  shelfCode?: string | null
  laneCode?: string | null
  node: StoreNavigationNode
}

export interface NavigationLeg {
  id: string
  legIndex: number
  fromNodeId: string
  toNodeId: string
  destinationLabel: string
  distanceMeters: number
  estimatedSeconds: number
  svgPath: string
  nodeIds: string[]
  nodes: StoreNavigationNode[]
  arrivalInstruction: string
}

export interface NavigationPlan {
  layoutId: string
  layoutVersion: string
  storeId: string
  startNodeId: string
  avoidCongestion: boolean
  accessibleOnly: boolean
  totalDistanceMeters: number
  estimatedSeconds: number
  estimatedMinutes: number
  stops: NavigationStop[]
  legs: NavigationLeg[]
  unresolvedDestinations: Array<{
    inputIndex: number
    productId?: string | null
    shelfCode?: string | null
    label?: string | null
    reason: string
  }>
}
