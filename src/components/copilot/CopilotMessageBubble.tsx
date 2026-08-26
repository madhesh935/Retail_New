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
      <div className="flex justify-end gap-2 my-2 select-none font-mono text-xs">
        <div className="max-w-[85%] bg-cyan-950/70 border border-cyan-500/40 rounded-lg p-2.5 shadow-sm space-y-1">
          <div className="flex items-center justify-between gap-2 text-[9px] text-cyan-300/80">
            <span className="font-bold">STORE MANAGER</span>
            <span>{message.timestamp}</span>
          </div>
          <p className="text-white font-sans text-xs">{message.text}</p>
        </div>
      </div>
    )
  }

  const res = message.structured

  return (
    <div className="flex justify-start gap-2 my-2 select-none font-mono text-xs">
      <div className="w-full bg-[#0F172A] border border-[#1E293B] rounded-lg p-3 shadow-md space-y-2.5">
        {/* Header: Copilot Badge & Tool Called */}
        <div className="flex items-center justify-between text-[10px] pb-2 border-b border-[#1E293B]">
          <div className="flex items-center gap-1.5 font-bold text-cyan-400">
            <Bot className="h-3.5 w-3.5" />
            <span>STORE AI COPILOT</span>
          </div>
          <div className="flex items-center gap-2 text-slate-500">
            {res?.toolCalled && (
              <span className="bg-[#090D14] px-1.5 py-0.5 rounded border border-[#1E293B] text-[9px] text-cyan-300 font-mono">
                [Tool: {res.toolCalled}]
              </span>
            )}
            <span>{message.timestamp}</span>
          </div>
        </div>

        {/* 4-Stage Structured Operational Response */}
        {res ? (
          <div className="space-y-2 text-xs">
            {/* 1. Observation */}
            <div className="p-2 rounded bg-[#090D14] border border-cyan-500/30 space-y-0.5">
              <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-wider block">
                1. Current Observation
              </span>
              <p className="text-slate-200 font-sans text-xs leading-relaxed">
                {res.observation}
              </p>
            </div>

            {/* 2. Prediction */}
            <div className="p-2 rounded bg-[#090D14] border border-amber-500/30 space-y-0.5">
              <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider block">
                2. Edge AI Forecast
              </span>
              <p className="text-slate-300 font-sans text-xs leading-relaxed">
                {res.prediction}
              </p>
            </div>

            {/* 3. Action */}
            <div className="p-2 rounded bg-[#090D14] border border-emerald-500/40 space-y-0.5">
              <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider block">
                3. Recommended Action
              </span>
              <p className="text-emerald-300 font-sans text-xs font-semibold leading-relaxed">
                {res.action}
              </p>
            </div>

            {/* 4. Reason */}
            <div className="p-2 rounded bg-[#090D14] border border-slate-700/60 space-y-0.5">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                4. Operational Reason / Deterministic Rationale
              </span>
              <p className="text-slate-400 font-sans text-[11px] leading-relaxed">
                {res.reason}
              </p>
            </div>

            {/* Embedded Action Buttons */}
            {res.actions && res.actions.length > 0 && (
              <div className="pt-2 border-t border-[#1E293B] space-y-1.5">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
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
                        'text-[10px] h-6 px-2 gap-1 font-mono',
                        act.type !== 'ASSIGN_STAFF' && 'border-[#1E293B] text-slate-300 hover:text-white'
                      )}
                    >
                      {act.type === 'VIEW_TWIN' && <Layers className="h-3 w-3 text-cyan-400" />}
                      {act.type === 'VIEW_CAMERA' && <Camera className="h-3 w-3 text-cyan-400" />}
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
          <p className="text-slate-300 font-sans text-xs">{message.text}</p>
        )}
      </div>
    </div>
  )
}
