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
  const bestLane = [q1, q2, q3, q4].filter(Boolean).sort((a, b) => (a!.currentWaitTimeSeconds) - (b!.currentWaitTimeSeconds))[0]
  const bestLaneStr = bestLane ? `C${bestLane.laneNumber} (~${(bestLane.currentWaitTimeSeconds / 60).toFixed(1)} min wait)` : 'No lanes reporting'

  // Real zone/shelf/staff/incident data — replaces the fixed placeholder
  // numbers this map used to show regardless of actual store state.
  const zones = useAppStore((s) => s.zones)
  const shelfItems = useAppStore((s) => s.shelfItems)
  const staffMembers = useAppStore((s) => s.staffMembers)
  const incidents = useAppStore((s) => s.incidents)

  const findZone = (namePart: string) => zones.find((z) => z.name.toLowerCase().includes(namePart.toLowerCase()))
  const shelvesInZone = (zoneName: string) => shelfItems.filter((sh) => sh.zoneName === zoneName)
  const STATUS_RANK: Record<string, number> = { OUT_OF_STOCK: 0, CRITICAL: 1, LOW: 2, MISPLACED: 3, OPTIMAL: 4 }
  const worstShelfIn = (zoneName: string) =>
    [...shelvesInZone(zoneName)].sort((a, b) => (STATUS_RANK[a.status] ?? 9) - (STATUS_RANK[b.status] ?? 9))[0]
  const healthyPct = (zoneName: string) => {
    const inZone = shelvesInZone(zoneName)
    if (!inZone.length) return null
    return Math.round((inZone.filter((sh) => sh.status === 'OPTIMAL').length / inZone.length) * 100)
  }
  const shelfAvailabilityPct = (sh: (typeof shelfItems)[number] | undefined) =>
    sh && sh.capacityCount > 0 ? Math.round((sh.currentCount / sh.capacityCount) * 100) : null
  const fmtDwell = (seconds: number) => `${Math.floor(seconds / 60)}m ${Math.round(seconds % 60)}s`
  const staffInZone = (namePart: string) =>
    staffMembers.find((m) => m.currentZoneName?.toLowerCase().includes(namePart.toLowerCase()) && m.status !== 'ON_BREAK' && m.status !== 'OFF_DUTY')
  const activeIncident = incidents.find((i) => i.status !== 'RESOLVED' && i.status !== 'DISMISSED')

  const zEntrance = findZone('Entrance')
  const zProduce = findZone('Produce')
  const zDairy = findZone('Dairy')
  const zBeverages = findZone('Beverages')
  const zElectronics = findZone('Electronics')
  const produceShelf = worstShelfIn(zProduce?.name || 'Fresh Produce & Fruits')
  const dairyShelf = worstShelfIn(zDairy?.name || 'Dairy, Bakery & Chilled')
  const beverageShelf = worstShelfIn(zBeverages?.name || 'Beverages & Snacks Aisle')
  const produceStaff = staffInZone('Produce')

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

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs">
            <span className={cn('h-2 w-2 rounded-full', isLive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500')} />
            <span>{isLive ? 'Live Floor' : 'Offline'}</span>
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
                data: { occupancy: zEntrance?.currentOccupancy ?? 0, capacity: zEntrance?.capacity ?? 0, alertCount: zEntrance?.alertCount ?? 0, camera: 'CAM-01' },
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
                    summary: `${zEntrance?.currentOccupancy ?? 0} shoppers in zone • ${zEntrance?.alertCount ?? 0} alerts`,
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
                <span>Capacity: <strong className="text-slate-900">{zEntrance?.capacity ?? 0}</strong></span>
                <span className="text-slate-300">|</span>
                <span>Alerts: <strong className={(zEntrance?.alertCount ?? 0) > 0 ? 'text-rose-700' : 'text-emerald-700'}>{zEntrance?.alertCount ?? 0}</strong></span>
              </div>
            </div>

            {layers.people && (
              <div className="flex items-center gap-1 text-[11px] text-sky-700 font-mono font-bold">
                <span className="h-1.5 w-1.5 rounded-full bg-sky-600" />
                <span>{zEntrance?.currentOccupancy ?? 0} Shoppers</span>
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
                data: { occupancy: zProduce?.currentOccupancy ?? 0, traffic: zProduce?.currentOccupancy && zProduce.capacity ? (zProduce.currentOccupancy / zProduce.capacity > 0.6 ? 'HIGH' : zProduce.currentOccupancy / zProduce.capacity > 0.3 ? 'MEDIUM' : 'LOW') : 'LOW', avgDwell: fmtDwell(zProduce?.avgDwellTimeSeconds ?? 0), shelfHealth: healthyPct(zProduce?.name || 'Fresh Produce & Fruits'), staff: produceStaff?.name },
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
                <div className="text-[11px] font-mono text-sky-700 font-semibold">{zProduce?.currentOccupancy ?? 0} shoppers</div>
              </div>
              <button
                onClick={(e) =>
                  handleOpenCamModal(e, {
                    code: 'C02',
                    name: 'Produce Camera',
                    zone: 'Produce',
                    summary: `${zProduce?.currentOccupancy ?? 0} Shoppers${produceShelf ? ` • ${produceShelf.shelfName || produceShelf.productName} ${shelfAvailabilityPct(produceShelf) ?? '—'}%` : ''}`,
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
              <span>Dwell: <strong className="text-slate-900">{fmtDwell(zProduce?.avgDwellTimeSeconds ?? 0)}</strong></span>
              <span>Health: <strong className="text-emerald-700">{healthyPct(zProduce?.name || 'Fresh Produce & Fruits') ?? '—'}%</strong></span>
            </div>

            {layers.shelves && produceShelf && (
              <div
                onClick={(e) => {
                  e.stopPropagation()
                  handleFixtureClick({
                    type: 'shelf',
                    id: `shelf-${produceShelf.shelfId}`,
                    name: produceShelf.shelfName || produceShelf.productName,
                    code: produceShelf.shelfId,
                    data: { sku: produceShelf.productName, compliance: produceShelf.planogramComplianceScore, stock: produceShelf.currentCount, status: produceShelf.status },
                  })
                }}
                className={cn(
                  'rounded-lg border bg-slate-50 p-2 text-xs flex items-center justify-between transition-all cursor-pointer shadow-2xs',
                  selectedFixtureId === `shelf-${produceShelf.shelfId}` ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/50' : 'border-slate-200 hover:border-emerald-300'
                )}
              >
                <span className="font-semibold text-slate-900">{produceShelf.shelfId} {produceShelf.productName}</span>
                <span className="text-emerald-700 font-mono font-bold text-[11px]">{shelfAvailabilityPct(produceShelf) ?? '—'}% In-Stock</span>
              </div>
            )}

            {layers.staff && produceStaff && (
              <div className="flex items-center gap-1 text-[10.5px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200 w-fit font-mono font-semibold">
                <UserCheck className="h-3 w-3 text-purple-600" />
                <span>{produceStaff.name} • {produceStaff.currentTaskDescription || produceStaff.status}</span>
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
                data: { occupancy: zDairy?.currentOccupancy ?? 0, avgDwell: fmtDwell(zDairy?.avgDwellTimeSeconds ?? 0), primaryIssue: dairyShelf && dairyShelf.status !== 'OPTIMAL' ? `${dairyShelf.shelfId} ${dairyShelf.productName} ${dairyShelf.status}` : 'None' },
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
                <div className="text-[11px] font-mono text-sky-700 font-semibold">{zDairy?.currentOccupancy ?? 0} shoppers</div>
              </div>
              <div className="text-right font-mono text-[10px] text-slate-500">
                Dwell: <strong className="text-slate-900">{fmtDwell(zDairy?.avgDwellTimeSeconds ?? 0)}</strong>
              </div>
            </div>

            {layers.shelves && dairyShelf && (
              <div
                onClick={(e) => {
                  e.stopPropagation()
                  handleFixtureClick({
                    type: 'shelf',
                    id: `shelf-${dairyShelf.shelfId}`,
                    name: `${dairyShelf.shelfId} ${dairyShelf.productName}`,
                    code: dairyShelf.shelfId,
                    data: { sku: dairyShelf.productName, status: dairyShelf.status, visibleUnits: dairyShelf.currentCount, backroomStock: dairyShelf.backroomUnits ?? 0 },
                  })
                }}
                className={cn(
                  'rounded-lg border p-2 text-xs flex items-center justify-between transition-all cursor-pointer shadow-2xs',
                  dairyShelf.status === 'OPTIMAL' ? 'bg-slate-50 border-slate-200 hover:border-slate-300' : 'bg-rose-50/30 border-rose-200 hover:border-rose-400',
                  selectedFixtureId === `shelf-${dairyShelf.shelfId}` && 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50'
                )}
              >
                <div>
                  <span className="font-bold text-slate-900 block">{dairyShelf.shelfId} {dairyShelf.productName}</span>
                  <span className="text-[10px] text-slate-500 font-mono">Backroom: {dairyShelf.backroomUnits ?? 0} units</span>
                </div>
                <div className="text-right">
                  <span className={cn('font-mono font-bold text-[11px] block', dairyShelf.status === 'OPTIMAL' ? 'text-emerald-700' : 'text-rose-700')}>
                    {dairyShelf.status.replace(/_/g, ' ')}
                  </span>
                  {dairyShelf.status !== 'OPTIMAL' && (
                    <span className="text-[10px] text-rose-700 font-mono underline font-semibold">[ Refill ]</span>
                  )}
                </div>
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
                data: { occupancy: zBeverages?.currentOccupancy ?? 0, highRiskSku: beverageShelf?.productName, predictedStockout: beverageShelf?.minutesUntilStockout != null ? `${beverageShelf.minutesUntilStockout} min` : undefined },
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
                <div className="text-[11px] font-mono text-sky-700 font-semibold">{zBeverages?.currentOccupancy ?? 0} shoppers</div>
              </div>
              <button
                onClick={(e) =>
                  handleOpenCamModal(e, {
                    code: 'C03',
                    name: 'Beverages Camera',
                    zone: 'Beverages',
                    summary: `${zBeverages?.currentOccupancy ?? 0} Shoppers${beverageShelf ? ` • ${beverageShelf.shelfId} ${beverageShelf.productName} ${shelfAvailabilityPct(beverageShelf) ?? '—'}%` : ''}`,
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

            {layers.shelves && beverageShelf && (
              <div
                onClick={(e) => {
                  e.stopPropagation()
                  handleFixtureClick({
                    type: 'shelf',
                    id: `shelf-${beverageShelf.shelfId}`,
                    name: `${beverageShelf.shelfId} ${beverageShelf.productName}`,
                    code: beverageShelf.shelfId,
                    data: { sku: beverageShelf.productName, availability: `${shelfAvailabilityPct(beverageShelf) ?? '—'}%`, visibleUnits: beverageShelf.currentCount, backroom: beverageShelf.backroomUnits ?? 0, predictedStockout: beverageShelf.minutesUntilStockout != null ? `${beverageShelf.minutesUntilStockout} min` : 'N/A' },
                  })
                }}
                className={cn(
                  'rounded-lg border p-2 text-xs flex items-center justify-between transition-all cursor-pointer shadow-2xs',
                  beverageShelf.status === 'OPTIMAL' ? 'bg-slate-50 border-slate-200 hover:border-slate-300' : 'bg-rose-50/30 border-rose-200 hover:border-rose-400',
                  selectedFixtureId === `shelf-${beverageShelf.shelfId}` && 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50'
                )}
              >
                <div>
                  <span className="font-bold text-slate-900 block">{beverageShelf.shelfId} {beverageShelf.productName}</span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {shelfAvailabilityPct(beverageShelf) ?? '—'}% left{beverageShelf.minutesUntilStockout != null ? ` • Empty in ${beverageShelf.minutesUntilStockout}m` : ''}
                  </span>
                </div>
                {beverageShelf.status !== 'OPTIMAL' && (
                  <span className="text-[10px] text-rose-700 font-mono underline font-semibold cursor-pointer">[ Replenish ]</span>
                )}
              </div>
            )}

            {layers.alerts && activeIncident && (
              <div
                onClick={(e) => {
                  e.stopPropagation()
                  handleFixtureClick({
                    type: 'incident',
                    id: activeIncident.id,
                    name: activeIncident.title,
                    code: activeIncident.id,
                    data: { location: activeIncident.zoneName, assignedTo: activeIncident.assignedToStaffName || 'Unassigned', status: activeIncident.status },
                  })
                }}
                className="flex items-center justify-between text-[11px] font-mono text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 hover:border-amber-400 cursor-pointer shadow-2xs font-semibold"
              >
                <div className="flex items-center gap-1 min-w-0">
                  <AlertTriangle className="h-3 w-3 text-amber-600 shrink-0" />
                  <span className="truncate">{activeIncident.title}</span>
                </div>
                <span className="text-[10px] text-amber-800 font-sans shrink-0">{activeIncident.assignedToStaffName || 'Unassigned'}</span>
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
                data: { occupancy: zElectronics?.currentOccupancy ?? 0, avgDwell: fmtDwell(zElectronics?.avgDwellTimeSeconds ?? 0), alertCount: zElectronics?.alertCount ?? 0 },
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
                <div className="text-[11px] font-mono text-sky-700 font-semibold">{zElectronics?.currentOccupancy ?? 0} shoppers</div>
              </div>
              <div className={cn(
                'text-[10px] font-mono px-2 py-0.5 rounded-md border font-bold',
                (zElectronics?.alertCount ?? 0) > 0 ? 'text-rose-700 bg-rose-50 border-rose-200' : 'text-emerald-700 bg-emerald-50 border-emerald-200'
              )}>
                {(zElectronics?.alertCount ?? 0) > 0 ? 'Security Alert' : 'Security Normal'}
              </div>
            </div>

            <div className="text-[11px] font-mono text-slate-500 flex items-center justify-between">
              <span>Avg Dwell: <strong className="text-slate-900">{fmtDwell(zElectronics?.avgDwellTimeSeconds ?? 0)}</strong></span>
              <span>Alerts: <strong className="text-slate-900">{zElectronics?.alertCount ?? 0}</strong></span>
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
                data: { lanesCount: [q1, q2, q3, q4].filter(Boolean).length, bestCheckout: bestLaneStr },
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
                      summary: [q1, q2, q3, q4]
                        .filter((q): q is NonNullable<typeof q> => !!q)
                        .map((q) => `C${q.laneNumber} ${q.status === 'CONGESTED' ? 'Congested' : 'Healthy'} (${q.currentQueueLength} in queue)`)
                        .join(' • ') || 'No lanes reporting',
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
                      data: { queueLength: q3?.currentQueueLength || 0, waitTime: `${((q3?.currentWaitTimeSeconds || 0) / 60).toFixed(1)} min`, status: q3?.status || 'STANDBY', staffName: q3?.assignedStaffName },
                    })
                  }}
                  className={cn(
                    'p-1.5 rounded-lg border text-center transition-colors cursor-pointer shadow-2xs',
                    q3?.status === 'STANDBY' || q3?.status === 'CLOSED' ? 'bg-amber-50/30 border-amber-200 hover:border-amber-300' : 'bg-slate-50 border-slate-200 hover:border-slate-300',
                    selectedFixtureId === 'lane-3' && 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50'
                  )}
                >
                  <div className="text-[9.5px] text-amber-800 font-medium">C3{q3?.assignedStaffName ? ` (${q3.assignedStaffName.split(' ')[0]})` : ''}</div>
                  {q3?.status === 'STANDBY' || q3?.status === 'CLOSED' ? (
                    <div className="text-amber-800 font-bold text-[10px]">[ Open C3 ]</div>
                  ) : (
                    <div className={cn('font-bold text-xs', q3?.status === 'CONGESTED' ? 'text-rose-700' : 'text-emerald-700')}>{fmtLane(q3)}</div>
                  )}
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

