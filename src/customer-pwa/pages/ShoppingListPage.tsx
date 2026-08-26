import React, { useState } from 'react'
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  Navigation,
  CheckCircle2,
  Sparkles,
  ChevronDown,
  ChevronUp,
  X,
  Tag,
  Check,
  AlertTriangle,
} from 'lucide-react'
import { useCustomerShopping, CustomerProduct, ShoppingListItem } from '../context/CustomerShoppingContext'

export const ShoppingListPage: React.FC = () => {
  const {
    shoppingList,
    removeFromShoppingList,
    updateQuantity,
    toggleItemCollected,
    clearShoppingList,
    setActiveTab,
    replaceProductInList,
    showToast,
  } = useCustomerShopping()

  const [selectedAltItem, setSelectedAltItem] = useState<ShoppingListItem | null>(null)

  const totalUnits = shoppingList.reduce((sum, item) => sum + item.quantity, 0)
  const totalItems = shoppingList.length

  return (
    <div className="space-y-4 pb-8 select-none">
      {/* 1. List Header */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <ShoppingBag className="h-4.5 w-4.5 text-cyan-600" />
            <span>My Shopping List</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {totalItems} unique products • {totalUnits} total items
          </p>
        </div>

        {totalItems > 0 && (
          <button
            onClick={clearShoppingList}
            className="text-xs text-slate-400 hover:text-rose-600 font-semibold p-1 transition-colors cursor-pointer"
          >
            Clear All
          </button>
        )}
      </div>

      {/* 2. Empty State or Items List */}
      {totalItems === 0 ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 space-y-3 shadow-sm">
          <div className="h-12 w-12 rounded-2xl bg-cyan-50 text-cyan-700 flex items-center justify-center mx-auto">
            <ShoppingBag className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Your List is Empty</h3>
            <p className="text-xs text-slate-500 mt-1">
              Search for products or ask the Shopping AI to add essentials.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('SEARCH')}
            className="bg-cyan-600 hover:bg-cyan-700 active:bg-cyan-800 text-white text-xs h-9 px-4 rounded-xl font-bold shadow-sm cursor-pointer transition-colors"
          >
            Browse Products
          </button>
        </div>
      ) : (
        <>
          {/* Item Cards List with 2-line title wrapping and rebalanced width */}
          <div className="space-y-2.5">
            {shoppingList.map((item) => {
              const hasAlternatives = item.alternatives && item.alternatives.length > 0

              return (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-2xl border transition-all bg-white shadow-sm space-y-2 ${
                    item.isCollected
                      ? 'border-emerald-200 bg-emerald-50/30 opacity-75'
                      : 'border-slate-200 hover:border-cyan-400'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    {/* Checkbox */}
                    <button
                      onClick={() => toggleItemCollected(item.id)}
                      className="mt-0.5 cursor-pointer shrink-0"
                    >
                      <CheckCircle2
                        className={`h-5 w-5 ${
                          item.isCollected
                            ? 'text-emerald-600 fill-emerald-100'
                            : 'text-slate-300 hover:text-slate-400'
                        }`}
                      />
                    </button>

                    {/* Left: Product Info (Majority Width, 2-line title wrapping) */}
                    <div className="flex-1 min-w-0">
                      {/* Product Name allows up to 2 lines without harsh cutoffs */}
                      <h4
                        className={`text-xs font-bold leading-snug line-clamp-2 ${
                          item.isCollected ? 'line-through text-slate-400' : 'text-slate-900'
                        }`}
                      >
                        {item.name}
                      </h4>

                      {/* Status, Price & Location */}
                      <div className="flex items-center gap-2 flex-wrap mt-1 text-[11px]">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase border ${
                            !item.isAvailable
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : item.isLowStock
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          {!item.isAvailable
                            ? 'Out of Stock'
                            : item.isLowStock
                            ? 'LOW STOCK'
                            : 'In Stock'}
                        </span>

                        <span className="font-extrabold text-cyan-800">{item.price}</span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-600 font-medium">
                          {item.aisle} • {item.shelf}
                        </span>
                      </div>

                      {/* Low Stock / Out of Stock Alternative Action Button */}
                      {(item.isLowStock || !item.isAvailable) && hasAlternatives && (
                        <div className="pt-1.5">
                          <button
                            onClick={() => setSelectedAltItem(item)}
                            className="text-[11px] font-bold text-cyan-700 hover:text-cyan-900 flex items-center gap-1 cursor-pointer bg-cyan-50 hover:bg-cyan-100 px-2 py-0.5 rounded-lg transition-colors"
                          >
                            <span>View Alternatives</span>
                            <span>→</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Right: Quantity Controls & Delete */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <div className="flex items-center bg-slate-50 rounded-xl p-0.5 border border-slate-200">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="h-6 w-6 rounded-lg bg-white text-slate-700 flex items-center justify-center hover:bg-slate-100 shadow-2xs cursor-pointer"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-5 text-center text-xs font-extrabold text-slate-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="h-6 w-6 rounded-lg bg-white text-slate-700 flex items-center justify-center hover:bg-slate-100 shadow-2xs cursor-pointer"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromShoppingList(item.id)}
                        className="text-slate-300 hover:text-rose-500 p-1 cursor-pointer transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* 3. Primary CTA: Start Optimized Store Route */}
          <div className="pt-2">
            <button
              onClick={() => setActiveTab('ROUTE')}
              className="w-full bg-cyan-600 hover:bg-cyan-700 active:bg-cyan-800 text-white font-extrabold text-xs h-12 rounded-2xl flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all active:scale-98"
            >
              <Navigation className="h-4 w-4" />
              <span>START OPTIMIZED ROUTE ({totalItems} STOPS)</span>
            </button>
          </div>
        </>
      )}

      {/* 4. Alternatives Drawer / Bottom Sheet */}
      {selectedAltItem && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in-0"
            onClick={() => setSelectedAltItem(null)}
          />

          <div className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl z-10 space-y-4 text-slate-800 animate-in slide-in-from-bottom duration-200 border border-slate-200 max-h-[80vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between pb-2 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-cyan-700 uppercase tracking-wider block">
                  Alternatives Nearby
                </span>
                <h3 className="text-sm font-extrabold text-slate-900 mt-0.5">
                  Substitutes for {selectedAltItem.name.split(' (')[0]}
                </h3>
              </div>

              <button
                onClick={() => setSelectedAltItem(null)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Current Item Summary */}
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
              <span className="text-slate-600 font-medium truncate">{selectedAltItem.name}</span>
              <span className="text-amber-700 font-bold px-1.5 py-0.5 bg-amber-100 rounded text-[10px] shrink-0">
                {selectedAltItem.isLowStock ? 'Low Stock' : 'Out of Stock'}
              </span>
            </div>

            {/* Alternatives List */}
            <div className="space-y-2.5">
              {selectedAltItem.alternatives?.map((alt) => (
                <div
                  key={alt.id}
                  className="p-3.5 rounded-2xl border border-slate-200 hover:border-cyan-500 bg-white flex items-center justify-between gap-3 shadow-2xs transition-all"
                >
                  <div className="space-y-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 leading-tight truncate">
                      {alt.name}
                    </h4>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                      <span className="font-extrabold text-cyan-800">{alt.price}</span>
                      <span>•</span>
                      <span className="text-emerald-700 font-bold">IN STOCK</span>
                      <span>•</span>
                      <span>{alt.shelf}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      const newProd: CustomerProduct = {
                        ...selectedAltItem,
                        id: alt.id,
                        name: alt.name,
                        shelf: alt.shelf,
                        price: alt.price,
                        isAvailable: true,
                        isLowStock: false,
                      }
                      replaceProductInList(selectedAltItem.id, newProd)
                      setSelectedAltItem(null)
                    }}
                    className="bg-cyan-600 hover:bg-cyan-700 active:bg-cyan-800 text-white text-xs h-8 px-3 rounded-xl font-bold shrink-0 cursor-pointer shadow-2xs transition-colors"
                  >
                    Replace Item
                  </button>
                </div>
              ))}
            </div>

            {/* Close Button */}
            <button
              onClick={() => setSelectedAltItem(null)}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
            >
              Keep Original Item
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
