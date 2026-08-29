import { StateCreator } from 'zustand'
import { CheckoutQueue, QueueAnalyticsPayload } from '@/types'

// ── Queue Action Log (for Reports page before/after history) ──────────────────
export interface QueueActionEntry {
  id: string
  time: string          // e.g. "18:42"
  actionTitle: string
  targetEntity: string
  category: 'QUEUE' | 'INVENTORY' | 'STAFF' | 'SAFETY'
  summaryResult: string
  assignedStaff: string
  beforeMetricLabel: string
  beforeValue: string
  afterMetricLabel: string
  afterValue: string
  operationalGain: string
  verificationMethod: string
}

export interface QueueSlice {
  queues: CheckoutQueue[]
  systemAverageWaitTimeSeconds: number
  systemTargetWaitTimeSeconds: number
  congestedLanesCount: number
  predictedWaitTimeCurve: { time: string; regularAvgSec: number; expressAvgSec: number }[]
  isLoadingQueues: boolean

  // Live action log written when counters are opened/actioned
  queueActionLog: QueueActionEntry[]

  setQueuesPayload: (payload: QueueAnalyticsPayload) => void
  updateLaneQueue: (laneId: string, queueLength: number, waitSeconds: number, status?: CheckoutQueue['status']) => void
  setLoadingQueues: (loading: boolean) => void
  addQueueAction: (entry: QueueActionEntry) => void
}

export const createQueueSlice: StateCreator<QueueSlice, [], [], QueueSlice> = (set) => ({
  queues: [],
  systemAverageWaitTimeSeconds: 0,
  systemTargetWaitTimeSeconds: 120,
  congestedLanesCount: 0,
  predictedWaitTimeCurve: [],
  isLoadingQueues: false,
  queueActionLog: [],

  setQueuesPayload: (payload) =>
    set({
      queues: payload.lanes || [],
      systemAverageWaitTimeSeconds: payload.systemAverageWaitTimeSeconds ?? 0,
      systemTargetWaitTimeSeconds: payload.systemTargetWaitTimeSeconds ?? 120,
      congestedLanesCount: (payload.lanes || []).filter((l) => l.status === 'CONGESTED').length,
      predictedWaitTimeCurve: payload.predictedWaitTimeCurve || [],
    }),

  updateLaneQueue: (laneId, queueLength, waitSeconds, status) =>
    set((state) => {
      const baseQueues = state.queues || []
      const existingIndex = baseQueues.findIndex((lane) => lane.id === laneId)
      
      let updated: CheckoutQueue[]
      if (existingIndex >= 0) {
        updated = baseQueues.map((lane) =>
          lane.id === laneId
            ? {
                ...lane,
                currentQueueLength: queueLength,
                currentWaitTimeSeconds: waitSeconds,
                status: status || (queueLength >= 5 ? 'CONGESTED' : lane.status === 'CLOSED' ? 'CLOSED' : 'ACTIVE'),
              }
            : lane
        )
      } else {
        const laneNum = parseInt(laneId.replace(/\D/g, '')) || 1
        const newLane: CheckoutQueue = {
          id: laneId,
          laneNumber: laneNum,
          laneType: laneNum === 3 ? 'EXPRESS_10_ITEMS' : laneNum === 4 ? 'SELF_CHECKOUT' : 'REGULAR_CASHIER',
          status: status || (queueLength >= 5 ? 'CONGESTED' : 'ACTIVE'),
          currentQueueLength: queueLength,
          currentWaitTimeSeconds: waitSeconds,
          processingRateItemsPerMinute: 20,
          predictedQueueIn10Min: Math.round(queueLength * 1.4),
          predictedWaitTimeIn10MinSeconds: Math.round(waitSeconds * 1.4),
          cameraSourceId: `cam-0${laneNum + 5}`,
          lastStateChange: 'Just now',
        }
        updated = [...baseQueues, newLane]
      }

      const activeLanes = updated.filter((l) => l.status !== 'CLOSED' && l.status !== 'STANDBY')
      const avgWait = activeLanes.length > 0
        ? Math.round(activeLanes.reduce((acc, l) => acc + l.currentWaitTimeSeconds, 0) / activeLanes.length)
        : 0

      return {
        queues: updated,
        systemAverageWaitTimeSeconds: avgWait,
        congestedLanesCount: updated.filter((l) => l.status === 'CONGESTED').length,
      }
    }),

  setLoadingQueues: (isLoadingQueues) => set({ isLoadingQueues }),

  addQueueAction: (entry) =>
    set((state) => ({
      queueActionLog: [entry, ...state.queueActionLog].slice(0, 20), // keep latest 20
    })),
})
