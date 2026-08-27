import React from 'react'
import {
  Bot,
  User,
  Clock,
  Sparkles,
  Layers,
  Camera,
  UserCheck,
  CheckSquare,
  ArrowRight,
  ExternalLink,
  HelpCircle,
  Cpu,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CopilotAction, CopilotStructuredResponse } from './CopilotToolEngine'
import { cn } from '@/lib/utils'

export interface ChatMessage {
  id: string
  sender: 'USER' | 'COPILOT'
  timestamp: string
  text?: string
  structured?: CopilotStructuredResponse
}

interface CopilotMessageBubbleProps {
  message: ChatMessage
  onTriggerAction: (action: CopilotAction) => void
}

export const CopilotMessageBubble: React.FC<CopilotMessageBubbleProps> = ({
  message,
  onTriggerAction,
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

  const res = message.structured

  return (
    <div className="flex justify-start gap-2 my-2 select-none font-sans text-xs">
      <div className="w-full bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs space-y-2.5">
        {/* Header: Copilot Badge & Tool Called */}
        <div className="flex items-center justify-between text-[10px] pb-2 border-b border-slate-100 font-sans">
          <div className="flex items-center gap-1.5 font-bold text-sky-700">
            <Bot className="h-3.5 w-3.5" />
            <span>STORE AI COPILOT</span>
          </div>
          <div className="flex items-center gap-2 text-slate-500 font-mono">
            {res?.toolCalled && (
              <span className="bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200 text-[9px] text-sky-700 font-mono">
                [Tool: {res.toolCalled}]
              </span>
            )}
            <span>{message.timestamp}</span>
          </div>
        </div>

        {/* 4-Stage Structured Operational Response */}
        {res ? (
          <div className="space-y-2 text-xs font-sans">
            {/* 1. Observation */}
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-0.5">
              <span className="text-[9px] font-bold text-sky-700 uppercase tracking-wider block">
                1. Current Observation
              </span>
              <p className="text-slate-700 text-xs leading-relaxed">
                {res.observation}
              </p>
            </div>

            {/* 2. Prediction */}
            <div className="p-2.5 rounded-lg bg-amber-50/40 border border-amber-200 space-y-0.5">
              <span className="text-[9px] font-bold text-amber-800 uppercase tracking-wider block">
                2. Edge AI Forecast
              </span>
              <p className="text-slate-800 text-xs leading-relaxed">
                {res.prediction}
              </p>
            </div>

            {/* 3. Action */}
            <div className="p-2.5 rounded-lg bg-emerald-50/40 border border-emerald-200 space-y-0.5">
              <span className="text-[9px] font-bold text-emerald-800 uppercase tracking-wider block">
                3. Recommended Action
              </span>
              <p className="text-emerald-800 text-xs font-semibold leading-relaxed">
                {res.action}
              </p>
            </div>

            {/* 4. Reason */}
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-0.5">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">
                4. Operational Reason / Deterministic Rationale
              </span>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                {res.reason}
              </p>
            </div>

            {/* Embedded Action Buttons */}
            {res.actions && res.actions.length > 0 && (
              <div className="pt-2 border-t border-slate-100 space-y-1.5">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">
                  Interactive Operational Actions:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {res.actions.map((act, idx) => (
                    <Button
                      key={idx}
                      variant={act.type === 'ASSIGN_STAFF' ? 'action' : 'outline'}
                      size="xs"
                      onClick={() => onTriggerAction(act)}
                      className={cn(
                        'text-[10px] h-6 px-2 gap-1 font-sans',
                        act.type === 'ASSIGN_STAFF'
                          ? 'bg-sky-600 hover:bg-sky-700 text-white font-semibold'
                          : 'border-slate-200 text-slate-700 bg-white hover:bg-slate-50 shadow-2xs font-semibold'
                      )}
                    >
                      {act.type === 'VIEW_TWIN' && <Layers className="h-3 w-3 text-sky-600" />}
                      {act.type === 'VIEW_CAMERA' && <Camera className="h-3 w-3 text-sky-600" />}
                      {act.type === 'ASSIGN_STAFF' && <UserCheck className="h-3 w-3" />}
                      {act.type === 'NAVIGATE' && <ExternalLink className="h-3 w-3" />}
                      <span>{act.label}</span>
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-slate-700 font-sans text-xs">{message.text}</p>
        )}
      </div>
    </div>
  )
}
