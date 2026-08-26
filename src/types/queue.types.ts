export interface CheckoutQueue {
  id: string
  laneNumber: number
  laneType: 'REGULAR_CASHIER' | 'SELF_CHECKOUT' | 'EXPRESS_10_ITEMS' | 'PRIORITY'
  status: 'ACTIVE' | 'CONGESTED' | 'STANDBY' | 'CLOSED'
  assignedStaffId?: string
  assignedStaffName?: string
  currentQueueLength: number
  currentWaitTimeSeconds: number
  processingRateItemsPerMinute: number
  predictedQueueIn10Min: number
  predictedWaitTimeIn10MinSeconds: number
  cameraSourceId: string
  lastStateChange: string
}

export interface QueueAnalyticsPayload {
  storeId: string
  totalLanes: number
  activeLanesCount: number
  congestedLanesCount: number
  closedLanesCount: number
  systemAverageWaitTimeSeconds: number
  systemTargetWaitTimeSeconds: number
  estimatedShopperAbandonmentRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  lanes: CheckoutQueue[]
  predictedWaitTimeCurve: { time: string; regularAvgSec: number; expressAvgSec: number }[]
}
