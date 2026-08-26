import React, { useState } from 'react'
import { Send, MessageSquare } from 'lucide-react'
import { CustomerAssistMessage } from '../../types/customerAssist.types'

interface AssistanceMessagePanelProps {
  messages: CustomerAssistMessage[]
  onSendMessage: (text: string) => void
  disabled?: boolean
}

const QUICK_REPLIES = [
  "I'm near the shelf",
  "I still can't find it",
  "Please bring it from backroom",
  "I'm at the checkout",
  "I no longer need help",
]

export const AssistanceMessagePanel: React.FC<AssistanceMessagePanelProps> = ({
  messages,
  onSendMessage,
  disabled = false,
}) => {
  const [inputText, setInputText] = useState('')

  const handleSend = () => {
    if (!inputText.trim() || disabled) return
    onSendMessage(inputText.trim())
    setInputText('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3.5 space-y-3 shadow-2xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
          <MessageSquare className="h-3.5 w-3.5 text-cyan-700" />
          <span>Message Store Associate</span>
        </div>
        <span className="text-[10px] text-slate-400 font-medium">Direct Chat</span>
      </div>

      {/* Quick Replies Carousel */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {QUICK_REPLIES.map((reply) => (
          <button
            key={reply}
            onClick={() => onSendMessage(reply)}
            disabled={disabled}
            className="shrink-0 px-2.5 py-1 rounded-full bg-slate-100 hover:bg-cyan-50 hover:text-cyan-800 hover:border-cyan-200 border border-slate-200 text-[10px] font-medium text-slate-700 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
          >
            {reply}
          </button>
        ))}
      </div>

      {/* Message Stream */}
      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
        {messages.length === 0 ? (
          <p className="text-[11px] text-slate-400 italic text-center py-2">
            No messages yet. Tap a quick reply if you want to update the associate.
          </p>
        ) : (
          messages.map((msg) => {
            const isCustomer = msg.sender === 'CUSTOMER'
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isCustomer ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs ${
                    isCustomer
                      ? 'bg-cyan-700 text-white rounded-br-xs'
                      : 'bg-slate-100 text-slate-900 border border-slate-200 rounded-bl-xs'
                  }`}
                >
                  <p className="leading-relaxed">{msg.text}</p>
                </div>
                <span className="text-[9px] text-slate-400 mt-0.5 px-1">
                  {isCustomer ? 'You' : 'Store Associate'} • {msg.timestamp}
                </span>
              </div>
            )
          })
        )}
      </div>

      {/* Text Input Row */}
      <div className="flex items-center gap-2 pt-1">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="Type a quick message..."
          maxLength={200}
          className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:bg-white transition-all disabled:opacity-50"
        />
        <button
          onClick={handleSend}
          disabled={!inputText.trim() || disabled}
          className="p-2 rounded-xl bg-cyan-700 text-white hover:bg-cyan-800 disabled:opacity-40 disabled:hover:bg-cyan-700 transition-all cursor-pointer shrink-0 shadow-2xs"
          aria-label="Send message"
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
