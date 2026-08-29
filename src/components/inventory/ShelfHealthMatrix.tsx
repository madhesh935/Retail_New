import React, { useState } from 'react'
import { Grid } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ShelfFilterType = 'ALL' | 'HEALTHY' | 'LOW' | 'CRITICAL' | 'OUT_OF_STOCK'

export interface ShelfMatrixItem {
  id: string
  code: string
  name: string
  aisle: string
  status: 'HEALTHY' | 'LOW' | 'CRITICAL' | 'OUT_OF_STOCK'
  availability: number
  visibleUnits: number
  posStock: number
  sku: string
  predictedDepletion: string
  consumptionRateLabel: string
  replenishmentDeadline: string
  cameraCode: string
  confidenceScore: number
}

interface ShelfHealthMatrixProps {
  items: ShelfMatrixItem[]
  selectedShelfId: string
  onSelectShelf: (shelf: ShelfMatrixItem) => void
}

export const ShelfHealthMatrix: React.FC<ShelfHealthMatrixProps> = ({
  items,
  selectedShelfId,
  onSelectShelf,
}) => {
  const [filter, setFilter] = useState<ShelfFilterType>('ALL')

  const filteredItems = items.filter((item) => {
    if (filter === 'ALL') return true
    if (filter === 'HEALTHY') return item.status === 'HEALTHY'
    if (filter === 'LOW') return item.status === 'LOW'
    if (filter === 'CRITICAL') return item.status === 'CRITICAL'
    if (filter === 'OUT_OF_STOCK') return item.status === 'OUT_OF_STOCK'
    return true
  })

  const aisles = Array.from(new Set(items.map((item) => item.aisle)))

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 flex flex-col justify-between shadow-2xs select-none h-full min-h-[460px] font-sans">
      {/* Header & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-sky-50 text-sky-600 border border-sky-200">
            <Grid className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 tracking-wide">
              Shelf Health Matrix ({items.length} shelves)
            </h3>
          </div>
        </div>

        {/* Clean Segmented Filter Bar */}
        <div className="flex items-center rounded-lg bg-slate-100 p-1 border border-slate-200 text-xs shadow-2xs">
          {(
            [
              { key: 'ALL', label: 'All' },
              { key: 'HEALTHY', label: 'Healthy' },
              { key: 'LOW', label: 'Low' },
              { key: 'CRITICAL', label: 'Critical' },
              { key: 'OUT_OF_STOCK', label: 'Out of Stock' },
            ] as { key: ShelfFilterType; label: string }[]
          ).map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                'px-2.5 py-1 rounded-md transition-all cursor-pointer text-[11px] font-medium',
                filter === f.key
                  ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grouped Aisle Matrix Grid */}
      <div className="py-3 space-y-3.5 flex-1 flex flex-col justify-start">
        {items.length === 0 && (
          <div className="text-xs text-slate-400 text-center py-8">Loading shelf data…</div>
        )}
        {aisles.map((aisleName) => {
          const aisleShelves = filteredItems.filter((s) => s.aisle === aisleName)
          if (aisleShelves.length === 0) return null

          return (
            <div key={aisleName} className="space-y-1.5">
              <div className="text-[10px] text-slate-500 font-semibold tracking-wide uppercase">
                {aisleName}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {aisleShelves.map((shelf) => {
                  const isSelected = selectedShelfId === shelf.id
                  const isCritical = shelf.status === 'CRITICAL'
                  const isOos = shelf.status === 'OUT_OF_STOCK'
                  const isLow = shelf.status === 'LOW'

                  return (
                    <button
                      key={shelf.id}
                      onClick={() => onSelectShelf(shelf)}
                      className={cn(
                        'p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer group relative shadow-2xs',
                        isSelected
                          ? 'bg-sky-50 border-sky-500 shadow-sm ring-2 ring-sky-400'
                          : isCritical || isOos
                          ? 'bg-rose-50/30 border-rose-200 hover:border-rose-400'
                          : isLow
                          ? 'bg-amber-50/30 border-amber-200 hover:border-amber-400'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      )}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className="font-mono font-bold text-slate-900 text-xs">{shelf.code}</span>
                        <span
                          className={cn(
                            'text-[9px] px-1.5 py-0.5 rounded-md font-semibold border',
                            shelf.status === 'HEALTHY'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : shelf.status === 'LOW'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          )}
                        >
                          {shelf.status === 'OUT_OF_STOCK' ? 'OOS' : shelf.status}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-700 truncate w-full font-medium">
                        {shelf.sku}
                      </div>

                      <div className="flex items-center justify-between w-full mt-2 pt-1.5 border-t border-slate-100 text-[10px]">
                        <span className={cn('font-bold', isCritical || isOos ? 'text-rose-700' : isLow ? 'text-amber-800' : 'text-slate-600')}>
                          {shelf.availability}%
                        </span>
                        {(isCritical || isLow) && (
                          <span className="text-[9px] text-slate-500 truncate max-w-[80px] font-mono">
                            {shelf.predictedDepletion}
                          </span>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
