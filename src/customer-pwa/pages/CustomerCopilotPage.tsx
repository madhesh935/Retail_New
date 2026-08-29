import React, { useState, useRef, useEffect } from 'react'
import { formatCopilotDisplayText } from '@/customer-pwa/lib/customerCopilotEnrichment'
import {
  Sparkles,
  Send,
  Plus,
  Minus,
  Navigation,
  ShoppingBag,
  ArrowRight,
  MapPin,
  Clock,
  Footprints,
  Tag,
  AlertTriangle,
  RotateCcw,
  Check,
  Bot,
} from 'lucide-react'
import {
  useCustomerShopping,
  CustomerProduct,
  CopilotShoppingPlanItem,
} from '../context/CustomerShoppingContext'
import { useCustomerAssist } from '../context/CustomerAssistContext'
import { CustomerMiniRoutePreview } from '../components/CustomerMiniRoutePreview'
import { CheckoutRecommendationCard } from '../components/CheckoutRecommendationCard'
import { CopilotRobotIcon } from '../components/CopilotRobotIcon'
import { HandHelping } from 'lucide-react'

export const CustomerCopilotPage: React.FC = () => {
  const {
    storeName,
    catalogLoading,
    copilotMessages,
    sendCopilotMessage,
    copilotIsTyping,
    clearCopilotMessages,
    addToShoppingList,
    addMultipleToShoppingList,
    setActiveTab,
    setIsNavigating,
    navigateToProduct,
    setRouteFocusProductIds,
  } = useCustomerShopping()
  const { openHelpSheet } = useCustomerAssist()

  const [inputPrompt, setInputPrompt] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [copilotMessages, copilotIsTyping])

  const quickIdeas = [
    { label: 'Where is Milk?', prompt: 'Where can I find milk?' },
    { label: 'Buy Dove shampoo', prompt: 'I want to buy Dove shampoo' },
    { label: 'Find bread', prompt: 'Is bread available? Show me the route' },
    { label: 'Tea location', prompt: 'Where is Tata tea in the store?' },
    { label: 'Breakfast for 4', prompt: 'I need groceries for breakfast for 4 people' },
    { label: 'Snacks under ₹500', prompt: 'I want snacks for 5 people under ₹500' },
    { label: 'Pasta Dinner', prompt: 'Help me buy ingredients for pasta dinner' },
    { label: 'Fastest Checkout', prompt: 'Which checkout lane is fastest right now?' },
  ]

  const handleSend = (text: string) => {
    if (!text.trim()) return
    sendCopilotMessage(text)
    setInputPrompt('')
  }

  return (
    <div className="flex h-full min-h-0 flex-col select-none">
      {/* Header */}
      <div className="shrink-0 px-4 pb-2 pt-4">
        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-cyan-200 bg-cyan-50 font-bold text-cyan-700 shadow-2xs">
              <CopilotRobotIcon className="h-5.5 w-5.5" stroke="#0F766E" />
            </div>
            <div>
              <h1 className="flex items-center gap-1.5 text-sm font-extrabold tracking-tight text-slate-900">
                <span>Shopping Copilot</span>
                {!catalogLoading && (
                  <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                )}
              </h1>
              <p className="text-[11px] font-medium text-slate-500">
                {storeName} • {catalogLoading ? 'Loading store availability…' : 'Live Store Availability'}
              </p>
            </div>
          </div>

          {copilotMessages.length > 1 && (
            <button
              type="button"
              onClick={clearCopilotMessages}
              className="cursor-pointer p-1 text-xs font-semibold text-slate-400 hover:text-slate-600"
              title="Reset Chat"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 pb-3">
        {/* Starter Welcome & Smart Now module when only greeting exists */}
        {copilotMessages.length <= 1 && (
          <div className="space-y-3 animate-in fade-in-50 duration-300">
            {/* Starter Greeting Box */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-500/10 via-white to-blue-500/10 border border-cyan-200/80 shadow-sm space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">👋</span>
                <h3 className="text-sm font-extrabold text-slate-900">Good morning!</h3>
              </div>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Tell me what recipes you're cooking, people you're hosting, or items you need. I'll
                calculate exact quantities and map your shortest store route.
              </p>
            </div>

            {/* Quick Ideas Chips */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
                Quick Ideas
              </span>
              <div className="flex flex-wrap gap-1.5">
                {quickIdeas.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(item.prompt)}
                    className="bg-white hover:bg-cyan-50 border border-slate-200 hover:border-cyan-400 text-slate-700 hover:text-cyan-800 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all shadow-2xs cursor-pointer active:scale-95"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Conversation Bubbles */}
        {copilotMessages.map((msg) => {
          const isUser = msg.sender === 'USER'

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-2 animate-in fade-in slide-in-from-bottom-1 duration-200`}
            >
              {/* Message Bubble Text */}
              <div
                className={`max-w-[88%] p-3 rounded-2xl text-xs font-medium leading-relaxed shadow-sm ${
                  isUser
                    ? 'bg-gradient-to-r from-teal-700 to-teal-600 text-white rounded-tr-xs'
                    : 'bg-white text-slate-800 border border-slate-200 rounded-tl-xs'
                }`}
              >
                {!isUser && (
                  <div className="flex items-center gap-1 text-[10px] font-bold text-cyan-700 uppercase tracking-wider mb-1">
                    <Sparkles className="h-3 w-3" />
                    <span>Shopping Copilot</span>
                  </div>
                )}
                <p className="whitespace-pre-line">{formatCopilotDisplayText(msg)}</p>
                <span
                  className={`text-[9px] block mt-1 text-right ${
                    isUser ? 'text-cyan-200' : 'text-slate-400'
                  }`}
                >
                  {msg.timestamp}
                </span>
              </div>

              {/* 1. Structured Multi-Item Shopping Plan Card */}
              {msg.shoppingPlan && (
                <div className="w-full rounded-2xl border border-cyan-300 bg-white p-3.5 shadow-sm space-y-3 text-slate-800">
                  <div className="flex items-start justify-between pb-2 border-b border-slate-100">
                    <div>
                      <span className="text-[9px] font-bold text-cyan-700 uppercase tracking-wider block">
                        Curated Shopping Plan
                      </span>
                      <h4 className="text-xs font-extrabold text-slate-900 mt-0.5">
                        {msg.shoppingPlan.title}
                      </h4>
                      {msg.shoppingPlan.subtitle && (
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {msg.shoppingPlan.subtitle}
                        </p>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">
                        Estimated Total
                      </span>
                      <span className="text-sm font-extrabold text-cyan-800">
                        ₹{msg.shoppingPlan.totalEstimated}
                      </span>
                    </div>
                  </div>

                  {/* Plan Items List with Steppers */}
                  <div className="space-y-2">
                    {msg.shoppingPlan.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2 text-xs"
                      >
                        <div className="min-w-0 flex-1">
                          <h5 className="font-bold text-slate-900 truncate">{item.product.name}</h5>
                          <span className="text-[11px] text-slate-500 font-medium">
                            {item.product.price} • {item.product.aisle} ({item.product.shelf})
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[10px] font-extrabold bg-cyan-100 text-cyan-800 px-2 py-0.5 rounded-md">
                            {item.suggestedQty}x suggested
                          </span>
                          <button
                            onClick={() => addToShoppingList(item.product, item.suggestedQty)}
                            className="h-7 w-7 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white flex items-center justify-center cursor-pointer shadow-2xs"
                            title="Add item"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Multi-Item Plan Actions */}
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                    <button
                      onClick={() => {
                        const items = msg.shoppingPlan!.items.map((i) => ({
                          product: i.product,
                          qty: i.suggestedQty,
                        }))
                        addMultipleToShoppingList(items)
                      }}
                      className="bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow-sm cursor-pointer active:scale-98 transition-all"
                    >
                      <ShoppingBag className="h-3.5 w-3.5" />
                      <span>Add All to List</span>
                    </button>

                    <button
                      onClick={() => {
                        const items = msg.shoppingPlan!.items.map((i) => ({
                          product: i.product,
                          qty: i.suggestedQty,
                        }))
                        addMultipleToShoppingList(items)
                        setRouteFocusProductIds(items.map((i) => i.product.id))
                        setIsNavigating(true)
                        setActiveTab('ROUTE')
                      }}
                      className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 transition-all"
                    >
                      <Navigation className="h-3.5 w-3.5" />
                      <span>Generate Route</span>
                    </button>
                  </div>
                </div>
              )}

              {/* 2. Structured Matched Products + live availability */}
              {msg.matchedProducts && (
                <div className="w-full space-y-2">
                  {msg.matchedProducts.map((prod) => {
                    const unavailable = !prod.isAvailable || prod.stockCount <= 0
                    return (
                      <div
                        key={prod.id}
                        className="p-3 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between gap-3 text-slate-800"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                                unavailable
                                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                                  : prod.isLowStock
                                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              }`}
                            >
                              {unavailable ? 'OUT OF STOCK' : prod.isLowStock ? 'LOW STOCK' : 'IN STOCK'}
                            </span>
                            <span className="text-[10px] text-slate-400 font-semibold">
                              {prod.stockCount} on shelf
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-slate-900 mt-1 truncate">{prod.name}</h4>
                          <span className="text-[11px] font-extrabold text-cyan-800">{prod.price}</span>
                          <span className="text-slate-400 text-xs mx-1">•</span>
                          <span className="text-[11px] text-slate-600">
                            {prod.aisle} • {prod.shelf}
                          </span>
                        </div>

                        <div className="flex flex-col gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => addToShoppingList(prod, 1)}
                            className="bg-cyan-600 hover:bg-cyan-700 text-white text-[11px] font-bold py-1.5 px-2.5 rounded-xl flex items-center gap-1 cursor-pointer shadow-2xs"
                          >
                            <Plus className="h-3 w-3" />
                            <span>Add</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => navigateToProduct(prod)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-semibold py-1 px-2 rounded-lg cursor-pointer"
                          >
                            Navigate
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* 2b. Primary product location pin */}
              {msg.singleProductLocation && !msg.productRoute && (
                <div className="w-full p-3 rounded-2xl bg-white border border-cyan-200 shadow-sm text-slate-800 space-y-2">
                  <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-cyan-800 uppercase tracking-wide">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>Product Location</span>
                  </div>
                  <div className="text-xs font-bold text-slate-900">{msg.singleProductLocation.product.name}</div>
                  <div className="text-[11px] text-slate-600">
                    {msg.singleProductLocation.aisle} · {msg.singleProductLocation.shelf}
                  </div>
                  <button
                    type="button"
                    onClick={() => navigateToProduct(msg.singleProductLocation!.product)}
                    className="w-full bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1.5"
                  >
                    <Navigation className="h-3.5 w-3.5" />
                    Open walking route
                  </button>
                </div>
              )}

              {/* 3. Structured Alternatives */}
              {msg.alternativeProducts && (
                <div className="w-full space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-1">
                    Nearby In-Stock Substitutes
                  </span>
                  {msg.alternativeProducts.map((alt) => (
                    <div
                      key={alt.id}
                      className="p-3 rounded-2xl bg-white border border-cyan-200 shadow-sm flex items-center justify-between gap-3 text-slate-800"
                    >
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-slate-900 truncate">{alt.name}</h4>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                          <span className="font-extrabold text-cyan-800">{alt.price}</span>
                          <span>•</span>
                          <span className={alt.isAvailable === false ? 'text-rose-600 font-bold' : 'text-emerald-700 font-bold'}>
                            {alt.isAvailable === false ? 'CHECK STOCK' : 'IN STOCK'}
                          </span>
                          <span>•</span>
                          <span>
                            {alt.aisle} ({alt.shelf})
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => navigateToProduct(alt)}
                        className="bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold py-1.5 px-3 rounded-xl shrink-0 cursor-pointer shadow-2xs"
                      >
                        Navigate
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* 4. Product-specific route (unique per shelf) */}
              {msg.productRoute && <CustomerMiniRoutePreview productRoute={msg.productRoute} />}

              {/* 4b. Full-list route preview */}
              {msg.showRoutePreview && !msg.productRoute && <CustomerMiniRoutePreview />}

              {/* 5. Live checkout recommendation */}
              {msg.showCheckoutRecommendation && (
                <div className="w-full">
                  <CheckoutRecommendationCard />
                </div>
              )}

              {/* 6. Emergency Guidance Alert */}
              {msg.isEmergencyAlert && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-950 space-y-1.5 shadow-sm">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span>Immediate Safety Guidance</span>
                  </div>
                  <p className="text-xs font-medium leading-relaxed">
                    For immediate medical emergencies, fire, or physical danger, please notify store personnel directly or call emergency services.
                  </p>
                </div>
              )}

              {/* 7. Staff Assistance Contextual CTA */}
              {msg.showStaffAssistButton && (
                <div className="p-3.5 rounded-2xl bg-cyan-50/90 border border-cyan-300 text-slate-800 space-y-2.5 shadow-2xs">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-xl bg-cyan-600 text-white shrink-0">
                      <HandHelping className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">
                        {msg.staffAssistPrefill?.requestType === 'BACKROOM_REQUEST'
                          ? 'Fetch Item from Backroom'
                          : 'Request Store Associate'}
                      </h4>
                      <p className="text-[11px] text-slate-600">
                        An associate can meet you in {msg.staffAssistPrefill?.zoneName || 'your aisle'}.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => openHelpSheet(msg.staffAssistPrefill)}
                    className="w-full py-2.5 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-98"
                  >
                    <HandHelping className="h-3.5 w-3.5" />
                    <span>
                      {msg.staffAssistPrefill?.requestType === 'BACKROOM_REQUEST'
                        ? 'Request From Backroom'
                        : 'Request Staff Assistance'}
                    </span>
                  </button>
                </div>
              )}
            </div>
          )
        })}

        {/* Typing indicator */}
        {copilotIsTyping && (
          <div className="flex items-center gap-2 p-3 bg-white rounded-2xl border border-slate-200 text-xs font-semibold text-slate-500 w-fit shadow-sm">
            <span className="h-2 w-2 rounded-full bg-cyan-600 animate-bounce" />
            <span className="h-2 w-2 rounded-full bg-cyan-600 animate-bounce [animation-delay:0.2s]" />
            <span className="h-2 w-2 rounded-full bg-cyan-600 animate-bounce [animation-delay:0.4s]" />
            <span className="text-[11px]">Checking live store availability...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input — in page flow, not fixed over messages */}
      <div className="shrink-0 border-t border-slate-200 bg-white/95 px-4 py-2 backdrop-blur-md">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSend(inputPrompt)
          }}
          className="relative flex items-center"
        >
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder="Ask Copilot (e.g. breakfast for 4, find milk)..."
            className="w-full rounded-2xl border border-slate-300 bg-white py-3 pl-3.5 pr-11 text-xs text-slate-800 shadow-sm placeholder:text-slate-400 focus:border-cyan-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!inputPrompt.trim() || copilotIsTyping}
            className="absolute right-2 cursor-pointer rounded-xl bg-cyan-600 p-2 text-white shadow-2xs transition-colors hover:bg-cyan-700 disabled:opacity-40"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </form>
      </div>
    </div>
  )
}
