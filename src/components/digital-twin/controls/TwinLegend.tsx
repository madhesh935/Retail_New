import React, { useState } from 'react'
import { UserCheck, AlertTriangle, Users, HelpCircle, Camera, ChevronDown, ChevronUp, LucideIcon } from 'lucide-react'

const ITEMS: { icon: LucideIcon; label: string; color: string }[] = [
  { icon: UserCheck, label: 'Staff Task', color: '#0EA5E9' },
  { icon: AlertTriangle, label: 'Replenishment Needed', color: '#F59E0B' },
  { icon: Users, label: 'Checkout Queue', color: '#DC2626' },
  { icon: HelpCircle, label: 'Customer Assistance', color: '#059669' },
  { icon: Camera, label: 'Camera', color: '#0EA5E9' },
]

/** Top-left icon legend explaining the twin's floating status badges. */
export const TwinLegend: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="absolute top-3 left-3 z-20 w-56 rounded-xl border border-slate-200 bg-white/95 backdrop-blur-sm shadow-lg font-sans select-none">
      <button
        type="button"
        onClick={() => setCollapsed((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-slate-900 cursor-pointer"
      >
        <span>Live Operations</span>
        {collapsed ? <ChevronUp className="h-3.5 w-3.5 text-slate-400" /> : <ChevronDown className="h-3.5 w-3.5 text-slate-400" />}
      </button>
      {!collapsed && (
        <div className="px-3 pb-2.5 space-y-1.5">
          {ITEMS.map((item) => (
            <div key={item.label} className="flex items-center gap-2 text-[11px] text-slate-600 font-medium">
              <span
                className="flex items-center justify-center rounded-full shrink-0"
                style={{ width: 18, height: 18, background: item.color }}
              >
                <item.icon size={11} color="white" strokeWidth={2.5} />
              </span>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
