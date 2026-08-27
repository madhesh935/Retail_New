import React, { useState } from 'react'
import { Tag, Plus, Check, Navigation, MapPin } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { useCustomerShopping } from '../context/CustomerShoppingContext'
import { cn } from '@/lib/utils'

export const CustomerSaveTodaySection: React.FC = () => {
  const { markdownCandidates, inventoryBatches } = useAppStore()
  const { addToShoppingList, setActiveTab } = useCustomerShopping()
  const [addedItemIds, setAddedItemIds] = useState<Record<string, boolean>>({})

  // Filter only APPROVED or APPLIED candidates where batch is not expired and has sellable units
  const approvedMarkdowns = markdownCandidates.filter((c) => {
    if (c.status !== 'APPROVED' && c.status !== 'APPLIED') return false
    const batch = inventoryBatches.find((b) => b.id === c.batchId)
    if (!batch) return false
    return batch.status !== 'EXPIRED' && batch.status !== 'WASTE_RECORDED' && batch.quantity > 0
  })

  if (approvedMarkdowns.length === 0) {
    return null
  }

  const handleAddToList = (candidate: typeof approvedMarkdowns[0]) => {
    addToShoppingList({
      id: `item-${candidate.productId}`,
      name: candidate.productName,
      brand: 'Fresh Daily',
      category: candidate.category,
      price: `₹${candidate.suggestedNewPrice}`,
      priceNum: candidate.suggestedNewPrice,
      aisle: `Shelf ${candidate.shelfCode}`,
      shelf: `Shelf ${candidate.shelfCode}`,
      stockCount: candidate.remainingQuantity,
      isAvailable: true,
      mapCoord: { x: 142, y: 220 },
    })

    setAddedItemIds((prev) => ({ ...prev, [candidate.id]: true }))
    setTimeout(() => {
      setAddedItemIds((prev) => ({ ...prev, [candidate.id]: false }))
    }, 2000)
  }

  return (
    <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-white border border-amber-200/90 rounded-2xl p-4 space-y-3 shadow-xs">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
            <Tag className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-tight flex items-center gap-1.5">
              <span>Save Today</span>
              <span className="text-[9px] bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded-full font-bold">
                Special Daily Offers
              </span>
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              Fresh items with early markdown savings
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-md">
          {approvedMarkdowns.length} Deals
        </span>
      </div>

      {/* Cards List */}
      <div className="space-y-2.5">
        {approvedMarkdowns.map((deal) => {
          const isAdded = addedItemIds[deal.id]
          const batch = inventoryBatches.find((b) => b.id === deal.batchId)
          const availableUnits = batch ? batch.quantity : deal.remainingQuantity

          return (
            <div
              key={deal.id}
              className="p-3 bg-white rounded-xl border border-amber-200/70 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-all hover:border-amber-300"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-bold uppercase text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200/60">
                    -{deal.suggestedDiscountPercent}% Off
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-cyan-600" />
                    <span>Shelf {deal.shelfCode}</span>
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 leading-tight">{deal.productName}</h4>
                <div className="text-[10px] text-slate-500">
                  Available: <strong className="text-slate-800 font-mono">{availableUnits} units</strong>
                </div>
              </div>

              {/* Price & Action Buttons */}
              <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 line-through font-mono block">
                    ₹{deal.currentPrice}
                  </span>
                  <span className="text-sm font-black text-emerald-700 font-mono leading-none block">
                    ₹{deal.suggestedNewPrice}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleAddToList(deal)}
                    className={cn(
                      'py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-2xs',
                      isAdded
                        ? 'bg-emerald-600 text-white'
                        : 'bg-amber-500 hover:bg-amber-600 text-white'
                    )}
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Added</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('ROUTE')}
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                    title={`Navigate to Shelf ${deal.shelfCode}`}
                  >
                    <Navigation className="w-3.5 h-3.5 text-cyan-700" />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
