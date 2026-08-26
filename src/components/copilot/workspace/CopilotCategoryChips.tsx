import React from 'react'
import {
  Sparkles,
  LayoutDashboard,
  PackageCheck,
  ListOrdered,
  UserCheck,
  TrendingUp,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export type QueryCategory =
  | 'ALL'
  | 'INVENTORY'
  | 'QUEUES'
  | 'STAFF'
  | 'INSIGHTS'

interface CopilotCategoryChipsProps {
  selectedCategory: QueryCategory
  onSelectCategory: (cat: QueryCategory) => void
  onSelectPrompt: (prompt: string) => void
}

const CATEGORY_PROMPTS: Record<QueryCategory, string[]> = {
  ALL: [
    "What's critical right now?",
    "Which shelves need replenishment?",
    "Which checkout is at risk of congestion?",
    "Where should available staff be deployed?",
  ],
  INVENTORY: [
    "Which shelves will run out first?",
    "Why is Beverage B4 critical?",
    "Show physical vs digital stock discrepancies.",
    "Which high-interest zone has low availability?",
  ],
  QUEUES: [
    "Which checkout is congested right now?",
    "Why should Counter C3 be opened?",
    "Predict queue congestion for the next 15 minutes.",
    "What is the average customer wait time?",
  ],
  STAFF: [
    "Who is available right now?",
    "Which staff member should handle B4?",
    "Where should available staff be deployed?",
    "Show active task allocations.",
  ],
  INSIGHTS: [
    "Summarize today's performance.",
    "Compare today with yesterday.",
    "What changed in the last 15 minutes?",
    "What is expected during the evening rush?",
  ],
}

export const CopilotCategoryChips: React.FC<CopilotCategoryChipsProps> = ({
  selectedCategory,
  onSelectCategory,
  onSelectPrompt,
}) => {
  const categories: { id: QueryCategory; label: string }[] = [
    { id: 'ALL', label: 'Overview' },
    { id: 'INVENTORY', label: 'Inventory' },
    { id: 'QUEUES', label: 'Queues' },
    { id: 'STAFF', label: 'Staff' },
    { id: 'INSIGHTS', label: 'Store Insights' },
  ]

  const activePrompts = CATEGORY_PROMPTS[selectedCategory] || CATEGORY_PROMPTS.ALL

  return (
    <div className="space-y-2 select-none text-xs">
      {/* Category Pills Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => onSelectCategory(c.id)}
            className={cn(
              'px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition-colors cursor-pointer border',
              selectedCategory === c.id
                ? 'bg-cyan-950 text-cyan-300 border-cyan-500/60 font-semibold'
                : 'bg-[#090D14] text-slate-400 border-[#1E293B] hover:text-white hover:border-slate-700'
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Suggested Prompt Chips (Max 4) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-0.5">
        {activePrompts.slice(0, 4).map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => onSelectPrompt(prompt)}
            className="text-[11px] text-slate-300 bg-[#090D14] hover:bg-[#131D31] hover:text-cyan-300 border border-[#1E293B] hover:border-cyan-500/50 rounded-lg px-2.5 py-1.5 text-left transition-all cursor-pointer font-medium leading-snug truncate"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  )
}
