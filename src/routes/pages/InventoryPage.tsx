import React, { useState } from 'react'
import {
  PackageCheck,
  Eye,
  Layers,
} from 'lucide-react'
import { InventoryKpiRow } from '@/components/inventory/InventoryKpiRow'
import { SHELF_MATRIX_ITEMS, ShelfMatrixItem } from '@/components/inventory/ShelfHealthMatrix'
import { PhysicalVsDigitalTable } from '@/components/inventory/PhysicalVsDigitalTable'
import { StockDepletionCard } from '@/components/inventory/StockDepletionCard'
import { LiveShelfVisionCard } from '@/components/inventory/LiveShelfVisionCard'
import { PlanogramComplianceCard } from '@/components/inventory/PlanogramComplianceCard'
import { LostSaleRiskCard } from '@/components/inventory/LostSaleRiskCard'
import {
  WhyRecommendationDialog,
  WhyDialogData,
} from '@/components/command-center/WhyRecommendationDialog'
import { cn } from '@/lib/utils'

export const InventoryPage: React.FC = () => {
  // Currently selected shelf for deep inspection (defaults to Beverage B4)
  const [selectedShelf, setSelectedShelf] = useState<ShelfMatrixItem>(
    SHELF_MATRIX_ITEMS.find((s) => s.id === 'shelf-b4') || SHELF_MATRIX_ITEMS[7]
  )

  // Explainability "Why?" dialog state
  const [whyDialogData, setWhyDialogData] = useState<WhyDialogData | null>(null)
  const [isWhyDialogOpen, setIsWhyDialogOpen] = useState(false)

  const handleSelectShelfById = (shelfIdOrCode: string) => {
    const found = SHELF_MATRIX_ITEMS.find(
      (s) =>
        s.id.toLowerCase() === shelfIdOrCode.toLowerCase() ||
        s.code.toLowerCase() === shelfIdOrCode.toLowerCase()
    )
    if (found) setSelectedShelf(found)
  }

  // Quick selectable shelves for immediate manager inspection
  const quickShelves = [
    SHELF_MATRIX_ITEMS.find((s) => s.code === 'B4')!,
    SHELF_MATRIX_ITEMS.find((s) => s.code === 'B2')!,
    SHELF_MATRIX_ITEMS.find((s) => s.code === 'C2')!,
    SHELF_MATRIX_ITEMS.find((s) => s.code === 'D2')!,
    SHELF_MATRIX_ITEMS.find((s) => s.code === 'A3')!,
  ].filter(Boolean)

  const isCriticalShelf =
    selectedShelf.status === 'CRITICAL' || selectedShelf.status === 'OUT_OF_STOCK'

  return (
    <div className="space-y-4 select-none pb-6">
      {/* ======================================================= */}
      {/* 1. HEADER & IMMEDIATE INVENTORY STATUS */}
      {/* ======================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1E293B]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <PackageCheck className="h-4 w-4 text-cyan-400" />
              <span>Inventory Intelligence</span>
            </h1>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
              Vision + Inventory Sync
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Updated 2 sec ago</span>
        </div>
      </div>

      {/* 6 Top KPI Cards */}
      <InventoryKpiRow />

      {/* ======================================================= */}
      {/* 2. DEPLETION FORECAST & LIVE CAMERA (SIDE-BY-SIDE) */}
      {/* ======================================================= */}
      <div className="space-y-3">
        {/* Clean Contextual Shelf Selector Header */}
        <div className="rounded-lg bg-[#0F172A] border border-[#1E293B] px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-sm">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">Selected Shelf:</span>
            <span className="font-mono font-bold text-white bg-[#1E293B] px-2 py-0.5 rounded text-xs">
              {selectedShelf.code}
            </span>
            <span className="text-slate-200 font-semibold">{selectedShelf.sku}</span>
            <span className="text-slate-500">·</span>
            <span
              className={cn(
                'font-medium text-[11px] px-2 py-0.5 rounded border',
                isCriticalShelf
                  ? 'bg-rose-950/80 text-rose-300 border-rose-500/40'
                  : selectedShelf.status === 'LOW'
                  ? 'bg-amber-950/80 text-amber-300 border-amber-500/30'
                  : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/30'
              )}
            >
              {selectedShelf.status} · {selectedShelf.availability}% available
            </span>
          </div>

          {/* Quick Shelf Switcher Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-[11px]">
            <span className="text-slate-500 text-[10px] hidden md:inline">Inspect:</span>
            {quickShelves.map((sh) => (
              <button
                key={sh.id}
                onClick={() => setSelectedShelf(sh)}
                className={cn(
                  'px-2.5 py-0.5 rounded-md font-mono text-[11px] transition-all cursor-pointer border',
                  selectedShelf.id === sh.id
                    ? 'bg-cyan-950 text-cyan-300 border-cyan-500/60 font-bold shadow-sm'
                    : 'bg-[#090D14] text-slate-400 border-[#1E293B] hover:text-white hover:border-slate-600'
                )}
              >
                {sh.code} ({sh.availability}%)
              </button>
            ))}
          </div>
        </div>

        {/* 2 Columns: Depletion Forecast & Live Camera */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 items-stretch">
          <div className="flex flex-col">
            <StockDepletionCard
              shelfName={selectedShelf.name}
              skuName={selectedShelf.sku}
              availability={selectedShelf.availability}
              consumptionRate={
                selectedShelf.availability < 40 ? '20.4 units/hr' : '8.2 units/hr'
              }
              predictedStockout={selectedShelf.predictedDepletion}
              replenishmentDeadline={
                selectedShelf.availability < 40 ? 'within 5 min' : 'within 45 min'
              }
            />
          </div>

          <div className="flex flex-col">
            <LiveShelfVisionCard
              shelfCode={selectedShelf.code}
              shelfName={selectedShelf.name}
              cameraCode={
                selectedShelf.code.startsWith('B')
                  ? 'C04'
                  : selectedShelf.code.startsWith('A')
                  ? 'C02'
                  : 'C03'
              }
              skuName={selectedShelf.sku}
              availability={selectedShelf.availability}
              visibleUnits={selectedShelf.visibleUnits}
              confidence="94.2%"
              latencyMs={14.8}
            />
          </div>
        </div>
      </div>

      {/* ======================================================= */}
      {/* 3. PLANOGRAM COMPLIANCE & SALES RISK (SIDE-BY-SIDE) */}
      {/* ======================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 items-start">
        <PlanogramComplianceCard />
        <LostSaleRiskCard />
      </div>

      {/* ======================================================= */}
      {/* 4. SHELF VS SYSTEM INVENTORY TABLE */}
      {/* ======================================================= */}
      <PhysicalVsDigitalTable onSelectShelf={handleSelectShelfById} />

      {/* Transparent AI Decision Explainability ("Why?") Dialog */}
      <WhyRecommendationDialog
        data={whyDialogData}
        open={isWhyDialogOpen}
        onOpenChange={setIsWhyDialogOpen}
      />
    </div>
  )
}
