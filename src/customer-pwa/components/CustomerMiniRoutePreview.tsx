import React from 'react'
import { Navigation, Footprints, Clock, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react'
import { useCustomerShopping } from '../context/CustomerShoppingContext'

export const CustomerMiniRoutePreview: React.FC = () => {
  const {
    optimizedRoute,
    navigationPlan,
    setIsNavigating,
    setActiveTab,
    useCrowdAlternativeRoute,
  } = useCustomerShopping()

  const itemsOnly = optimizedRoute.filter((s) => s.item)
  const distanceLabel = navigationPlan
    ? `${Math.round(navigationPlan.totalDistanceMeters)} m`
    : useCrowdAlternativeRoute ? '146 m' : '182 m'
  const timeLabel = navigationPlan
    ? `${navigationPlan.estimatedMinutes} min`
    : useCrowdAlternativeRoute ? '8 min' : '11 min'

  return (
    <div className="rounded-2xl border border-cyan-200 bg-cyan-50/40 p-3.5 space-y-3 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Sparkles className="h-4 w-4 text-cyan-600" />
          <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wide">
            Smart Route Ready
          </h4>
        </div>
        <span className="text-[10px] font-bold bg-cyan-100 text-cyan-800 px-2 py-0.5 rounded-full">
          {itemsOnly.length} items
        </span>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-2 text-center text-xs">
        <div className="p-2 rounded-xl bg-white border border-slate-200">
          <span className="text-[10px] text-slate-400 font-bold block flex items-center justify-center gap-1">
            <Footprints className="h-3 w-3 text-cyan-600" /> Walking
          </span>
          <span className="font-extrabold text-slate-900">{distanceLabel}</span>
        </div>
        <div className="p-2 rounded-xl bg-white border border-slate-200">
          <span className="text-[10px] text-slate-400 font-bold block flex items-center justify-center gap-1">
            <Clock className="h-3 w-3 text-cyan-600" /> Est. Time
          </span>
          <span className="font-extrabold text-slate-900">{timeLabel}</span>
        </div>
      </div>

      {/* Simplified Waypoint Trail */}
      <div className="p-2 rounded-xl bg-white border border-slate-200 text-[11px] text-slate-600 font-medium space-y-1">
        <div className="flex items-center gap-1.5 truncate">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-600 shrink-0" />
          {optimizedRoute.map((step, index) => (
            <React.Fragment key={`${step.title}-${index}`}>
              {index > 0 && <span>→</span>}
              <span className={index === 0 ? 'font-bold text-slate-800' : index === optimizedRoute.length - 1 ? 'font-bold text-emerald-700' : 'truncate'}>
                {step.item ? `${step.item.name.split(' (')[0]} (${step.item.aisle})` : step.title}
              </span>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <button
          onClick={() => {
            setIsNavigating(true)
            setActiveTab('ROUTE')
          }}
          className="bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer active:scale-98 transition-all"
        >
          <Navigation className="h-3.5 w-3.5" />
          <span>Start Navigation</span>
        </button>

        <button
          onClick={() => {
            setIsNavigating(false)
            setActiveTab('ROUTE')
          }}
          className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1 cursor-pointer transition-all"
        >
          <span>View Full Route</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
