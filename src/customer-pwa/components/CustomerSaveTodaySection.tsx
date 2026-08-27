import React, { useState } from 'react'
import { Tag, Plus, Check, Navigation } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { useCustomerShopping } from '../context/CustomerShoppingContext'
import { cn } from '@/lib/utils'

export const CustomerSaveTodaySection: React.FC = () => {
  const { markdownCandidates, inventoryBatches } = useAppStore()
  const { addToShoppingList, setActiveTab, catalog } = useCustomerShopping()
  const [addedItemIds, setAddedItemIds] = useState<Record<string, boolean>>({})

  const approvedMarkdowns = markdownCandidates.filter((c) => {
    if (c.status !== 'APPROVED' && c.status !== 'APPLIED' && c.status !== 'RECOMMENDED') return false
    const batch = inventoryBatches.find((b) => b.id === c.batchId)
    if (!batch) return false
    return batch.status !== 'EXPIRED' && batch.status !== 'WASTE_RECORDED' && batch.quantity > 0
  })

  if (approvedMarkdowns.length === 0) return null

  const handleAddToList = (candidate: (typeof approvedMarkdowns)[0]) => {
    const catalogProduct = catalog.find((p) => p.id === candidate.productId)
    const shelfCode = (candidate.shelfCode || catalogProduct?.shelf || '')
      .replace(/^shelf\s+/i, '')
      .trim()
      .toUpperCase()
    addToShoppingList({
      id: candidate.productId,
      name: candidate.productName,
      brand: catalogProduct?.brand || 'Fresh Daily',
      category: candidate.category,
      price: `₹${candidate.suggestedNewPrice}`,
      priceNum: candidate.suggestedNewPrice,
      aisle: catalogProduct?.aisle || (shelfCode ? `Shelf ${shelfCode}` : 'In store'),
      shelf: shelfCode || catalogProduct?.shelf || '',
      stockCount: candidate.remainingQuantity,
      isAvailable: true,
      mapCoord: catalogProduct?.mapCoord || { x: 250, y: 160 },
    })

    setAddedItemIds((prev) => ({ ...prev, [candidate.id]: true }))
    setTimeout(() => {
      setAddedItemIds((prev) => ({ ...prev, [candidate.id]: false }))
    }, 2000)
  }

  return (
    <div className="rounded-xl border border-amber-200/80 bg-amber-50/40 overflow-hidden">
      <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-amber-200/60 bg-white/70">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0">
            <Tag className="w-3 h-3" />
          </div>
          <div className="min-w-0">
            <h3 className="text-[11px] font-bold text-slate-900 uppercase tracking-wide truncate">
              Save Today
            </h3>
          </div>
        </div>
        <span className="text-[9px] font-bold text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded shrink-0">
          {approvedMarkdowns.length} deals
        </span>
      </div>

      <div className="divide-y divide-amber-100/80">
        {approvedMarkdowns.map((deal) => {
          const isAdded = addedItemIds[deal.id]
          const batch = inventoryBatches.find((b) => b.id === deal.batchId)
          const units = batch ? batch.quantity : deal.remainingQuantity

          return (
            <div
              key={deal.id}
              className="flex items-center gap-2 px-3 py-2 bg-white/80 hover:bg-white transition-colors"
            >
              <span className="text-[9px] font-bold text-amber-800 bg-amber-50 border border-amber-200/70 px-1 py-0.5 rounded shrink-0 w-9 text-center leading-tight">
                -{deal.suggestedDiscountPercent}%
              </span>

              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold text-slate-900 truncate leading-tight">
                  {deal.productName}
                </p>
                <p className="text-[9px] text-slate-500 mt-0.5">
                  {deal.shelfCode ? `Shelf ${deal.shelfCode}` : 'In store'} · {units} left
                </p>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <div className="text-right leading-none">
                  <span className="text-[9px] text-slate-400 line-through font-mono block">
                    ₹{deal.currentPrice}
                  </span>
                  <span className="text-xs font-bold text-emerald-700 font-mono">
                    ₹{deal.suggestedNewPrice}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleAddToList(deal)}
                  aria-label={isAdded ? 'Added to list' : 'Add to list'}
                  className={cn(
                    'p-1.5 rounded-lg transition-colors cursor-pointer',
                    isAdded
                      ? 'bg-emerald-600 text-white'
                      : 'bg-amber-500 hover:bg-amber-600 text-white'
                  )}
                >
                  {isAdded ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('ROUTE')}
                  aria-label={`Navigate to shelf ${deal.shelfCode}`}
                  className="p-1.5 bg-slate-100 hover:bg-slate-200 text-cyan-700 rounded-lg transition-colors cursor-pointer"
                >
                  <Navigation className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
