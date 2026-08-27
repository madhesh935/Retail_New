import React, { useState, useMemo, useRef, useEffect } from 'react'
import {
  Search,
  Bot,
  Tag,
  X,
  Clock,
} from 'lucide-react'
import { useCustomerShopping } from '../context/CustomerShoppingContext'
import { CustomerProductCard } from '../components/CustomerProductCard'

export const CustomerSearchPage: React.FC = () => {
  const { setActiveTab, catalog, searchCatalog } = useCustomerShopping()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'OFFERS'>('ALL')
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    searchInputRef.current?.focus()
  }, [])

  const categories = ['ALL', 'Groceries', 'Dairy', 'Snacks', 'Personal Care', 'Beverages']

  const recentSearches = ['Milk', 'Bread', 'Dove Shampoo', 'Cola Zero', 'Biscuits']

  const filteredProducts = useMemo(() => {
    let list = searchQuery.trim() ? searchCatalog(searchQuery) : catalog

    if (selectedFilter === 'IN_STOCK') {
      list = list.filter((p) => p.isAvailable && !p.isLowStock)
    } else if (selectedFilter === 'LOW_STOCK') {
      list = list.filter((p) => p.isLowStock)
    } else if (selectedFilter === 'OFFERS') {
      list = list.filter((p) => p.isLowStock || p.stockCount <= 8)
    }

    if (selectedCategory !== 'ALL') {
      list = list.filter((p) => p.category.toLowerCase().includes(selectedCategory.toLowerCase()))
    }

    return list
  }, [searchQuery, selectedFilter, selectedCategory, catalog, searchCatalog])

  return (
    <div className="space-y-3.5 pb-20 select-none">
      <div className="space-y-1 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h1 className="text-base font-extrabold tracking-tight text-slate-900">Find Products</h1>
        <p className="text-xs font-medium text-slate-500">
          Search products available in this store with live aisle & shelf locations
        </p>
      </div>

      <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search milk, shampoo, rice..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border-2 border-slate-200 bg-white py-3 pl-10 pr-9 text-sm text-slate-900 shadow-sm transition-colors placeholder-slate-400 focus:border-cyan-600 focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer p-1 text-xs text-slate-400 hover:text-slate-700"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 no-scrollbar">
          <button
            type="button"
            onClick={() => setSelectedFilter('ALL')}
            className={`cursor-pointer whitespace-nowrap rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
              selectedFilter === 'ALL'
                ? 'bg-cyan-700 text-white shadow-sm'
                : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            All Products
          </button>

          <button
            type="button"
            onClick={() => setSelectedFilter('IN_STOCK')}
            className={`cursor-pointer whitespace-nowrap rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
              selectedFilter === 'IN_STOCK'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            ● In Stock
          </button>

          <button
            type="button"
            onClick={() => setSelectedFilter('LOW_STOCK')}
            className={`cursor-pointer whitespace-nowrap rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
              selectedFilter === 'LOW_STOCK'
                ? 'bg-amber-700 text-white shadow-sm'
                : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            Low Stock
          </button>

          <button
            type="button"
            onClick={() => setSelectedFilter('OFFERS')}
            className={`flex cursor-pointer items-center gap-1 whitespace-nowrap rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
              selectedFilter === 'OFFERS'
                ? 'bg-purple-700 text-white shadow-sm'
                : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Tag className="h-3 w-3" /> Offers
          </button>
        </div>

        <div className="flex items-center gap-1 overflow-x-auto py-0.5 text-[11px] no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`cursor-pointer whitespace-nowrap rounded-lg px-2.5 py-1 font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-slate-800 font-bold text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {!searchQuery && selectedCategory === 'ALL' && selectedFilter === 'ALL' && (
        <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm">
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
                type="button"
                onClick={() => setSearchQuery(term)}
                className="cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-cyan-50 hover:text-cyan-800"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1 text-xs font-semibold text-slate-500">
          <span>Showing {filteredProducts.length} Items</span>
          <span className="text-[11px] font-bold text-cyan-700">Live Availability</span>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-8 text-center">
            <p className="text-xs font-bold text-slate-700">No matching product found</p>
            <p className="text-[11px] text-slate-500">
              Try searching with another keyword or ask our in-store AI assistant.
            </p>
            <div className="flex justify-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setActiveTab('ASSISTANT')}
                className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-cyan-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-cyan-700"
              >
                <Bot className="h-3.5 w-3.5" />
                <span>Ask Shopping AI</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSearchQuery('')
                  setSelectedFilter('ALL')
                  setSelectedCategory('ALL')
                }}
                className="cursor-pointer rounded-xl bg-slate-100 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200"
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
