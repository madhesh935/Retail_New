import React, { useState, useRef, useEffect } from 'react'
import {
  Send,
  Sparkles,
  Bot,
  User,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CopilotCategoryChips, QueryCategory } from './CopilotCategoryChips'
import { cn } from '@/lib/utils'
import { CopilotRichText } from '../CopilotRichText'
import { sendCopilotChat } from '@/services/api/chat.service'
import { useLiveManagerContext } from './useLiveManagerContext'

export interface WorkspaceChatMessage {
  id: string
  sender: 'USER' | 'COPILOT'
  timestamp: string
  text?: string
}

interface CopilotChatWorkspaceProps {
  initialPrompt?: string
}

export const CopilotChatWorkspace: React.FC<CopilotChatWorkspaceProps> = ({
  initialPrompt,
}) => {
  const [messages, setMessages] = useState<WorkspaceChatMessage[]>([
    {
      id: 'welcome-msg',
      sender: 'COPILOT',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: 'How can I help you?',
    },
  ])
  const [inputValue, setInputValue] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<QueryCategory>('ALL')
  const liveContext = useLiveManagerContext()

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (initialPrompt) {
      handleSendMessage(initialPrompt)
    }
  }, [initialPrompt])

  const handleSendMessage = (customText?: string) => {
    const text = customText || inputValue
    if (!text.trim()) return

    const userMsg: WorkspaceChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'USER',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text,
    }

    setMessages((prev) => [...prev, userMsg])
    setInputValue('')
    setIsThinking(true)

    const apiMessages = [...messages, userMsg].map((m) => ({
      role: (m.sender === 'USER' ? 'user' : 'assistant') as 'user' | 'assistant',
      content: m.text || '',
    }))

    sendCopilotChat({
      persona: 'manager',
      messages: apiMessages,
      context: {
        surface: 'manager_copilot_workspace',
        page: 'copilot',
        activeStore: 'Store 01 — Chennai Central',
        liveOccupancy: liveContext.currentOccupancy,
        occupancyPct: liveContext.occupancyPct,
        shelfHealthPct: liveContext.shelfHealthPct,
        criticalShelvesCount: liveContext.criticalShelvesCount,
        avgWaitMinutes: liveContext.avgWaitMinutes,
        criticalIncidentsCount: liveContext.criticalIncidentsCount,
        availableStaffCount: liveContext.availableStaffCount,
        availableStaffCodes: liveContext.availableStaffCodes,
        storeHealthScore: liveContext.storeHealthScore,
        storeHealthLabel: liveContext.storeHealthLabel,
      },
    })
      .then(({ reply }) => {
        const botMsg: WorkspaceChatMessage = {
          id: `copilot-${Date.now()}`,
          sender: 'COPILOT',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: reply,
        }

        setMessages((prev) => [...prev, botMsg])
      })
      .catch((err) => {
        const botMsg: WorkspaceChatMessage = {
          id: `copilot-${Date.now()}`,
          sender: 'COPILOT',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text:
            err instanceof Error
              ? `Sorry — ${err.message}`
              : 'Sorry, I could not reach Store AI. Is the backend running?',
        }
        setMessages((prev) => [...prev, botMsg])
      })
      .finally(() => {
        setIsThinking(false)
      })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3.5 flex flex-col h-full select-none text-xs shadow-2xs space-y-3 font-sans">
      {/* Scrollable Conversation Container */}
      <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 flex flex-col">
        {/* Active Messages List */}
        {messages.map((msg) => {
          const isUser = msg.sender === 'USER'

          return (
            <React.Fragment key={msg.id}>
              <div
                className={cn(
                  'flex gap-2.5',
                  isUser ? 'justify-end' : 'justify-start'
                )}
              >
                {!isUser && (
                  <div className="h-7 w-7 rounded-lg bg-sky-50 border border-sky-200 text-sky-600 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    <Bot className="h-4 w-4" />
                  </div>
                )}

                <div
                  className={cn(
                    'rounded-xl p-3 max-w-[88%] space-y-2 shadow-2xs',
                    isUser
                      ? 'bg-sky-50 border border-sky-200 text-slate-900'
                      : 'bg-slate-50 border border-slate-200 text-slate-800'
                  )}
                >
                  {/* User/Bot Text Content */}
                  {msg.text && (
                    isUser ? (
                      <p className="whitespace-pre-wrap break-words text-xs leading-relaxed font-medium">
                        {msg.text}
                      </p>
                    ) : (
                      <CopilotRichText text={msg.text} className="text-[13px] leading-5" />
                    )
                  )}

                  {/* Message Timestamp & Grounding Badge */}
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                    <span>{msg.timestamp}</span>
                    {!isUser && (
                      <span className="text-sky-700 font-semibold">
                        ● Grounded in live store operations
                      </span>
                    )}
                  </div>
                </div>

                {isUser && (
                  <div className="h-7 w-7 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>

              {/* Show suggested category prompts right below the initial welcome message */}
              {msg.id === 'welcome-msg' && messages.length === 1 && (
                <div className="pt-2 pl-9">
                  <CopilotCategoryChips
                    selectedCategory={selectedCategory}
                    onSelectCategory={setSelectedCategory}
                    onSelectPrompt={(p) => handleSendMessage(p)}
                  />
                </div>
              )}
            </React.Fragment>
          )
        })}

        {/* Thinking Indicator */}
        {isThinking && (
          <div className="flex gap-2.5 items-center text-xs text-slate-500 pl-1">
            <div className="h-7 w-7 rounded-lg bg-sky-50 border border-sky-200 text-sky-600 flex items-center justify-center shrink-0">
              <Sparkles className="h-4 w-4 animate-spin" />
            </div>
            <span>Checking live store data...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Sticky Bottom Input Composer */}
      <div className="pt-2 border-t border-slate-100 bg-white space-y-2">
        {/* Input Bar */}
        <div className="flex items-center gap-2">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Store AI about queues, inventory, staff allocations..."
            rows={1}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-sky-500 resize-none h-10 shadow-2xs"
          />

          <Button
            variant="action"
            size="sm"
            onClick={() => handleSendMessage()}
            disabled={!inputValue.trim() || isThinking}
            className="h-10 px-4 gap-1.5 text-xs font-semibold shrink-0 bg-sky-600 hover:bg-sky-700 text-white"
          >
            <span>Send</span>
            <Send className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
