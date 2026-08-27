import React, { useState, useRef, useEffect } from 'react'
import {
  Send,
  Sparkles,
  Bot,
  User,
  RotateCcw,
  Camera,
  UserCheck,
  PackageCheck,
  ListOrdered,
  ArrowRight,
  HelpCircle,
  Clock,
  CheckCircle2,
  ExternalLink,
  ShieldAlert,
  Compass,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CopilotCategoryChips, QueryCategory } from './CopilotCategoryChips'
import {
  executeCopilotQuery,
  CopilotAction,
  CopilotStructuredResponse,
} from '../CopilotToolEngine'
import { StaffDispatchConfirmDialog } from '../StaffDispatchConfirmDialog'
import { WhyRecommendationDialog, WhyDialogData } from '@/components/command-center/WhyRecommendationDialog'
import { ZoneCameraDrawer } from '@/components/shopper-analytics/ZoneCameraDrawer'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { CopilotRichText } from '../CopilotRichText'

export interface WorkspaceChatMessage {
  id: string
  sender: 'USER' | 'COPILOT'
  timestamp: string
  text?: string
  structured?: CopilotStructuredResponse
  specialType?: 'CAMERA_EVIDENCE' | 'INVENTORY_RANKED' | 'EXPLAIN_WHY' | 'CROSS_MODULE' | 'FORECAST_30MIN'
}

interface CopilotChatWorkspaceProps {
  initialPrompt?: string
}

export const CopilotChatWorkspace: React.FC<CopilotChatWorkspaceProps> = ({
  initialPrompt,
}) => {
  const navigate = useNavigate()
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

  // Dialog states
  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; staffId: string; taskTitle: string }>({
    isOpen: false,
    staffId: '',
    taskTitle: '',
  })
  const [cameraDrawer, setCameraDrawer] = useState<{ isOpen: boolean; cameraCode: string; zoneName: string }>({
    isOpen: false,
    cameraCode: '',
    zoneName: '',
  })
  const [whyDialog, setWhyDialog] = useState<{ isOpen: boolean; data: WhyDialogData | null }>({
    isOpen: false,
    data: null,
  })

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

    // Evaluate grounded query and special rich UI response blocks
    const q = text.toLowerCase()
    let specialType: WorkspaceChatMessage['specialType'] = undefined

    if (q.includes('camera') || q.includes('c1 is congested') || q.includes('evidence')) {
      specialType = 'CAMERA_EVIDENCE'
    } else if (q.includes('refill first') || q.includes('run out first') || q.includes('which shelves')) {
      specialType = 'INVENTORY_RANKED'
    } else if (q.includes('why should counter c3') || q.includes('why should c3')) {
      specialType = 'EXPLAIN_WHY'
    } else if (q.includes('beverage') || q.includes('sales opportunities') || q.includes('cross-module') || q.includes('opportunity')) {
      specialType = 'CROSS_MODULE'
    } else if (q.includes('next 30 minutes') || q.includes('30 min') || q.includes('forecast')) {
      specialType = 'FORECAST_30MIN'
    }

    const apiMessages = [...messages, userMsg].map((m) => ({
      role: m.sender === 'USER' ? 'user' : 'assistant',
      content: m.text || (m.structured && m.structured.observation ? m.structured.observation : '')
    }))

    fetch('http://127.0.0.1:8000/api/v1/chat/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: apiMessages,
        system_prompt: 'You are an intelligent retail assistant chatbot. Your responses should be strictly related to shop content, retail operations, store management, inventory, and customer service. Be helpful and concise.'
      })
    })
    .then(res => res.json())
    .then(data => {
      const structRes = executeCopilotQuery(text, {
        page: 'copilot',
        activeStore: 'Store 01 — Chennai Central',
      })
      
      const replyText = data.reply || (data.detail ? `Error: ${data.detail}` : "Error: Received empty response");
      
      const botMsg: WorkspaceChatMessage = {
        id: `copilot-${Date.now()}`,
        sender: 'COPILOT',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: replyText,
        structured: structRes,
        specialType,
      }

      setMessages((prev) => [...prev, botMsg])
    })
    .catch(err => {
      console.error(err);
      const errorMsg: WorkspaceChatMessage = {
        id: `copilot-${Date.now()}`,
        sender: 'COPILOT',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: "Sorry, I encountered an error connecting to the intelligence server."
      }
      setMessages((prev) => [...prev, errorMsg])
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

  const handleTriggerAction = (act: CopilotAction) => {
    if (act.type === 'NAVIGATE') {
      navigate(act.payload)
    } else if (act.type === 'VIEW_TWIN') {
      navigate('/digital-twin')
    } else if (act.type === 'VIEW_CAMERA') {
      setCameraDrawer({
        isOpen: true,
        cameraCode: act.payload?.cameraCode || 'CAM-06',
        zoneName: act.payload?.zoneName || 'Monitored Zone',
      })
    } else if (act.type === 'ASSIGN_STAFF') {
      setConfirmDialog({
        isOpen: true,
        staffId: act.payload?.staffId || 'S02',
        taskTitle: act.payload?.task || 'Staff Operational Reallocation',
      })
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

                  {/* Structured Bot Response Content */}
                  {msg.structured && (
                    <div className="space-y-2.5">
                      {/* Observation */}
                      {msg.structured.observation && (
                        <div className="text-xs leading-relaxed text-slate-700">
                          {msg.structured.observation}
                        </div>
                      )}

                      {/* Recommendation & Reason */}
                      {msg.structured.action && (
                        <div className="p-2.5 rounded-lg bg-emerald-50/50 border border-emerald-200 text-xs">
                          <span className="text-[10px] text-emerald-800 font-bold block uppercase">
                            Recommended Action
                          </span>
                          <div className="text-slate-900 font-bold mt-0.5">
                            {msg.structured.action}
                          </div>
                          {msg.structured.prediction && (
                            <div className="text-[11px] text-amber-800 font-medium mt-1">
                              {msg.structured.prediction}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Raw Metric Chips */}
                      {msg.structured.rawMetrics && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {Object.entries(msg.structured.rawMetrics).map(([key, val], idx) => (
                            <div
                              key={idx}
                              className="bg-white px-2 py-0.5 rounded-md border border-slate-200 text-[10px] flex items-center gap-1.5 shadow-2xs font-mono"
                            >
                              <span className="text-slate-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                              <strong className="text-sky-700 font-bold">{String(val)}</strong>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Action Buttons */}
                      {msg.structured.actions && msg.structured.actions.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-200">
                          {msg.structured.actions.map((act, idx) => (
                            <Button
                              key={idx}
                              variant="action"
                              size="xs"
                              onClick={() => handleTriggerAction(act)}
                              className="h-7 px-2.5 text-[11px] gap-1 bg-sky-600 hover:bg-sky-700 text-white font-semibold"
                            >
                              {act.label}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
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

      {/* Confirmation & Auxiliary Dialogs */}
      <StaffDispatchConfirmDialog
        isOpen={confirmDialog.isOpen}
        staffId={confirmDialog.staffId}
        taskTitle={confirmDialog.taskTitle}
        onCancel={() => setConfirmDialog({ isOpen: false, staffId: '', taskTitle: '' })}
        onConfirm={() => {
          setConfirmDialog({ isOpen: false, staffId: '', taskTitle: '' })
          navigate('/staff-operations')
        }}
      />

      <WhyRecommendationDialog
        data={whyDialog.data}
        open={whyDialog.isOpen}
        onOpenChange={(isOpen) => {
          if (!isOpen) setWhyDialog({ isOpen: false, data: null })
        }}
      />

      {cameraDrawer.isOpen && (
        <ZoneCameraDrawer
          cameraCode={cameraDrawer.cameraCode}
          zoneName={cameraDrawer.zoneName}
          onClose={() => setCameraDrawer({ isOpen: false, cameraCode: '', zoneName: '' })}
        />
      )}
    </div>
  )
}
