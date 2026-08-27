import React, { useState, useRef, useEffect } from 'react'
import {
  Bot,
  User,
  Send,
  Sparkles,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Navigation,
} from 'lucide-react'
import { useCustomerShopping, CustomerProduct } from '../context/CustomerShoppingContext'
import { CustomerProductCard } from '../components/CustomerProductCard'
import { CheckoutRecommendationCard } from '../components/CheckoutRecommendationCard'

interface AssistantChatMessage {
  id: string
  sender: 'USER' | 'ASSISTANT'
  text: string
  timestamp: string
  matchedProducts?: CustomerProduct[]
  isCheckoutRecommendation?: boolean
}

export const CustomerAssistantPage: React.FC = () => {
  const { addToShoppingList, setActiveTab, catalog, searchCatalog } = useCustomerShopping()

  const initialAssistantMessages: AssistantChatMessage[] = [
    {
      id: 'msg-welcome',
      sender: 'ASSISTANT',
      text: `Hello! I'm your in-store Smart Shopping Assistant. Ask me where any item is located, check live stock, or build your shopping list!`,
      timestamp: 'Just now',
    },
  ]

  const [messages, setMessages] = useState<AssistantChatMessage[]>(initialAssistantMessages)
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendQuery = (customText?: string) => {
    const text = customText || inputValue
    if (!text.trim()) return

    const userMsg: AssistantChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'USER',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages((prev) => [...prev, userMsg])
    setInputValue('')
    setIsTyping(true)

    // Grounded against live DB catalog
    setTimeout(() => {
      const q = text.toLowerCase()
      let replyText = ''
      let matched: CustomerProduct[] = []
      let isCheckout = false
      const find = (id: string) => catalog.find((p) => p.id === id)

      if (q.includes('dove') || q.includes('shampoo')) {
        const prod = find('prod-dove') || searchCatalog('shampoo')[0]
        if (prod) {
          matched = [prod]
          replyText = `${prod.name} is ${prod.isAvailable ? 'in stock' : 'currently unavailable'} on ${prod.shelf} in ${prod.aisle} (${prod.stockCount} units).`
        }
      } else if (q.includes('milk') && !q.includes('bread') && !q.includes('shampoo')) {
        const prod = find('prod-milk') || searchCatalog('milk')[0]
        if (prod) {
          matched = [prod]
          replyText = `${prod.name} is available in ${prod.category} (${prod.aisle}, ${prod.shelf}).`
        }
      } else if (q.includes('bread') || q.includes('brown bread')) {
        const prod = find('prod-bread') || searchCatalog('bread')[0]
        if (prod) {
          matched = [prod]
          replyText = `${prod.name} is available in ${prod.category} (${prod.aisle}, ${prod.shelf}).`
        }
      } else if (q.includes('amul') || q.includes('butter')) {
        const prod = find('prod-amul-butter') || searchCatalog('butter')[0]
        if (prod) {
          matched = [prod]
          replyText = `Yes, ${prod.name} is in stock in ${prod.aisle}, ${prod.shelf}.`
        }
      } else if (q.includes('milk, bread') || (q.includes('milk') && q.includes('bread') && q.includes('shampoo'))) {
        const milk = find('prod-milk')
        const bread = find('prod-bread')
        const shampoo = find('prod-dove')
        matched = [milk, bread, shampoo].filter(Boolean) as CustomerProduct[]
        matched.forEach((p) => addToShoppingList(p, 1))
        replyText =
          matched.length > 0
            ? `I found ${matched.length} items in stock and added them to your Shopping List.`
            : `I couldn't resolve those items from the live catalog yet.`
      } else if (q.includes('checkout') || q.includes('fastest') || q.includes('queue') || q.includes('pay')) {
        isCheckout = true
        replyText = `I'll recommend the fastest open checkout based on live queue intelligence.`
      } else if (q.includes('alternative')) {
        const biscuit = find('prod-biscuits') || searchCatalog('biscuit')[0]
        if (biscuit) {
          matched = [biscuit]
          replyText = `${biscuit.name} has alternatives available nearby on the sales floor.`
        }
      } else {
        matched = searchCatalog(text)
        if (matched.length > 0) {
          replyText = `Here are the matching products in the store:`
        } else {
          replyText = `I couldn't find "${text}" on the sales floor. Would you like to check our alternative recommendations or ask a store associate?`
        }
      }

      const botMsg: AssistantChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'ASSISTANT',
        text: replyText || `I couldn't find a match in the live catalog for "${text}".`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        matchedProducts: matched.length > 0 ? matched : undefined,
        isCheckoutRecommendation: isCheckout,
      }

      setMessages((prev) => [...prev, botMsg])
      setIsTyping(false)
    }, 250)
  }

  const promptSuggestions = [
    'Where is milk?',
    'Where can I find Dove Shampoo?',
    'Do you have brown bread?',
    'I need milk, bread and shampoo.',
    "What's the fastest checkout?",
    'Find an alternative for this product.',
  ]

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] select-none">
      {/* Top Header */}
      <div className="pb-3 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 leading-none">
              Store Shopping Assistant
            </h2>
            <span className="text-[11px] text-emerald-600 font-medium">● Connected to Live Store</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setMessages(initialAssistantMessages)}
          className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          title="Reset conversation"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto py-3 space-y-3">
        {messages.map((msg) => {
          const isUser = msg.sender === 'USER'

          return (
            <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[90%] rounded-2xl p-3.5 shadow-sm space-y-2 text-xs leading-relaxed ${
                  isUser
                    ? 'bg-cyan-600 text-white font-medium rounded-tr-none'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                }`}
              >
                <div className="flex items-center justify-between gap-2 text-[10px] opacity-75">
                  <span className="font-bold">{isUser ? 'You' : 'Store Assistant'}</span>
                  <span>{msg.timestamp}</span>
                </div>

                <p className="font-sans text-xs">{msg.text}</p>

                {/* Embedded Product Results */}
                {msg.matchedProducts && msg.matchedProducts.length > 0 && (
                  <div className="space-y-2 pt-1">
                    {msg.matchedProducts.map((p) => (
                      <CustomerProductCard key={p.id} product={p} />
                    ))}
                  </div>
                )}

                {/* Embedded Checkout Recommendation Card */}
                {msg.isCheckoutRecommendation && (
                  <div className="pt-1">
                    <CheckoutRecommendationCard onNavigateToCheckout={() => setActiveTab('ROUTE')} />
                  </div>
                )}
              </div>
            </div>
          )
        })}

        {isTyping && (
          <div className="flex items-center gap-1.5 text-xs text-slate-400 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-600 animate-bounce" />
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-600 animate-bounce [animation-delay:0.2s]" />
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-600 animate-bounce [animation-delay:0.4s]" />
            <span className="text-[11px] font-sans">Checking shelf availability...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Question Chips */}
      <div className="py-2 flex gap-1.5 overflow-x-auto no-scrollbar">
        {promptSuggestions.map((sug) => (
          <button
            key={sug}
            onClick={() => handleSendQuery(sug)}
            className="text-[11px] font-medium text-slate-700 bg-white border border-slate-200 hover:border-cyan-500 rounded-full px-3 py-1 whitespace-nowrap shadow-sm cursor-pointer transition-all hover:bg-cyan-50"
          >
            {sug}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleSendQuery()
        }}
        className="pt-2 flex items-center gap-2"
      >
        <input
          type="text"
          placeholder="Ask where any item is (e.g. Dove Shampoo)"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="flex-1 bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-500 shadow-sm"
        />
        <button
          type="submit"
          disabled={!inputValue.trim() || isTyping}
          className="bg-cyan-600 hover:bg-cyan-700 active:bg-cyan-800 disabled:opacity-50 text-white text-xs h-9 px-3.5 rounded-xl flex items-center gap-1 font-semibold shadow-sm cursor-pointer transition-colors"
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </form>
    </div>
  )
}
