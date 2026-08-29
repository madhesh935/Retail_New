import React, { useState } from 'react'
import {
  Navigation,
  Clock,
  Footprints,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowDown,
  ShoppingBag,
  RotateCcw,
  Check,
  ChevronLeft,
  MapPin,
  CreditCard,
} from 'lucide-react'
import { useCustomerShopping, CustomerProduct } from '../context/CustomerShoppingContext'
import { useCustomerAssist } from '../context/CustomerAssistContext'
import { CustomerIndoorMap2D } from '../components/CustomerIndoorMap2D'
import { CheckoutRecommendationCard } from '../components/CheckoutRecommendationCard'
import { OutOfStockAlertModal } from '../components/OutOfStockAlertModal'
import { HandHelping } from 'lucide-react'

export const SmartMapRoutePage: React.FC = () => {
  const {
    shoppingList,
    optimizedRoute,
    navigationPlan,
    activeStepIndex,
    setActiveStepIndex,
    toggleItemCollected,
    skipItem,
    isAisle4Congested,
    useCrowdAlternativeRoute,
    setUseCrowdAlternativeRoute,
    isNavigating,
    setIsNavigating,
    targetCheckoutCounter,
    isNavigatingToCheckout,
    setIsNavigatingToCheckout,
    showToast,
    setActiveTab,
    routeFocusProductIds,
    setRouteFocusProductIds,
    checkoutLanes,
  } = useCustomerShopping()
  const { openHelpSheet } = useCustomerAssist()

  const [foundFeedback, setFoundFeedback] = useState<string | null>(null)
  const [reachedCheckoutConfirmation, setReachedCheckoutConfirmation] = useState(false)

  const targetLane = checkoutLanes.find((lane) => lane.code === targetCheckoutCounter)
  const targetWaitLabel = (() => {
    const seconds = targetLane?.waitSeconds ?? 0
    if (!Number.isFinite(seconds) || seconds <= 0) return 'No wait'
    const mins = seconds / 60
    return mins < 1 ? '<1 min' : `~${mins.toFixed(1)} min`
  })()

  const focusMode = Boolean(routeFocusProductIds?.length)
  const itemsOnly = optimizedRoute.filter((step) => step.item)
  const completedCount = itemsOnly.filter((step) => step.item?.isCollected).length
  const skippedCount = itemsOnly.filter((step) => step.item?.isSkipped).length
  const totalItemsCount = itemsOnly.length
  const allItemsResolved = totalItemsCount > 0 && completedCount + skippedCount === totalItemsCount
  const progressPercent = totalItemsCount > 0 ? Math.round((completedCount / totalItemsCount) * 100) : 0
  const routeDistanceLabel = navigationPlan
    ? `${Math.round(navigationPlan.totalDistanceMeters)} m`
    : 'Calculating…'
  const routeTimeLabel = navigationPlan
    ? `${navigationPlan.estimatedMinutes} min`
    : 'Calculating…'

  // Current active step (find first uncompleted, unskipped item)
  const currentStep =
    optimizedRoute[activeStepIndex] ||
    itemsOnly.find((s) => !s.item?.isCollected && !s.item?.isSkipped) ||
    optimizedRoute[1] ||
    optimizedRoute[0]

  const currentSequenceNumber = currentStep?.stepIndex || activeStepIndex + 1

  const handleItemFound = () => {
    if (currentStep?.item) {
      toggleItemCollected(currentStep.item.id)
      const shortName = currentStep.item.name.split(' (')[0]
      setFoundFeedback(`✓ ${shortName} found`)
      setTimeout(() => setFoundFeedback(null), 1800)
    }

    // Auto advance to next uncompleted step
    if (activeStepIndex < optimizedRoute.length - 1) {
      setActiveStepIndex(activeStepIndex + 1)
    }
  }

  const handleSkip = () => {
    if (currentStep?.item) {
      skipItem(currentStep.item.id)
      showToast(`Skipped ${currentStep.item.name.split(' (')[0]}`)
    }

    if (activeStepIndex < optimizedRoute.length - 1) {
      setActiveStepIndex(activeStepIndex + 1)
    }
  }

  const handleAvoidCrowd = () => {
    setUseCrowdAlternativeRoute(true)
    showToast('Updating the route to avoid congested corridors')
  }

  const handleStandardRoute = () => {
    setUseCrowdAlternativeRoute(false)
    showToast('Switched back to standard route')
  }

  // =========================================================================
  // VIEW 1: PRE-NAVIGATION SMART ROUTE SUMMARY
  // =========================================================================
  if (!isNavigating) {
    return (
      <div className="space-y-4 pb-8 select-none">
        {focusMode && (
          <div className="rounded-2xl border border-cyan-200 bg-cyan-50 px-3.5 py-2.5 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="text-[10px] font-extrabold uppercase tracking-wide text-cyan-800">
                Product route focus
              </div>
              <div className="text-xs font-bold text-slate-900 truncate">
                Showing path for {itemsOnly.map((s) => s.item?.name.split(' (')[0]).join(', ') || 'selected item'}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setRouteFocusProductIds(null)}
              className="text-[10px] font-bold text-cyan-800 bg-white border border-cyan-200 px-2 py-1 rounded-lg shrink-0"
            >
              Show full list
            </button>
          </div>
        )}
        {/* Header */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center font-bold">
                <Navigation className="h-4 w-4" />
              </div>
              <div>
                <h1 className="text-sm font-extrabold text-slate-900 leading-tight">
                  {focusMode ? 'Product Walking Route' : 'Your Smart Route'}
                </h1>
                <span className="text-[11px] text-slate-500 font-medium">
                  {totalItemsCount} stop{totalItemsCount === 1 ? '' : 's'} • Live shelf navigation
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() =>
                  openHelpSheet({
                    zoneName: 'Store Floor',
                    requestType: 'PRODUCT_ASSISTANCE',
                  })
                }
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-200 text-[11px] font-bold cursor-pointer transition-all shadow-2xs"
              >
                <HandHelping className="h-3 w-3 text-cyan-700" />
                <span>Need Help?</span>
              </button>
            </div>
          </div>

          {/* Key Metrics: Distance & Shopping Time */}
          <div className="grid grid-cols-2 gap-2 text-center pt-1 border-t border-slate-100">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase font-semibold flex items-center justify-center gap-1">
                <Footprints className="h-3 w-3 text-cyan-600" />
                <span>Walking Distance</span>
              </span>
              <span className="text-base font-extrabold text-slate-900 mt-0.5 block">
                {routeDistanceLabel}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase font-semibold flex items-center justify-center gap-1">
                <Clock className="h-3 w-3 text-cyan-600" />
                <span>Est. Walking Time</span>
              </span>
              <span className="text-base font-extrabold text-slate-900 mt-0.5 block">
                {routeTimeLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Ordered Waypoint Sequence */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
          <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
            Optimized In-Store Sequence
          </h3>

          <div className="space-y-1 text-xs">
            {/* 1. Entrance */}
            <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-50 border border-slate-200">
              <div className="h-6 w-6 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-[10px]">
                1
              </div>
              <span className="font-bold text-slate-800">Entrance & Turnstiles</span>
            </div>

            <div className="flex justify-center py-0.5 text-slate-300">
              <ArrowDown className="h-3.5 w-3.5 text-slate-400" />
            </div>

            {/* Product steps */}
            {itemsOnly.map((step, idx) => (
              <React.Fragment key={idx}>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-cyan-50/50 border border-cyan-200">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-6 w-6 rounded-full bg-cyan-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0">
                      {idx + 2}
                    </div>
                    <div className="truncate">
                      <h4 className="font-bold text-slate-900 truncate">{step.title}</h4>
                      <span className="text-[11px] text-cyan-800 font-medium">{step.location}</span>
                    </div>
                  </div>
                  {step.item?.isLowStock && (
                    <span className="text-[9px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded shrink-0">
                      LOW STOCK
                    </span>
                  )}
                </div>

                <div className="flex justify-center py-0.5 text-slate-300">
                  <ArrowDown className="h-3.5 w-3.5 text-slate-400" />
                </div>
              </React.Fragment>
            ))}

            {/* Final: Checkout */}
            <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50 border border-emerald-200">
              <div className="flex items-center gap-2.5">
                <div className="h-6 w-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px]">
                  {itemsOnly.length + 2}
                </div>
                <div>
                  <span className="font-bold text-slate-900">Checkout {targetCheckoutCounter}</span>
                  <span className="text-[10px] text-emerald-700 block font-medium">Fastest checkout • {targetWaitLabel}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Primary CTA: START NAVIGATION */}
        <button
          onClick={() => {
            setIsNavigating(true)
            setIsNavigatingToCheckout(false)
            setReachedCheckoutConfirmation(false)
          }}
          className="w-full bg-gradient-to-r from-teal-700 to-teal-600 hover:from-teal-800 hover:to-teal-700 text-white text-sm h-12 rounded-2xl font-extrabold shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
        >
          <Navigation className="h-4.5 w-4.5" />
          <span>START NAVIGATION</span>
          <ArrowRight className="h-4.5 w-4.5" />
        </button>
      </div>
    )
  }

  // =========================================================================
  // VIEW 2: ACTIVE MAP-FIRST NAVIGATION MODE
  // =========================================================================
  return (
    <div className="space-y-3 pb-8 select-none">
      {/* 1. Top Bar: Back button, Progress Bar & Time remaining */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-sm space-y-2">
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              setIsNavigating(false)
              setIsNavigatingToCheckout(false)
            }}
            className="flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 font-bold p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Smart Route</span>
          </button>

          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <span className="text-cyan-800 font-extrabold">
              {completedCount}/{totalItemsCount} found
            </span>
            <button
              onClick={() =>
                openHelpSheet({
                  product: currentStep?.item,
                  shelfCode: currentStep?.item?.shelf,
                  zoneName: currentStep?.location || 'Store Floor',
                  requestType: 'PRODUCT_ASSISTANCE',
                })
              }
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-200 text-[10px] font-bold cursor-pointer transition-all shadow-2xs"
            >
              <HandHelping className="h-3 w-3 text-cyan-700" />
              <span>Need Help?</span>
            </button>
          </div>
        </div>

        {/* Thin Visual Progress Bar */}
        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-cyan-500 to-emerald-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* 2. Single Non-Duplicated Crowd Notification Banner */}
      {isAisle4Congested && !isNavigatingToCheckout && (
        <>
          {/* STATE 1: Congestion detected, alternative available */}
          {!useCrowdAlternativeRoute ? (
            <div className="bg-amber-50 border border-amber-300 rounded-2xl p-3 flex items-center justify-between gap-2 shadow-sm animate-in fade-in">
              <div className="flex items-center gap-2 min-w-0">
                <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-amber-900 leading-tight">Aisle 4 is busy</h4>
                  <p className="text-[10px] text-amber-700 truncate">
                    A less crowded route is available.
                  </p>
                </div>
              </div>
              <button
                onClick={handleAvoidCrowd}
                className="text-[11px] font-extrabold text-amber-950 bg-amber-200 hover:bg-amber-300 px-3 py-1.5 rounded-xl shrink-0 cursor-pointer shadow-2xs transition-colors"
              >
                Avoid Crowd
              </button>
            </div>
          ) : (
            /* STATE 2: Route updated to bypass Aisle 4 */
            <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-3 flex items-center justify-between gap-2 shadow-sm animate-in fade-in">
              <div className="flex items-center gap-2 min-w-0">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-emerald-900 leading-tight">Route Updated</h4>
                  <p className="text-[10px] text-emerald-700 truncate">
                    We've adjusted your route to avoid Aisle 4.
                  </p>
                </div>
              </div>
              <button
                onClick={handleStandardRoute}
                className="text-[10px] font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 px-2.5 py-1.5 rounded-xl shrink-0 cursor-pointer transition-colors"
              >
                Standard Route
              </button>
            </div>
          )}
        </>
      )}

      {/* 3. Large Store Map */}
      <div className="bg-white rounded-3xl p-2 border border-slate-200 shadow-sm h-[390px] sm:h-[430px] flex flex-col">
        <CustomerIndoorMap2D />
      </div>

      {/* Temporary Item Found Feedback Banner */}
      {foundFeedback && (
        <div className="bg-emerald-600 text-white rounded-xl py-2 px-3 text-xs font-bold text-center shadow-md animate-in zoom-in-95 duration-150">
          {foundFeedback}
        </div>
      )}

      {/* 4. Active Navigation State Switcher */}
      {reachedCheckoutConfirmation ? (
        /* Reached Checkout Final Feedback */
        <div className="bg-emerald-50 border-2 border-emerald-400 rounded-3xl p-5 text-center space-y-3 shadow-md animate-in zoom-in-95">
          <div className="h-12 w-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-sm">
            <Check className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-emerald-900">
              You've reached Checkout {targetCheckoutCounter} ✓
            </h3>
            <p className="text-xs text-emerald-700 mt-1">
              Thank you for shopping with us at Retail Edge.
            </p>
          </div>

          <button
            onClick={() => {
              setIsNavigating(false)
              setIsNavigatingToCheckout(false)
              setReachedCheckoutConfirmation(false)
              setActiveTab('HOME')
            }}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs h-10 rounded-xl font-bold cursor-pointer"
          >
            Finish Shopping
          </button>
        </div>
      ) : isNavigatingToCheckout ? (
        /* Active Checkout Lane Wayfinding */
        <div className="bg-white rounded-3xl p-4 border-2 border-emerald-500 shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
              NEXT STOP
            </span>
          </div>

          <div>
            <h3 className="text-sm font-extrabold text-slate-900 leading-tight">
              Checkout Counter {targetCheckoutCounter}
            </h3>
            <div className="flex items-center gap-2 text-xs text-slate-600 font-medium mt-1">
              <CreditCard className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span>
                Estimated Wait: {targetWaitLabel}
              </span>
            </div>
          </div>

          <button
            onClick={() => setReachedCheckoutConfirmation(true)}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold h-11 rounded-2xl shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
          >
            <Check className="h-4 w-4" />
            <span>REACHED CHECKOUT ✓</span>
          </button>
        </div>
      ) : !allItemsResolved ? (
        /* Next Product Destination Card */
        <div className="bg-white rounded-3xl p-4 border-2 border-cyan-500 shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-cyan-800 bg-cyan-100 px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
              <span>NEXT STOP</span>
              <span className="bg-cyan-600 text-white rounded-full h-4 w-4 inline-flex items-center justify-center text-[9px]">
                {currentSequenceNumber}
              </span>
            </span>
          </div>

          <div>
            <h3 className="text-sm font-extrabold text-slate-900 leading-tight">
              {currentStep?.title || 'Loading next stop…'}
            </h3>
            <div className="flex items-center gap-2 text-xs text-slate-600 font-medium mt-1">
              <MapPin className="h-3.5 w-3.5 text-cyan-600 shrink-0" />
              <span>{currentStep?.location || 'Locating…'}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
            <button
              onClick={handleItemFound}
              className="bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-extrabold py-3 px-3 rounded-2xl shadow-sm flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 transition-all min-h-[44px]"
            >
              <Check className="h-4 w-4" />
              <span>ITEM FOUND ✓</span>
            </button>

            <button
              onClick={handleSkip}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold py-3 px-3 rounded-2xl cursor-pointer min-h-[44px]"
            >
              SKIP
            </button>
          </div>
        </div>
      ) : (
        /* All Items Resolved: Final Checkout Recommendation State */
        <div className="space-y-3">
          <div className="bg-emerald-50 border border-emerald-300 rounded-3xl p-4 text-center space-y-1 shadow-sm">
            <div className="h-10 w-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto mb-1">
              <Check className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-extrabold text-emerald-900">SHOPPING COMPLETE ✓</h3>
            <p className="text-xs text-emerald-700">
              {skippedCount > 0
                ? `${completedCount} items collected (${skippedCount} skipped). Ready to check out?`
                : 'All items collected! Proceed to the fastest counter.'}
            </p>

            {skippedCount > 0 && (
              <div className="pt-2 flex justify-center gap-2">
                <button
                  onClick={() => {
                    // Reset to first skipped item
                    setActiveStepIndex(1)
                  }}
                  className="text-xs text-cyan-800 font-bold bg-white border border-cyan-200 px-3 py-1 rounded-xl cursor-pointer"
                >
                  Find Skipped Items
                </button>
              </div>
            )}
          </div>

          {/* Live Checkout Recommendation (real queue data, shared with the copilot card) */}
          <CheckoutRecommendationCard
            onNavigateToCheckout={() =>
              showToast(`Navigating directly to Checkout ${targetCheckoutCounter}`)
            }
          />
        </div>
      )}

      {/* Out of Stock Substitute Modal */}
      <OutOfStockAlertModal />
    </div>
  )
}
