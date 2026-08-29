import React, { useMemo, useState } from 'react'
import { Database } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/useAppStore'
import { ShelfItem } from '@/types'

export interface InventoryFusionItem {
  id: string
  productName: string
  sku: string
  category: string
  shelfCode: string
  shelfLocation: string
  visibleUnits: number
  backroomUnits: number
  availability: number
  status: 'REPLENISH' | 'HEALTHY' | 'BACKROOM_STOCK' | 'OUT_OF_STOCK'
}

function toFusionItem(item: ShelfItem): InventoryFusionItem {
  const availability = item.capacityCount > 0
    ? Math.round((item.currentCount / item.capacityCount) * 100)
    : 0
  const backroomUnits = item.backroomUnits || 0

  let status: InventoryFusionItem['status']
  if (item.status === 'OUT_OF_STOCK') {
    status = backroomUnits > 0 ? 'BACKROOM_STOCK' : 'OUT_OF_STOCK'
  } else if (item.status === 'LOW' || item.status === 'CRITICAL') {
    status = 'REPLENISH'
  } else {
    status = 'HEALTHY'
  }

  return {
    id: item.id,
    productName: item.productName,
    sku: item.sku,
    category: item.category,
    shelfCode: item.shelfId,
    shelfLocation: item.shelfName,
    visibleUnits: item.currentCount,
    backroomUnits,
    availability,
    status,
  }
}

interface PhysicalVsDigitalTableProps {
  onSelectShelf?: (shelfCode: string) => void
}

export const PhysicalVsDigitalTable: React.FC<PhysicalVsDigitalTableProps> = ({
  onSelectShelf,
}) => {
  const [filterMode, setFilterMode] = useState<'ISSUES_ONLY' | 'ALL'>('ISSUES_ONLY')
  const shelfItems = useAppStore((s) => s.shelfItems)

  const fusionItems = useMemo(() => shelfItems.map(toFusionItem), [shelfItems])

  const items = filterMode === 'ISSUES_ONLY'
    ? fusionItems.filter((item) => item.status !== 'HEALTHY')
    : fusionItems

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 flex flex-col justify-between shadow-2xs select-none font-sans">
      {/* Header & Filter Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-sky-50 text-sky-600 border border-sky-200">
              <Database className="h-3.5 w-3.5" />
            </div>
            <h3 className="text-xs font-bold text-slate-900 tracking-wide">
              Shelf vs System Inventory
            </h3>
          </div>
        </div>

        {/* Issues Only vs All Products Toggle */}
        <div className="flex items-center rounded-lg bg-slate-100 p-1 border border-slate-200 text-xs shadow-2xs">
          <button
            onClick={() => setFilterMode('ISSUES_ONLY')}
            className={cn(
              'px-3 py-1 rounded-md transition-all cursor-pointer text-[11px] font-medium',
              filterMode === 'ISSUES_ONLY'
                ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                : 'text-slate-500 hover:text-slate-900'
            )}
          >
            Issues Only ({fusionItems.filter((i) => i.status !== 'HEALTHY').length})
          </button>
          <button
            onClick={() => setFilterMode('ALL')}
            className={cn(
              'px-3 py-1 rounded-md transition-all cursor-pointer text-[11px] font-medium',
              filterMode === 'ALL'
                ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                : 'text-slate-500 hover:text-slate-900'
            )}
          >
            All Products ({fusionItems.length})
          </button>
        </div>
      </div>

      {/* Clean Table Content */}
      <div className="overflow-x-auto my-1">
        <table className="w-full text-left text-xs border-collapse font-sans">
          <thead>
            <tr className="border-b border-slate-200 text-[11px] text-slate-500 font-medium">
              <th className="py-2.5 px-3">Product</th>
              <th className="py-2.5 px-3 font-mono">Shelf</th>
              <th className="py-2.5 px-3 text-center">Shelf Visible</th>
              <th className="py-2.5 px-3 text-center">Backroom Stock</th>
              <th className="py-2.5 px-3 text-center">Availability</th>
              <th className="py-2.5 px-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {items.map((item) => {
              const isReplenish = item.status === 'REPLENISH'
              const isBackroom = item.status === 'BACKROOM_STOCK'
              const isOos = item.status === 'OUT_OF_STOCK'

              return (
                <tr
                  key={item.id}
                  onClick={() => onSelectShelf && onSelectShelf(item.shelfCode)}
                  className="hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  {/* Product */}
                  <td className="py-2.5 px-3">
                    <div className="font-semibold text-slate-900 text-xs">
                      {item.productName}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">{item.sku}</div>
                  </td>

                  {/* Shelf Location */}
                  <td className="py-2.5 px-3 text-slate-800 font-mono font-bold text-xs">
                    {item.shelfCode}
                  </td>

                  {/* Shelf Visible */}
                  <td className="py-2.5 px-3 text-center font-mono font-semibold">
                    <span
                      className={cn(
                        item.visibleUnits === 0
                          ? 'text-rose-700'
                          : isReplenish
                          ? 'text-amber-800'
                          : 'text-emerald-700'
                      )}
                    >
                      {item.visibleUnits} units
                    </span>
                  </td>

                  {/* Backroom Stock */}
                  <td className="py-2.5 px-3 text-center text-slate-700 font-mono">
                    {item.backroomUnits} units
                  </td>

                  {/* Availability */}
                  <td className="py-2.5 px-3 text-center font-mono font-semibold">
                    <span
                      className={cn(
                        item.availability === 0
                          ? 'text-rose-700'
                          : item.availability < 40
                          ? 'text-amber-800'
                          : 'text-emerald-700'
                      )}
                    >
                      {item.availability}%
                    </span>
                  </td>

                  {/* Status Badge */}
                  <td className="py-2.5 px-3 text-right">
                    {isReplenish && (
                      <span className="inline-block px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-semibold uppercase">
                        Replenish
                      </span>
                    )}

                    {isBackroom && (
                      <span className="inline-block px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-semibold uppercase">
                        Backroom Stock
                      </span>
                    )}

                    {isOos && (
                      <span className="inline-block px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-semibold uppercase">
                        Out of Stock
                      </span>
                    )}

                    {item.status === 'HEALTHY' && (
                      <span className="inline-block px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold uppercase">
                        Healthy
                      </span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
