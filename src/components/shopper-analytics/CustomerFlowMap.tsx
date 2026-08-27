import React, { useState } from 'react'
import {
  Route,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export interface CustomerRoute {
  id: string
  name: string
  percentage: number
  steps: string[]
  description: string
  color: string
  svgPath: string
}

export const CUSTOMER_ROUTES: CustomerRoute[] = [
  {
    id: 'route-a',
    name: 'Quick Refreshment',
    percentage: 34,
    steps: ['Entrance', 'Beverages', 'Snacks', 'Checkout'],
    description: 'Fast convenience trip · Highest volume during evening rush',
    color: '#F43F5E',
    svgPath: 'M 200 35 Q 260 80 320 110 T 320 200 T 290 280',
  },
  {
    id: 'route-b',
    name: 'Fresh Grocery Basket',
    percentage: 28,
    steps: ['Entrance', 'Produce', 'Dairy', 'Checkout'],
    description: 'Perimeter fresh loop with large basket items',
    color: '#10B981',
    svgPath: 'M 200 35 Q 130 65 80 110 T 200 110 T 200 200 T 280 280',
  },
  {
    id: 'route-c',
    name: 'Household & Pantry',
    percentage: 21,
    steps: ['Entrance', 'Household', 'Dairy', 'Checkout'],
    description: 'Routine household restocking loop',
    color: '#06B6D4',
    svgPath: 'M 200 35 Q 100 120 80 200 T 180 180 T 270 280',
  },
  {
    id: 'route-d',
    name: 'High-Value Electronics',
    percentage: 17,
    steps: ['Entrance', 'Electronics', 'Checkout'],
    description: 'Extended dwell browsing and product comparison',
    color: '#A855F7',
    svgPath: 'M 200 35 Q 190 120 180 210 T 260 280',
  },
]

export const CustomerFlowMap: React.FC = () => {
  const [selectedRouteId, setSelectedRouteId] = useState<string>('route-a')

  const activeRoute =
    CUSTOMER_ROUTES.find((r) => r.id === selectedRouteId) || CUSTOMER_ROUTES[0]

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 flex flex-col justify-between shadow-2xs select-none h-full min-h-[420px] font-sans">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-sky-50 text-sky-600 border border-sky-200">
            <Route className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 tracking-wide">
              Shopper Flow Patterns
            </h3>
          </div>
        </div>

        <span className="text-[10px] text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200 font-semibold">
          4 Dominant Routes
        </span>
      </div>

      {/* Main Flow Content */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 my-3 flex-1 items-stretch">
        {/* Left 6 cols: SVG Single Route Floor Overlay */}
        <div className="md:col-span-6 relative h-64 md:h-auto rounded-xl bg-slate-50 border border-slate-200 overflow-hidden p-2 flex flex-col justify-between shadow-2xs">
          <svg className="w-full h-full" viewBox="0 0 400 320">
            {/* Zone Shapes */}
            {/* Entrance */}
            <rect x="140" y="10" width="120" height="30" rx="6" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" />
            <text x="200" y="28" fill="#475569" fontSize="10" textAnchor="middle" fontWeight="bold" fontFamily="sans-serif">
              ENTRANCE
            </text>

            {/* Produce */}
            <rect x="25" y="75" width="100" height="60" rx="6" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" />
            <text x="75" y="110" fill="#475569" fontSize="10" textAnchor="middle" fontFamily="sans-serif">
              Produce
            </text>

            {/* Dairy */}
            <rect x="150" y="75" width="100" height="60" rx="6" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" />
            <text x="200" y="110" fill="#475569" fontSize="10" textAnchor="middle" fontFamily="sans-serif">
              Dairy
            </text>

            {/* Beverages */}
            <rect x="275" y="75" width="100" height="60" rx="6" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" />
            <text x="325" y="110" fill="#475569" fontSize="10" textAnchor="middle" fontFamily="sans-serif">
              Beverages
            </text>

            {/* Household */}
            <rect x="25" y="170" width="100" height="60" rx="6" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" />
            <text x="75" y="205" fill="#475569" fontSize="10" textAnchor="middle" fontFamily="sans-serif">
              Household
            </text>

            {/* Electronics */}
            <rect x="150" y="170" width="100" height="60" rx="6" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" />
            <text x="200" y="205" fill="#475569" fontSize="10" textAnchor="middle" fontFamily="sans-serif">
              Electronics
            </text>

            {/* Checkout */}
            <rect x="250" y="250" width="125" height="45" rx="6" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" />
            <text x="312" y="278" fill="#475569" fontSize="10" textAnchor="middle" fontWeight="bold" fontFamily="sans-serif">
              CHECKOUT
            </text>

            {/* Glowing Active Route Line */}
            <path
              d={activeRoute.svgPath}
              fill="none"
              stroke={activeRoute.color}
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="6 4"
              className="transition-all duration-300"
            />

            {/* Route Start Indicator */}
            <circle cx="200" cy="35" r="5" fill={activeRoute.color} />
          </svg>

          <div className="text-[10px] text-slate-500 z-10 flex items-center justify-between px-1 bg-white/90 p-1.5 rounded-lg border border-slate-200">
            <span>Showing: <strong className="text-slate-900">{activeRoute.name}</strong></span>
            <span className="font-bold font-mono" style={{ color: activeRoute.color }}>{activeRoute.percentage}% of Shoppers</span>
          </div>
        </div>

        {/* Right 6 cols: Clickable Route List */}
        <div className="md:col-span-6 space-y-2 flex flex-col justify-between">
          {CUSTOMER_ROUTES.map((route, idx) => {
            const isSelected = selectedRouteId === route.id

            return (
              <button
                key={route.id}
                onClick={() => setSelectedRouteId(route.id)}
                className={cn(
                  'p-2.5 rounded-xl border text-left transition-all cursor-pointer w-full flex flex-col justify-between shadow-2xs',
                  isSelected
                    ? 'bg-sky-50 border-sky-400 shadow-sm ring-1 ring-sky-400'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                )}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                    <span
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{ backgroundColor: route.color }}
                    />
                    <span>{idx + 1}. {route.name}</span>
                  </div>
                  <span className="text-xs font-bold font-mono text-slate-900">
                    {route.percentage}%
                  </span>
                </div>

                <div className="text-[11px] text-slate-600 flex items-center gap-1 flex-wrap my-0.5">
                  {route.steps.map((step, i) => (
                    <React.Fragment key={i}>
                      <span className={cn(i === 0 || i === route.steps.length - 1 ? 'text-slate-900 font-semibold' : 'text-slate-700')}>
                        {step}
                      </span>
                      {i < route.steps.length - 1 && (
                        <ArrowRight className="h-2.5 w-2.5 text-slate-400" />
                      )}
                    </React.Fragment>
                  ))}
                </div>

                <div className="text-[10px] text-slate-500 mt-1 truncate">
                  {route.description}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-500">
        Aggregate transitions derived from anonymous cross-zone sensor continuity
      </div>
    </div>
  )
}
