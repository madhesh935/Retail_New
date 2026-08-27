import React, { useMemo, useState } from 'react'
import {
  Navigation,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { useCustomerShopping } from '../context/CustomerShoppingContext'

interface CheckoutRecommendationCardProps {
  onNavigateToCheckout?: () => void
}

function formatWait(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return 'Now'
  const mins = seconds / 60
  if (mins < 1) return '<1 min'
  return `${mins.toFixed(1)} min`
}

export const CheckoutRecommendationCard: React.FC<CheckoutRecommendationCardProps> = ({
  onNavigateToCheckout,
}) => {
  const {
    checkoutLanes,
    recommendedCheckout,
    setTargetCheckoutCounter,
    setIsNavigatingToCheckout,
    setActiveTab,
  } = useCustomerShopping()
  const [showOtherCounters, setShowOtherCounters] = useState(false)

  const openLanes = useMemo(
    () =>
      checkoutLanes
        .filter((lane) => lane.status !== 'CLOSED')
        .sort((a, b) => a.waitSeconds - b.waitSeconds),
    [checkoutLanes]
  )

  const best = recommendedCheckout || openLanes[0]
  const laneCode = best?.code || 'C2'
  const queueLen = best?.queueLength ?? 0
  const waitLabel = formatWait(best?.waitSeconds ?? 0)

  const handleNavigate = () => {
    if (['C1', 'C2', 'C3', 'C4', 'C5'].includes(laneCode)) {
      setTargetCheckoutCounter(laneCode as 'C1' | 'C2' | 'C3' | 'C4' | 'C5')
    }
    setIsNavigatingToCheckout(true)
    setActiveTab('ROUTE')
    onNavigateToCheckout?.()
  }

  return (
    <div className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-4 shadow-sm text-slate-800 space-y-3 select-none">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wide">
              Recommended Checkout
            </h4>
            <span className="text-[11px] text-slate-500 font-medium">
              {checkoutLanes.length ? 'Live queue wait from store lanes' : 'Connecting to live queues…'}
            </span>
          </div>
        </div>

        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
          FASTEST CHECKOUT
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center p-3 rounded-2xl bg-white border border-emerald-200 shadow-2xs">
        <div>
          <span className="text-[10px] text-slate-500 uppercase font-bold block">Counter</span>
          <span className="text-sm font-extrabold text-slate-900">COUNTER {laneCode}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 uppercase font-bold block">Queue</span>
          <span className="text-sm font-extrabold text-emerald-600">
            {queueLen} customer{queueLen === 1 ? '' : 's'}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 uppercase font-bold block">Estimated Wait</span>
          <span className="text-sm font-extrabold text-cyan-800">{waitLabel}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleNavigate}
        className="w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs h-11 rounded-2xl font-extrabold shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
      >
        <Navigation className="h-4 w-4" />
        <span>NAVIGATE TO {laneCode}</span>
      </button>

      <div className="pt-1 text-center">
        <button
          type="button"
          onClick={() => setShowOtherCounters(!showOtherCounters)}
          className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center justify-center gap-1 mx-auto py-1 cursor-pointer transition-colors"
        >
          <span>View Other Counters</span>
          {showOtherCounters ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>

        {showOtherCounters && (
          <div className="grid grid-cols-3 gap-2 pt-2 text-[11px] text-left">
            {(openLanes.length ? openLanes : [{ code: laneCode, waitSeconds: best?.waitSeconds || 0, queueLength: queueLen, status: 'ACTIVE' }]).slice(0, 6).map((lane) => {
              const isBest = lane.code === laneCode
              return (
                <button
                  key={lane.code}
                  type="button"
                  onClick={() => {
                    if (['C1', 'C2', 'C3', 'C4', 'C5'].includes(lane.code)) {
                      setTargetCheckoutCounter(lane.code as 'C1' | 'C2' | 'C3' | 'C4' | 'C5')
                    }
                  }}
                  className={`p-2 rounded-xl border text-left ${
                    isBest
                      ? 'bg-emerald-50 border-emerald-300'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <span className={`font-bold block ${isBest ? 'text-emerald-900' : 'text-slate-800'}`}>
                    Counter {lane.code}
                  </span>
                  <span
                    className={`font-extrabold ${
                      isBest ? 'text-emerald-700' : lane.waitSeconds > 240 ? 'text-rose-600' : 'text-amber-600'
                    }`}
                  >
                    {formatWait(lane.waitSeconds)}
                    {isBest ? ' (Best)' : ''}
                  </span>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
