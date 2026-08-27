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
                  'p-3 rounded-xl border transition-all cursor-pointer select-none group shadow-2xs',
                  !notif.read
                    ? isCritical
                      ? 'bg-rose-50/40 border-rose-200 hover:bg-rose-50'
                      : notif.group === 'WARNING'
                      ? 'bg-amber-50/40 border-amber-200 hover:bg-amber-50'
                      : 'bg-emerald-50/40 border-emerald-200 hover:bg-emerald-50'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100 opacity-80'
                )}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    {!notif.read && (
                      <span className="h-1.5 w-1.5 rounded-full bg-sky-600 shrink-0" />
                    )}
                    <span className="text-xs font-semibold text-slate-900 font-sans group-hover:text-sky-700 transition-colors">
                      {notif.title}
                    </span>
                  </div>
                  <SeverityBadge severity={notif.severity} size="sm" />
                </div>

                <p className="text-xs text-slate-600 leading-relaxed mb-2.5 font-sans">
                  {notif.message}
                </p>

                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1.5 border-t border-slate-200/60">
                  <span className="flex items-center gap-1 font-sans">
                    <Clock className="h-3 w-3 text-slate-400" />
                    {formatTimeAgo(notif.timestamp)}
                  </span>
                  <span className="text-sky-700 font-semibold flex items-center gap-0.5 group-hover:underline font-sans">
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
    <div className="fixed inset-0 z-50 flex justify-end font-sans">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in-0"
        onClick={() => setNotificationDrawerOpen(false)}
      />

      {/* Slide-over Drawer */}
      <div className="relative w-full max-w-md h-full bg-white border-l border-slate-200 z-10 flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Top Header */}
        <div className="p-4 border-b border-slate-100 bg-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-sky-50 border border-sky-200 text-sky-600">
              <ShieldAlert className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 font-sans uppercase tracking-wider">
                Operational Incident Drawer
              </div>
              <div className="text-[10px] text-slate-500 font-sans">
                {unreadCount > 0 ? `${unreadCount} unacknowledged operational alerts` : 'All alerts acknowledged'}
              </div>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setNotificationDrawerOpen(false)}
            className="text-slate-400 hover:text-slate-900"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Filter Tabs Bar */}
        <div className="px-4 py-2 border-b border-slate-100 bg-slate-50 flex items-center justify-between gap-2 overflow-x-auto select-none font-sans">
          <div className="flex items-center gap-1 text-[11px]">
            <button
              onClick={() => setNotificationFilter('ALL')}
              className={cn(
                'px-2 py-1 rounded-md transition-colors cursor-pointer',
                notificationFilter === 'ALL'
                  ? 'bg-white text-sky-700 font-bold border border-slate-200 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              )}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setNotificationFilter('CRITICAL')}
              className={cn(
                'px-2 py-1 rounded-md transition-colors cursor-pointer',
                notificationFilter === 'CRITICAL'
                  ? 'bg-rose-50 text-rose-700 font-bold border border-rose-200 shadow-2xs'
                  : 'text-slate-500 hover:text-rose-700'
              )}
            >
              Critical ({criticalCount})
            </button>
            <button
              onClick={() => setNotificationFilter('WARNING')}
              className={cn(
                'px-2 py-1 rounded-md transition-colors cursor-pointer',
                notificationFilter === 'WARNING'
                  ? 'bg-amber-50 text-amber-800 font-bold border border-amber-200 shadow-2xs'
                  : 'text-slate-500 hover:text-amber-800'
              )}
            >
              Warning ({warningCount})
            </button>
            <button
              onClick={() => setNotificationFilter('RESOLVED')}
              className={cn(
                'px-2 py-1 rounded-md transition-colors cursor-pointer',
                notificationFilter === 'RESOLVED'
                  ? 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 shadow-2xs'
                  : 'text-slate-500 hover:text-emerald-700'
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
                className="text-[10px] text-sky-700 hover:text-sky-800 gap-1 px-1.5 h-6 font-sans"
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
            <div className="py-16 text-center text-xs text-slate-400 font-sans space-y-2">
              <CheckCircle2 className="h-8 w-8 mx-auto text-slate-300" />
              <div>No alerts matching this filter category.</div>
            </div>
          ) : (
            <>
              {renderGroupSection(
                'Critical Alerts',
                'CRITICAL',
                criticalItems,
                <ShieldAlert className="h-3.5 w-3.5 text-rose-600" />,
                'rose'
              )}

              {renderGroupSection(
                'High / Warnings',
                'WARNING',
                warningItems,
                <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />,
                'amber'
              )}

              {renderGroupSection(
                'Resolved Operational Actions',
                'RESOLVED',
                resolvedItems,
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />,
                'emerald'
              )}
            </>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs font-sans text-slate-500">
          <Button
            variant="ghost"
            size="xs"
            onClick={clearAllNotifications}
            className="text-slate-500 hover:text-rose-600 text-[11px] gap-1"
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
            className="text-sky-700 border-slate-200 bg-white hover:bg-slate-50 text-[11px] gap-1 shadow-2xs"
          >
            All Incidents <ExternalLink className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  )
}
