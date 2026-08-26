import { StoreStatus } from './store.types'
import { RetailIncident } from './incident.types'
import { CheckoutQueue } from './queue.types'
import { EdgeDeviceTelemetry } from './system.types'
import { ShelfItem } from './inventory.types'
import { TrackedShopper } from './shopper.types'

export type WebSocketEventType =
  | 'STORE_STATUS_UPDATE'
  | 'OCCUPANCY_CHANGED'
  | 'SHOPPER_TRACKING_FRAME'
  | 'INCIDENT_DETECTED'
  | 'INCIDENT_RESOLVED'
  | 'QUEUE_CONGESTION_ALERT'
  | 'QUEUE_METRICS_UPDATE'
  | 'SHELF_STOCKOUT_DETECTED'
  | 'PLANOGRAM_DEVIATION'
  | 'EDGE_HEALTH_TELEMETRY'
  | 'AI_RECOMMENDATION_DISPATCHED'
  | 'STAFF_STATUS_CHANGED'
  | 'HEARTBEAT'

export interface WebSocketMessage<T = unknown> {
  event: WebSocketEventType
  storeId: string
  timestamp: string
  payload: T
  seq?: number
}

export type StoreStatusWsEvent = WebSocketMessage<StoreStatus>
export type OccupancyWsEvent = WebSocketMessage<{ currentOccupancy: number; occupancyRate: number; entryDelta: number; exitDelta: number }>
export type ShopperTrackingWsEvent = WebSocketMessage<{ activeShoppers: TrackedShopper[] }>
export type IncidentWsEvent = WebSocketMessage<RetailIncident>
export type QueueMetricsWsEvent = WebSocketMessage<{ lanes: CheckoutQueue[]; avgWaitSeconds: number }>
export type ShelfStockoutWsEvent = WebSocketMessage<ShelfItem>
export type EdgeHealthWsEvent = WebSocketMessage<EdgeDeviceTelemetry>
