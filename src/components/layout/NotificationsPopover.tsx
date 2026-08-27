import React from 'react'
import { Bell, ShieldAlert, CheckCheck, Trash2, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@/store/useAppStore'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { SeverityBadge } from '@/components/common/SeverityBadge'
import { formatTimeAgo } from '@/lib/utils'

export const NotificationsPopover: React.FC = () => {
  const notifications = useAppStore((s) => s.notifications)
  const unreadCount = useAppStore((s) => s.unreadNotificationCount)
  const markNotificationAsRead = useAppStore((s) => s.markNotificationAsRead)
  const clearAllNotifications = useAppStore((s) => s.clearAllNotifications)
  const isNotificationsOpen = useAppStore((s) => s.isNotificationsOpen)
  const setNotificationsOpen = useAppStore((s) => s.setNotificationsOpen)
  const navigate = useNavigate()

  const handleAction = (notif: (typeof notifications)[0]) => {
    markNotificationAsRead(notif.id)
    setNotificationsOpen(false)
    if (notif.actionUrl) {
      navigate(notif.actionUrl)
    }
  }

  return (
    <Popover open={isNotificationsOpen} onOpenChange={setNotificationsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon-sm"
          className="relative border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-2xs"
          title="Edge AI Incident Notifications"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white font-mono shadow-xs animate-pulse">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-80 sm:w-96 p-0 bg-white border-slate-200 shadow-2xl text-slate-900 font-sans"
      >
        <div className="flex items-center justify-between p-3 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-sky-600" />
            <span className="text-xs font-bold text-slate-900 font-sans uppercase tracking-wider">
              Edge AI Telemetry Alerts
            </span>
            {unreadCount > 0 && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 font-bold">
                {unreadCount} new
              </span>
            )}
          </div>
          {notifications.length > 0 && (
            <Button
              variant="ghost"
              size="xs"
              onClick={clearAllNotifications}
              className="text-[10px] text-slate-500 hover:text-slate-900 h-6 px-1.5 font-sans"
            >
              Clear all
            </Button>
          )}
        </div>

        <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
          {notifications.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400 font-sans">
              No active alerts or incident notifications.
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleAction(notif)}
                className={`p-3 transition-colors cursor-pointer hover:bg-slate-50 ${
                  !notif.read ? 'bg-sky-50/30' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className="text-xs font-semibold text-slate-900 truncate">
                    {notif.title}
                  </span>
                  <SeverityBadge severity={notif.severity} />
                </div>
                <p className="text-xs text-slate-600 leading-relaxed mb-2 line-clamp-2">
                  {notif.message}
                </p>
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-sans">
                  <span>{formatTimeAgo(notif.timestamp)}</span>
                  <span className="text-sky-700 font-semibold flex items-center gap-1 group-hover:underline">
                    Action <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
