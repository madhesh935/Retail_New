import React, { useState } from 'react'
import {
  Navigation,
  Plus,
  Check,
  MapPin,
  Tag,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { CustomerProduct, useCustomerShopping } from '../context/CustomerShoppingContext'
import { useCustomerAssist } from '../context/CustomerAssistContext'
import { BackroomRequestButton } from './assist/BackroomRequestButton'
import { HandHelping, HelpCircle } from 'lucide-react'

interface CustomerProductCardProps {
  product: CustomerProduct
  onNavigate?: (product: CustomerProduct) => void
  onViewAlternatives?: (product: CustomerProduct) => void
}

export const CustomerProductCard: React.FC<CustomerProductCardProps> = ({
  product,
  onNavigate,
  onViewAlternatives,
}) => {
  const { shoppingList, addToShoppingList, setActiveTab } = useCustomerShopping()
  const { openHelpSheet } = useCustomerAssist()
  const [showAlternativesList, setShowAlternativesList] = useState(false)
  const isInList = shoppingList.some((item) => item.id === product.id)

  const handleNavigateClick = () => {
    if (onNavigate) {
      onNavigate(product)
    } else {
      setActiveTab('ROUTE')
    }
  }

  const handleNeedHelp = () => {
    openHelpSheet({
      product,
      shelfCode: product.shelf,
      zoneName: product.category,
      requestType: !product.isAvailable
        ? (product.backroomStock && product.backroomStock > 0 ? 'BACKROOM_REQUEST' : 'SHELF_ASSISTANCE')
        : 'PRODUCT_ASSISTANCE',
    })
  }

  const hasBackroomStock = !product.isAvailable && product.backroomStock && product.backroomStock > 0

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-sm transition-all text-slate-800 space-y-2.5">
      {/* Top Header: Category & Availability */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
          {product.category}
        </span>

        {/* Customer-Friendly Availability Hierarchy */}
        {product.isAvailable ? (
          <div className="flex items-center gap-1.5">
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                product.isLowStock
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}
            >
              {product.isLowStock ? 'LOW STOCK' : 'IN STOCK'}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              {product.isLowStock
                ? `Only ${product.stockCount} remaining on shelf`
                : `${product.stockCount} on shelf`}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
              OFF SHELF
            </span>
            {hasBackroomStock && (
              <span className="text-[10px] text-blue-700 font-bold bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                {product.backroomStock} in Backroom
              </span>
            )}
          </div>
        )}
      </div>

      {/* Product Title & Brand */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2">
            {product.name}
          </h3>
          <span className="text-[11px] text-slate-500 font-medium block mt-0.5">
            Brand: {product.brand}
          </span>
        </div>
        <span className="text-base font-extrabold text-cyan-800 whitespace-nowrap">
          {product.price}
        </span>
      </div>

      {/* Special Contextual Backroom Action */}
      {hasBackroomStock && (
        <BackroomRequestButton product={product} />
      )}

      {/* Location in Store Badge */}
      <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs">
        <div className="p-1 rounded-lg bg-cyan-100 text-cyan-800 shrink-0">
          <MapPin className="h-3.5 w-3.5" />
        </div>
        <div className="flex-1 flex items-center justify-between min-w-0">
          <span className="text-slate-600 font-medium text-[11px]">Location:</span>
          <div className="flex items-center gap-1 font-bold text-slate-900 text-xs">
            <span className="bg-white px-2 py-0.5 rounded-md border border-slate-200 shadow-2xs">
              {product.aisle}
            </span>
            <span className="bg-white px-2 py-0.5 rounded-md border border-slate-200 shadow-2xs">
              {product.shelf}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons: Navigate | Add to List | Need Help */}
      <div className="flex items-center justify-between gap-1.5 pt-1 flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Navigate CTA */}
          <button
            type="button"
            onClick={handleNavigateClick}
            className="bg-cyan-600 hover:bg-cyan-700 active:bg-cyan-800 text-white text-xs h-8 px-3 rounded-xl gap-1 font-bold shadow-sm cursor-pointer flex items-center transition-all"
          >
            <Navigation className="h-3 w-3" />
            <span>Navigate</span>
          </button>

          {/* Add to List CTA */}
          <button
            type="button"
            onClick={() => addToShoppingList(product, 1)}
            className={`text-xs h-8 px-3 rounded-xl gap-1 font-bold transition-all cursor-pointer flex items-center ${
              isInList
                ? 'bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 shadow-2xs'
                : 'bg-white hover:bg-cyan-50 border border-slate-300 text-slate-700 shadow-2xs'
            }`}
          >
            {isInList ? (
              <>
                <Check className="h-3 w-3 text-emerald-600" />
                <span>In List</span>
              </>
            ) : (
              <>
                <Plus className="h-3 w-3 text-slate-500" />
                <span>Add</span>
              </>
            )}
          </button>

          {/* Need Help Contextual Button */}
          <button
            type="button"
            onClick={handleNeedHelp}
            className="text-xs h-8 px-2.5 rounded-xl gap-1 font-semibold text-slate-600 hover:text-cyan-800 hover:bg-cyan-50 border border-slate-200 transition-all cursor-pointer flex items-center"
          >
            <HandHelping className="h-3 w-3 text-cyan-600" />
            <span>Need Help</span>
          </button>
        </div>

        {product.alternatives && product.alternatives.length > 0 && (
          <button
            type="button"
            onClick={() => setShowAlternativesList(!showAlternativesList)}
            className="text-xs font-semibold text-cyan-700 hover:text-cyan-900 py-1 px-2 rounded-lg hover:bg-cyan-50 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>Alts</span>
            {showAlternativesList ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
        )}
      </div>

      {/* Expanded Alternatives Drawer if toggled */}
      {showAlternativesList && product.alternatives && (
        <div className="mt-2 pt-2 border-t border-slate-100 space-y-1.5 bg-slate-50/70 p-2.5 rounded-xl text-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase block">
            Suggested In-Stock Alternatives:
          </span>
          {product.alternatives.map((alt) => (
            <div key={alt.id} className="flex items-center justify-between p-2 bg-white rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="font-bold text-slate-800">{alt.name}</span>
                <span className="text-[11px] text-slate-500 block">{alt.shelf} • {alt.price}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  addToShoppingList({
                    ...product,
                    id: alt.id,
                    name: alt.name,
                    shelf: alt.shelf,
                    price: alt.price,
                  })
                }}
                className="bg-cyan-600 hover:bg-cyan-700 text-white text-[11px] font-bold py-1 px-2.5 rounded-lg flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
              >
                <Plus className="h-3 w-3" />
                <span>Add</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
