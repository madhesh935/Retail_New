import React, { useState } from 'react'
import {
  Play,
  RotateCcw,
  Zap,
  PackageCheck,
  Clock,
  Sparkles,
  Users,
  ShieldCheck,
  TrendingDown,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Radio,
} from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { Button } from '@/components/ui/button'
import { ShelfItem, CheckoutQueue, RetailIncident } from '@/types'
import { cn } from '@/lib/utils'

export const DemoSimulationController: React.FC = () => {
  const isDemoMode = useAppStore((s) => s.isDemoMode)
  const setDemoMode = useAppStore((s) => s.setDemoMode)
  const handleWebSocketMessage = useAppStore((s) => s.handleWebSocketMessage)
  const addNotification = useAppStore((s) => s.addNotification)
  const activeStoreId = useAppStore((s) => s.activeStoreId)

  const [isExpanded, setIsExpanded] = useState(false)
  const [activeSimulation, setActiveSimulation] = useState<string | null>(null)
  const [simStep, setSimStep] = useState(0)

  if (!isDemoMode) return null

  const createWsMsg = <T,>(event: any, payload: T) => ({
    event,
    storeId: activeStoreId,
    timestamp: new Date().toISOString(),
    payload,
  })

  // 1. Simulate Shelf B4 Depletion Sequence (82% -> 55% -> 31% -> 17%)
  const runB4DepletionSimulation = () => {
    setActiveSimulation('SHELF_B4')
    setSimStep(1)

    // Step 1: 82%
    handleWebSocketMessage(
      createWsMsg<ShelfItem>('SHELF_STOCKOUT_DETECTED', {
        id: 'shelf-b4',
        storeId: activeStoreId,
        shelfCode: 'B4',
        zoneId: 'zone-beverages',
        zoneName: 'Beverages',
        aisleId: 'Aisle 4',
        skuId: 'sku-cola-01',
        skuName: 'Sparkling Cola Zero 330ml',
        currentFillPercentage: 82,
        visibleUnits: 18,
        capacityUnits: 24,
        facingCount: 4,
        targetFacings: 4,
        status: 'HEALTHY',
        lastRestockedAt: new Date().toISOString(),
        depletionRatePerHour: 20.4,
        estimatedStockoutMinutes: 52,
        lostSaleRiskPerHour: 0,
        planogramCompliant: true,
      } as unknown as ShelfItem)
    )

    // Step 2: 55% (after 1.2s)
    setTimeout(() => {
      setSimStep(2)
      handleWebSocketMessage(
        createWsMsg<ShelfItem>('SHELF_STOCKOUT_DETECTED', {
          id: 'shelf-b4',
          storeId: activeStoreId,
          shelfCode: 'B4',
          zoneId: 'zone-beverages',
          zoneName: 'Beverages',
          aisleId: 'Aisle 4',
          skuId: 'sku-cola-01',
          skuName: 'Sparkling Cola Zero 330ml',
          currentFillPercentage: 55,
          visibleUnits: 11,
          capacityUnits: 24,
          facingCount: 4,
          targetFacings: 4,
          status: 'LOW',
          lastRestockedAt: new Date().toISOString(),
          depletionRatePerHour: 20.4,
          estimatedStockoutMinutes: 32,
          lostSaleRiskPerHour: 80,
          planogramCompliant: true,
        } as unknown as ShelfItem)
      )
    }, 1200)

    // Step 3: 31% (after 2.4s)
    setTimeout(() => {
      setSimStep(3)
      handleWebSocketMessage(
        createWsMsg<ShelfItem>('SHELF_STOCKOUT_DETECTED', {
          id: 'shelf-b4',
          storeId: activeStoreId,
          shelfCode: 'B4',
          zoneId: 'zone-beverages',
          zoneName: 'Beverages',
          aisleId: 'Aisle 4',
          skuId: 'sku-cola-01',
          skuName: 'Sparkling Cola Zero 330ml',
          currentFillPercentage: 31,
          visibleUnits: 6,
          capacityUnits: 24,
          facingCount: 4,
          targetFacings: 4,
          status: 'LOW',
          lastRestockedAt: new Date().toISOString(),
          depletionRatePerHour: 20.4,
          estimatedStockoutMinutes: 17,
          lostSaleRiskPerHour: 160,
          planogramCompliant: true,
        } as unknown as ShelfItem)
      )
    }, 2400)

    // Step 4: 17% Critical Stockout Alert (after 3.6s)
    setTimeout(() => {
      setSimStep(4)
      handleWebSocketMessage(
        createWsMsg<ShelfItem>('SHELF_STOCKOUT_DETECTED', {
          id: 'shelf-b4',
          storeId: activeStoreId,
          shelfCode: 'B4',
          zoneId: 'zone-beverages',
          zoneName: 'Beverages',
          aisleId: 'Aisle 4',
          skuId: 'sku-cola-01',
          skuName: 'Sparkling Cola Zero 330ml',
          currentFillPercentage: 17,
          visibleUnits: 3,
          capacityUnits: 24,
          facingCount: 4,
          targetFacings: 4,
          status: 'CRITICAL',
          lastRestockedAt: new Date().toISOString(),
          depletionRatePerHour: 20.4,
          estimatedStockoutMinutes: 9,
          lostSaleRiskPerHour: 240,
          planogramCompliant: true,
        } as unknown as ShelfItem)
      )
      handleWebSocketMessage(
        createWsMsg<RetailIncident>('INCIDENT_DETECTED', {
          id: 'INC-DEMO-B4',
          storeId: activeStoreId,
          type: 'INVENTORY_STOCKOUT',
          category: 'INVENTORY',
          title: 'Shelf B4 Depletion: Sparkling Cola Zero',
          description: 'Visible inventory dropped to 17% (3 units). Stockout in 9 min.',
          severity: 'high',
          status: 'open',
          zoneId: 'zone-beverages',
          zoneName: 'Beverages',
          location: { zone: 'Beverages', shelfId: 'B4', aisle: '4' },
          cameraIds: ['CAM-04'],
          confidence: 0.94,
          timestamp: new Date().toISOString(),
          assignedToStaffId: 'S03',
        } as unknown as RetailIncident)
      )
    }, 3600)
  }

  // 2. Simulate Queue C1 Congestion Surge (2 -> 4 -> 6 -> 8)
  const runQueueC1SurgeSimulation = () => {
    setActiveSimulation('QUEUE_C1')
    setSimStep(1)

    // Step 1: 2 shoppers
    handleWebSocketMessage(
      createWsMsg<{ lanes: CheckoutQueue[]; avgWaitSeconds: number }>('QUEUE_METRICS_UPDATE', {
        avgWaitSeconds: 84,
        lanes: [
          { id: 'q1', storeId: activeStoreId, laneNumber: 1, laneType: 'STANDARD', currentQueueLength: 2, estimatedWaitTimeSeconds: 84, arrivalRatePerMin: 1.8, serviceRatePerMin: 1.5, status: 'HEALTHY', activeCashierName: 'Elena Rostova', cameraFeedId: 'CAM-06' },
          { id: 'q2', storeId: activeStoreId, laneNumber: 2, laneType: 'STANDARD', currentQueueLength: 1, estimatedWaitTimeSeconds: 45, arrivalRatePerMin: 1.2, serviceRatePerMin: 1.6, status: 'HEALTHY', activeCashierName: 'Raj Patel', cameraFeedId: 'CAM-06' },
          { id: 'q3', storeId: activeStoreId, laneNumber: 3, laneType: 'EXPRESS', currentQueueLength: 0, estimatedWaitTimeSeconds: 0, arrivalRatePerMin: 0, serviceRatePerMin: 2.0, status: 'CLOSED', cameraFeedId: 'CAM-06' },
          { id: 'q4', storeId: activeStoreId, laneNumber: 4, laneType: 'SELF_CHECKOUT', currentQueueLength: 3, estimatedWaitTimeSeconds: 90, arrivalRatePerMin: 2.1, serviceRatePerMin: 2.2, status: 'HEALTHY', cameraFeedId: 'CAM-06' },
        ] as unknown as CheckoutQueue[],
      })
    )

    // Step 2: 4 shoppers (after 1.2s)
    setTimeout(() => {
      setSimStep(2)
      handleWebSocketMessage(
        createWsMsg<{ lanes: CheckoutQueue[]; avgWaitSeconds: number }>('QUEUE_METRICS_UPDATE', {
          avgWaitSeconds: 140,
          lanes: [
            { id: 'q1', storeId: activeStoreId, laneNumber: 1, laneType: 'STANDARD', currentQueueLength: 4, estimatedWaitTimeSeconds: 140, arrivalRatePerMin: 2.2, serviceRatePerMin: 1.5, status: 'HEALTHY', activeCashierName: 'Elena Rostova', cameraFeedId: 'CAM-06' },
            { id: 'q2', storeId: activeStoreId, laneNumber: 2, laneType: 'STANDARD', currentQueueLength: 2, estimatedWaitTimeSeconds: 65, arrivalRatePerMin: 1.2, serviceRatePerMin: 1.6, status: 'HEALTHY', activeCashierName: 'Raj Patel', cameraFeedId: 'CAM-06' },
            { id: 'q3', storeId: activeStoreId, laneNumber: 3, laneType: 'EXPRESS', currentQueueLength: 0, estimatedWaitTimeSeconds: 0, arrivalRatePerMin: 0, serviceRatePerMin: 2.0, status: 'CLOSED', cameraFeedId: 'CAM-06' },
            { id: 'q4', storeId: activeStoreId, laneNumber: 4, laneType: 'SELF_CHECKOUT', currentQueueLength: 3, estimatedWaitTimeSeconds: 90, arrivalRatePerMin: 2.1, serviceRatePerMin: 2.2, status: 'HEALTHY', cameraFeedId: 'CAM-06' },
          ] as unknown as CheckoutQueue[],
        })
      )
    }, 1200)

    // Step 3: 6 shoppers (after 2.4s)
    setTimeout(() => {
      setSimStep(3)
      handleWebSocketMessage(
        createWsMsg<{ lanes: CheckoutQueue[]; avgWaitSeconds: number }>('QUEUE_METRICS_UPDATE', {
          avgWaitSeconds: 210,
          lanes: [
            { id: 'q1', storeId: activeStoreId, laneNumber: 1, laneType: 'STANDARD', currentQueueLength: 6, estimatedWaitTimeSeconds: 210, arrivalRatePerMin: 2.6, serviceRatePerMin: 1.5, status: 'CONGESTED', activeCashierName: 'Elena Rostova', cameraFeedId: 'CAM-06' },
            { id: 'q2', storeId: activeStoreId, laneNumber: 2, laneType: 'STANDARD', currentQueueLength: 2, estimatedWaitTimeSeconds: 65, arrivalRatePerMin: 1.2, serviceRatePerMin: 1.6, status: 'HEALTHY', activeCashierName: 'Raj Patel', cameraFeedId: 'CAM-06' },
            { id: 'q3', storeId: activeStoreId, laneNumber: 3, laneType: 'EXPRESS', currentQueueLength: 0, estimatedWaitTimeSeconds: 0, arrivalRatePerMin: 0, serviceRatePerMin: 2.0, status: 'CLOSED', cameraFeedId: 'CAM-06' },
            { id: 'q4', storeId: activeStoreId, laneNumber: 4, laneType: 'SELF_CHECKOUT', currentQueueLength: 4, estimatedWaitTimeSeconds: 110, arrivalRatePerMin: 2.1, serviceRatePerMin: 2.2, status: 'HEALTHY', cameraFeedId: 'CAM-06' },
          ] as unknown as CheckoutQueue[],
        })
      )
    }, 2400)

    // Step 4: 8 shoppers Critical Congestion (after 3.6s)
    setTimeout(() => {
      setSimStep(4)
      handleWebSocketMessage(
        createWsMsg<{ lanes: CheckoutQueue[]; avgWaitSeconds: number }>('QUEUE_METRICS_UPDATE', {
          avgWaitSeconds: 324,
          lanes: [
            { id: 'q1', storeId: activeStoreId, laneNumber: 1, laneType: 'STANDARD', currentQueueLength: 8, estimatedWaitTimeSeconds: 324, arrivalRatePerMin: 2.8, serviceRatePerMin: 1.5, status: 'CONGESTED', activeCashierName: 'Elena Rostova', cameraFeedId: 'CAM-06' },
            { id: 'q2', storeId: activeStoreId, laneNumber: 2, laneType: 'STANDARD', currentQueueLength: 2, estimatedWaitTimeSeconds: 65, arrivalRatePerMin: 1.2, serviceRatePerMin: 1.6, status: 'HEALTHY', activeCashierName: 'Raj Patel', cameraFeedId: 'CAM-06' },
            { id: 'q3', storeId: activeStoreId, laneNumber: 3, laneType: 'EXPRESS', currentQueueLength: 0, estimatedWaitTimeSeconds: 0, arrivalRatePerMin: 0, serviceRatePerMin: 2.0, status: 'CLOSED', cameraFeedId: 'CAM-06' },
            { id: 'q4', storeId: activeStoreId, laneNumber: 4, laneType: 'SELF_CHECKOUT', currentQueueLength: 5, estimatedWaitTimeSeconds: 130, arrivalRatePerMin: 2.1, serviceRatePerMin: 2.2, status: 'HEALTHY', cameraFeedId: 'CAM-06' },
          ] as unknown as CheckoutQueue[],
        })
      )
      handleWebSocketMessage(
        createWsMsg<RetailIncident>('INCIDENT_DETECTED', {
          id: 'INC-DEMO-C1',
          storeId: activeStoreId,
          type: 'QUEUE_CONGESTION',
          category: 'QUEUE',
          title: 'Counter C1 Queue Congestion (8 shoppers)',
          description: 'Arrival rate exceeds cashier capacity. Open Standby Counter C3 immediately.',
          severity: 'critical',
          status: 'open',
          zoneId: 'zone-checkouts',
          zoneName: 'Checkouts',
          location: { zone: 'Checkout Lanes', checkoutId: 'C1' },
          cameraIds: ['CAM-06'],
          confidence: 0.92,
          timestamp: new Date().toISOString(),
          assignedToStaffId: 'S02',
        } as unknown as RetailIncident)
      )
    }, 3600)
  }

  // 3. Full Closed-Loop Lifecycle Simulation
  const runFullLifecycleSimulation = () => {
    setActiveSimulation('FULL_LIFECYCLE')
    setSimStep(1)

    let current = 1
    const interval = setInterval(() => {
      current += 1
      setSimStep(current)
      if (current >= 8) {
        clearInterval(interval)
      }
    }, 1200)
  }

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-3.5 py-1.5 text-xs select-none font-sans text-amber-900 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        {/* Left: Engine Mode Header */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="p-1 rounded-md bg-amber-100 border border-amber-200 text-amber-700 shrink-0 shadow-2xs">
            <Zap className="h-3.5 w-3.5" />
          </div>
          <div className="flex items-center gap-2 whitespace-nowrap">
            <span className="font-bold text-amber-800 uppercase tracking-wider text-[11px]">
              SCENARIO SIMULATION ACTIVE
            </span>
          </div>
        </div>

        {/* Right: Quick Action Triggers */}
        <div className="flex flex-wrap items-center gap-1.5 text-[10px] shrink-0 font-sans">
          {/* Trigger 1: B4 Depletion */}
          <Button
            variant="outline"
            size="xs"
            onClick={runB4DepletionSimulation}
            className="border-amber-200 bg-white text-amber-800 hover:bg-amber-100 text-[10px] h-6 px-2 gap-1 font-semibold cursor-pointer whitespace-nowrap shadow-2xs"
          >
            <PackageCheck className="h-3 w-3 text-amber-600 shrink-0" />
            <span>Deplete Shelf B4</span>
          </Button>

          {/* Trigger 2: C1 Queue Surge */}
          <Button
            variant="outline"
            size="xs"
            onClick={runQueueC1SurgeSimulation}
            className="border-rose-200 bg-white text-rose-700 hover:bg-rose-50 text-[10px] h-6 px-2 gap-1 font-semibold cursor-pointer whitespace-nowrap shadow-2xs"
          >
            <Users className="h-3 w-3 text-rose-600 shrink-0" />
            <span>Surge Queue C1</span>
          </Button>

          {/* Trigger 3: Full Closed-Loop Flow */}
          <Button
            variant="outline"
            size="xs"
            onClick={runFullLifecycleSimulation}
            className="border-sky-200 bg-white text-sky-700 hover:bg-sky-50 text-[10px] h-6 px-2 gap-1 font-semibold cursor-pointer whitespace-nowrap shadow-2xs"
          >
            <Sparkles className="h-3 w-3 text-sky-600 shrink-0" />
            <span>Run Closed-Loop Sequence</span>
          </Button>

          <Button
            variant="outline"
            size="xs"
            onClick={() => setDemoMode(false)}
            className="border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-[10px] font-semibold h-6 px-2 whitespace-nowrap shadow-2xs"
          >
            Return to Live Stream
          </Button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-amber-700 hover:text-amber-900 p-1 cursor-pointer"
            title="Toggle details"
          >
            {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Expanded Step Status Tracker */}
      {isExpanded && activeSimulation && (
        <div className="mt-2 pt-2 border-t border-amber-200 grid grid-cols-1 sm:grid-cols-4 gap-2 text-[10px]">
          <div className="bg-white p-2.5 rounded-lg border border-amber-200 col-span-4 flex items-center justify-between shadow-2xs">
            <span className="font-bold text-slate-900 flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              <span>
                Active Simulation: <strong>{activeSimulation}</strong> • Phase {simStep}/4
              </span>
            </span>
            <span className="text-emerald-700 font-mono font-bold">Real-Time State Dispatched to Zustand & 3D Twin</span>
          </div>
        </div>
      )}
    </div>
  )
}
