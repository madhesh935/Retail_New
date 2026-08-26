import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bell,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  X,
  CheckCheck,
  Trash2,
  ArrowRight,
  ExternalLink,
  Clock,
} from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { SeverityBadge } from '@/components/common/SeverityBadge'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Button } from '@/components/ui/button'
import { formatTimeAgo, cn } from '@/lib/utils'

export const NotificationDrawer: React.FC = () => {
  const isNotificationDrawerOpen = useAppStore((s) => s.isNotificationDrawerOpen)
  const setNotificationDrawerOpen = useAppStore((s) => s.setNotificationDrawerOpen)
  const notifications = useAppStore((s) => s.notifications)
  const unreadCount = useAppStore((s) => s.unreadNotificationCount)
  const notificationFilter = useAppStore((s) => s.notificationFilter)
  const setNotificationFilter = useAppStore((s) => s.setNotificationFilter)
  const markNotificationAsRead = useAppStore((s) => s.markNotificationAsRead)
  const markAllNotificationsAsRead = useAppStore((s) => s.markAllNotificationsAsRead)
  const clearAllNotifications = useAppStore((s) => s.clearAllNotifications)

  const navigate = useNavigate()

  if (!isNotificationDrawerOpen) return null

  const handleNotificationClick = (notif: (typeof notifications)[0]) => {
    markNotificationAsRead(notif.id)
    setNotificationDrawerOpen(false)
    if (notif.actionUrl) {
      navigate(notif.actionUrl)
    }
  }

  // Filter notifications based on selected tab
  const filteredNotifications = notifications.filter((notif) => {
    if (notificationFilter === 'ALL') return true
    return notif.group === notificationFilter
  })

  const criticalCount = notifications.filter((n) => n.group === 'CRITICAL').length
  const warningCount = notifications.filter((n) => n.group === 'WARNING').length
  const resolvedCount = notifications.filter((n) => n.group === 'RESOLVED').length

  const renderGroupSection = (
    groupTitle: string,
    groupType: 'CRITICAL' | 'WARNING' | 'RESOLVED',
    items: typeof notifications,
    icon: React.ReactNode,
    badgeVariant: string
  ) => {
    if (items.length === 0) return null

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1 py-0.5">
          <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-wider">
            {icon}
            <span
              className={
                groupType === 'CRITICAL'
                  ? 'text-rose-400'
                  : groupType === 'WARNING'
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              }
            >
              {groupTitle}
            </span>
            <span className="text-slate-500 font-normal">({items.length})</span>
          </div>
        </div>

        <div className="space-y-2">
          {items.map((notif) => {
            const isResolved = notif.group === 'RESOLVED'
            const isCritical = notif.group === 'CRITICAL'

            return (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={cn(
                  'p-3 rounded-lg border transition-all cursor-pointer select-none group',
                  !notif.read
                    ? isCritical
                      ? 'bg-rose-950/20 border-rose-500/50 hover:bg-rose-950/30'
                      : notif.group === 'WARNING'
                      ? 'bg-amber-950/20 border-amber-500/40 hover:bg-amber-950/30'
                      : 'bg-[#0F172A] border-emerald-500/30 hover:bg-[#131D31]'
                    : 'bg-[#090D14] border-[#1E293B] hover:bg-[#0F172A] opacity-75'
                )}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    {!notif.read && (
                      <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shrink-0" />
                    )}
                    <span className="text-xs font-semibold text-white font-sans group-hover:text-cyan-300 transition-colors">
                      {notif.title}
                    </span>
                  </div>
                  <SeverityBadge severity={notif.severity} size="sm" />
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-2.5">
                  {notif.message}
                </p>

                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1.5 border-t border-[#1E293B]/70">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-slate-500" />
                    {formatTimeAgo(notif.timestamp)}
                  </span>
                  <span className="text-cyan-400 flex items-center gap-0.5 group-hover:underline">
                    Take Action <ArrowRight className="h-2.5 w-2.5 ml-0.5" />
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const criticalItems = filteredNotifications.filter((n) => n.group === 'CRITICAL')
  const warningItems = filteredNotifications.filter((n) => n.group === 'WARNING')
  const resolvedItems = filteredNotifications.filter((n) => n.group === 'RESOLVED')

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity animate-in fade-in-0"
        onClick={() => setNotificationDrawerOpen(false)}
      />

      {/* Slide-over Drawer */}
      <div className="relative w-full max-w-md h-full bg-[#0B0F17] border-l border-[#1E293B] z-10 flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Top Header */}
        <div className="p-4 border-b border-[#1E293B] bg-[#0F172A] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-400">
              <ShieldAlert className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                Operational Incident Drawer
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                {unreadCount > 0 ? `${unreadCount} unacknowledged operational alerts` : 'All alerts acknowledged'}
              </div>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setNotificationDrawerOpen(false)}
            className="text-slate-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Filter Tabs Bar */}
        <div className="px-4 py-2 border-b border-[#1E293B] bg-[#090D14] flex items-center justify-between gap-2 overflow-x-auto select-none">
          <div className="flex items-center gap-1 text-[11px] font-mono">
            <button
              onClick={() => setNotificationFilter('ALL')}
              className={cn(
                'px-2 py-1 rounded transition-colors cursor-pointer',
                notificationFilter === 'ALL'
                  ? 'bg-[#1E293B] text-cyan-300 font-bold border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              )}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setNotificationFilter('CRITICAL')}
              className={cn(
                'px-2 py-1 rounded transition-colors cursor-pointer',
                notificationFilter === 'CRITICAL'
                  ? 'bg-rose-950 text-rose-300 font-bold border border-rose-500/40'
                  : 'text-slate-400 hover:text-rose-300'
              )}
            >
              Critical ({criticalCount})
            </button>
            <button
              onClick={() => setNotificationFilter('WARNING')}
              className={cn(
                'px-2 py-1 rounded transition-colors cursor-pointer',
                notificationFilter === 'WARNING'
                  ? 'bg-amber-950 text-amber-300 font-bold border border-amber-500/40'
                  : 'text-slate-400 hover:text-amber-300'
              )}
            >
              Warning ({warningCount})
            </button>
            <button
              onClick={() => setNotificationFilter('RESOLVED')}
              className={cn(
                'px-2 py-1 rounded transition-colors cursor-pointer',
                notificationFilter === 'RESOLVED'
                  ? 'bg-emerald-950 text-emerald-300 font-bold border border-emerald-500/40'
                  : 'text-slate-400 hover:text-emerald-300'
              )}
            >
              Resolved ({resolvedCount})
            </button>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="xs"
                onClick={markAllNotificationsAsRead}
                className="text-[10px] text-cyan-400 hover:text-cyan-300 gap-1 px-1.5 h-6 font-mono"
                title="Mark all as read"
              >
                <CheckCheck className="h-3 w-3" /> Mark read
              </Button>
            )}
          </div>
        </div>

        {/* Grouped Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {filteredNotifications.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-500 font-mono space-y-2">
              <CheckCircle2 className="h-8 w-8 mx-auto text-slate-700" />
              <div>No alerts matching this filter category.</div>
            </div>
          ) : (
            <>
              {renderGroupSection(
                'Critical Alerts',
                'CRITICAL',
                criticalItems,
                <ShieldAlert className="h-3.5 w-3.5 text-rose-400" />,
                'rose'
              )}

              {renderGroupSection(
                'High / Warnings',
                'WARNING',
                warningItems,
                <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />,
                'amber'
              )}

              {renderGroupSection(
                'Resolved Operational Actions',
                'RESOLVED',
                resolvedItems,
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />,
                'emerald'
              )}
            </>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-3 border-t border-[#1E293B] bg-[#090D14] flex items-center justify-between text-xs font-mono text-slate-400">
          <Button
            variant="ghost"
            size="xs"
            onClick={clearAllNotifications}
            className="text-slate-500 hover:text-rose-400 text-[11px] gap-1"
          >
            <Trash2 className="h-3 w-3" /> Clear Alert History
          </Button>

          <Button
            variant="outline"
            size="xs"
            onClick={() => {
              setNotificationDrawerOpen(false)
              navigate('/incidents-actions')
            }}
            className="text-cyan-300 border-cyan-500/40 hover:bg-cyan-950/60 text-[11px] gap-1"
          >
            All Incidents <ExternalLink className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  )
}
