import React from 'react'
import { Sparkles } from 'lucide-react'

interface CopilotSuggestedChipsProps {
  onSelectQuery: (query: string) => void
}

export const SUGGESTED_QUERIES = [
  "What's critical right now?",
  "Which shelves need replenishment?",
  "Which checkout is likely to become congested?",
  "Where should available staff be deployed?",
  "Why is Beverage B4 critical?",
  "Which zone has the highest lost-sale risk?",
  "What changed during the last hour?",
  "Summarize today's store performance.",
]

export const CopilotSuggestedChips: React.FC<CopilotSuggestedChipsProps> = ({
  onSelectQuery,
}) => {
  return (
    <div className="space-y-1.5 select-none font-mono text-xs">
      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
        <Sparkles className="h-3 w-3 text-cyan-400" />
        <span>Suggested Operations Queries</span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {SUGGESTED_QUERIES.map((q) => (
          <button
            key={q}
            onClick={() => onSelectQuery(q)}
            className="text-[10px] text-slate-300 bg-[#090D14] hover:bg-[#131D31] hover:text-cyan-300 border border-[#1E293B] hover:border-cyan-500/50 rounded-md px-2 py-1 text-left transition-all cursor-pointer font-sans leading-tight shadow-sm"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  )
}
