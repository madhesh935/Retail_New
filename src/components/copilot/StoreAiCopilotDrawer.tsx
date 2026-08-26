import React, { useState, useRef, useEffect } from 'react'
import {
  X,
  Bot,
  Send,
  Sparkles,
  RotateCcw,
  Compass,
  Layers,
  Camera,
  UserCheck,
  CheckCircle2,
  Cpu,
  Maximize2,
  ExternalLink,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CopilotSuggestedChips } from './CopilotSuggestedChips'
import { CopilotMessageBubble, ChatMessage } from './CopilotMessageBubble'
import {
  executeCopilotQuery,
  CopilotAction,
  CopilotContext,
} from './CopilotToolEngine'
import { StaffDispatchConfirmDialog } from './StaffDispatchConfirmDialog'
import { ZoneCameraDrawer } from '@/components/shopper-analytics/ZoneCameraDrawer'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAppStore } from '@/store/useAppStore'
import { cn } from '@/lib/utils'

interface StoreAiCopilotDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export const StoreAiCopilotDrawer: React.FC<StoreAiCopilotDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const location = useLocation()
  const navigate = useNavigate()
  const activeStoreId = useAppStore((s) => s.activeStoreId)

  // Current page context
  const currentPath = location.pathname.replace('/', '') || 'command-center'
  const copilotContext: CopilotContext = {
    page: currentPath,
    selectedEntity:
      currentPath === 'inventory'
        ? 'B4'
        : currentPath === 'queues' || currentPath === 'queue-intelligence'
        ? 'C1'
        : undefined,
    activeStore: 'Store 01 — Chennai Central',
  }

  // Page-specific contextual quick chips
  const getContextualPrompts = () => {
    if (currentPath === 'inventory') {
      return [
        'Why is B4 critical?',
        'When will it run out?',
        'Should I replenish now?',
        'Who should handle it?',
      ]
    }
    if (currentPath === 'queues' || currentPath === 'queue-intelligence') {
      return [
        'Why is C1 critical?',
        'Predict next 10 minutes.',
        'Which counter should open?',
        'Who can be assigned?',
      ]
    }
    if (currentPath === 'digital-twin') {
      return [
        "What's happening here?",
        'Show critical areas.',
        'Explain selected shelf.',
        'Explain selected checkout.',
      ]
    }
    return [
      "What's critical right now?",
      'Which shelves need replenishment?',
      'Which checkout is congested?',
      'Summarize today\'s store performance.',
    ]
  }

  // Initial welcome greeting
  const initialMessages: ChatMessage[] = [
    {
      id: 'msg-welcome',
      sender: 'COPILOT',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      structured: {
        toolCalled: 'get_store_status',
        observation: `Connected to Edge Node (NVIDIA Jetson Orin NX). Store 01 is active with 126 shoppers and 3 operational alerts.`,
        prediction: `Afternoon rush is currently elevating Counter C1 queue depth and Beverage Aisle B4 depletion velocity.`,
        action: `Review recommended staff reallocations to prevent queue bottlenecks and stockouts.`,
        reason: `Deterministic rate tracking indicates arrival rate λ = 2.8/min exceeds single-register capacity.`,
        actions: [
          { type: 'NAVIGATE', label: 'View Command Center', payload: '/command-center' },
          { type: 'VIEW_TWIN', label: 'Open Digital Twin', payload: '/digital-twin' },
        ],
      },
    },
  ]

  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [inputValue, setInputValue] = useState('')
  const [isThinking, setIsThinking] = useState(false)

  // Confirmation dialog state for staff dispatch actions
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    staffId: string
    taskTitle: string
  }>({ isOpen: false, staffId: '', taskTitle: '' })

  // Camera preview drawer state
  const [cameraDrawer, setCameraDrawer] = useState<{
    isOpen: boolean
    cameraCode: string
    zoneName: string
  }>({ isOpen: false, cameraCode: '', zoneName: '' })

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
    }
  }, [messages, isOpen])

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputValue
    if (!text.trim()) return

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'USER',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text,
    }

    setMessages((prev) => [...prev, userMsg])
    setInputValue('')
    setIsThinking(true)

    // Simulate rapid local edge LLM / tool call latency (300ms)
    setTimeout(() => {
      const response = executeCopilotQuery(text, copilotContext)

      const copilotMsg: ChatMessage = {
        id: `copilot-${Date.now()}`,
        sender: 'COPILOT',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        structured: response,
      }

      setMessages((prev) => [...prev, copilotMsg])
      setIsThinking(false)
    }, 350)
  }

  const handleTriggerAction = (action: CopilotAction) => {
    if (action.type === 'NAVIGATE') {
      navigate(action.payload)
    } else if (action.type === 'VIEW_TWIN') {
      navigate('/digital-twin')
    } else if (action.type === 'VIEW_CAMERA') {
      setCameraDrawer({
        isOpen: true,
        cameraCode: action.payload?.cameraCode || 'CAM-06',
        zoneName: action.payload?.zoneName || 'Monitored Zone',
      })
    } else if (action.type === 'ASSIGN_STAFF') {
      // Safety confirmation modal trigger
      setConfirmDialog({
        isOpen: true,
        staffId: action.payload?.staffId || 'S02',
        taskTitle: action.payload?.task || 'Operational Task Allocation',
      })
    }
  }

  const handleConfirmDispatch = () => {
    const confirmMsg: ChatMessage = {
      id: `system-${Date.now()}`,
      sender: 'COPILOT',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: `✓ Confirmed: Dispatch notification sent to Associate ${confirmDialog.staffId} for "${confirmDialog.taskTitle}". Status transitioned to IN_PROGRESS.`,
    }
    setMessages((prev) => [...prev, confirmMsg])
    setConfirmDialog({ isOpen: false, staffId: '', taskTitle: '' })
  }

  const handleResetChat = () => {
    setMessages(initialMessages)
  }

  const handleOpenFullCopilot = () => {
    const lastUserPrompt = messages.filter((m) => m.sender === 'USER').pop()?.text || ''
    onClose()
    navigate('/copilot', { state: { initialPrompt: lastUserPrompt } })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end select-none font-mono">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in-0"
        onClick={onClose}
      />

      {/* Slide-over Copilot Panel */}
      <div className="relative w-full max-w-lg h-full bg-[#0B0F17] border-l border-[#1E293B] z-10 flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b border-[#1E293B] bg-[#0F172A]/80 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-[#041523] border-2 border-[#008B9E] flex items-center justify-center text-[#00E5FF] font-bold text-xs shadow-sm">
                <svg
                  viewBox="0 0 48 48"
                  fill="none"
                  stroke="#00E5FF"
                  strokeWidth="3.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-5 h-5"
                >
                  <path d="M 18 13.5 H 23.5 V 19" />
                  <rect x="13" y="19" width="22" height="16" rx="4.5" />
                  <line x1="8" y1="27" x2="13" y2="27" />
                  <line x1="35" y1="27" x2="40" y2="27" />
                  <line x1="20" y1="25" x2="20" y2="29" strokeWidth="3.6" />
                  <line x1="28" y1="25" x2="28" y2="29" strokeWidth="3.6" />
                </svg>
              </div>
              <div>
                <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider flex items-center gap-1.5">
                  <span>Store AI Copilot</span>
                  <span className="text-[9px] text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-500/40 font-bold">
                    Edge Active
                  </span>
                </h3>
                <span className="text-[10px] text-slate-400 font-sans">
                  Ask questions about current store operations.
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="xs"
                onClick={handleOpenFullCopilot}
                className="text-[10px] h-6 px-2 text-cyan-300 border-cyan-500/40 hover:bg-cyan-950/60 gap-1 font-mono"
                title="Open Full Copilot Workspace"
              >
                <Maximize2 className="h-3 w-3 text-cyan-400" />
                <span className="hidden sm:inline">Full Workspace</span>
              </Button>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={handleResetChat}
                title="Reset Conversation"
                className="text-slate-400 hover:text-white"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={onClose}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Context Awareness Pill */}
          <div className="flex items-center justify-between text-[9px] bg-[#090D14] p-1.5 rounded border border-[#1E293B] text-slate-400">
            <span className="flex items-center gap-1">
              <Compass className="h-3 w-3 text-cyan-400" />
              <span>Active Context: <strong className="text-white">/{currentPath}</strong></span>
            </span>
            <span className="text-cyan-400 font-bold">Store 01 (Chennai Central)</span>
          </div>
        </div>

        {/* Chat Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg) => (
            <CopilotMessageBubble
              key={msg.id}
              message={msg}
              onTriggerAction={handleTriggerAction}
            />
          ))}

          {isThinking && (
            <div className="flex items-center gap-2 text-cyan-400 text-xs py-2">
              <Cpu className="h-3.5 w-3.5 animate-spin" />
              <span className="font-mono text-[10px]">Running edge tool query & rate equations...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Chips Footer */}
        <div className="p-3 border-t border-[#1E293B] bg-[#0B0F17] space-y-2">
          {/* Page-Specific Context Prompts */}
          <div className="flex flex-wrap gap-1">
            {getContextualPrompts().map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                className="text-[9px] text-slate-300 bg-[#090D14] hover:bg-[#131D31] hover:text-cyan-300 border border-[#1E293B] hover:border-cyan-500/50 rounded px-2 py-0.5 text-left transition-colors cursor-pointer font-sans"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSend()
            }}
            className="flex items-center gap-2 pt-1"
          >
            <input
              type="text"
              placeholder="Ask Store AI anything about live operations..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-1 bg-[#090D14] border border-[#1E293B] rounded-md px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-sans"
            />
            <Button
              type="submit"
              variant="action"
              size="sm"
              disabled={!inputValue.trim() || isThinking}
              className="h-8 px-3 gap-1"
            >
              <Send className="h-3 w-3" />
            </Button>
          </form>
        </div>
      </div>

      {/* Safety Confirmation Modal */}
      <StaffDispatchConfirmDialog
        isOpen={confirmDialog.isOpen}
        staffId={confirmDialog.staffId}
        taskTitle={confirmDialog.taskTitle}
        onConfirm={handleConfirmDispatch}
        onCancel={() => setConfirmDialog({ isOpen: false, staffId: '', taskTitle: '' })}
      />

      {/* Embedded Live Camera Inspection Drawer */}
      <ZoneCameraDrawer
        cameraCode={cameraDrawer.isOpen ? cameraDrawer.cameraCode : null}
        zoneName={cameraDrawer.isOpen ? cameraDrawer.zoneName : null}
        onClose={() => setCameraDrawer({ isOpen: false, cameraCode: '', zoneName: '' })}
      />
    </div>
  )
}
