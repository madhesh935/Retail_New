import React from 'react'
import {
  Users,
  PackageCheck,
  Clock,
  ShieldAlert,
  UserCheck,
  Activity,
  ChevronRight,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/useAppStore'

export const CopilotRightContextPanel: React.FC = () => {
  const navigate = useNavigate()
  const currentOccupancy = useAppStore((s) => s.currentOccupancy) || 142

  const contextItems = [
    { label: 'Live Occupancy', value: `${currentOccupancy}`, subtext: '41% capacity', icon: Users, path: '/shopper-analytics', color: 'text-slate-900' },
    { label: 'Shelf Health', value: '86%', subtext: '3 critical shelves', icon: PackageCheck, path: '/inventory', color: 'text-emerald-700' },
    { label: 'Average Wait', value: '2.8 min', subtext: 'Target <5.0 min', icon: Clock, path: '/queues', color: 'text-amber-800' },
    { label: 'Critical Alerts', value: '2', subtext: 'Immediate action', icon: ShieldAlert, path: '/incidents-actions', color: 'text-rose-700' },
    { label: 'Available Staff', value: '3', subtext: 'S02, S03, S06', icon: UserCheck, path: '/staff-operations', color: 'text-emerald-700' },
    { label: 'Store Health', value: '91/100', subtext: 'Optimal condition', icon: Activity, path: '/command-center', color: 'text-emerald-700' },
  ]

  const recentChanges = [
    { text: 'Shelf B4 dropped to 17%', delta: '↓ 31% → 17%', icon: TrendingDown, color: 'text-rose-700' },
    { text: 'Checkout C1 surge', delta: '↑ Queue 4 → 8', icon: TrendingUp, color: 'text-amber-800' },
    { text: 'S03 assigned to B4', delta: 'Active Task', icon: UserCheck, color: 'text-sky-700' },
  ]

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3.5 flex flex-col h-full justify-between select-none text-xs shadow-2xs space-y-3 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
        <div>
          <h3 className="text-xs font-bold text-slate-900 tracking-wide">
            Live Store Context
          </h3>
          <p className="text-[10px] text-slate-500">
            Real-time store operational telemetry
          </p>
        </div>
        <span className="text-[10px] text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200 font-bold">
          Store 01
        </span>
      </div>

      {/* Navigable Metric Tiles */}
      <div className="space-y-1.5 flex-1 overflow-y-auto pr-0.5">
        {contextItems.map((item) => {
          const Icon = item.icon

          return (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200 hover:border-sky-300 hover:bg-sky-50/50 text-left transition-all cursor-pointer group flex items-center justify-between shadow-2xs"
            >
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-white text-slate-500 border border-slate-200 group-hover:text-sky-600 shadow-2xs">
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div>
                  <div className="text-[11px] text-slate-700 group-hover:text-slate-900 font-semibold">
                    {item.label}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {item.subtext}
                  </div>
                </div>
              </div>

              <div className="text-right font-mono">
                <div className={cn('text-sm font-bold', item.color)}>
                  {item.value}
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* What Changed (Last 15 min) */}
      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 shadow-2xs">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-900 border-b border-slate-200/60 pb-1">
          <span>What Changed</span>
          <span className="text-[10px] text-slate-400 font-normal">Last 15 min</span>
        </div>
        <div className="space-y-1 text-[10px]">
          {recentChanges.map((c, i) => (
            <div key={i} className="flex items-center justify-between text-slate-700 font-sans">
              <span className="truncate max-w-[150px]">{c.text}</span>
              <span className={cn('font-bold font-mono', c.color)}>{c.delta}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Edge Connection Status */}
      <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-500 flex items-center justify-between font-sans">
        <span className="flex items-center gap-1 text-emerald-700 font-bold">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <span>Store Data Live</span>
        </span>
        <span>6/6 Cameras</span>
        <span className="text-sky-700 font-bold">Edge Connected</span>
      </div>
    </div>
  )
}
