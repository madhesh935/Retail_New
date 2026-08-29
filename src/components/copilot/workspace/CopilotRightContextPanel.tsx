import React from 'react'
import {
  Users,
  PackageCheck,
  Clock,
  ShieldAlert,
  UserCheck,
  Activity,
  ChevronRight,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useLiveManagerContext } from './useLiveManagerContext'

export const CopilotRightContextPanel: React.FC = () => {
  const navigate = useNavigate()
  const ctx = useLiveManagerContext()

  const contextItems = [
    { label: 'Live Occupancy', value: `${ctx.currentOccupancy}`, subtext: `${ctx.occupancyPct}% capacity`, icon: Users, path: '/shopper-analytics', color: 'text-slate-900' },
    { label: 'Shelf Health', value: `${ctx.shelfHealthPct}%`, subtext: `${ctx.criticalShelvesCount} critical shelves`, icon: PackageCheck, path: '/inventory', color: 'text-emerald-700' },
    { label: 'Average Wait', value: `${ctx.avgWaitMinutes} min`, subtext: 'Target <5.0 min', icon: Clock, path: '/queues', color: 'text-amber-800' },
    { label: 'Critical Alerts', value: `${ctx.criticalIncidentsCount}`, subtext: 'Immediate action', icon: ShieldAlert, path: '/incidents-actions', color: 'text-rose-700' },
    {
      label: 'Available Staff',
      value: `${ctx.availableStaffCount}`,
      subtext: ctx.availableStaffCodes.length > 0 ? ctx.availableStaffCodes.join(', ') : 'None available',
      icon: UserCheck,
      path: '/staff-operations',
      color: 'text-emerald-700',
    },
    { label: 'Store Health', value: `${ctx.storeHealthScore}/100`, subtext: ctx.storeHealthLabel, icon: Activity, path: '/command-center', color: 'text-emerald-700' },
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

      {/* Footer Edge Connection Status */}
      <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-500 flex items-center justify-between font-sans">
        <span className={cn('flex items-center gap-1 font-bold', ctx.isEdgeConnected ? 'text-emerald-700' : 'text-rose-700')}>
          <span className={cn('h-1.5 w-1.5 rounded-full', ctx.isEdgeConnected ? 'bg-emerald-500' : 'bg-rose-500')} />
          <span>{ctx.isEdgeConnected ? 'Store Data Live' : 'Reconnecting…'}</span>
        </span>
        <span>{ctx.camerasOnline}/{ctx.camerasTotal} Cameras</span>
        <span className={cn('font-bold', ctx.isEdgeConnected ? 'text-sky-700' : 'text-rose-700')}>
          {ctx.isEdgeConnected ? 'Edge Connected' : 'Edge Offline'}
        </span>
      </div>
    </div>
  )
}
