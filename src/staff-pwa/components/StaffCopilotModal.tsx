import React, { useState, useEffect, useRef } from 'react'
import { X, Send, Mic, ArrowRight } from 'lucide-react'
import { CopilotRobotIcon } from './CopilotRobotIcon'
import { useAppStore } from '@/store/useAppStore'
import { sendCopilotChat } from '@/services/api/chat.service'

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

function inferStaffAction(query: string, pendingCount: number, helpCount: number): {
  actionLabel?: string
  actionTab?: ChatMessage['actionTab']
  taskId?: string
} {
  const q = query.toLowerCase()
  if (q.includes('customer') || q.includes('help') || q.includes('assist') || helpCount > 0 && q.includes('request')) {
    return { actionLabel: 'View Customer Requests', actionTab: 'assist' }
  }
  if (q.includes('scan') || q.includes('barcode') || q.includes('markdown') || q.includes('price')) {
    return { actionLabel: 'Open Scan Tab', actionTab: 'scan' }
  }
  if (q.includes('spill') || q.includes('safety') || q.includes('hazard')) {
    return { actionLabel: 'View Safety Task', actionTab: 'work', taskId: 'task-b4-spill' }
  }
  if (q.includes('b4') || q.includes('refill') || q.includes('restock') || q.includes('backroom') || q.includes('next') || q.includes('urgent') || pendingCount > 0) {
    return { actionLabel: 'Open Work Tasks', actionTab: 'work' }
  }
  return {}
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
      text: `Hello ${authenticatedStaff?.name || 'Associate'}! I am your Store Associate AI Companion — same intelligence as the manager Store AI. Ask me about tasks, locations, FEFO, markdowns, or SOPs.`,
      timestamp: 'Just now',
    },
  ])
  const [inputText, setInputText] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [isThinking, setIsThinking] = useState(false)
  const recognitionRef = useRef<any>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const sendRef = useRef<(query: string) => void>(() => {})
  const busyRef = useRef(false)
  const requestIdRef = useRef(0)

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen) {
      setTimeout(scrollToBottom, 100)
    }
  }, [isOpen, messages, isThinking])

  const handleSendQuery = async (query: string) => {
    if (!query.trim() || isThinking || busyRef.current) return

    busyRef.current = true
    const requestId = ++requestIdRef.current
    const trimmed = query.trim()
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'USER',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    const nextMessages = [...messages, userMsg]
    setMessages(nextMessages)
    setInputText('')
    setIsThinking(true)

    const pendingCount = pendingTasks?.length || 0
    const helpCount = customerRequests.filter((r) => r.status === 'REQUESTED').length
    const action = inferStaffAction(trimmed, pendingCount, helpCount)

    try {
      const { reply } = await sendCopilotChat({
        persona: 'staff',
        messages: nextMessages
          .filter((m) => m.id !== 'welcome')
          .map((m) => ({
            role: m.sender === 'USER' ? ('user' as const) : ('assistant' as const),
            content: m.text,
          })),
        context: {
          surface: 'staff_pwa',
          staffName: authenticatedStaff?.name,
          staffRole: authenticatedStaff?.role,
          pendingTaskCount: pendingCount,
          pendingTaskTitles: (pendingTasks || []).slice(0, 5).map((t: { title?: string }) => t.title),
          openCustomerHelpRequests: helpCount,
          zone: authenticatedStaff?.zoneName,
        },
      })

      if (requestId !== requestIdRef.current) return

      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'AI',
          text: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          ...action,
        },
      ])
    } catch (err) {
      if (requestId !== requestIdRef.current) return
      const detail = err instanceof Error ? err.message : 'Could not reach Store AI'
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'AI',
          text: `Sorry — ${detail}. Check that the backend is running and OpenRouter is configured.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actionLabel: 'Open Work',
          actionTab: 'work',
        },
      ])
    } finally {
      if (requestId === requestIdRef.current) {
        busyRef.current = false
        setIsThinking(false)
      }
    }
  }

  sendRef.current = handleSendQuery

  useEffect(() => {
    if (typeof window === 'undefined') return
    const SpeechRecognitionCtor =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    if (!SpeechRecognitionCtor) return

    const recog = new SpeechRecognitionCtor()
    recog.continuous = false
    recog.interimResults = false
    recog.lang = 'en-US'
    recog.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setInputText(transcript)
      setIsListening(false)
      sendRef.current(transcript)
    }
    recog.onerror = () => setIsListening(false)
    recog.onend = () => setIsListening(false)
    recognitionRef.current = recog
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
        <div className="px-5 py-4 border-b border-slate-200/80 flex items-center justify-between bg-white text-slate-900 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8.5 h-8.5 rounded-xl bg-sky-50 text-sky-700 border border-sky-200 flex items-center justify-center shadow-xs">
              <CopilotRobotIcon className="w-5.5 h-5.5" stroke="#0F766E" />
            </div>
            <div>
              <h3 className="text-sm font-bold leading-tight text-slate-900">Store Copilot AI</h3>
              <p className="text-[11px] text-slate-500 font-medium">
                {isThinking ? 'Thinking…' : 'Live Store Intelligence'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

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
                    ? 'bg-sky-600 text-white rounded-br-xs font-medium'
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
                    className="mt-2.5 w-full py-1.5 px-3 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-xl text-[11px] font-bold text-sky-900 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>{m.actionLabel}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
              <span className="text-[9px] text-slate-400 mt-1 px-1">{m.timestamp}</span>
            </div>
          ))}
          {isThinking && (
            <div className="text-[11px] text-slate-500 font-medium px-1 animate-pulse">Store AI is responding…</div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="px-4 py-2 border-t border-slate-100 bg-white overflow-x-auto scrollbar-hide flex gap-1.5 shrink-0">
          {QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              disabled={isThinking}
              onClick={() => handleSendQuery(prompt)}
              className="whitespace-nowrap px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-[11px] font-semibold text-slate-700 transition-colors shrink-0 disabled:opacity-50 cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>

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
            className={`p-2.5 rounded-xl transition-all cursor-pointer ${
              isListening
                ? 'bg-rose-500 text-white animate-pulse'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
            title="Voice input"
          >
            <Mic className="w-4 h-4" />
          </button>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isThinking}
            placeholder={isListening ? 'Listening to voice...' : 'Ask about tasks, stock, locations...'}
            className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isThinking}
            className="p-2.5 bg-sky-600 hover:bg-sky-700 disabled:opacity-40 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  )
}
