import React from 'react'
import { Navigation, Footprints, Clock, ArrowRight, Sparkles, MapPin } from 'lucide-react'
import { useCustomerShopping, type CustomerProduct } from '../context/CustomerShoppingContext'
import type { CopilotProductRoutePreview } from '../lib/customerCopilotEnrichment'
import type { NavigationPlan } from '../types/navigation'

type Props = {
  /** When provided, show this product-specific route instead of the full shopping list route. */
  productRoute?: CopilotProductRoutePreview | null
  focusProduct?: CustomerProduct | null
  title?: string
}

export const CustomerMiniRoutePreview: React.FC<Props> = ({
  productRoute,
  focusProduct,
  title,
}) => {
  const {
    optimizedRoute,
    navigationPlan,
    setIsNavigating,
    setActiveTab,
    useCrowdAlternativeRoute,
    navigateToProduct,
    setRouteFocusProductIds,
  } = useCustomerShopping()

  const plan: NavigationPlan | null | undefined = productRoute?.plan || navigationPlan
  const itemsOnly = productRoute
    ? [{ title: productRoute.product.name, aisle: productRoute.aisle }]
    : optimizedRoute.filter((s) => s.item).map((s) => ({ title: s.item!.name, aisle: s.item!.aisle }))

  const trail = productRoute?.steps?.length
    ? productRoute.steps.map((s) => s.title)
    : optimizedRoute.map((step) =>
        step.item ? `${step.item.name.split(' (')[0]} (${step.item.aisle})` : step.title
      )

  const distanceLabel = productRoute?.distanceMeters
    ? `${Math.round(productRoute.distanceMeters)} m`
    : plan
      ? `${Math.round(plan.totalDistanceMeters)} m`
      : useCrowdAlternativeRoute
        ? '146 m'
        : '182 m'

  const timeLabel = productRoute?.estimatedMinutes
    ? `${productRoute.estimatedMinutes} min`
    : plan
      ? `${plan.estimatedMinutes} min`
      : useCrowdAlternativeRoute
        ? '8 min'
        : '11 min'

  const heading =
    title ||
    (productRoute
      ? `Route to ${productRoute.product.name.split(' (')[0]}`
      : 'Smart Route Ready')

  const handleStart = () => {
    if (productRoute?.product || focusProduct) {
      navigateToProduct(productRoute?.product || focusProduct!)
      return
    }
    setRouteFocusProductIds(null)
    setIsNavigating(true)
    setActiveTab('ROUTE')
  }

  return (
    <div className="rounded-2xl border border-cyan-200 bg-cyan-50/40 p-3.5 space-y-3 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <Sparkles className="h-4 w-4 text-cyan-600 shrink-0" />
          <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wide truncate">
            {heading}
          </h4>
        </div>
        <span className="text-[10px] font-bold bg-cyan-100 text-cyan-800 px-2 py-0.5 rounded-full shrink-0">
          {itemsOnly.length} stop{itemsOnly.length === 1 ? '' : 's'}
        </span>
      </div>

      {productRoute && (
        <div className="flex items-start gap-2 text-[11px] text-slate-700 bg-white border border-slate-200 rounded-xl px-2.5 py-2">
          <MapPin className="h-3.5 w-3.5 text-cyan-700 mt-0.5 shrink-0" />
          <div className="min-w-0">
            <div className="font-bold text-slate-900">
              {productRoute.availabilityLabel} · {productRoute.stockLabel}
            </div>
            <div className="text-slate-600">
              {productRoute.aisle} · {productRoute.shelf}
            </div>
          </div>
        </div>
      )}

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

      <div className="p-2 rounded-xl bg-white border border-slate-200 text-[11px] text-slate-600 font-medium">
        <div className="flex flex-wrap items-center gap-1">
          {trail.map((label, index) => (
            <React.Fragment key={`${label}-${index}`}>
              {index > 0 && <span className="text-slate-300">→</span>}
              <span
                className={
                  index === 0
                    ? 'font-bold text-slate-800'
                    : index === trail.length - 1
                      ? 'font-bold text-emerald-700'
                      : 'truncate max-w-[9rem]'
                }
              >
                {label}
              </span>
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 pt-1">
        <button
          type="button"
          onClick={handleStart}
          className="bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer active:scale-98 transition-all"
        >
          <Navigation className="h-3.5 w-3.5" />
          <span>Start Navigation</span>
        </button>

        <button
          type="button"
          onClick={() => {
            if (productRoute?.product || focusProduct) {
              navigateToProduct(productRoute?.product || focusProduct!)
              return
            }
            setRouteFocusProductIds(null)
            setIsNavigating(false)
            setActiveTab('ROUTE')
          }}
          className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1 cursor-pointer transition-all"
        >
          <span>View Full Map</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
