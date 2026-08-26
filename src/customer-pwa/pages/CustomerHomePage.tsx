import React, { useState, useEffect } from 'react'
import {
  Search,
  Bot,
  ShoppingBag,
  Navigation,
  Sparkles,
  MapPin,
  Tag,
  ArrowRight,
  Zap,
  Flame,
  AlertTriangle,
  ChevronRight,
  Percent,
} from 'lucide-react'
import { useCustomerShopping, STORE_CATALOG } from '../context/CustomerShoppingContext'
import { CustomerProductCard } from '../components/CustomerProductCard'

export const CustomerHomePage: React.FC = () => {
  const { shoppingList, setActiveTab, setIsNavigating } = useCustomerShopping()
  const [showOffersModal, setShowOffersModal] = useState(false)
  const [smartNowIndex, setSmartNowIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const listCount = shoppingList.length

  const smartNowItems = [
    {
      id: 'checkout',
      icon: Zap,
      iconColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50/70',
      borderColor: 'border-emerald-200',
      title: '⚡ Fastest Checkout: Counter C2',
      detail: '~1.8 min wait • 2 shoppers in queue',
      actionText: 'View Checkout',
      onAction: () => {
        setIsNavigating(false)
        setActiveTab('ROUTE')
      },
    },
    {
      id: 'popular',
      icon: Flame,
      iconColor: 'text-cyan-600',
      bgColor: 'bg-cyan-50/70',
      borderColor: 'border-cyan-200',
      title: '🔥 Popular in store right now',
      detail: 'Heritage Whole Milk & Dove Daily Moisture Shampoo',
      actionText: 'View Items',
      onAction: () => setActiveTab('SEARCH'),
    },
    {
      id: 'busy',
      icon: AlertTriangle,
      iconColor: 'text-amber-600',
      bgColor: 'bg-amber-50/70',
      borderColor: 'border-amber-200',
      title: '⚠️ Aisle 4 is currently busy',
      detail: 'Smart Route can bypass it via North Concourse (+1 min)',
      actionText: 'View Route',
      onAction: () => setActiveTab('ROUTE'),
    },
    {
      id: 'deal',
      icon: Percent,
      iconColor: 'text-purple-600',
      bgColor: 'bg-purple-50/70',
      borderColor: 'border-purple-200',
      title: '🏷️ In-Store Deal Nearby',
      detail: '20% off beverages in Aisle 5 & Snacks island',
      actionText: 'View Offers',
      onAction: () => setShowOffersModal(true),
    },
  ]

  // Auto-rotate Smart Now every 6 seconds unless paused
  useEffect(() => {
    if (isPaused) return
    const interval = setInterval(() => {
      setSmartNowIndex((prev) => (prev + 1) % smartNowItems.length)
    }, 6000)
    return () => clearInterval(interval)
  }, [isPaused, smartNowItems.length])

  const activeSmartNow = smartNowItems[smartNowIndex]

  return (
    <div className="space-y-4 pb-6 select-none">
      {/* 1. Simplified Greeting Card */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-1">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
            <span>Good morning</span>
            <span>👋</span>
          </h2>
          <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            Open Today • 08:00–22:00
          </span>
        </div>

        <p className="text-xs text-slate-600 font-medium">
          What are you looking for today?
        </p>
      </div>

      {/* 2. Primary Search Input & Shopping Copilot Shortcut */}
      <div className="space-y-2">
        <div
          onClick={() => setActiveTab('SEARCH')}
          className="relative cursor-pointer"
        >
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            readOnly
            placeholder="Search milk, shampoo, bread..."
            className="w-full bg-white border-2 border-slate-200 hover:border-cyan-500 rounded-2xl pl-10 pr-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none shadow-sm cursor-pointer transition-colors"
          />
        </div>
      </div>

      {/* 3. Four Compact Quick Action Cards (2x2 Grid) */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* 1. Find Product */}
        <button
          onClick={() => setActiveTab('SEARCH')}
          className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-cyan-400 hover:shadow-sm transition-all text-left flex items-center gap-3 cursor-pointer group min-h-[56px]"
        >
          <div className="h-9 w-9 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Search className="h-4.5 w-4.5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs font-bold text-slate-900 leading-tight">Find Product</h3>
            <p className="text-[10px] text-slate-500 truncate mt-0.5">Aisle & shelf lookup</p>
          </div>
        </button>

        {/* 2. My List */}
        <button
          onClick={() => setActiveTab('LIST')}
          className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-400 hover:shadow-sm transition-all text-left flex items-center gap-3 cursor-pointer group min-h-[56px]"
        >
          <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <ShoppingBag className="h-4.5 w-4.5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs font-bold text-slate-900 leading-tight">My List</h3>
            <p className="text-[10px] text-slate-500 truncate mt-0.5">{listCount} items ready</p>
          </div>
        </button>

        {/* 3. Smart Route */}
        <button
          onClick={() => setActiveTab('ROUTE')}
          className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-purple-400 hover:shadow-sm transition-all text-left flex items-center gap-3 cursor-pointer group min-h-[56px]"
        >
          <div className="h-9 w-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Navigation className="h-4.5 w-4.5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs font-bold text-slate-900 leading-tight">Smart Route</h3>
            <p className="text-[10px] text-slate-500 truncate mt-0.5">Shortest path in store</p>
          </div>
        </button>

        {/* 4. Offers */}
        <button
          onClick={() => setShowOffersModal(true)}
          className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-amber-400 hover:shadow-sm transition-all text-left flex items-center gap-3 cursor-pointer group min-h-[56px]"
        >
          <div className="h-9 w-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Tag className="h-4.5 w-4.5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs font-bold text-slate-900 leading-tight">Offers</h3>
            <p className="text-[10px] text-slate-500 truncate mt-0.5">Daily in-store deals</p>
          </div>
        </button>
      </div>

      {/* 4. Dynamic SMART NOW ✦ Rotating Live Intelligence Module */}
      <div
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
        className={`rounded-2xl border p-3.5 shadow-sm transition-all duration-300 ${activeSmartNow.bgColor} ${activeSmartNow.borderColor}`}
      >
        <div className="flex items-center justify-between pb-1.5 border-b border-black/5">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-cyan-600" />
              <span>SMART NOW ✦</span>
            </span>
          </div>

          {/* Indicator dots */}
          <div className="flex items-center gap-1">
            {smartNowItems.map((_, idx) => (
              <span
                key={idx}
                onClick={() => setSmartNowIndex(idx)}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  smartNowIndex === idx ? 'w-4 bg-slate-800' : 'w-1.5 bg-slate-300'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-bold text-slate-900 leading-tight truncate">
              {activeSmartNow.title}
            </h4>
            <p className="text-[11px] text-slate-600 truncate mt-0.5">
              {activeSmartNow.detail}
            </p>
          </div>

          <button
            onClick={activeSmartNow.onAction}
            className="text-[11px] font-extrabold text-cyan-900 bg-white hover:bg-cyan-50 border border-slate-200 px-3 py-1.5 rounded-xl shrink-0 cursor-pointer shadow-2xs transition-colors flex items-center gap-1"
          >
            <span>{activeSmartNow.actionText}</span>
            <ChevronRight className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* 5. Popular In-Store Products */}
      <div className="space-y-2.5 pt-1">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
            Popular In-Store Products
          </h3>
          <button
            onClick={() => setActiveTab('SEARCH')}
            className="text-xs text-cyan-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View All</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        <div className="space-y-2">
          {STORE_CATALOG.slice(0, 3).map((product) => (
            <CustomerProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>

      {/* Offers Dialog Modal */}
      {showOffersModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 space-y-4 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2 text-amber-600 font-bold text-sm">
                <Tag className="h-4 w-4" />
                <span>Today's In-Store Offers</span>
              </div>
              <button
                onClick={() => setShowOffersModal(false)}
                className="text-xs text-slate-400 hover:text-slate-700 font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-slate-700">
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200">
                <span className="font-extrabold text-amber-900 block">🥛 Dairy Specials</span>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  Buy 2 Amul Pasteurised Salted Butter (500g), get 10% instant discount at checkout.
                </p>
              </div>

              <div className="p-3 bg-cyan-50 rounded-2xl border border-cyan-200">
                <span className="font-extrabold text-cyan-900 block">🧴 Personal Care Combo</span>
                <p className="text-[11px] text-cyan-800 mt-0.5">
                  Dove Daily Moisture 340ml with free sample pack on Shelf D4.
                </p>
              </div>

              <div className="p-3 bg-purple-50 rounded-2xl border border-purple-200">
                <span className="font-extrabold text-purple-900 block">🥨 Snacks Fiesta</span>
                <p className="text-[11px] text-purple-800 mt-0.5">
                  Britannia NutriChoice 250g at flat ₹65 in Aisle 4.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowOffersModal(false)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
