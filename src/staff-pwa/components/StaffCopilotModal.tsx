import React, { useState, useEffect, useRef } from 'react'
import { X, Send, Mic, ArrowRight, ClipboardList, Headphones } from 'lucide-react'
import { CopilotRobotIcon } from './CopilotRobotIcon'
import { useAppStore } from '@/store/useAppStore'
import { sendCopilotChat } from '@/services/api/chat.service'
import {
  buildStaffCopilotEnrichment,
  buildStaffCopilotReplyText,
  formatStaffCopilotDisplayText,
  type StaffCopilotMessage,
  type StaffCopilotTab,
} from '@/staff-pwa/lib/staffCopilotEnrichment'

interface StaffCopilotModalProps {
  isOpen: boolean
  onClose: () => void
  onNavigateTab?: (tab: StaffCopilotTab) => void
  onOpenTaskDetails?: (taskId: string) => void
}

export const StaffCopilotModal: React.FC<StaffCopilotModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
  onOpenTaskDetails,
}) => {
  const { pendingTasks, customerRequests, authenticatedStaff, markdownCandidates, inventoryBatches } =
    useAppStore()
  const [messages, setMessages] = useState<StaffCopilotMessage[]>([
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
    const copilotCtx = {
      query: trimmed,
      staffId: authenticatedStaff?.id,
      pendingTasks: pendingTasks || [],
      customerRequests,
      markdownCandidates,
      inventoryBatches,
    }
    const enrichment = buildStaffCopilotEnrichment(copilotCtx)

    const userMsg: StaffCopilotMessage = {
      id: `u-${Date.now()}`,
      sender: 'USER',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    const nextMessages = [...messages, userMsg]
    setMessages(nextMessages)
    setInputText('')
    setIsThinking(true)

    try {
      let reply = ''
      try {
        const chat = await sendCopilotChat({
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
            pendingTaskCount: (pendingTasks || []).length,
            pendingTaskTitles: (pendingTasks || []).slice(0, 5).map((t) => t.title),
            openCustomerHelpRequests: customerRequests.filter((r) =>
              ['REQUESTED', 'ASSIGNED', 'ACCEPTED'].includes(r.status)
            ).length,
            zone: authenticatedStaff?.zoneName,
          },
        })
        reply = chat.reply
      } catch (chatErr) {
        console.warn('Staff copilot chat unavailable; using structured reply.', chatErr)
      }

      if (requestId !== requestIdRef.current) return

      const finalText = buildStaffCopilotReplyText(enrichment, copilotCtx, reply)

      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'AI',
          text: finalText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          ...enrichment,
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
          text:
            buildStaffCopilotReplyText(enrichment, copilotCtx) ||
            `Sorry — ${detail}. Check that the backend is running and OpenRouter is configured.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          ...enrichment,
          actionLabel: enrichment.actionLabel || 'Open Work',
          actionTab: enrichment.actionTab || 'work',
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
                <div className="whitespace-pre-line">{formatStaffCopilotDisplayText(m)}</div>
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

              {m.taskCards && m.taskCards.length > 0 && (
                <div className="w-full mt-1 space-y-1.5">
                  {m.taskCards.map((task) => (
                    <div
                      key={task.id}
                      className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs text-[11px]"
                    >
                      <div className="flex items-start gap-2">
                        <ClipboardList className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" />
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-slate-900 leading-snug">{task.title}</p>
                          <p className="text-slate-500 mt-0.5">
                            {task.zoneName}
                            {task.shelfCode ? ` • Shelf ${task.shelfCode}` : ''}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[9px] font-bold uppercase">
                              {task.priority}
                            </span>
                            {task.etaMinutes != null && (
                              <span className="text-[9px] text-slate-400 font-medium">
                                ~{task.etaMinutes} min
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {m.helpCards && m.helpCards.length > 0 && (
                <div className="w-full mt-1 space-y-1.5">
                  {m.helpCards.map((req) => (
                    <div
                      key={req.id}
                      className="p-2.5 rounded-xl bg-white border border-violet-200 shadow-xs text-[11px]"
                    >
                      <div className="flex items-start gap-2">
                        <Headphones className="w-3.5 h-3.5 text-violet-600 shrink-0 mt-0.5" />
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-slate-900 leading-snug">{req.typeLabel}</p>
                          <p className="text-slate-500 mt-0.5">
                            {req.zoneName}
                            {req.productName ? ` • ${req.productName}` : ''}
                            {req.shelfCode ? ` • Shelf ${req.shelfCode}` : ''}
                          </p>
                          <span className="inline-block mt-1 px-1.5 py-0.5 rounded-md bg-violet-50 text-violet-800 text-[9px] font-bold uppercase">
                            {req.status.replace(/_/g, ' ')}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
