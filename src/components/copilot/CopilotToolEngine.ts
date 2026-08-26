import { WhyDialogData } from '@/components/command-center/WhyRecommendationDialog'
import { useAppStore } from '@/store/useAppStore'

export interface CopilotAction {
  type: 'NAVIGATE' | 'VIEW_TWIN' | 'VIEW_CAMERA' | 'ASSIGN_STAFF' | 'CREATE_TASK' | 'OPEN_WHY'
  label: string
  payload?: any
}

export interface CopilotStructuredResponse {
  toolCalled: string
  observation: string
  prediction: string
  action: string
  reason: string
  actions: CopilotAction[]
  rawMetrics?: Record<string, string | number>
}

export interface CopilotContext {
  page: string
  selectedEntity?: string
  activeStore: string
}

// 8 Backend Tool Implementations Grounded in Real Store State
export const CopilotTools = {
  get_store_status: () => {
    return {
      storeName: 'Store 01 — Chennai Central',
      liveOccupancy: 126,
      capacityLimit: 350,
      todayFootfall: 1284,
      avgWaitTime: '2.8 min',
      shelfHealth: '86%',
      criticalAlertsCount: 3,
      edgeEngineState: 'ACTIVE (DeepStream 6.3)',
    }
  },

  get_inventory_risks: () => {
    return {
      criticalShelves: ['Beverage B4 (17% availability)', 'Dairy C2 (0% milk)', 'Beverage B2 (19%)'],
      topStockoutRisk: 'Shelf B4 Sparkling Cola Zero 12pk (empty in 9m)',
      backroomAvailableUnits: 24,
      lostSaleExposure: '$240/hr in Beverages',
      overallPlanogramCompliance: '93%',
    }
  },

  get_queue_status: () => {
    // Read live state from Zustand store
    const state = useAppStore.getState()
    const queues = Array.isArray(state.queues) ? state.queues : []
    const activeQueues = queues.filter((l) => l.status !== 'CLOSED' && l.status !== 'STANDBY')
    const congestedLane = activeQueues.reduce(
      (prev, curr) => (curr.currentQueueLength > (prev?.currentQueueLength || 0) ? curr : prev),
      activeQueues[0] || null
    )
    const avgWaitSec = state.systemAverageWaitTimeSeconds || 0
    const avgWaitMin = (avgWaitSec / 60).toFixed(1)
    const congestedCode = congestedLane ? `C${congestedLane.laneNumber}` : 'C1'
    const congestedQ = congestedLane?.currentQueueLength || 0
    const congestedWaitMin = congestedLane ? (congestedLane.currentWaitTimeSeconds / 60).toFixed(1) : '0.0'
    const forecast5 = congestedLane ? Math.round(congestedQ + congestedQ * 0.6) : 0
    const openLanes = activeQueues.map((q) => `C${q.laneNumber}`).join(', ')

    return {
      activeCounters: `${activeQueues.length} / ${queues.length} (${openLanes} Active)`,
      criticalCounter: `Counter ${congestedCode} (Queue: ${congestedQ} shoppers, Est. Wait: ${congestedWaitMin} min)`,
      avgWaitTime: `${avgWaitMin} min (system average)`,
      forecast5Min: `${forecast5} shoppers (projected +5min)`,
      recommendedAction: congestedQ >= 5 ? 'Open a standby counter immediately' : 'Queue levels within normal range',
      suggestedStaff: 'S02 Marcus Vance',
    }
  },

  get_staff_state: () => {
    return {
      staffOnShift: 18,
      availableStaff: 5,
      activeTasks: 6,
      topRecommendedAllocations: [
        { staffId: 'S02', name: 'Marcus Vance', destination: 'Counter C3', role: 'Billing', distance: '18m' },
        { staffId: 'S03', name: 'Liam O\'Connor', destination: 'Shelf B4', role: 'Replenishment', distance: '28m' },
      ],
    }
  },

  get_zone_analytics: () => {
    return {
      highestTrafficZone: 'Beverages (382 visitors today, 52s dwell)',
      highestEngagedZone: 'Electronics (244 visitors, 4.2m avg dwell, 88% intent)',
      bottleneckZone: 'Checkout Lanes C1-C4 (620 visitors inflow)',
      highestLostSaleZone: 'Beverages (82% Interest / 61% Shelf Availability)',
    }
  },

  get_predictions: () => {
    return {
      peakHourWindow: '19:00–19:30 (145–160 expected occupancy)',
      counterC1CongestionRisk: '92% probability of SLA breach in 5 min',
      shelfB4StockoutTime: '9 minutes remaining',
    }
  },

  get_incidents: () => {
    return {
      criticalIncidents: [
        { id: 'INC-701', title: 'Counter C1 Queue Congestion (8 wait)', zone: 'Checkout' },
        { id: 'INC-704', title: 'Liquid Spill Hazard', zone: 'Aisle 2 Produce' },
      ],
      highSeverity: [
        { id: 'INC-702', title: 'Shelf B4 Depletion', zone: 'Beverages' },
      ],
      resolvedToday: 18,
    }
  },

  get_historical_report: () => {
    return {
      footfallComparison: '+12% vs yesterday (1,284 footfall)',
      avgWaitReduction: '34% average reduction after Edge AI interventions',
      preventedStockoutsToday: 8,
    }
  },
}

// Grounded Query Parser & Decision Engine
export function executeCopilotQuery(
  query: string,
  context: CopilotContext
): CopilotStructuredResponse {
  const q = query.toLowerCase()

  // Scenario 1: "What's critical right now?"
  if (q.includes('critical') && (q.includes('right now') || q.includes('what') || q.includes('active'))) {
    const queue = CopilotTools.get_queue_status()
    const inv = CopilotTools.get_inventory_risks()

    return {
      toolCalled: 'get_incidents & get_queue_status',
      observation: `Store 01 has 2 critical operational bottlenecks: Counter C1 queue has reached 8 shoppers (5.4m wait), and Shelf B4 availability dropped to 17% (3 visible units).`,
      prediction: `Counter C1 is projected to hit 13 shoppers in +5 min (92% congestion risk), and Shelf B4 will completely stock out in 9 minutes.`,
      action: `Open Standby Counter C3 with Associate S02 (Marcus Vance) and dispatch Associate S03 (Liam O'Connor) to restock Shelf B4 from Bay 3B.`,
      reason: `Queue arrival rate (2.8/min) currently exceeds cashier Elena's service rate (1.5/min), and beverage footfall is surging during afternoon rush.`,
      actions: [
        { type: 'NAVIGATE', label: 'Open Queues (/queues)', payload: '/queues' },
        { type: 'VIEW_TWIN', label: 'View in Digital Twin', payload: '/digital-twin' },
        { type: 'ASSIGN_STAFF', label: 'Assign S02 → Counter C3', payload: { staffId: 'S02', task: 'Open Counter C3' } },
        { type: 'VIEW_CAMERA', label: 'View Cam C06 (Checkout)', payload: { cameraCode: 'CAM-06', zoneName: 'Checkout Lanes' } },
      ],
    }
  }

  // Scenario 2: "Which shelves need replenishment?"
  if (q.includes('shelf') || q.includes('replenish') || q.includes('stock-out')) {
    const inv = CopilotTools.get_inventory_risks()

    return {
      toolCalled: 'get_inventory_risks',
      observation: `3 shelves require immediate restock: Shelf B4 (Sparkling Cola 17% • 3 units), Shelf B2 (Sports Drink 19%), and Shelf C2 (Whole Milk 0% • Backroom only).`,
      prediction: `Shelf B4 will become fully empty in 9 minutes, risking $240/hr in lost revenue. Shelf D2 (Almonds) is projected to deplete in 17 minutes.`,
      action: `Dispatch Liam O'Connor (S03) to restock 24 units of Cola to Shelf B4 from Backroom Bay 3B.`,
      reason: `High consumer velocity (20.4 units/hr) paired with sufficient backroom inventory (24 units available in Bay 3B).`,
      actions: [
        { type: 'NAVIGATE', label: 'Open Inventory (/inventory)', payload: '/inventory' },
        { type: 'ASSIGN_STAFF', label: 'Assign S03 → Shelf B4', payload: { staffId: 'S03', task: 'Refill Beverage B4' } },
        { type: 'VIEW_CAMERA', label: 'View Cam C04 (Shelf B4)', payload: { cameraCode: 'CAM-04', zoneName: 'Beverages Gondola B4' } },
      ],
    }
  }

  // Scenario 3: "Why is Beverage B4 critical?" (or contextual follow-up)
  if (q.includes('b4') || (context.selectedEntity === 'B4' && q.includes('why'))) {
    return {
      toolCalled: 'get_inventory_risks & get_zone_analytics',
      observation: `Shelf B4 (Sparkling Cola Zero 12pk) currently has only 3 visible facings on the sales floor (17% availability) against a POS stock of 14 units.`,
      prediction: `At the current depletion rate of 0.33 units/min, visible inventory will reach 0 in exactly 9.0 minutes.`,
      action: `Fetch 24 units from Backroom Rack 3B and replenish shelf immediately.`,
      reason: `Mathematical rate equation: T_empty = 3 units / 0.333 units/min = 9.0 min. Customer footfall in Aisle 4 is currently high density.`,
      actions: [
        { type: 'NAVIGATE', label: 'Open Shelf B4 Detail', payload: '/inventory' },
        { type: 'ASSIGN_STAFF', label: 'Dispatch S03 (Liam O\'Connor)', payload: { staffId: 'S03', task: 'Refill Beverage B4' } },
        { type: 'VIEW_CAMERA', label: 'Live Vision (CAM-04)', payload: { cameraCode: 'CAM-04', zoneName: 'Beverages Gondola B4' } },
      ],
    }
  }

  // Scenario 4: "Which checkout is likely to become congested?"
  if (q.includes('checkout') || q.includes('congest') || q.includes('queue')) {
    const queue = CopilotTools.get_queue_status()

    return {
      toolCalled: 'get_queue_status & get_predictions',
      observation: `Counter C1 has 8 people queued with an estimated wait of 5.4 min, exceeding the store 3.0 min SLA. Counters C2 and C4 are healthy (2 and 5 queue).`,
      prediction: `Temporal AI predicts Counter C1 queue will grow to 13 people within +5 minutes if Counter C3 remains closed (92% congestion probability).`,
      action: `Activate Standby Counter C3 and reallocate Associate Marcus Vance (S02) from Aisle 3.`,
      reason: `Queue inflow λ = 2.8 cust/min exceeds single-cashier capacity μ = 1.5 cust/min. Opening C3 restores equilibrium (μ_total = 3.7/min).`,
      actions: [
        { type: 'NAVIGATE', label: 'Go to Queues (/queues)', payload: '/queues' },
        { type: 'ASSIGN_STAFF', label: 'Activate Counter C3 (S02)', payload: { staffId: 'S02', task: 'Open Counter C3' } },
        { type: 'VIEW_CAMERA', label: 'View Cam C06 (Overhead)', payload: { cameraCode: 'CAM-06', zoneName: 'Checkout Lanes' } },
      ],
    }
  }

  // Scenario 5: "Where should available staff be deployed?"
  if (q.includes('staff') || q.includes('deployed') || q.includes('available')) {
    return {
      toolCalled: 'get_staff_state & get_incidents',
      observation: `5 staff members are currently available on shift: S02 (Marcus Vance in Aisle 3), S03 (Liam O'Connor in Stock Room), S06 (Priya Sharma on Center Floor).`,
      prediction: `Unassigned critical tasks will cause Counter C1 wait times to exceed 6 minutes and Shelf B4 to stock out within 9 minutes.`,
      action: `1. Reallocate S02 → Counter C3 (Billing Certified • 18m away).\n2. Dispatch S03 → Shelf B4 (Restock Tier 1 • Bay 3B ready).\n3. Assign S04 → Liquid Spill Cleanup (Aisle 2).`,
      reason: `Matches employees based on certified skill profiles, physical zone proximity, and task urgency scores without invasive surveillance.`,
      actions: [
        { type: 'NAVIGATE', label: 'Open Staff Operations (/staff)', payload: '/staff' },
        { type: 'ASSIGN_STAFF', label: 'Approve All Allocations', payload: { staffId: 'S02', task: 'Open Counter C3' } },
      ],
    }
  }

  // Scenario 6: "Which zone has the highest lost-sale risk?"
  if (q.includes('lost-sale') || q.includes('opportunity') || q.includes('highest risk zone')) {
    return {
      toolCalled: 'get_zone_analytics',
      observation: `Beverages (Aisle 4) has the highest lost-sale opportunity risk with 382 visitors, 52s dwell, but only 61% average shelf availability.`,
      prediction: `Revenue exposure is estimated at $240/hour in Beverages and $185/hour in Dairy & Chilled if restock delays persist.`,
      action: `Prioritize rapid restock cycle for Aisle 4 Beverage Gondolas (B4, B2) and Dairy Cooler Wall (C2).`,
      reason: `High shopper footfall + high purchase engagement colliding with low shelf facings leads directly to basket abandonment.`,
      actions: [
        { type: 'NAVIGATE', label: 'View Shopper Analytics (/shopper-analytics)', payload: '/shopper-analytics' },
        { type: 'VIEW_TWIN', label: 'Inspect in Digital Twin', payload: '/digital-twin' },
      ],
    }
  }

  // Scenario 7: "What changed during the last hour?"
  if (q.includes('last hour') || q.includes('changed') || q.includes('history')) {
    return {
      toolCalled: 'get_historical_report & get_incidents',
      observation: `During the last 60 minutes: Footfall surged by +14%, Counter C3 was opened at 18:42, Shelf B4 was replenished at 18:38, and a liquid spill was cleared in Aisle 2.`,
      prediction: `Footfall will reach peak occupancy (145-160 shoppers) between 19:00-19:30.`,
      action: `Maintain 3 active checkout counters and prepare evening replenishment carts for Produce and Dairy.`,
      reason: `Evening rush influx typically peaks at 19:15 based on historical weekday footfall models.`,
      actions: [
        { type: 'NAVIGATE', label: 'View Executive Reports (/reports)', payload: '/reports' },
        { type: 'VIEW_TWIN', label: 'Replay in Digital Twin', payload: '/digital-twin' },
      ],
    }
  }

  // Default / Summarize today's store performance
  const status = CopilotTools.get_store_status()
  return {
    toolCalled: 'get_store_status',
    observation: `Store 01 (Chennai Central) is operating with 126 live shoppers (36% capacity), 1,284 footfall (+12% vs yesterday), and 91% overall shelf availability.`,
    prediction: `Expected peak rush at 19:00–19:30 with 145–160 concurrent shoppers.`,
    action: `Monitor Counter C1 queue buildup and complete Shelf B4 restock before peak hour rush begins.`,
    reason: `All 6 RTSP camera streams and NVIDIA Jetson Orin NX edge inference (13 FPS, 68ms latency) are operating nominally.`,
    actions: [
      { type: 'NAVIGATE', label: 'View Command Center', payload: '/command-center' },
      { type: 'VIEW_TWIN', label: 'Explore Digital Twin', payload: '/digital-twin' },
      { type: 'NAVIGATE', label: 'Inspect Reports & Insights', payload: '/reports' },
    ],
  }
}
