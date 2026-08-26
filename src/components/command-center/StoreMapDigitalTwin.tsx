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
    <div className="rounded-lg border border-[#1E293B] bg-[#0F172A] p-4 flex flex-col justify-between shadow-sm relative overflow-hidden select-none h-full min-h-[560px] font-sans">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-[#1E293B] z-10 shrink-0">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <span>Store Map</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#131D31] text-cyan-300 border border-cyan-500/30 font-normal">
              Live Overview
            </span>
          </h3>
        </div>

        {/* Layer Toggles */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex flex-wrap items-center bg-[#090D14] p-0.5 rounded-lg border border-[#1E293B] text-[11px]">
            <button
              onClick={() => toggleLayer('people')}
              className={cn(
                'px-2 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer font-medium',
                layers.people ? 'bg-[#131D31] text-cyan-300 border border-cyan-500/40 shadow-sm' : 'text-slate-400 hover:text-slate-200'
              )}
            >
              <Users className="h-3 w-3" /> People
            </button>

            <button
              onClick={() => toggleLayer('heatmap')}
              className={cn(
                'px-2 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer font-medium',
                layers.heatmap ? 'bg-amber-950 text-amber-300 border border-amber-500/40 shadow-sm' : 'text-slate-400 hover:text-slate-200'
              )}
            >
              <Flame className="h-3 w-3" /> Heatmap
            </button>

            <button
              onClick={() => toggleLayer('shelves')}
              className={cn(
                'px-2 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer font-medium',
                layers.shelves ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40 shadow-sm' : 'text-slate-400 hover:text-slate-200'
              )}
            >
              <Box className="h-3 w-3" /> Shelves
            </button>

            <button
              onClick={() => toggleLayer('queues')}
              className={cn(
                'px-2 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer font-medium',
                layers.queues ? 'bg-blue-950 text-blue-300 border border-blue-500/40 shadow-sm' : 'text-slate-400 hover:text-slate-200'
              )}
            >
              <ListOrdered className="h-3 w-3" /> Queues
            </button>

            <button
              onClick={() => toggleLayer('staff')}
              className={cn(
                'px-2 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer font-medium',
                layers.staff ? 'bg-purple-950 text-purple-300 border border-purple-500/40 shadow-sm' : 'text-slate-400 hover:text-slate-200'
              )}
            >
              <UserCheck className="h-3 w-3" /> Staff
            </button>

            <button
              onClick={() => toggleLayer('alerts')}
              className={cn(
                'px-2 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer font-medium',
                layers.alerts ? 'bg-rose-950 text-rose-300 border border-rose-500/40 shadow-sm' : 'text-slate-400 hover:text-slate-200'
              )}
            >
              <ShieldAlert className="h-3 w-3" /> Alerts
            </button>
          </div>

          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#090D14] border border-[#1E293B] text-[10.5px] font-mono text-slate-400">
            <span className={cn('h-1.5 w-1.5 rounded-full', isLive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400')} />
            <span>{isLive ? 'Updated 2s ago' : 'Stale'}</span>
          </div>
        </div>
      </div>

      {/* Map Canvas */}
      <div className="relative flex-1 w-full my-2.5 rounded-lg bg-[#070A10] border border-[#1E293B] overflow-hidden flex flex-col justify-between p-3 min-h-[460px]">
        {/* Floor Pattern */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(to right, #1E293B 1px, transparent 1px), linear-gradient(to bottom, #1E293B 1px, transparent 1px)`,
            backgroundSize: '28px 28px',
          }}
        />

        {/* Heatmap Layer */}
        {layers.heatmap && (
          <div className="absolute inset-0 pointer-events-none transition-opacity duration-300 z-0">
            <div className="absolute top-[28%] left-[12%] h-40 w-40 rounded-full bg-emerald-500/15 blur-2xl" />
            <div className="absolute top-[28%] right-[12%] h-40 w-40 rounded-full bg-rose-500/20 blur-2xl" />
            <div className="absolute bottom-[10%] right-[10%] h-44 w-44 rounded-full bg-rose-600/25 blur-2xl animate-pulse" />
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
              'rounded-lg border bg-[#0C121D] px-3 py-2 flex items-center justify-between cursor-pointer transition-all hover:border-cyan-500/40 shadow-sm',
              selectedFixtureId === 'zone-entrance' ? 'border-cyan-400 ring-1 ring-cyan-400/40 bg-[#0F172A]' : 'border-[#1E293B]'
            )}
          >
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-white uppercase tracking-wide">Entrance</span>
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
                className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/30 text-[10px] text-cyan-300 font-mono hover:bg-cyan-900"
              >
                <Camera className="h-2.5 w-2.5 text-cyan-400" />
                <span>C01</span>
              </button>

              <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono text-slate-300">
                <span>In: <strong className="text-emerald-400">14</strong></span>
                <span className="text-slate-600">/</span>
                <span>Out: <strong className="text-slate-400">9</strong></span>
                <span className="text-slate-600">|</span>
                <span>Net: <strong className="text-cyan-300">+5</strong></span>
              </div>
            </div>

            {layers.people && (
              <div className="flex items-center gap-1 text-[11px] text-cyan-400 font-mono">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
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
              'rounded-lg border bg-[#0B101A] p-3 flex flex-col justify-between space-y-2 cursor-pointer transition-all shadow-sm',
              selectedFixtureId === 'zone-produce' ? 'border-cyan-400 ring-1 ring-cyan-400/40 bg-[#0E1522]' : 'border-[#1E293B] hover:border-slate-600'
            )}
          >
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-1.5">
              <div>
                <span className="text-xs font-bold text-white uppercase">Produce</span>
                <div className="text-[11px] font-mono text-cyan-300">28 shoppers • High Traffic</div>
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
                className="p-1 rounded bg-[#090D14] border border-[#1E293B] hover:border-cyan-500/40 text-slate-400 hover:text-cyan-300 text-[10px] font-mono flex items-center gap-1"
              >
                <Camera className="h-3 w-3 text-cyan-400" />
                <span>C02</span>
              </button>
            </div>

            <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
              <span>Dwell: <strong className="text-white">2m 14s</strong></span>
              <span>Health: <strong className="text-emerald-400">92%</strong></span>
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
                    data: { sku: 'Royal Gala Organic Apples', compliance: 92, stock: 38, status: 'OPTIMAL' },
                  })
                }}
                className={cn(
                  'rounded border bg-[#070A10] p-2 text-xs flex items-center justify-between transition-all cursor-pointer',
                  selectedFixtureId === 'shelf-a1' ? 'border-emerald-400 ring-1 ring-emerald-400/40 bg-emerald-950/20' : 'border-emerald-500/40 hover:border-emerald-400'
                )}
              >
                <span className="font-semibold text-white">A1 Gala Apples</span>
                <span className="text-emerald-400 font-mono font-bold text-[11px]">92% In-Stock</span>
              </div>
            )}

            {layers.staff && (
              <div className="flex items-center gap-1 text-[10.5px] text-purple-300 bg-purple-950/80 px-2 py-0.5 rounded border border-purple-500/30 w-fit font-mono">
                <UserCheck className="h-3 w-3 text-purple-400" />
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
              'rounded-lg border bg-[#0B101A] p-3 flex flex-col justify-between space-y-2 cursor-pointer transition-all shadow-sm',
              selectedFixtureId === 'zone-dairy' ? 'border-cyan-400 ring-1 ring-cyan-400/40 bg-[#0E1522]' : 'border-[#1E293B] hover:border-slate-600'
            )}
          >
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-1.5">
              <div>
                <span className="text-xs font-bold text-white uppercase">Dairy & Bakery</span>
                <div className="text-[11px] font-mono text-cyan-300">22 shoppers • Medium Traffic</div>
              </div>
              <div className="text-right font-mono text-[10px] text-slate-400">
                Dwell: <strong className="text-white">1m 48s</strong>
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
                  'rounded border bg-[#070A10] p-2 text-xs flex items-center justify-between transition-all cursor-pointer',
                  selectedFixtureId === 'shelf-c2' ? 'border-rose-400 ring-1 ring-rose-400 bg-rose-950/30' : 'border-rose-500/60 hover:border-rose-400'
                )}
              >
                <div>
                  <span className="font-semibold text-white block">C2 Whole Milk</span>
                  <span className="text-[10px] text-slate-400 font-mono">Backroom: 12 units</span>
                </div>
                <div className="text-right">
                  <span className="text-rose-400 font-mono font-bold text-[11px] block">OUT OF STOCK</span>
                  <span className="text-[10px] text-rose-300 font-mono underline font-semibold">[ Refill ]</span>
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
                className="px-2 py-1 rounded bg-[#070A10] border border-[#1E293B] text-xs flex items-center justify-between text-slate-300 hover:border-slate-500"
              >
                <span>D1 Sourdough</span>
                <span className="text-emerald-400 font-mono text-[11px]">98% Available</span>
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
              'rounded-lg border bg-[#0B101A] p-3 flex flex-col justify-between space-y-2 cursor-pointer transition-all shadow-sm',
              selectedFixtureId === 'zone-beverages' ? 'border-cyan-400 ring-1 ring-cyan-400/40 bg-[#0E1522]' : 'border-[#1E293B] hover:border-slate-600'
            )}
          >
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-1.5">
              <div>
                <span className="text-xs font-bold text-white uppercase">Beverages</span>
                <div className="text-[11px] font-mono text-cyan-300">18 shoppers • High Demand</div>
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
                className="p-1 rounded bg-[#090D14] border border-[#1E293B] hover:border-cyan-500/40 text-slate-400 hover:text-cyan-300 text-[10px] font-mono flex items-center gap-1"
              >
                <Camera className="h-3 w-3 text-cyan-400" />
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
                  'rounded border bg-[#070A10] p-2 text-xs flex items-center justify-between transition-all cursor-pointer',
                  selectedFixtureId === 'shelf-b4' ? 'border-rose-400 ring-1 ring-rose-400 bg-rose-950/30' : 'border-rose-500/60 hover:border-rose-400'
                )}
              >
                <div>
                  <span className="font-semibold text-white block">B4 Zero Cola</span>
                  <span className="text-[10px] text-slate-400 font-mono">17% left • Empty in 9m</span>
                </div>
                <span className="text-[10px] text-rose-300 font-mono underline font-semibold cursor-pointer">[ Replenish ]</span>
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
                className="flex items-center justify-between text-[11px] font-mono text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/40 hover:border-amber-400 cursor-pointer"
              >
                <div className="flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3 text-amber-400 shrink-0" />
                  <span>Cooler 2 Spill</span>
                </div>
                <span className="text-[10px] text-amber-400 font-sans">Sarah assigned</span>
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
              'md:col-span-5 rounded-lg border bg-[#0B101A] p-3 flex flex-col justify-between space-y-1.5 cursor-pointer transition-all shadow-sm',
              selectedFixtureId === 'zone-elec' ? 'border-cyan-400 ring-1 ring-cyan-400/40 bg-[#0E1522]' : 'border-[#1E293B] hover:border-slate-600'
            )}
          >
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-1.5">
              <div>
                <span className="text-xs font-bold text-white uppercase">Electronics</span>
                <div className="text-[11px] font-mono text-cyan-300">12 shoppers • Peak Dwell</div>
              </div>
              <div className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-500/30">
                Security Normal
              </div>
            </div>

            <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
              <span>Avg Dwell: <strong className="text-white">4m 05s</strong></span>
              <span>Alerts: <strong className="text-white">0</strong></span>
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
              'md:col-span-7 rounded-lg border bg-[#0B101A] p-3 flex flex-col justify-between space-y-1.5 cursor-pointer transition-all shadow-sm',
              selectedFixtureId === 'zone-checkout-plaza' ? 'border-cyan-400 ring-1 ring-cyan-400/40 bg-[#0E1522]' : 'border-[#1E293B] hover:border-slate-600'
            )}
          >
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white uppercase">Checkout</span>
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
                  className="p-0.5 rounded bg-[#090D14] border border-[#1E293B] text-[10px] text-slate-400 font-mono hover:text-cyan-300 flex items-center gap-1"
                >
                  <Camera className="h-3 w-3 text-cyan-400" />
                  <span>C05</span>
                </button>
              </div>

              <span className="text-[10.5px] font-mono text-emerald-400 font-semibold">
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
                    'p-1.5 rounded bg-[#070A10] border text-center transition-colors cursor-pointer',
                    selectedFixtureId === 'lane-1' ? 'border-rose-400 ring-1 ring-rose-400 bg-rose-950/40' : `${q1?.status === 'CONGESTED' ? 'border-rose-500/70 hover:border-rose-400' : 'border-[#1E293B] hover:border-emerald-400'}`
                  )}
                >
                  <div className="text-[9.5px] text-slate-400">C1 (Elena)</div>
                  <div className={`font-bold text-xs ${q1?.status === 'CONGESTED' ? 'text-rose-400' : 'text-emerald-400'}`}>{fmtLane(q1)}</div>
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
                    'p-1.5 rounded bg-[#070A10] border text-center transition-colors cursor-pointer',
                    selectedFixtureId === 'lane-2' ? 'border-emerald-400 ring-1 ring-emerald-400 bg-[#0E1522]' : 'border-[#1E293B] hover:border-emerald-400'
                  )}
                >
                  <div className="text-[9.5px] text-slate-400">C2 (Marcus)</div>
                  <div className="text-emerald-400 font-bold text-xs">{fmtLane(q2)}</div>
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
                    'p-1.5 rounded bg-[#070A10] border text-center transition-colors cursor-pointer',
                    selectedFixtureId === 'lane-3' ? 'border-amber-400 ring-1 ring-amber-400 bg-amber-950/30' : 'border-amber-500/30 hover:border-amber-500/60'
                  )}
                >
                  <div className="text-[9.5px] text-amber-400 font-medium">C3 Standby</div>
                  <div className="text-amber-300 font-bold text-[10px]">[ Open C3 ]</div>
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
                    'p-1.5 rounded bg-[#070A10] border text-center transition-colors cursor-pointer',
                    selectedFixtureId === 'lane-4' ? 'border-cyan-400 ring-1 ring-cyan-400 bg-[#0E1522]' : 'border-[#1E293B] hover:border-cyan-500/40'
                  )}
                >
                  <div className="text-[9.5px] text-slate-400">C4 (Self)</div>
                  <div className="text-cyan-300 font-bold text-xs">{fmtLane(q4)}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-[#1E293B] shrink-0">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-rose-500" /> Critical</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-400" /> Warning</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-400" /> Healthy</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-purple-400" /> Staff</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-cyan-400" /> Shopper</span>
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
        <DialogContent className="bg-[#0B0F17] border-[#1E293B] text-slate-100 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between pr-6 font-mono text-sm">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40 text-xs font-bold">
                  {activeCameraModal?.code}
                </span>
                <span>{activeCameraModal?.name}</span>
              </div>
              <span className="text-xs text-emerald-400 flex items-center gap-1.5 font-normal">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                LIVE
              </span>
            </DialogTitle>
          </DialogHeader>

          {activeCameraModal && (
            <div className="space-y-4 pt-2 font-sans">
              <div className="relative aspect-video rounded-lg bg-[#070A10] border border-[#1E293B] overflow-hidden flex items-center justify-center">
                <div
                  className="absolute inset-0 opacity-15"
                  style={{
                    backgroundImage: `linear-gradient(to right, #1E293B 1px, transparent 1px), linear-gradient(to bottom, #1E293B 1px, transparent 1px)`,
                    backgroundSize: '24px 24px',
                  }}
                />
                <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="bg-black/70 px-2 py-0.5 rounded text-cyan-300 border border-cyan-500/30">
                      Camera Stream · 30 FPS
                    </span>
                    <span className="bg-black/70 px-2 py-0.5 rounded text-slate-300">
                      {activeCameraModal.resolution}
                    </span>
                  </div>
                  <div className="self-center border border-cyan-400/80 bg-cyan-500/10 px-4 py-6 rounded text-center">
                    <span className="text-[10px] font-mono text-cyan-300 bg-black/80 px-1.5 py-0.5 rounded">
                      Detection Field Active
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 bg-black/70 px-2 py-0.5 rounded self-start">
                    Latency: {activeCameraModal.latencyMs}ms
                  </div>
                </div>
              </div>

              <div className="p-3 rounded bg-[#0F172A] border border-[#1E293B] flex items-center justify-between text-xs font-mono">
                <div>
                  <span className="text-slate-400 block text-[10px] font-sans">Summary</span>
                  <span className="text-white font-semibold">{activeCameraModal.summary}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[10px] font-sans">Location</span>
                  <span className="text-cyan-300">{activeCameraModal.zone}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

