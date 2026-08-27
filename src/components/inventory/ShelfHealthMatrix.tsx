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
}

interface ShelfHealthMatrixProps {
  selectedShelfId: string
  onSelectShelf: (shelf: ShelfMatrixItem) => void
}

export const SHELF_MATRIX_ITEMS: ShelfMatrixItem[] = [
  // Aisle A (Produce & Fruits)
  { id: 'shelf-a1', code: 'A1', name: 'Produce Tier A1', aisle: 'Aisle A • Fresh Produce', status: 'HEALTHY', availability: 92, visibleUnits: 38, posStock: 80, sku: 'Royal Gala Organic Apples', predictedDepletion: '4.5 hrs' },
  { id: 'shelf-a2', code: 'A2', name: 'Produce Tier A2', aisle: 'Aisle A • Fresh Produce', status: 'HEALTHY', availability: 88, visibleUnits: 24, posStock: 50, sku: 'Valencia Seedless Oranges', predictedDepletion: '3.8 hrs' },
  { id: 'shelf-a3', code: 'A3', name: 'Produce Tier A3', aisle: 'Aisle A • Fresh Produce', status: 'LOW', availability: 42, visibleUnits: 12, posStock: 30, sku: 'Organic Hass Avocados', predictedDepletion: '~45 min' },
  { id: 'shelf-a4', code: 'A4', name: 'Produce Tier A4', aisle: 'Aisle A • Fresh Produce', status: 'HEALTHY', availability: 94, visibleUnits: 30, posStock: 60, sku: 'Honeycrisp Farm Apples', predictedDepletion: '5.2 hrs' },

  // Aisle B (Beverages & Soft Drinks)
  { id: 'shelf-b1', code: 'B1', name: 'Beverage Gondola B1', aisle: 'Aisle B • Cold Beverages', status: 'HEALTHY', availability: 90, visibleUnits: 32, posStock: 70, sku: 'Sparkling Mineral Water 1L', predictedDepletion: '6.0 hrs' },
  { id: 'shelf-b2', code: 'B2', name: 'Beverage Gondola B2', aisle: 'Aisle B • Cold Beverages', status: 'CRITICAL', availability: 19, visibleUnits: 4, posStock: 16, sku: 'Electrolyte Sports Drink Blue', predictedDepletion: '~14 min' },
  { id: 'shelf-b3', code: 'B3', name: 'Beverage Gondola B3', aisle: 'Aisle B • Cold Beverages', status: 'HEALTHY', availability: 85, visibleUnits: 26, posStock: 55, sku: 'Zero Calorie Green Tea 500ml', predictedDepletion: '4.0 hrs' },
  { id: 'shelf-b4', code: 'B4', name: 'Beverage Gondola B4', aisle: 'Aisle B • Cold Beverages', status: 'CRITICAL', availability: 17, visibleUnits: 3, posStock: 14, sku: 'Sparkling Cola Zero 12-Pack', predictedDepletion: '~9 min' },

  // Aisle C (Dairy, Chilled & Bakery)
  { id: 'shelf-c1', code: 'C1', name: 'Dairy Chiller Wall C1', aisle: 'Aisle C • Dairy & Bakery', status: 'LOW', availability: 38, visibleUnits: 8, posStock: 25, sku: 'Greek Yogurt Vanilla 32oz', predictedDepletion: '~38 min' },
  { id: 'shelf-c2', code: 'C2', name: 'Dairy Chiller Wall C2', aisle: 'Aisle C • Dairy & Bakery', status: 'OUT_OF_STOCK', availability: 0, visibleUnits: 0, posStock: 24, sku: 'Horizon Organic Whole Milk 1Gal', predictedDepletion: 'Depleted' },
  { id: 'shelf-c3', code: 'C3', name: 'Artisan Bakery Rack C3', aisle: 'Aisle C • Dairy & Bakery', status: 'HEALTHY', availability: 96, visibleUnits: 22, posStock: 30, sku: 'Stoneground Sourdough Loaf', predictedDepletion: '5.5 hrs' },
  { id: 'shelf-c4', code: 'C4', name: 'Artisan Bakery Rack C4', aisle: 'Aisle C • Dairy & Bakery', status: 'HEALTHY', availability: 91, visibleUnits: 18, posStock: 24, sku: 'French Brioche Rolls 6pk', predictedDepletion: '4.8 hrs' },

  // Aisle D (Snacks, Breakfast & Pantry)
  { id: 'shelf-d1', code: 'D1', name: 'Snacks Endcap D1', aisle: 'Aisle D • Snacks & Pantry', status: 'HEALTHY', availability: 88, visibleUnits: 28, posStock: 60, sku: 'Organic Tortilla Sea Salt Chips', predictedDepletion: '4.2 hrs' },
  { id: 'shelf-d2', code: 'D2', name: 'Snacks Gondola D2', aisle: 'Aisle D • Snacks & Pantry', status: 'LOW', availability: 24, visibleUnits: 5, posStock: 18, sku: 'Whole Roasted Almonds 200g', predictedDepletion: '~17 min' },
  { id: 'shelf-d3', code: 'D3', name: 'Breakfast Cereal D3', aisle: 'Aisle D • Snacks & Pantry', status: 'HEALTHY', availability: 92, visibleUnits: 20, posStock: 40, sku: 'Crunchy Honey Oat Granola', predictedDepletion: '6.5 hrs' },
  { id: 'shelf-d4', code: 'D4', name: 'Snacks Gondola D4', aisle: 'Aisle D • Snacks & Pantry', status: 'LOW', availability: 31, visibleUnits: 8, posStock: 22, sku: 'Kettle Cooked Potato Chips', predictedDepletion: '~28 min' },
]

export const ShelfHealthMatrix: React.FC<ShelfHealthMatrixProps> = ({
  selectedShelfId,
  onSelectShelf,
}) => {
  const [filter, setFilter] = useState<ShelfFilterType>('ALL')

  const filteredItems = SHELF_MATRIX_ITEMS.filter((item) => {
    if (filter === 'ALL') return true
    if (filter === 'HEALTHY') return item.status === 'HEALTHY'
    if (filter === 'LOW') return item.status === 'LOW'
    if (filter === 'CRITICAL') return item.status === 'CRITICAL'
    if (filter === 'OUT_OF_STOCK') return item.status === 'OUT_OF_STOCK'
    return true
  })

  const aisles = [
    'Aisle A • Fresh Produce',
    'Aisle B • Cold Beverages',
    'Aisle C • Dairy & Bakery',
    'Aisle D • Snacks & Pantry',
  ]

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
              Shelf Health Matrix (A1 — D4)
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
