import React, { useState, useRef, useEffect } from 'react'
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
  Zap,
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
import { CopilotRobotIcon } from '../components/CopilotRobotIcon'
import { HandHelping } from 'lucide-react'

export const CustomerCopilotPage: React.FC = () => {
  const {
    storeName,
    copilotMessages,
    sendCopilotMessage,
    copilotIsTyping,
    clearCopilotMessages,
    addToShoppingList,
    addMultipleToShoppingList,
    setActiveTab,
    setIsNavigating,
  } = useCustomerShopping()
  const { openHelpSheet } = useCustomerAssist()

  const [inputPrompt, setInputPrompt] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [copilotMessages, copilotIsTyping])

  const quickIdeas = [
    { label: 'Breakfast for 4', prompt: 'I need groceries for breakfast for 4 people' },
    { label: 'Snacks under ₹500', prompt: 'I want snacks for 5 people under ₹500' },
    { label: 'Tea & Biscuits for 6', prompt: 'I need tea, milk and biscuits for 6 people' },
    { label: 'Where is Milk?', prompt: 'Where can I find milk?' },
    { label: 'Pasta Dinner', prompt: 'Help me buy ingredients for pasta' },
    { label: 'Dove Alternative', prompt: 'I want something similar to Dove shampoo' },
    { label: 'Fastest Checkout', prompt: 'Which checkout lane is fastest right now?' },
  ]

  const handleSend = (text: string) => {
    if (!text.trim()) return
    sendCopilotMessage(text)
    setInputPrompt('')
  }

  return (
    <div className="flex flex-col h-full space-y-3 pb-24 select-none">
      {/* 1. Header */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-2xl bg-cyan-50 border border-cyan-200 text-cyan-700 flex items-center justify-center font-bold shadow-2xs">
            <CopilotRobotIcon className="h-5.5 w-5.5" stroke="#0284C7" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
              <span>Shopping Copilot</span>
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </h1>
            <p className="text-[11px] text-slate-500 font-medium">
              {storeName} • Live Store Availability
            </p>
          </div>
        </div>

        {copilotMessages.length > 1 && (
          <button
            onClick={clearCopilotMessages}
            className="text-xs text-slate-400 hover:text-slate-600 font-semibold p-1 cursor-pointer"
            title="Reset Chat"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* 2. Messages Stream */}
      <div className="space-y-3 flex-1 overflow-y-auto pr-0.5">
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

            {/* SMART RIGHT NOW LIVE MODULE */}
            <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold text-cyan-800 uppercase tracking-wider flex items-center gap-1">
                  <Zap className="h-3 w-3 text-cyan-600" />
                  <span>SMART RIGHT NOW</span>
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                  Live
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div
                  onClick={() => handleSend('Which checkout is fastest?')}
                  className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200 cursor-pointer hover:bg-emerald-100/70 transition-colors"
                >
                  <span className="text-[10px] text-emerald-800 font-bold block flex items-center gap-1">
                    ⚡ Fastest Checkout
                  </span>
                  <span className="font-extrabold text-slate-900 block mt-0.5">Counter C2</span>
                  <span className="text-[10px] text-emerald-700">~1.8 min wait</span>
                </div>

                <div
                  onClick={() => handleSend('Can I avoid crowded Aisle 4?')}
                  className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200 cursor-pointer hover:bg-amber-100/70 transition-colors"
                >
                  <span className="text-[10px] text-amber-800 font-bold block flex items-center gap-1">
                    ⚠️ Busy Area
                  </span>
                  <span className="font-extrabold text-slate-900 block mt-0.5">Aisle 4 (Snacks)</span>
                  <span className="text-[10px] text-amber-700">Bypass available</span>
                </div>
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
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-tr-xs'
                    : 'bg-white text-slate-800 border border-slate-200 rounded-tl-xs'
                }`}
              >
                {!isUser && (
                  <div className="flex items-center gap-1 text-[10px] font-bold text-cyan-700 uppercase tracking-wider mb-1">
                    <Sparkles className="h-3 w-3" />
                    <span>Shopping Copilot</span>
                  </div>
                )}
                <p>{msg.text}</p>
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

              {/* 2. Structured Matched Products */}
              {msg.matchedProducts && (
                <div className="w-full space-y-2">
                  {msg.matchedProducts.map((prod) => (
                    <div
                      key={prod.id}
                      className="p-3 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between gap-3 text-slate-800"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {prod.isLowStock ? 'LOW STOCK' : 'IN STOCK'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-semibold">{prod.stockCount} on shelf</span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 mt-1 truncate">{prod.name}</h4>
                        <span className="text-[11px] font-extrabold text-cyan-800">{prod.price}</span>
                        <span className="text-slate-400 text-xs mx-1">•</span>
                        <span className="text-[11px] text-slate-600">{prod.aisle} • {prod.shelf}</span>
                      </div>

                      <div className="flex flex-col gap-1.5 shrink-0">
                        <button
                          onClick={() => addToShoppingList(prod, 1)}
                          className="bg-cyan-600 hover:bg-cyan-700 text-white text-[11px] font-bold py-1.5 px-2.5 rounded-xl flex items-center gap-1 cursor-pointer shadow-2xs"
                        >
                          <Plus className="h-3 w-3" />
                          <span>Add</span>
                        </button>
                        <button
                          onClick={() => {
                            addToShoppingList(prod, 1)
                            setIsNavigating(true)
                            setActiveTab('ROUTE')
                          }}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-semibold py-1 px-2 rounded-lg cursor-pointer"
                        >
                          Navigate
                        </button>
                      </div>
                    </div>
                  ))}
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
                          <span className="text-emerald-700 font-bold">IN STOCK</span>
                          <span>•</span>
                          <span>{alt.aisle} ({alt.shelf})</span>
                        </div>
                      </div>

                      <button
                        onClick={() => addToShoppingList(alt, 1)}
                        className="bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold py-1.5 px-3 rounded-xl shrink-0 cursor-pointer shadow-2xs"
                      >
                        Use This
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* 4. Inline Route Preview Card */}
              {msg.showRoutePreview && <CustomerMiniRoutePreview />}

              {/* 5. Checkout Recommendation Card */}
              {msg.showCheckoutRecommendation && (
                <div className="w-full p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-300 text-slate-800 space-y-2 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wide flex items-center gap-1">
                      <Zap className="h-3 w-3" />
                      <span>FASTEST CHECKOUT</span>
                    </span>
                    <span className="text-[10px] font-bold bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full">
                      ~1.8 min wait
                    </span>
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900">Counter C2</h4>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Only 2 shoppers in queue. Fast cashless UPI & card scanning active.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setIsNavigating(true)
                      setActiveTab('ROUTE')
                    }}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Navigation className="h-3.5 w-3.5" />
                    <span>Navigate to Checkout C2</span>
                  </button>
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

      {/* 3. Sticky Input Composer (Mobile Keyboard resilient) */}
      <div className="fixed bottom-14 left-0 right-0 max-w-md mx-auto px-4 py-2 bg-slate-50/90 backdrop-blur-md border-t border-slate-200 z-30">
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
            className="w-full bg-white border border-slate-300 rounded-2xl pl-3.5 pr-11 py-3 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 shadow-sm"
          />
          <button
            type="submit"
            disabled={!inputPrompt.trim() || copilotIsTyping}
            className="absolute right-2 p-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 disabled:opacity-40 text-white transition-colors cursor-pointer shadow-2xs"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </form>
      </div>
    </div>
  )
}
