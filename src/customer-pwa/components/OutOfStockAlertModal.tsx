import React from 'react'
import {
  AlertTriangle,
  X,
  Sparkles,
  Package,
  Check,
} from 'lucide-react'
import { CustomerProduct, useCustomerShopping } from '../context/CustomerShoppingContext'

export const OutOfStockAlertModal: React.FC = () => {
  const {
    outOfStockProduct,
    setOutOfStockProduct,
    removeFromShoppingList,
    replaceProductInList,
  } = useCustomerShopping()

  if (!outOfStockProduct) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 select-none">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in-0"
        onClick={() => setOutOfStockProduct(null)}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md rounded-3xl bg-white p-5 shadow-2xl z-10 space-y-3.5 text-slate-800 animate-in slide-in-from-bottom sm:zoom-in-95 duration-200 border border-slate-200">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-amber-100 text-amber-700">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 leading-tight">
                Product Update
              </h3>
              <span className="text-xs text-slate-500 font-medium">In-Store Inventory Notification</span>
            </div>
          </div>

          <button
            onClick={() => setOutOfStockProduct(null)}
            className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Status text */}
        <p className="text-xs text-slate-600 leading-relaxed font-medium">
          <strong className="text-slate-900">{outOfStockProduct.name}</strong> is currently unavailable on {outOfStockProduct.shelf}.
        </p>

        {/* Alternative available list */}
        {outOfStockProduct.alternatives && outOfStockProduct.alternatives.length > 0 && (
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Alternative Available:
            </span>

            {outOfStockProduct.alternatives.map((alt) => (
              <div
                key={alt.id}
                className="p-3.5 rounded-2xl border-2 border-cyan-500 bg-cyan-50/40 flex items-center justify-between gap-2 shadow-sm"
              >
                <div className="space-y-0.5 min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 truncate">{alt.name}</h4>
                  <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
                    <span className="bg-white px-2 py-0.5 rounded border border-slate-200 font-bold text-slate-800">
                      {alt.shelf}
                    </span>
                    <span>•</span>
                    <span className="font-extrabold text-cyan-800">{alt.price}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    const newProd: CustomerProduct = {
                      ...outOfStockProduct,
                      id: alt.id,
                      name: alt.name,
                      shelf: alt.shelf,
                      price: alt.price,
                      isAvailable: alt.isAvailable !== false,
                      isLowStock: false,
                    }
                    replaceProductInList(outOfStockProduct.id, newProd)
                  }}
                  className="bg-cyan-600 hover:bg-cyan-700 active:bg-cyan-800 text-white text-xs h-8 px-3 rounded-xl font-bold shrink-0 cursor-pointer shadow-2xs transition-colors"
                >
                  Use Alternative
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Bottom Actions */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
          <button
            onClick={() => {
              removeFromShoppingList(outOfStockProduct.id)
              setOutOfStockProduct(null)
            }}
            className="text-slate-500 hover:text-slate-800 font-medium cursor-pointer"
          >
            Skip Item
          </button>

          <button
            onClick={() => setOutOfStockProduct(null)}
            className="text-slate-400 hover:text-slate-600 text-xs font-semibold px-2 py-1 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  )
}
