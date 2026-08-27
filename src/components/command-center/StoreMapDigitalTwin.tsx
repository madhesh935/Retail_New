import React, { useState } from 'react'
import {
  Users,
  Flame,
  Box,
  ListOrdered,
  UserCheck,
  ShieldAlert,
  Camera,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  Store,
  Clock,
  Eye,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

export interface SelectedEntity {
  type: 'shelf' | 'checkout' | 'zone' | 'incident' | 'camera'
  id: string
  name: string
  code: string
  data: any
}

interface StoreMapDigitalTwinProps {
  onSelectEntity: (entity: SelectedEntity) => void
}

interface CameraModalState {
  code: string
  name: string
  zone: string
  summary: string
  resolution: string
  fps: number
  latencyMs: number
}

export const StoreMapDigitalTwin: React.FC<StoreMapDigitalTwinProps> = ({ onSelectEntity }) => {
  const connectionState = useAppStore((s) => s.connectionState)
  const isLive = connectionState === 'CONNECTED'

  // Live queue data from YOLO model
  const queues = useAppStore((s) => s.queues)
  const getQueue = (laneNum: number) => Array.isArray(queues) ? queues.find((q) => q.laneNumber === laneNum) : null
  const q1 = getQueue(1)
  const q2 = getQueue(2)
  const q3 = getQueue(3)
  const q4 = getQueue(4)

  const fmtLane = (q: typeof q1) => q
    ? `${q.currentQueueLength} • ${(q.currentWaitTimeSeconds / 60).toFixed(1)}m`
    : '0 • 0.0m'
  const bestLane = [q1, q2, q4].filter(Boolean).sort((a, b) => (a!.currentWaitTimeSeconds) - (b!.currentWaitTimeSeconds))[0]
  const bestLaneStr = bestLane ? `C${bestLane.laneNumber} (~${(bestLane.currentWaitTimeSeconds / 60).toFixed(1)} min wait)` : 'C2 (~1.4m wait)'

  // Layer toggles state
  const [layers, setLayers] = useState({
    people: true,
    heatmap: false,
    shelves: true,
    queues: true,
    staff: true,
    alerts: true,
  })

  // Selected fixture ID for local highlight ring
  const [selectedFixtureId, setSelectedFixtureId] = useState<string | null>('shelf-b4')

  // Live Camera preview modal state
  const [activeCameraModal, setActiveCameraModal] = useState<CameraModalState | null>(null)

  const toggleLayer = (layerKey: keyof typeof layers) => {
    setLayers((prev) => ({ ...prev, [layerKey]: !prev[layerKey] }))
  }

  const handleFixtureClick = (entity: SelectedEntity) => {
    setSelectedFixtureId(entity.id)
    onSelectEntity(entity)
  }

  const handleOpenCamModal = (e: React.MouseEvent, cam: CameraModalState) => {
    e.stopPropagation()
    setActiveCameraModal(cam)
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 flex flex-col justify-between shadow-2xs relative overflow-hidden select-none h-full min-h-[560px] font-sans">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-100 z-10 shrink-0">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
            <span>Store Map</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200 font-normal">
              Live Overview
            </span>
          </h3>
        </div>

        {/* Layer Toggles */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex flex-wrap items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[11px]">
            <button
              onClick={() => toggleLayer('people')}
              className={cn(
                'px-2 py-1 rounded-md transition-colors flex items-center gap-1 cursor-pointer font-medium',
                layers.people ? 'bg-white text-sky-700 border border-slate-200 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              )}
            >
              <Users className="h-3 w-3" /> People
            </button>

            <button
              onClick={() => toggleLayer('heatmap')}
              className={cn(
                'px-2 py-1 rounded-md transition-colors flex items-center gap-1 cursor-pointer font-medium',
                layers.heatmap ? 'bg-amber-50 text-amber-700 border border-amber-200 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              )}
            >
              <Flame className="h-3 w-3" /> Heatmap
            </button>

            <button
              onClick={() => toggleLayer('shelves')}
              className={cn(
                'px-2 py-1 rounded-md transition-colors flex items-center gap-1 cursor-pointer font-medium',
                layers.shelves ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              )}
            >
              <Box className="h-3 w-3" /> Shelves
            </button>

            <button
              onClick={() => toggleLayer('queues')}
              className={cn(
                'px-2 py-1 rounded-md transition-colors flex items-center gap-1 cursor-pointer font-medium',
                layers.queues ? 'bg-sky-50 text-sky-700 border border-sky-200 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              )}
            >
              <ListOrdered className="h-3 w-3" /> Queues
            </button>

            <button
              onClick={() => toggleLayer('staff')}
              className={cn(
                'px-2 py-1 rounded-md transition-colors flex items-center gap-1 cursor-pointer font-medium',
                layers.staff ? 'bg-purple-50 text-purple-700 border border-purple-200 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              )}
            >
              <UserCheck className="h-3 w-3" /> Staff
            </button>

            <button
              onClick={() => toggleLayer('alerts')}
              className={cn(
                'px-2 py-1 rounded-md transition-colors flex items-center gap-1 cursor-pointer font-medium',
                layers.alerts ? 'bg-rose-50 text-rose-700 border border-rose-200 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              )}
            >
              <ShieldAlert className="h-3 w-3" /> Alerts
            </button>
          </div>

          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-50 border border-slate-200 text-[10.5px] font-mono text-slate-500">
            <span className={cn('h-1.5 w-1.5 rounded-full', isLive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500')} />
            <span>{isLive ? 'Updated 2s ago' : 'Stale'}</span>
          </div>
        </div>
      </div>

      {/* Map Canvas */}
      <div className="relative flex-1 w-full my-2.5 rounded-xl bg-slate-50 border border-slate-200 overflow-hidden flex flex-col justify-between p-3 min-h-[460px] shadow-inner font-sans">
        {/* Floor Pattern */}
        <div
          className="absolute inset-0 opacity-40 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(to right, #E2E8F0 1px, transparent 1px), linear-gradient(to bottom, #E2E8F0 1px, transparent 1px)`,
            backgroundSize: '28px 28px',
          }}
        />

        {/* Heatmap Layer */}
        {layers.heatmap && (
          <div className="absolute inset-0 pointer-events-none transition-opacity duration-300 z-0">
            <div className="absolute top-[28%] left-[12%] h-40 w-40 rounded-full bg-emerald-500/10 blur-2xl" />
            <div className="absolute top-[28%] right-[12%] h-40 w-40 rounded-full bg-rose-500/15 blur-2xl" />
            <div className="absolute bottom-[10%] right-[10%] h-44 w-44 rounded-full bg-rose-600/20 blur-2xl animate-pulse" />
          </div>
        )}

        {/* TOP: Entrance */}
        <div className="w-full z-10 shrink-0">
          <div
            onClick={() =>
              handleFixtureClick({
                type: 'zone',
                id: 'zone-entrance',
                name: 'Entrance',
                code: 'ENTRANCE',
                data: { occupancy: 14, inflow: 14, outflow: 9, netFlow: '+5', activeLanes: 4, camera: 'CAM-01' },
              })
            }
            className={cn(
              'rounded-xl border bg-white px-3.5 py-2.5 flex items-center justify-between cursor-pointer transition-all hover:border-sky-300 shadow-2xs',
              selectedFixtureId === 'zone-entrance' ? 'border-sky-500 ring-2 ring-sky-500/20 bg-sky-50/50' : 'border-slate-200'
            )}
          >
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">Entrance</span>
              <button
                onClick={(e) =>
                  handleOpenCamModal(e, {
                    code: 'C01',
                    name: 'Entrance Camera',
                    zone: 'Store Entrance',
                    summary: '14 Inflow • 9 Outflow • Net +5',
                    resolution: '1080p @ 30fps',
                    fps: 30,
                    latencyMs: 14,
                  })
                }
                className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-sky-50 border border-sky-200 text-[10px] text-sky-700 font-mono hover:bg-sky-100 font-semibold"
              >
                <Camera className="h-2.5 w-2.5 text-sky-600" />
                <span>C01</span>
              </button>

              <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono text-slate-600">
                <span>In: <strong className="text-emerald-700">14</strong></span>
                <span className="text-slate-300">/</span>
                <span>Out: <strong className="text-slate-500">9</strong></span>
                <span className="text-slate-300">|</span>
                <span>Net: <strong className="text-sky-700">+5</strong></span>
              </div>
            </div>

            {layers.people && (
              <div className="flex items-center gap-1 text-[11px] text-sky-700 font-mono font-bold">
                <span className="h-1.5 w-1.5 rounded-full bg-sky-600" />
                <span>14 Shoppers</span>
              </div>
            )}
          </div>
        </div>

        {/* MIDDLE: 3 Core Zones (Produce, Dairy & Bakery, Beverages) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-2 z-10 flex-1 items-stretch">
          {/* PRODUCE */}
          <div
            onClick={() =>
              handleFixtureClick({
                type: 'zone',
                id: 'zone-produce',
                name: 'Produce',
                code: 'PRODUCE',
                data: { occupancy: 28, traffic: 'HIGH', avgDwell: '2m 14s', shelfHealth: '92%', staff: 'Liam' },
              })
            }
            className={cn(
              'rounded-xl border bg-white p-3 flex flex-col justify-between space-y-2 cursor-pointer transition-all shadow-2xs',
              selectedFixtureId === 'zone-produce' ? 'border-sky-500 ring-2 ring-sky-500/20 bg-sky-50/50' : 'border-slate-200 hover:border-slate-300'
            )}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
              <div>
                <span className="text-xs font-bold text-slate-900 uppercase">Produce</span>
                <div className="text-[11px] font-mono text-sky-700 font-semibold">28 shoppers • High Traffic</div>
              </div>
              <button
                onClick={(e) =>
                  handleOpenCamModal(e, {
                    code: 'C02',
                    name: 'Produce Camera',
                    zone: 'Produce',
                    summary: '28 Shoppers • A1 Gala Apples 92% Healthy',
                    resolution: '1080p @ 30fps',
                    fps: 30,
                    latencyMs: 16,
                  })
                }
                className="p-1 rounded-md bg-slate-50 border border-slate-200 hover:border-sky-300 text-slate-500 hover:text-sky-700 text-[10px] font-mono flex items-center gap-1 shadow-2xs font-semibold"
              >
                <Camera className="h-3 w-3 text-sky-600" />
                <span>C02</span>
              </button>
            </div>

            <div className="text-[11px] font-mono text-slate-500 flex items-center justify-between">
              <span>Dwell: <strong className="text-slate-900">2m 14s</strong></span>
              <span>Health: <strong className="text-emerald-700">92%</strong></span>
            </div>

            {layers.shelves && (
              <div
                onClick={(e) => {
                  e.stopPropagation()
                  handleFixtureClick({
                    type: 'shelf',
                    id: 'shelf-a1',
                    name: 'A1 Gala Apples',
                    code: 'A1',
                    data: { sku: 'Organic Royal Gala Apples', compliance: 92, stock: 38, status: 'OPTIMAL' },
                  })
                }}
                className={cn(
                  'rounded-lg border bg-slate-50 p-2 text-xs flex items-center justify-between transition-all cursor-pointer shadow-2xs',
                  selectedFixtureId === 'shelf-a1' ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/50' : 'border-slate-200 hover:border-emerald-300'
                )}
              >
                <span className="font-semibold text-slate-900">A1 Gala Apples</span>
                <span className="text-emerald-700 font-mono font-bold text-[11px]">92% In-Stock</span>
              </div>
            )}

            {layers.staff && (
              <div className="flex items-center gap-1 text-[10.5px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200 w-fit font-mono font-semibold">
                <UserCheck className="h-3 w-3 text-purple-600" />
                <span>Liam • Restocking</span>
              </div>
            )}
          </div>

          {/* DAIRY & BAKERY */}
          <div
            onClick={() =>
              handleFixtureClick({
                type: 'zone',
                id: 'zone-dairy',
                name: 'Dairy & Bakery',
                code: 'DAIRY',
                data: { occupancy: 22, traffic: 'MEDIUM', avgDwell: '1m 48s', primaryIssue: 'C2 Whole Milk OUT OF STOCK' },
              })
            }
            className={cn(
              'rounded-xl border bg-white p-3 flex flex-col justify-between space-y-2 cursor-pointer transition-all shadow-2xs',
              selectedFixtureId === 'zone-dairy' ? 'border-sky-500 ring-2 ring-sky-500/20 bg-sky-50/50' : 'border-slate-200 hover:border-slate-300'
            )}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
              <div>
                <span className="text-xs font-bold text-slate-900 uppercase">Dairy & Bakery</span>
                <div className="text-[11px] font-mono text-sky-700 font-semibold">22 shoppers • Medium Traffic</div>
              </div>
              <div className="text-right font-mono text-[10px] text-slate-500">
                Dwell: <strong className="text-slate-900">1m 48s</strong>
              </div>
            </div>

            {layers.shelves && (
              <div
                onClick={(e) => {
                  e.stopPropagation()
                  handleFixtureClick({
                    type: 'shelf',
                    id: 'shelf-c2',
                    name: 'C2 Whole Milk',
                    code: 'C2',
                    data: { sku: 'Organic Whole Milk', status: 'CRITICAL', visibleUnits: 0, backroomStock: 12 },
                  })
                }}
                className={cn(
                  'rounded-lg border bg-rose-50/30 p-2 text-xs flex items-center justify-between transition-all cursor-pointer shadow-2xs',
                  selectedFixtureId === 'shelf-c2' ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50' : 'border-rose-200 hover:border-rose-400'
                )}
              >
                <div>
                  <span className="font-bold text-slate-900 block">C2 Whole Milk</span>
                  <span className="text-[10px] text-slate-500 font-mono">Backroom: 12 units</span>
                </div>
                <div className="text-right">
                  <span className="text-rose-700 font-mono font-bold text-[11px] block">OUT OF STOCK</span>
                  <span className="text-[10px] text-rose-700 font-mono underline font-semibold">[ Refill ]</span>
                </div>
              </div>
            )}

            {layers.shelves && (
              <div
                onClick={(e) => {
                  e.stopPropagation()
                  handleFixtureClick({
                    type: 'shelf',
                    id: 'shelf-d1',
                    name: 'D1 Sourdough',
                    code: 'D1',
                    data: { sku: 'Artisan Sourdough', status: 'OPTIMAL', stock: 16 },
                  })
                }}
                className="px-2 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs flex items-center justify-between text-slate-700 hover:border-slate-300 shadow-2xs font-semibold"
              >
                <span>D1 Sourdough</span>
                <span className="text-emerald-700 font-mono text-[11px] font-bold">98% Available</span>
              </div>
            )}
          </div>

          {/* BEVERAGES */}
          <div
            onClick={() =>
              handleFixtureClick({
                type: 'zone',
                id: 'zone-beverages',
                name: 'Beverages',
                code: 'BEVERAGES',
                data: { occupancy: 18, demand: 'HIGH', highRiskSku: 'Zero Sugar Cola', predictedStockout: '9 min' },
              })
            }
            className={cn(
              'rounded-xl border bg-white p-3 flex flex-col justify-between space-y-2 cursor-pointer transition-all shadow-2xs',
              selectedFixtureId === 'zone-beverages' ? 'border-sky-500 ring-2 ring-sky-500/20 bg-sky-50/50' : 'border-slate-200 hover:border-slate-300'
            )}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
              <div>
                <span className="text-xs font-bold text-slate-900 uppercase">Beverages</span>
                <div className="text-[11px] font-mono text-sky-700 font-semibold">18 shoppers • High Demand</div>
              </div>
              <button
                onClick={(e) =>
                  handleOpenCamModal(e, {
                    code: 'C03',
                    name: 'Beverages Camera',
                    zone: 'Beverages',
                    summary: '18 Shoppers • B4 Zero Cola 17% • Spill Alert Cooler 2',
                    resolution: '1080p @ 29fps',
                    fps: 29,
                    latencyMs: 15,
                  })
                }
                className="p-1 rounded-md bg-slate-50 border border-slate-200 hover:border-sky-300 text-slate-500 hover:text-sky-700 text-[10px] font-mono flex items-center gap-1 shadow-2xs font-semibold"
              >
                <Camera className="h-3 w-3 text-sky-600" />
                <span>C03</span>
              </button>
            </div>

            {layers.shelves && (
              <div
                onClick={(e) => {
                  e.stopPropagation()
                  handleFixtureClick({
                    type: 'shelf',
                    id: 'shelf-b4',
                    name: 'B4 Zero Cola',
                    code: 'B4',
                    data: { sku: 'Zero Sugar Cola', availability: '17%', visibleUnits: 3, backroom: 14, predictedStockout: '9 min' },
                  })
                }}
                className={cn(
                  'rounded-lg border bg-rose-50/30 p-2 text-xs flex items-center justify-between transition-all cursor-pointer shadow-2xs',
                  selectedFixtureId === 'shelf-b4' ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50' : 'border-rose-200 hover:border-rose-400'
                )}
              >
                <div>
                  <span className="font-bold text-slate-900 block">B4 Zero Cola</span>
                  <span className="text-[10px] text-slate-500 font-mono">17% left • Empty in 9m</span>
                </div>
                <span className="text-[10px] text-rose-700 font-mono underline font-semibold cursor-pointer">[ Replenish ]</span>
              </div>
            )}

            {layers.alerts && (
              <div
                onClick={(e) => {
                  e.stopPropagation()
                  handleFixtureClick({
                    type: 'incident',
                    id: 'inc-spill-cooler2',
                    name: 'Cooler 2 Spill',
                    code: 'INC-SPILL',
                    data: { location: 'Cooler 2 Floor', assignedTo: 'Sarah Jenkins', status: 'IN_PROGRESS' },
                  })
                }}
                className="flex items-center justify-between text-[11px] font-mono text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 hover:border-amber-400 cursor-pointer shadow-2xs font-semibold"
              >
                <div className="flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3 text-amber-600 shrink-0" />
                  <span>Cooler 2 Spill</span>
                </div>
                <span className="text-[10px] text-amber-800 font-sans">Sarah assigned</span>
              </div>
            )}
          </div>
        </div>

        {/* BOTTOM: Electronics & Checkout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 z-10 shrink-0 items-stretch">
          {/* ELECTRONICS (5 cols) */}
          <div
            onClick={() =>
              handleFixtureClick({
                type: 'zone',
                id: 'zone-elec',
                name: 'Electronics',
                code: 'ELEC',
                data: { occupancy: 12, avgDwell: '4m 05s', engagement: 'HIGH', security: 'NORMAL' },
              })
            }
            className={cn(
              'md:col-span-5 rounded-xl border bg-white p-3 flex flex-col justify-between space-y-1.5 cursor-pointer transition-all shadow-2xs',
              selectedFixtureId === 'zone-elec' ? 'border-sky-500 ring-2 ring-sky-500/20 bg-sky-50/50' : 'border-slate-200 hover:border-slate-300'
            )}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
              <div>
                <span className="text-xs font-bold text-slate-900 uppercase">Electronics</span>
                <div className="text-[11px] font-mono text-sky-700 font-semibold">12 shoppers • Peak Dwell</div>
              </div>
              <div className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 font-bold">
                Security Normal
              </div>
            </div>

            <div className="text-[11px] font-mono text-slate-500 flex items-center justify-between">
              <span>Avg Dwell: <strong className="text-slate-900">4m 05s</strong></span>
              <span>Alerts: <strong className="text-slate-900">0</strong></span>
            </div>
          </div>

          {/* CHECKOUT (7 cols) */}
          <div
            onClick={() =>
              handleFixtureClick({
                type: 'zone',
                id: 'zone-checkout-plaza',
                name: 'Checkout',
                code: 'CHECKOUT',
                data: { lanesCount: 4, bestCheckout: 'C2 (~1.4 min wait)' },
              })
            }
            className={cn(
              'md:col-span-7 rounded-xl border bg-white p-3 flex flex-col justify-between space-y-1.5 cursor-pointer transition-all shadow-2xs',
              selectedFixtureId === 'zone-checkout-plaza' ? 'border-sky-500 ring-2 ring-sky-500/20 bg-sky-50/50' : 'border-slate-200 hover:border-slate-300'
            )}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 uppercase">Checkout</span>
                <button
                  onClick={(e) =>
                    handleOpenCamModal(e, {
                      code: 'C05',
                      name: 'Checkout Camera',
                      zone: 'Checkout',
                      summary: 'C1 Congested (8 in queue • 5.4m wait) • C2 Healthy',
                      resolution: '1080p @ 30fps',
                      fps: 30,
                      latencyMs: 13,
                    })
                  }
                  className="p-0.5 rounded-md bg-slate-50 border border-slate-200 text-[10px] text-slate-500 font-mono hover:text-sky-700 flex items-center gap-1 shadow-2xs font-semibold"
                >
                  <Camera className="h-3 w-3 text-sky-600" />
                  <span>C05</span>
                </button>
              </div>

              <span className="text-[10.5px] font-mono text-emerald-700 font-bold">
                Best: {bestLaneStr}
              </span>
            </div>

            {/* 4 Lanes */}
            {layers.queues && (
              <div className="grid grid-cols-4 gap-1.5 text-xs font-mono">
                {/* C1 */}
                <div
                  onClick={(e) => {
                    e.stopPropagation()
                    handleFixtureClick({
                      type: 'checkout',
                      id: 'lane-1',
                      name: 'Counter C1',
                      code: 'C1',
                      data: { queueLength: q1?.currentQueueLength || 0, waitTime: `${((q1?.currentWaitTimeSeconds || 0) / 60).toFixed(1)} min`, predictedIn5m: Math.round((q1?.currentQueueLength || 0) * 1.6), status: q1?.status === 'CONGESTED' ? 'CRITICAL' : 'ACTIVE', staffName: q1?.assignedStaffName || 'Elena Rostova' },
                    })
                  }}
                  className={cn(
                    'p-1.5 rounded-lg border text-center transition-colors cursor-pointer shadow-2xs',
                    selectedFixtureId === 'lane-1' ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50' : `${q1?.status === 'CONGESTED' ? 'border-rose-300 bg-rose-50/40 hover:border-rose-400' : 'bg-slate-50 border-slate-200 hover:border-slate-300'}`
                  )}
                >
                  <div className="text-[9.5px] text-slate-500">C1 (Elena)</div>
                  <div className={`font-bold text-xs ${q1?.status === 'CONGESTED' ? 'text-rose-700' : 'text-emerald-700'}`}>{fmtLane(q1)}</div>
                </div>

                {/* C2 */}
                <div
                  onClick={(e) => {
                    e.stopPropagation()
                    handleFixtureClick({
                      type: 'checkout',
                      id: 'lane-2',
                      name: 'Counter C2',
                      code: 'C2',
                      data: { queueLength: q2?.currentQueueLength || 0, waitTime: `${((q2?.currentWaitTimeSeconds || 0) / 60).toFixed(1)} min`, status: q2?.status || 'ACTIVE', staffName: q2?.assignedStaffName || 'Marcus Vance' },
                    })
                  }}
                  className={cn(
                    'p-1.5 rounded-lg bg-slate-50 border text-center transition-colors cursor-pointer shadow-2xs',
                    selectedFixtureId === 'lane-2' ? 'border-sky-500 ring-2 ring-sky-500/20 bg-sky-50' : 'border-slate-200 hover:border-emerald-300'
                  )}
                >
                  <div className="text-[9.5px] text-slate-500">C2 (Marcus)</div>
                  <div className="text-emerald-700 font-bold text-xs">{fmtLane(q2)}</div>
                </div>

                {/* C3 */}
                <div
                  onClick={(e) => {
                    e.stopPropagation()
                    handleFixtureClick({
                      type: 'checkout',
                      id: 'lane-3',
                      name: 'Counter C3',
                      code: 'C3',
                      data: { queueLength: 0, waitTime: '0 min', status: 'STANDBY' },
                    })
                  }}
                  className={cn(
                    'p-1.5 rounded-lg bg-amber-50/30 border text-center transition-colors cursor-pointer shadow-2xs',
                    selectedFixtureId === 'lane-3' ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50' : 'border-amber-200 hover:border-amber-300'
                  )}
                >
                  <div className="text-[9.5px] text-amber-800 font-medium">C3 Standby</div>
                  <div className="text-amber-800 font-bold text-[10px]">[ Open C3 ]</div>
                </div>

                {/* C4 */}
                <div
                  onClick={(e) => {
                    e.stopPropagation()
                    handleFixtureClick({
                      type: 'checkout',
                      id: 'lane-4',
                      name: 'Counter C4',
                      code: 'C4',
                      data: { queueLength: q4?.currentQueueLength || 0, waitTime: `${((q4?.currentWaitTimeSeconds || 0) / 60).toFixed(1)} min`, status: q4?.status || 'ACTIVE' },
                    })
                  }}
                  className={cn(
                    'p-1.5 rounded-lg bg-slate-50 border text-center transition-colors cursor-pointer shadow-2xs',
                    selectedFixtureId === 'lane-4' ? 'border-sky-500 ring-2 ring-sky-500/20 bg-sky-50' : 'border-slate-200 hover:border-sky-300'
                  )}
                >
                  <div className="text-[9.5px] text-slate-500">C4 (Self)</div>
                  <div className="text-sky-700 font-bold text-xs">{fmtLane(q4)}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100 shrink-0 font-sans">
        <div className="flex items-center gap-3 font-medium">
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-rose-500" /> Critical</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-500" /> Warning</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Healthy</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-purple-500" /> Staff</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-sky-500" /> Shopper</span>
        </div>
        <span className="text-slate-400 hidden md:inline">Click any zone, shelf, or counter for live inspection</span>
      </div>

      {/* Camera Inspection Modal */}
      <Dialog
        open={!!activeCameraModal}
        onOpenChange={(open) => {
          if (!open) setActiveCameraModal(null)
        }}
      >
        <DialogContent className="bg-white border-slate-200 text-slate-900 max-w-2xl shadow-2xl rounded-xl font-sans">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between pr-6 text-sm font-sans">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200 text-xs font-mono font-bold">
                  {activeCameraModal?.code}
                </span>
                <span className="text-slate-900 font-bold">{activeCameraModal?.name}</span>
              </div>
              <span className="text-xs text-emerald-700 flex items-center gap-1.5 font-bold">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                LIVE
              </span>
            </DialogTitle>
          </DialogHeader>

          {activeCameraModal && (
            <div className="space-y-4 pt-2 font-sans">
              <div className="relative aspect-video rounded-xl bg-slate-950 border border-slate-200 overflow-hidden flex items-center justify-center shadow-inner">
                <div
                  className="absolute inset-0 opacity-15"
                  style={{
                    backgroundImage: `linear-gradient(to right, #1E293B 1px, transparent 1px), linear-gradient(to bottom, #1E293B 1px, transparent 1px)`,
                    backgroundSize: '24px 24px',
                  }}
                />
                <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="bg-black/70 px-2 py-0.5 rounded text-sky-300 border border-sky-500/30">
                      Camera Stream · 30 FPS
                    </span>
                    <span className="bg-black/70 px-2 py-0.5 rounded text-slate-300">
                      {activeCameraModal.resolution}
                    </span>
                  </div>
                  <div className="self-center border border-sky-400/80 bg-sky-500/10 px-4 py-6 rounded-lg text-center backdrop-blur-xs">
                    <span className="text-[10px] font-mono text-sky-300 bg-black/80 px-2 py-0.5 rounded font-bold">
                      Detection Field Active
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 bg-black/70 px-2 py-0.5 rounded self-start">
                    Latency: {activeCameraModal.latencyMs}ms
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs font-sans shadow-2xs">
                <div>
                  <span className="text-slate-500 block text-[10px]">Summary</span>
                  <span className="text-slate-900 font-bold">{activeCameraModal.summary}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 block text-[10px]">Location</span>
                  <span className="text-sky-700 font-mono font-bold">{activeCameraModal.zone}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

