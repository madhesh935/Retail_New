import React from 'react'
import {
  Search,
  ShoppingBag,
  Navigation,
  ArrowRight,
  HandHelping,
} from 'lucide-react'
import { useCustomerShopping } from '../context/CustomerShoppingContext'
import { useCustomerAssist } from '../context/CustomerAssistContext'
import { CustomerProductCard } from '../components/CustomerProductCard'
import { AssistanceStatusCard } from '../components/assist/AssistanceStatusCard'
import { CustomerSaveTodaySection } from '../components/CustomerSaveTodaySection'

export const CustomerHomePage: React.FC = () => {
  const { shoppingList, setActiveTab, catalog } = useCustomerShopping()
  const { openHelpSheet } = useCustomerAssist()

  const listCount = shoppingList.length

  return (
    <div className="space-y-4 pb-20 select-none">
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

      {/* Active Help Request Status Banner */}
      <AssistanceStatusCard />

      {/* Save Today — Approved Dynamic Markdowns */}
      <CustomerSaveTodaySection />

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

        {/* 4. Need Help / Store Associate */}
        <button
          onClick={() => openHelpSheet()}
          className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-cyan-400 hover:shadow-sm transition-all text-left flex items-center gap-3 cursor-pointer group min-h-[56px]"
        >
          <div className="h-9 w-9 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <HandHelping className="h-4.5 w-4.5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs font-bold text-slate-900 leading-tight">Need Help?</h3>
            <p className="text-[10px] text-slate-500 truncate mt-0.5">Ask store associate</p>
          </div>
        </button>
      </div>

      {/* 4. Popular In-Store Products */}
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
          {catalog.slice(0, 3).map((product) => (
            <CustomerProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  )
}
