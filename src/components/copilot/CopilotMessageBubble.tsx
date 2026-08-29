import React from 'react'
import { Bot } from 'lucide-react'
import { CopilotRichText } from './CopilotRichText'

export interface ChatMessage {
  id: string
  sender: 'USER' | 'COPILOT'
  timestamp: string
  text?: string
}

interface CopilotMessageBubbleProps {
  message: ChatMessage
}

export const CopilotMessageBubble: React.FC<CopilotMessageBubbleProps> = ({
  message,
}) => {
  const isUser = message.sender === 'USER'

  if (isUser) {
    return (
      <div className="flex justify-end gap-2 my-2 select-none font-sans text-xs">
        <div className="max-w-[85%] bg-sky-50 border border-sky-200 rounded-xl p-3 shadow-2xs space-y-1">
          <div className="flex items-center justify-between gap-2 text-[9px] text-sky-700 font-mono">
            <span className="font-bold">STORE MANAGER</span>
            <span>{message.timestamp}</span>
          </div>
          <p className="text-slate-900 font-sans text-xs">{message.text}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex justify-start gap-2 my-2 select-none font-sans text-xs">
      <div className="w-full bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs space-y-2.5">
        <div className="flex items-center justify-between text-[10px] pb-2 border-b border-slate-100 font-sans">
          <div className="flex items-center gap-1.5 font-bold text-sky-700">
            <Bot className="h-3.5 w-3.5" />
            <span>STORE AI COPILOT</span>
          </div>
          <span className="text-slate-500 font-mono">{message.timestamp}</span>
        </div>

        {message.text && (
          <CopilotRichText
            text={message.text}
            className="font-sans text-[13px] leading-5"
          />
        )}
      </div>
    </div>
  )
}
