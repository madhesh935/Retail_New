import React from 'react'
import { Bell, Wifi } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'

interface StaffTopBarProps {
  onOpenNotifications: () => void
  storeName?: string
}

export const StaffTopBar: React.FC<StaffTopBarProps> = ({
  onOpenNotifications,
  storeName = 'Chennai Central • Store 01',
}) => {
  const { operationalStatus, setOperationalStatus, customerRequests, pendingTasks, connectionState } = useAppStore()

  const urgentCount =
    customerRequests.filter((r) => r.status === 'REQUESTED').length +
    pendingTasks.filter((t) => t.priority === 'CRITICAL' && t.status === 'ASSIGNED').length

  const isConnected = connectionState === 'CONNECTED'
  const isReconnecting = connectionState === 'RECONNECTING' || connectionState === 'CONNECTING'

  return (
    <header className="h-14 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 flex items-center justify-between shrink-0 z-30 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
      {/* Store Branding & Edge Connectivity */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center tracking-tight shadow-xs shadow-blue-500/20">
          RE
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-900 tracking-tight leading-tight">Retail Edge</span>
            <span className="text-[10px] text-slate-400 font-medium font-mono">Store 01</span>
          </div>
          <div
            className={`flex items-center gap-1.5 text-[10px] font-semibold ${
              isConnected ? 'text-emerald-700' : isReconnecting ? 'text-amber-700' : 'text-rose-700'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isConnected
                  ? 'bg-emerald-500 animate-pulse'
                  : isReconnecting
                  ? 'bg-amber-500 animate-pulse'
                  : 'bg-rose-500'
              }`}
            />
            <span>{isConnected ? 'Edge Gateway Online' : isReconnecting ? 'Connecting…' : 'Edge Gateway Offline'}</span>
          </div>
        </div>
      </div>

      {/* Right controls: Status pill + Notification Bell */}
      <div className="flex items-center gap-2">
        {/* Status Dropdown/Selector */}
        <select
          value={operationalStatus}
          onChange={(e) => setOperationalStatus(e.target.value as any)}
          className={`text-[11px] font-bold px-2.5 py-1 rounded-xl border appearance-none transition-all cursor-pointer shadow-2xs ${
            operationalStatus === 'AVAILABLE'
              ? 'bg-emerald-50/80 text-emerald-800 border-emerald-200/80'
              : operationalStatus === 'BUSY'
              ? 'bg-blue-50/80 text-blue-800 border-blue-200/80'
              : 'bg-amber-50/80 text-amber-800 border-amber-200/80'
          }`}
        >
          <option value="AVAILABLE">● Available</option>
          <option value="BUSY">● Busy</option>
          <option value="ON_BREAK">● On Break</option>
        </select>

        {/* Notification Bell */}
        <button
          type="button"
          onClick={onOpenNotifications}
          className="relative p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-4.5 h-4.5" />
          {urgentCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] font-extrabold flex items-center justify-center border-2 border-white">
              {urgentCount}
            </span>
          )}
        </button>
      </div>
    </header>
  )
}
