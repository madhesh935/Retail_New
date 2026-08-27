import React, { useState, useEffect, useRef } from 'react'
import {
  X,
  Send,
  Mic,
  MicOff,
  Bot,
  User,
  ArrowRight,
  MapPin,
  Package,
  ShieldAlert,
  CheckCircle2,
} from 'lucide-react'
import { CopilotRobotIcon } from './CopilotRobotIcon'
import { useAppStore } from '@/store/useAppStore'

interface StaffCopilotModalProps {
  isOpen: boolean
  onClose: () => void
  onNavigateTab?: (tab: 'today' | 'assist' | 'scan' | 'work' | 'more') => void
  onOpenTaskDetails?: (taskId: string) => void
}

interface ChatMessage {
  id: string
  sender: 'AI' | 'USER'
  text: string
  timestamp: string
  actionLabel?: string
  actionTab?: 'today' | 'assist' | 'scan' | 'work' | 'more'
  taskId?: string
}

export const StaffCopilotModal: React.FC<StaffCopilotModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
  onOpenTaskDetails,
}) => {
  const { pendingTasks, customerRequests, authenticatedStaff } = useAppStore()
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'AI',
      text: `Hello ${authenticatedStaff?.name || 'Liam'}! I am your Store Associate AI Companion. Ask me about your assigned tasks, product locations, backroom stock bays, or safety SOPs.`,
      timestamp: 'Just now',
    },
  ])
  const [inputText, setInputText] = useState('')
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef<any>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen) {
      setTimeout(scrollToBottom, 100)
    }
  }, [isOpen, messages])

  // Initialize Speech Recognition if supported
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        const recog = new SpeechRecognition()
        recog.continuous = false
        recog.interimResults = false
        recog.lang = 'en-US'
        recog.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript
          setInputText(transcript)
          setIsListening(false)
          handleSendQuery(transcript)
        }
        recog.onerror = () => setIsListening(false)
        recog.onend = () => setIsListening(false)
        recognitionRef.current = recog
      }
    }
  }, [])

  if (!isOpen) return null

  const toggleMic = () => {
    if (!recognitionRef.current) {
      alert('Voice dictation is not supported in this browser. Please type your query.')
      return
    }
    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      setIsListening(true)
      recognitionRef.current.start()
    }
  }

  const handleSendQuery = (query: string) => {
    if (!query.trim()) return

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'USER',
      text: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages((prev) => [...prev, userMsg])
    setInputText('')

    // Generate grounded operational AI response
    setTimeout(() => {
      const q = query.toLowerCase()
      let aiText = ''
      let actionLabel: string | undefined
      let actionTab: 'today' | 'assist' | 'scan' | 'work' | 'more' | undefined
      let taskId: string | undefined

      if (q.includes('next') || q.includes('what should i do') || q.includes('urgent')) {
        aiText = 'Your most urgent activity is **Refill Beverage B4**. Shelf availability is down to 17% with predicted depletion in ~9 minutes. 14 units are staged in Backroom Bay 3B.'
        actionLabel = 'View B4 Restock Task'
        actionTab = 'work'
        taskId = 'task-b4-replenish'
      } else if (q.includes('expire') || q.includes('expiry') || q.includes('fefo') || q.includes('rotation')) {
        aiText = 'Active Expiry & Stock Rotation:\n• **Milk 1L (Batch MILK-0827)** expires tomorrow. Batch MILK-0827 should be moved to the FRONT row on Shelf C2, while newer Batch MILK-0902 remains behind.'
        actionLabel = 'Open Work Tasks'
        actionTab = 'work'
      } else if (q.includes('batch') || q.includes('front')) {
        aiText = 'FEFO Rule (First Expire, First Out):\n• Always position earliest-expiry batch (MILK-0827) in front.\n• Staged location: Stockroom Bay 3B.\n• Front Shelf: Dairy C2.'
        actionLabel = 'Scan Batch Barcode'
        actionTab = 'scan'
      } else if (q.includes('markdown') || q.includes('discount') || q.includes('price')) {
        aiText = 'Markdown Status: Greek Yogurt 500g has an approved 15% markdown (₹80 → ₹68). Please replace the shelf tag at Shelf C4 and apply the yellow Save Today sticker.'
        actionLabel = 'Open Scan Tab'
        actionTab = 'scan'
      } else if (q.includes('where is b4') || q.includes('locate b4') || q.includes('b4')) {
        aiText = 'Shelf B4 is located in **Aisle 4 (Beverages & Cold Drinks)**, immediately past the chilled juice section on your right.'
        actionLabel = 'Open Store Map'
        actionTab = 'work'
      } else if (q.includes('backroom') || q.includes('stock') || q.includes('cola')) {
        aiText = 'Sparkling Cola Zero 12-Pack is stored in **Backroom Bay 3B (Pallet Rack Row 3)**. Total 14 units available for shelf replenishment.'
        actionLabel = 'Start Refill Task'
        actionTab = 'work'
        taskId = 'task-b4-replenish'
      } else if (q.includes('spill') || q.includes('clean')) {
        aiText = 'Standard Spill SOP:\n1. Place Yellow Caution Cone immediately.\n2. Mop liquid with absorbent pads.\n3. Verify walkway traction is dry before removing cone.'
        actionLabel = 'View Spill Task SOP'
        actionTab = 'work'
        taskId = 'task-b4-spill'
      } else if (q.includes('customer') || q.includes('help') || q.includes('request')) {
        const count = customerRequests.filter((r) => r.status === 'REQUESTED').length
        aiText = `You have ${count} pending customer assistance request(s). A shopper in Dairy & Chilled is looking for **Lactose-Free Organic Milk** at Shelf C2.`
        actionLabel = 'View Customer Requests'
        actionTab = 'assist'
      } else if (q.includes('safety') || q.includes('hazard') || q.includes('alert')) {
        aiText = 'Active Safety Notice: Minor water spill reported near Shelf B4 walkway. Caution cone in place; associate Liam assigned to mop.'
        actionLabel = 'View Safety Task'
        actionTab = 'work'
        taskId = 'task-b4-spill'
      } else {
        aiText = `Understood. For "${query}", you can check the Scan tab to look up any shelf QR code, or view your assigned work in the Work tab.`
        actionLabel = 'Go to Work'
        actionTab = 'work'
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'AI',
        text: aiText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionLabel,
        actionTab,
        taskId,
      }

      setMessages((prev) => [...prev, aiMsg])
    }, 450)
  }

  const QUICK_PROMPTS = [
    'What should I do next?',
    'Which batch goes in front?',
    'Any expiry tasks assigned?',
    'Has markdown been approved?',
    'Where is backroom stock?',
  ]

  return (
    <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[85vh]">
        {/* Header (Clean Light Theme) */}
        <div className="px-5 py-4 border-b border-slate-200/80 flex items-center justify-between bg-white text-slate-900 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8.5 h-8.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shadow-xs">
              <CopilotRobotIcon className="w-5.5 h-5.5 text-blue-600" stroke="#2563EB" />
            </div>
            <div>
              <h3 className="text-sm font-bold leading-tight text-slate-900">Store Copilot AI</h3>
              <p className="text-[11px] text-slate-500 font-medium">Operational Grounded Store Intelligence</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat History */}
        <div className="p-4 flex-1 overflow-y-auto space-y-3 bg-slate-50/70">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col text-xs max-w-[88%] ${
                m.sender === 'USER' ? 'ml-auto items-end' : 'mr-auto items-start'
              }`}
            >
              <div
                className={`p-3 rounded-2xl leading-relaxed shadow-xs ${
                  m.sender === 'USER'
                    ? 'bg-blue-600 text-white rounded-br-xs font-medium'
                    : 'bg-white border border-slate-200/90 text-slate-800 rounded-bl-xs'
                }`}
              >
                <div className="whitespace-pre-line">{m.text}</div>
                {m.actionLabel && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose()
                      if (m.taskId && onOpenTaskDetails) {
                        onOpenTaskDetails(m.taskId)
                      } else if (m.actionTab && onNavigateTab) {
                        onNavigateTab(m.actionTab)
                      }
                    }}
                    className="mt-2.5 w-full py-1.5 px-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl text-[11px] font-bold text-blue-900 flex items-center justify-center gap-1 transition-colors"
                  >
                    <span>{m.actionLabel}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
              <span className="text-[9px] text-slate-400 mt-1 px-1">{m.timestamp}</span>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Quick Suggestion Pills */}
        <div className="px-4 py-2 border-t border-slate-100 bg-white overflow-x-auto scrollbar-hide flex gap-1.5 shrink-0">
          {QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => handleSendQuery(prompt)}
              className="whitespace-nowrap px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-[11px] font-semibold text-slate-700 transition-colors shrink-0"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSendQuery(inputText)
          }}
          className="p-3 border-t border-slate-100 bg-white flex items-center gap-2"
        >
          <button
            type="button"
            onClick={toggleMic}
            className={`p-2.5 rounded-xl transition-all ${
              isListening
                ? 'bg-rose-500 text-white animate-pulse'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
            title="Voice input"
          >
            {isListening ? <Mic className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={isListening ? 'Listening to voice...' : 'Ask about tasks, stock, locations...'}
            className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl shadow-xs shadow-blue-500/20 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  )
}
