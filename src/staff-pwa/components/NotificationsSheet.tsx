import React from 'react'
import { X, Bell, CheckCircle2, MessageCircle, AlertTriangle, ArrowRight, Check } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'

interface NotificationsSheetProps {
  isOpen: boolean
  onClose: () => void
  onNavigateTab: (tab: 'today' | 'assist' | 'scan' | 'work' | 'more') => void
}

export const NotificationsSheet: React.FC<NotificationsSheetProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
}) => {
  const { storeAnnouncements, acknowledgeAnnouncement, customerRequests, pendingTasks } = useAppStore()

  if (!isOpen) return null

  const waitingHelpCount = customerRequests.filter((r) => r.status === 'REQUESTED').length
  const urgentTasksCount = pendingTasks.filter((t) => t.priority === 'CRITICAL' || t.priority === 'URGENT').length

  return (
    <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 border border-blue-200/80 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 leading-tight">Store Notifications</h3>
              <p className="text-[11px] text-slate-500 font-medium">Operational Dispatch & Announcements</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 overflow-y-auto space-y-3">
          {/* Active Customer Request Pill */}
          {waitingHelpCount > 0 && (
            <div
              onClick={() => {
                onClose()
                onNavigateTab('assist')
              }}
              className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-2xl cursor-pointer hover:bg-blue-100/60 transition-all flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2.5">
                <MessageCircle className="w-5 h-5 text-blue-600 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-blue-950">Customer Assistance Waiting</h4>
                  <p className="text-[11px] text-blue-800">{waitingHelpCount} shopper requesting help in Dairy Wall</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-blue-700" />
            </div>
          )}

          {/* Urgent Tasks Pill */}
          {urgentTasksCount > 0 && (
            <div
              onClick={() => {
                onClose()
                onNavigateTab('work')
              }}
              className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl cursor-pointer hover:bg-rose-100/60 transition-all flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-rose-950">High Priority Dispatch</h4>
                  <p className="text-[11px] text-rose-800">Checkout Counter C3 & Shelf B4 require attention</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-rose-700" />
            </div>
          )}

          {/* Store Announcements */}
          <div className="pt-2 space-y-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Store Announcements</h4>
            {storeAnnouncements.map((ann) => (
              <div key={ann.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded uppercase ${
                      ann.priority === 'URGENT' ? 'bg-amber-100 text-amber-900' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {ann.priority}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{ann.timestamp}</span>
                </div>
                <h5 className="text-xs font-bold text-slate-900">{ann.title}</h5>
                <p className="text-[11px] text-slate-600 leading-relaxed">{ann.content}</p>
                <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[10px]">
                  <span className="text-slate-400 font-medium">By {ann.author}</span>
                  {ann.acknowledged ? (
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <Check className="w-3 h-3" /> Acknowledged
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => acknowledgeAnnouncement(ann.id)}
                      className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-xs shadow-blue-500/20"
                    >
                      Acknowledge
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-white">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
