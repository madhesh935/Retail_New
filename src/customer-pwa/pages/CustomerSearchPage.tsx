import React, { useState, useMemo, useRef, useEffect } from 'react'
import {
  Search,
  Bot,
  Sparkles,
  Tag,
  Filter,
  X,
  Clock,
  ArrowRight,
} from 'lucide-react'
import { useCustomerShopping, STORE_CATALOG, CustomerProduct } from '../context/CustomerShoppingContext'
import { CustomerProductCard } from '../components/CustomerProductCard'

export const CustomerSearchPage: React.FC = () => {
  const { setActiveTab } = useCustomerShopping()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'OFFERS'>('ALL')
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    searchInputRef.current?.focus()
  }, [])

  const categories = ['ALL', 'Groceries', 'Dairy', 'Snacks', 'Personal Care', 'Beverages']

  const recentSearches = ['Milk', 'Bread', 'Dove Shampoo', 'Cola Zero', 'Biscuits']

  // Filtered product results
  const filteredProducts = useMemo(() => {
    let list = STORE_CATALOG

    // Search text match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.aisle.toLowerCase().includes(q) ||
          p.shelf.toLowerCase().includes(q)
      )
    }

    // Availability / Offers Filter
    if (selectedFilter === 'IN_STOCK') {
      list = list.filter((p) => p.isAvailable && !p.isLowStock)
    } else if (selectedFilter === 'LOW_STOCK') {
      list = list.filter((p) => p.isLowStock)
    } else if (selectedFilter === 'OFFERS') {
      list = list.filter((p) => p.id === 'prod-dove' || p.id === 'prod-biscuits')
    }

    // Category Filter
    if (selectedCategory !== 'ALL') {
      list = list.filter((p) => p.category.toLowerCase().includes(selectedCategory.toLowerCase()))
    }

    return list
  }, [searchQuery, selectedFilter, selectedCategory])

  return (
    <div className="space-y-3.5 pb-8 select-none">
      {/* 1. Search Header */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-1">
        <h1 className="text-base font-extrabold text-slate-900 tracking-tight">
          Find Products
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          Search products available in this store with live aisle & shelf locations
        </p>
      </div>

      {/* 2. Sticky Search Bar */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md pb-1 space-y-2">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search milk, shampoo, rice..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border-2 border-slate-200 focus:border-cyan-600 rounded-2xl pl-10 pr-9 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none shadow-sm transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* 3. Availability Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <button
            onClick={() => setSelectedFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              selectedFilter === 'ALL'
                ? 'bg-cyan-700 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            All Products
          </button>

          <button
            onClick={() => setSelectedFilter('IN_STOCK')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              selectedFilter === 'IN_STOCK'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            ● In Stock
          </button>

          <button
            onClick={() => setSelectedFilter('LOW_STOCK')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              selectedFilter === 'LOW_STOCK'
                ? 'bg-amber-700 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Low Stock
          </button>

          <button
            onClick={() => setSelectedFilter('OFFERS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
              selectedFilter === 'OFFERS'
                ? 'bg-purple-700 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Tag className="h-3 w-3" /> Offers
          </button>
        </div>

        {/* 4. Category Pills */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 text-[11px]">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-slate-800 text-white font-bold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 5. Recent Searches (if search is empty and no custom category selected) */}
      {!searchQuery && selectedCategory === 'ALL' && selectedFilter === 'ALL' && (
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-slate-400" />
              <span>Recent Searches</span>
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {recentSearches.map((term) => (
              <button
                key={term}
                onClick={() => setSearchQuery(term)}
                className="text-xs font-medium text-slate-700 bg-slate-50 hover:bg-cyan-50 hover:text-cyan-800 border border-slate-200 rounded-xl px-3 py-1.5 cursor-pointer transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 6. Product Results Feed */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
          <span>Showing {filteredProducts.length} Items</span>
          <span className="text-[11px] text-cyan-700 font-bold">Live Availability</span>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
            <p className="text-xs font-bold text-slate-700">No matching product found</p>
            <p className="text-[11px] text-slate-500">
              Try searching with another keyword or ask our in-store AI assistant.
            </p>
            <div className="flex justify-center gap-2 pt-1">
              <button
                onClick={() => setActiveTab('ASSISTANT')}
                className="bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold py-2 px-3.5 rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Bot className="h-3.5 w-3.5" />
                <span>Ask Shopping AI</span>
              </button>

              <button
                onClick={() => {
                  setSearchQuery('')
                  setSelectedFilter('ALL')
                  setSelectedCategory('ALL')
                }}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold py-2 px-3.5 rounded-xl cursor-pointer"
              >
                Clear Filters
              </button>
            </div>
          </div>
        ) : (
          filteredProducts.map((product) => (
            <CustomerProductCard key={product.id} product={product} />
          ))
        )}
      </div>
    </div>
  )
}
