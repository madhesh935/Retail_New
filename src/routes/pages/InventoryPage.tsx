import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  PackageCheck,
  Eye,
  Layers,
  Compass,
  CalendarClock,
  LayoutGrid,
  RefreshCw,
  Table,
  Sparkles,
  Search,
  Activity,
  Bot,
  ChevronDown,
  Check,
  Filter,
} from 'lucide-react'
import { InventoryKpiRow } from '@/components/inventory/InventoryKpiRow'
import { ShelfMatrixItem, ShelfHealthMatrix } from '@/components/inventory/ShelfHealthMatrix'
import { toShelfMatrixItems } from '@/services/api/livePageAdapters'
import { PhysicalVsDigitalTable } from '@/components/inventory/PhysicalVsDigitalTable'
import { StockDepletionCard } from '@/components/inventory/StockDepletionCard'
import { LiveShelfVisionCard } from '@/components/inventory/LiveShelfVisionCard'
import { PlanogramComplianceCard } from '@/components/inventory/PlanogramComplianceCard'
import { LostSaleRiskCard } from '@/components/inventory/LostSaleRiskCard'
import { ReplenishmentPriorityList } from '@/components/inventory/ReplenishmentPriorityList'
import { ExpiryWasteSection } from '@/components/inventory/expiry/ExpiryWasteSection'
import {
  WhyRecommendationDialog,
  WhyDialogData,
} from '@/components/command-center/WhyRecommendationDialog'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/store/useAppStore'
import { cn } from '@/lib/utils'

export type InventoryTab =
  | 'OVERVIEW'
  | 'SHELF_HEALTH'
  | 'REPLENISHMENT'
  | 'SHELF_VS_SYSTEM'
  | 'EXPIRY_WASTE'
  | 'PLANOGRAM'

const SHELF_URGENCY_RANK: Record<ShelfMatrixItem['status'], number> = {
  OUT_OF_STOCK: 0,
  CRITICAL: 1,
  LOW: 2,
  HEALTHY: 3,
}

export const InventoryPage: React.FC = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<InventoryTab>('OVERVIEW')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Expiry risk stats for badge
  const expirySummary = useAppStore((s) => s.expiryAnalyticsSummary)
  const pendingTasks = useAppStore((s) => s.pendingTasks)
  const shelfItems = useAppStore((s) => s.shelfItems)
  const staffMembers = useAppStore((s) => s.staffMembers)
  const inventoryAnalytics = useAppStore((s) => s.inventoryAnalytics)
  const dispatchRealTask = useAppStore((s) => s.dispatchRealTask)
  const [dispatchedShelfIds, setDispatchedShelfIds] = useState<Record<string, boolean>>({})

  const shelfMatrixItems = React.useMemo(() => toShelfMatrixItems(shelfItems), [shelfItems])

  const handleDispatchRefill = (shelf: ShelfMatrixItem) => {
    setDispatchedShelfIds((prev) => ({ ...prev, [shelf.id]: true }))
    const availableStaff = staffMembers.find((s) => s.status === 'ON_DUTY_AVAILABLE')
    dispatchRealTask({
      title: `Restock ${shelf.code} — ${shelf.sku}`,
      type: 'RESTOCK',
      priority: shelf.status === 'OUT_OF_STOCK' || shelf.status === 'CRITICAL' ? 'CRITICAL' : 'HIGH',
      target_location: `Shelf ${shelf.code}`,
      description: `${shelf.availability}% availability, ${shelf.visibleUnits} visible units.`,
      assigned_staff_id: availableStaff?.id,
    })
  }

  const urgentRestocksCount = pendingTasks.filter(
    (t) => (t.category === 'RESTOCK' || t.category === 'STOCK_ROTATION') && t.status !== 'COMPLETED'
  ).length

  const healthyShelfPercent = shelfMatrixItems.length > 0
    ? Math.round(
        (shelfMatrixItems.filter((s) => s.status === 'HEALTHY').length / shelfMatrixItems.length) * 100
      )
    : 0

  const shelfDiscrepanciesCount = shelfItems.filter((s) => s.status !== 'OPTIMAL').length

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Currently selected shelf for deep inspection (defaults to the most urgent live shelf)
  const [selectedShelfId, setSelectedShelfId] = useState<string | null>(null)

  const shelvesByUrgency = React.useMemo(
    () => [...shelfMatrixItems].sort((a, b) => SHELF_URGENCY_RANK[a.status] - SHELF_URGENCY_RANK[b.status]),
    [shelfMatrixItems]
  )

  useEffect(() => {
    if (!selectedShelfId && shelvesByUrgency.length > 0) {
      setSelectedShelfId(shelvesByUrgency[0].id)
    }
  }, [selectedShelfId, shelvesByUrgency])

  const selectedShelf = shelfMatrixItems.find((s) => s.id === selectedShelfId) || null

  // Explainability "Why?" dialog state
  const [whyDialogData, setWhyDialogData] = useState<WhyDialogData | null>(null)
  const [isWhyDialogOpen, setIsWhyDialogOpen] = useState(false)

  const handleSelectShelfById = (shelfIdOrCode: string) => {
    const found = shelfMatrixItems.find(
      (s) =>
        s.id.toLowerCase() === shelfIdOrCode.toLowerCase() ||
        s.code.toLowerCase() === shelfIdOrCode.toLowerCase()
    )
    if (found) setSelectedShelfId(found.id)
  }

  // Quick selectable shelves for immediate manager inspection: the 5 most urgent live shelves
  const quickShelves = shelvesByUrgency.slice(0, 5)

  const isCriticalShelf =
    selectedShelf?.status === 'CRITICAL' || selectedShelf?.status === 'OUT_OF_STOCK'

  const TABS_CONFIG = [
    {
      id: 'OVERVIEW' as const,
      label: 'Overview',
      description: 'Storewide availability matrix, CCTV feeds & KPI signals',
      icon: LayoutGrid,
    },
    {
      id: 'SHELF_HEALTH' as const,
      label: 'Shelf Health',
      description: 'Real-time on-shelf stock levels and depletion velocities',
      icon: Eye,
      badge: `${healthyShelfPercent}% OK`,
      badgeVariant: 'emerald' as const,
    },
    {
      id: 'REPLENISHMENT' as const,
      label: 'Replenishment',
      description: 'Algorithmic refill queue with backroom bay routing',
      icon: RefreshCw,
      badge: `${urgentRestocksCount} urgent`,
      badgeVariant: 'rose' as const,
    },
    {
      id: 'SHELF_VS_SYSTEM' as const,
      label: 'Shelf vs System',
      description: 'Camera detection vs POS inventory reconciliation audit',
      icon: Table,
      badge: `${shelfDiscrepanciesCount} Discrepanc${shelfDiscrepanciesCount === 1 ? 'y' : 'ies'}`,
      badgeVariant: 'amber' as const,
    },
    {
      id: 'EXPIRY_WASTE' as const,
      label: 'Expiry & Waste',
      description: 'Batch-level expiry tracking, FEFO rotation & governed markdowns',
      icon: CalendarClock,
      badge: `${expirySummary?.atRiskUnitsTotal ?? 0} at risk`,
      badgeVariant: 'amber' as const,
    },
    {
      id: 'PLANOGRAM' as const,
      label: 'Planogram',
      description: 'Visual facing compliance, misplacement & void detection',
      icon: Layers,
      badge: `${Math.round(inventoryAnalytics.overallPlanogramCompliance)}% Compliant`,
      badgeVariant: 'sky' as const,
    },
  ]

  const activeTabConfig = TABS_CONFIG.find((t) => t.id === activeTab) || TABS_CONFIG[0]
  const ActiveIcon = activeTabConfig.icon

  return (
    <div className="space-y-4 select-none pb-6 font-sans">
      {/* ======================================================= */}
      {/* 1. HEADER WITH DROPDOWN PLACED DIRECTLY ON THE RIGHT */}
      {/* ======================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        {/* Left Side: Title */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
            <PackageCheck className="h-4.5 w-4.5" />
          </div>
          <h1 className="text-base font-bold text-slate-900 tracking-tight leading-tight">
            Inventory Intelligence
          </h1>
        </div>

        {/* Right Side: Section Selector Dropdown Dialog (Placed where Live + Copilot were) */}
        <div className="relative shrink-0" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={cn(
              'px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer border shadow-2xs select-none',
              isDropdownOpen
                ? 'bg-blue-50 border-blue-300 text-blue-900 ring-2 ring-blue-500/20'
                : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50 hover:border-slate-300'
            )}
          >
            <div className="flex items-center gap-2">
              <ActiveIcon className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="text-slate-900 font-bold">{activeTabConfig.label}</span>
            </div>

            {activeTabConfig.badge && (
              <span
                className={cn(
                  'text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-md',
                  activeTabConfig.badgeVariant === 'rose'
                    ? 'bg-rose-100 text-rose-800'
                    : activeTabConfig.badgeVariant === 'amber'
                    ? 'bg-amber-100 text-amber-900'
                    : activeTabConfig.badgeVariant === 'emerald'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-sky-100 text-sky-800'
                )}
              >
                {activeTabConfig.badge}
              </span>
            )}

            <ChevronDown
              className={cn(
                'w-4 h-4 text-slate-400 transition-transform duration-200',
                isDropdownOpen && 'rotate-180 text-blue-600'
              )}
            />
          </button>

          {/* Dropdown Menu Popup (Anchored to the right) */}
          {isDropdownOpen && (
            <div className="absolute top-full right-0 mt-1.5 w-72 sm:w-80 bg-white rounded-2xl border border-slate-200 shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-2.5 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1">
                Select Intelligence Module
              </div>

              <div className="space-y-1">
                {TABS_CONFIG.map((tab) => {
                  const Icon = tab.icon
                  const isSelected = activeTab === tab.id
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        setActiveTab(tab.id)
                        setIsDropdownOpen(false)
                      }}
                      className={cn(
                        'w-full text-left p-2.5 rounded-xl text-xs transition-all flex items-start justify-between gap-2 cursor-pointer',
                        isSelected
                          ? 'bg-blue-50/80 text-blue-900 border border-blue-200/80 font-bold'
                          : 'hover:bg-slate-50 text-slate-700 hover:text-slate-900'
                      )}
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div
                          className={cn(
                            'w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5',
                            isSelected
                              ? 'bg-blue-600 text-white shadow-2xs'
                              : 'bg-slate-100 text-slate-600'
                          )}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span>{tab.label}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-blue-600" />}
                          </div>
                          <div className="text-[11px] text-slate-500 font-normal leading-tight line-clamp-1 mt-0.5">
                            {tab.description}
                          </div>
                        </div>
                      </div>

                      {tab.badge && (
                        <span
                          className={cn(
                            'text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-md shrink-0 self-center',
                            tab.badgeVariant === 'rose'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200/80'
                              : tab.badgeVariant === 'amber'
                              ? 'bg-amber-50 text-amber-900 border border-amber-200/80'
                              : tab.badgeVariant === 'emerald'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/80'
                              : 'bg-sky-50 text-sky-800 border border-sky-200/80'
                          )}
                        >
                          {tab.badge}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ======================================================= */}
      {/* 2. DYNAMIC TAB CONTENT */}
      {/* ======================================================= */}

      {/* TAB: EXPIRY & WASTE */}
      {activeTab === 'EXPIRY_WASTE' && <ExpiryWasteSection />}

      {/* TAB: OVERVIEW */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-4">
          {/* Top 6 KPI Cards */}
          <InventoryKpiRow />

          {/* Depletion Forecast & Live Camera */}
          <div className="space-y-3">
            {/* Shelf Selector Bar */}
            <div className="rounded-xl bg-white border border-slate-200 px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs">
              <div className="flex items-center gap-2 text-xs font-sans">
                <span className="text-slate-500 font-medium">Selected Shelf:</span>
                {selectedShelf ? (
                  <>
                    <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md text-xs border border-slate-200">
                      {selectedShelf.code}
                    </span>
                    <span className="text-slate-800 font-semibold">{selectedShelf.sku}</span>
                    <span className="text-slate-300">·</span>
                    <span
                      className={cn(
                        'font-medium text-[11px] px-2 py-0.5 rounded-md border',
                        isCriticalShelf
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : selectedShelf.status === 'LOW'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      )}
                    >
                      {selectedShelf.status} · {selectedShelf.availability}% available
                    </span>
                  </>
                ) : (
                  <span className="text-slate-400 text-[11px]">Loading shelf data…</span>
                )}
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto text-[11px]">
                <Button
                  variant="outline"
                  size="xs"
                  className="h-7 text-[11px] gap-1 border-slate-200"
                  disabled={!selectedShelf}
                  onClick={() => selectedShelf && navigate(`/digital-twin?shelf=${selectedShelf.id}`)}
                >
                  <Compass className="h-3 w-3 text-teal-700" />
                  Show on Twin
                </Button>
                <span className="text-slate-400 text-[10px] hidden md:inline font-sans">Inspect:</span>
                {quickShelves.map((sh) => (
                  <button
                    key={sh.id}
                    onClick={() => setSelectedShelfId(sh.id)}
                    className={cn(
                      'px-2.5 py-0.5 rounded-md font-mono text-[11px] transition-all cursor-pointer border',
                      selectedShelf?.id === sh.id
                        ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-2xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                    )}
                  >
                    {sh.code} ({sh.availability}%)
                  </button>
                ))}
              </div>
            </div>

            {selectedShelf && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 items-stretch">
                <StockDepletionCard
                  shelfName={selectedShelf.name}
                  skuName={selectedShelf.sku}
                  availability={selectedShelf.availability}
                  consumptionRate={selectedShelf.consumptionRateLabel}
                  predictedStockout={selectedShelf.predictedDepletion}
                  replenishmentDeadline={selectedShelf.replenishmentDeadline}
                  onDispatchRefill={() => handleDispatchRefill(selectedShelf)}
                  isDispatched={!!dispatchedShelfIds[selectedShelf.id]}
                />
                <LiveShelfVisionCard
                  shelfCode={selectedShelf.code}
                  shelfName={selectedShelf.name}
                  cameraCode={selectedShelf.cameraCode}
                  skuName={selectedShelf.sku}
                  availability={selectedShelf.availability}
                  visibleUnits={selectedShelf.visibleUnits}
                  confidence={`${(selectedShelf.confidenceScore * 100).toFixed(1)}%`}
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 items-start">
            <PlanogramComplianceCard />
            <LostSaleRiskCard />
          </div>

          <PhysicalVsDigitalTable onSelectShelf={handleSelectShelfById} />
        </div>
      )}

      {/* TAB: SHELF HEALTH */}
      {activeTab === 'SHELF_HEALTH' && (
        <div className="space-y-4">
          <ShelfHealthMatrix
            items={shelfMatrixItems}
            selectedShelfId={selectedShelf?.id || ''}
            onSelectShelf={(sh) => setSelectedShelfId(sh.id)}
          />
          {selectedShelf && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <LiveShelfVisionCard
                shelfCode={selectedShelf.code}
                shelfName={selectedShelf.name}
                cameraCode={selectedShelf.cameraCode}
                skuName={selectedShelf.sku}
                availability={selectedShelf.availability}
                visibleUnits={selectedShelf.visibleUnits}
                confidence={`${(selectedShelf.confidenceScore * 100).toFixed(1)}%`}
              />
              <LostSaleRiskCard />
            </div>
          )}
        </div>
      )}

      {/* TAB: REPLENISHMENT */}
      {activeTab === 'REPLENISHMENT' && (
        <div className="space-y-4">
          <ReplenishmentPriorityList
            onSelectShelf={handleSelectShelfById}
            onOpenWhy={(data) => {
              setWhyDialogData(data)
              setIsWhyDialogOpen(true)
            }}
          />
          {selectedShelf && (
            <StockDepletionCard
              shelfName={selectedShelf.name}
              skuName={selectedShelf.sku}
              availability={selectedShelf.availability}
              consumptionRate={selectedShelf.consumptionRateLabel}
              predictedStockout={selectedShelf.predictedDepletion}
              replenishmentDeadline={selectedShelf.replenishmentDeadline}
              onDispatchRefill={() => handleDispatchRefill(selectedShelf)}
              isDispatched={!!dispatchedShelfIds[selectedShelf.id]}
            />
          )}
        </div>
      )}

      {/* TAB: SHELF VS SYSTEM */}
      {activeTab === 'SHELF_VS_SYSTEM' && (
        <div className="space-y-4">
          <PhysicalVsDigitalTable onSelectShelf={handleSelectShelfById} />
        </div>
      )}

      {/* TAB: PLANOGRAM */}
      {activeTab === 'PLANOGRAM' && (
        <div className="space-y-4">
          <PlanogramComplianceCard />
          <PhysicalVsDigitalTable onSelectShelf={handleSelectShelfById} />
        </div>
      )}

      {/* Transparent AI Decision Explainability ("Why?") Dialog */}
      <WhyRecommendationDialog
        data={whyDialogData}
        open={isWhyDialogOpen}
        onOpenChange={setIsWhyDialogOpen}
      />
    </div>
  )
}
