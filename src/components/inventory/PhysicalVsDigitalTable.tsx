import React, { useState } from 'react'
import { Database } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface InventoryFusionItem {
  id: string
  productName: string
  sku: string
  category: string
  shelfCode: string
  shelfLocation: string
  posStock: number
  visionShelfCount: number
  availability: number
  status: 'REPLENISH' | 'HEALTHY' | 'BACKROOM_STOCK' | 'OUT_OF_STOCK'
}

export const FUSION_INVENTORY_ITEMS: InventoryFusionItem[] = [
  {
    id: 'prod-01',
    productName: 'Sparkling Cola Zero 12-Pack',
    sku: 'BEV-COLA-001',
    category: 'Beverages',
    shelfCode: 'B4',
    shelfLocation: 'Shelf B4',
    posStock: 14,
    visionShelfCount: 3,
    availability: 17,
    status: 'REPLENISH',
  },
  {
    id: 'prod-02',
    productName: 'Horizon Organic Whole Milk 1Gal',
    sku: 'DAIRY-MILK-001',
    category: 'Dairy',
    shelfCode: 'C2',
    shelfLocation: 'Shelf C2',
    posStock: 24,
    visionShelfCount: 0,
    availability: 0,
    status: 'BACKROOM_STOCK',
  },
  {
    id: 'prod-03',
    productName: 'Organic Orange Juice 1L',
    sku: 'BEV-JUICE-004',
    category: 'Beverages',
    shelfCode: 'B3',
    shelfLocation: 'Shelf B3',
    posStock: 0,
    visionShelfCount: 0,
    availability: 0,
    status: 'OUT_OF_STOCK',
  },
  {
    id: 'prod-04',
    productName: 'Electrolyte Sports Drink Blue',
    sku: 'BEV-SPORT-002',
    category: 'Beverages',
    shelfCode: 'B2',
    shelfLocation: 'Shelf B2',
    posStock: 16,
    visionShelfCount: 4,
    availability: 19,
    status: 'REPLENISH',
  },
  {
    id: 'prod-05',
    productName: 'Whole Roasted Almonds 200g',
    sku: 'SNK-ALMOND-001',
    category: 'Snacks',
    shelfCode: 'D2',
    shelfLocation: 'Shelf D2',
    posStock: 18,
    visionShelfCount: 5,
    availability: 24,
    status: 'REPLENISH',
  },
  {
    id: 'prod-06',
    productName: 'Royal Gala Organic Apples',
    sku: 'PROD-APPLE-001',
    category: 'Produce',
    shelfCode: 'A1',
    shelfLocation: 'Shelf A1',
    posStock: 80,
    visionShelfCount: 38,
    availability: 92,
    status: 'HEALTHY',
  },
  {
    id: 'prod-07',
    productName: 'Honeycrisp Farm Apples',
    sku: 'PROD-APPLE-002',
    category: 'Produce',
    shelfCode: 'A4',
    shelfLocation: 'Shelf A4',
    posStock: 60,
    visionShelfCount: 30,
    availability: 94,
    status: 'HEALTHY',
  },
  {
    id: 'prod-08',
    productName: 'Stoneground Sourdough Loaf',
    sku: 'BAKE-SOUR-001',
    category: 'Bakery',
    shelfCode: 'C3',
    shelfLocation: 'Shelf C3',
    posStock: 30,
    visionShelfCount: 22,
    availability: 96,
    status: 'HEALTHY',
  },
]

interface PhysicalVsDigitalTableProps {
  onSelectShelf?: (shelfCode: string) => void
}

export const PhysicalVsDigitalTable: React.FC<PhysicalVsDigitalTableProps> = ({
  onSelectShelf,
}) => {
  const [filterMode, setFilterMode] = useState<'ISSUES_ONLY' | 'ALL'>('ISSUES_ONLY')

  const items = filterMode === 'ISSUES_ONLY'
    ? FUSION_INVENTORY_ITEMS.filter((item) => item.status !== 'HEALTHY')
    : FUSION_INVENTORY_ITEMS

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
            Issues Only ({FUSION_INVENTORY_ITEMS.filter((i) => i.status !== 'HEALTHY').length})
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
            All Products ({FUSION_INVENTORY_ITEMS.length})
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
              <th className="py-2.5 px-3 text-center">Store Inventory</th>
              <th className="py-2.5 px-3 text-center">Shelf Visible</th>
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

                  {/* Store Inventory */}
                  <td className="py-2.5 px-3 text-center text-slate-700 font-mono">
                    {item.posStock} units
                  </td>

                  {/* Shelf Visible */}
                  <td className="py-2.5 px-3 text-center font-mono font-semibold">
                    <span
                      className={cn(
                        item.visionShelfCount === 0
                          ? 'text-rose-700'
                          : isReplenish
                          ? 'text-amber-800'
                          : 'text-emerald-700'
                      )}
                    >
                      {item.visionShelfCount} units
                    </span>
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
