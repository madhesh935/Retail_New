import React, { useState } from 'react'
import {
  CreditCard,
  Clock,
  Users,
  Navigation,
  Sparkles,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'

interface CheckoutRecommendationCardProps {
  onNavigateToCheckout?: () => void
}

export const CheckoutRecommendationCard: React.FC<CheckoutRecommendationCardProps> = ({
  onNavigateToCheckout,
}) => {
  const [showOtherCounters, setShowOtherCounters] = useState(false)

  return (
    <div className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-4 shadow-sm text-slate-800 space-y-3 select-none">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wide">
              Recommended Checkout
            </h4>
            <span className="text-[11px] text-slate-500 font-medium">Fastest available lane right now</span>
          </div>
        </div>

        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
          FASTEST CHECKOUT
        </span>
      </div>

      {/* Recommended Counter Detail (C2) */}
      <div className="grid grid-cols-3 gap-2 text-center p-3 rounded-2xl bg-white border border-emerald-200 shadow-2xs">
        <div>
          <span className="text-[10px] text-slate-500 uppercase font-bold block">Counter</span>
          <span className="text-sm font-extrabold text-slate-900">COUNTER C2</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 uppercase font-bold block">Queue</span>
          <span className="text-sm font-extrabold text-emerald-600">2 customers</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 uppercase font-bold block">Estimated Wait</span>
          <span className="text-sm font-extrabold text-cyan-800">1.8 min</span>
        </div>
      </div>

      {/* Primary CTA: NAVIGATE TO C2 */}
      <button
        onClick={onNavigateToCheckout}
        className="w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs h-11 rounded-2xl font-extrabold shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
      >
        <Navigation className="h-4 w-4" />
        <span>NAVIGATE TO C2</span>
      </button>

      {/* Secondary: View Other Counters */}
      <div className="pt-1 text-center">
        <button
          onClick={() => setShowOtherCounters(!showOtherCounters)}
          className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center justify-center gap-1 mx-auto py-1 cursor-pointer transition-colors"
        >
          <span>View Other Counters</span>
          {showOtherCounters ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>

        {showOtherCounters && (
          <div className="grid grid-cols-3 gap-2 pt-2 text-[11px] text-left">
            <div className="p-2 rounded-xl bg-white border border-slate-200">
              <span className="font-bold text-slate-800 block">Counter C1</span>
              <span className="text-rose-600 font-extrabold">5.4 min</span>
            </div>
            <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-300">
              <span className="font-bold text-emerald-900 block">Counter C2</span>
              <span className="text-emerald-700 font-extrabold">1.8 min (Best)</span>
            </div>
            <div className="p-2 rounded-xl bg-white border border-slate-200">
              <span className="font-bold text-slate-800 block">Counter C3</span>
              <span className="text-amber-600 font-extrabold">3.1 min</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
