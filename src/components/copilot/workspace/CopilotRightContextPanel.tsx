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
    { label: 'Live Occupancy', value: `${currentOccupancy}`, subtext: '41% capacity', icon: Users, path: '/shopper-analytics', color: 'text-white' },
    { label: 'Shelf Health', value: '86%', subtext: '3 critical shelves', icon: PackageCheck, path: '/inventory', color: 'text-emerald-400' },
    { label: 'Average Wait', value: '2.8 min', subtext: 'Target <5.0 min', icon: Clock, path: '/queues', color: 'text-amber-400' },
    { label: 'Critical Alerts', value: '2', subtext: 'Immediate action', icon: ShieldAlert, path: '/incidents-actions', color: 'text-rose-400' },
    { label: 'Available Staff', value: '3', subtext: 'S02, S03, S06', icon: UserCheck, path: '/staff-operations', color: 'text-emerald-400' },
    { label: 'Store Health', value: '91/100', subtext: 'Optimal condition', icon: Activity, path: '/command-center', color: 'text-emerald-400' },
  ]

  const recentChanges = [
    { text: 'Shelf B4 dropped to 17%', delta: '↓ 31% → 17%', icon: TrendingDown, color: 'text-rose-400' },
    { text: 'Checkout C1 surge', delta: '↑ Queue 4 → 8', icon: TrendingUp, color: 'text-amber-400' },
    { text: 'S03 assigned to B4', delta: 'Active Task', icon: UserCheck, color: 'text-cyan-400' },
  ]

  return (
    <div className="rounded-lg border border-[#1E293B] bg-[#0F172A] p-3.5 flex flex-col h-full justify-between select-none text-xs shadow-sm space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-[#1E293B]">
        <div>
          <h3 className="text-xs font-semibold text-white tracking-wide">
            Live Store Context
          </h3>
          <p className="text-[10px] text-slate-400">
            Real-time store operational telemetry
          </p>
        </div>
        <span className="text-[10px] text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30 font-medium">
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
              className="w-full p-2 rounded-lg bg-[#090D14] border border-[#1E293B] hover:border-slate-500 hover:bg-[#131D31] text-left transition-all cursor-pointer group flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <div className="p-1 rounded bg-[#0F172A] text-slate-400 border border-[#1E293B] group-hover:text-cyan-400">
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div>
                  <div className="text-[11px] text-slate-300 group-hover:text-white font-medium">
                    {item.label}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {item.subtext}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className={cn('text-sm font-bold', item.color)}>
                  {item.value}
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* What Changed (Last 15 min) */}
      <div className="p-2.5 rounded-lg bg-[#090D14] border border-[#1E293B] space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300 border-b border-[#1E293B] pb-1">
          <span>What Changed</span>
          <span className="text-[10px] text-slate-500 font-normal">Last 15 min</span>
        </div>
        <div className="space-y-1 text-[10px]">
          {recentChanges.map((c, i) => (
            <div key={i} className="flex items-center justify-between text-slate-300">
              <span className="truncate max-w-[150px]">{c.text}</span>
              <span className={cn('font-medium', c.color)}>{c.delta}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Edge Connection Status */}
      <div className="pt-2 border-t border-[#1E293B] text-[10px] text-slate-400 flex items-center justify-between">
        <span className="flex items-center gap-1 text-emerald-400 font-medium">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          <span>Store Data Live</span>
        </span>
        <span>6/6 Cameras</span>
        <span className="text-cyan-400 font-medium">Edge Connected</span>
      </div>
    </div>
  )
}
