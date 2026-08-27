import React, { useState } from 'react'
import {
  HandHelping,
  MapPin,
  Clock,
  CheckCircle2,
  Inbox,
  MessageCircle,
  ArrowRight,
  Check,
} from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { CustomerHelpRequest } from '@/store/slices/customerRequestSlice'

interface StaffAssistPageProps {
  onOpenAssistDetails: (request: CustomerHelpRequest) => void
  onOpenMap: (zoneName: string, shelfCode?: string) => void
}

export const StaffAssistPage: React.FC<StaffAssistPageProps> = ({
  onOpenAssistDetails,
  onOpenMap,
}) => {
  const { customerRequests, acceptCustomerRequest, authenticatedStaff } = useAppStore()
  const [activeFilter, setActiveFilter] = useState<'NEW' | 'HELPING' | 'DONE'>('NEW')

  const staffName = authenticatedStaff?.name || 'Liam'
  const staffId = authenticatedStaff?.id || 'STAFF-03'

  const newRequests = customerRequests.filter((r) => r.status === 'REQUESTED')
  const helpingRequests = customerRequests.filter(
    (r) => r.status === 'ACCEPTED' || r.status === 'ASSIGNED' || r.status === 'ASSISTING'
  )
  const doneRequests = customerRequests.filter((r) => r.status === 'COMPLETED' || r.status === 'UNAVAILABLE')

  const displayedRequests =
    activeFilter === 'NEW' ? newRequests : activeFilter === 'HELPING' ? helpingRequests : doneRequests

  const handleQuickAccept = (e: React.MouseEvent, reqId: string) => {
    e.stopPropagation()
    acceptCustomerRequest(reqId, staffId, staffName)
  }

  return (
    <div className="space-y-3.5 p-4 pb-28">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-4.5 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-1">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <HandHelping className="w-5 h-5 text-blue-600" />
            <span>Customer Assistance</span>
          </h2>
          <span className="text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200/80 px-2 py-0.5 rounded-full">
            {newRequests.length} Waiting
          </span>
        </div>
        <p className="text-xs text-slate-500 font-medium">
          Live shopper assistance dispatches from store aisles & Customer PWA
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-xl">
        <button
          type="button"
          onClick={() => setActiveFilter('NEW')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeFilter === 'NEW'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <span>New</span>
          {newRequests.length > 0 && (
            <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center">
              {newRequests.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('HELPING')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeFilter === 'HELPING'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <span>Helping Now</span>
          {helpingRequests.length > 0 && (
            <span className="w-4 h-4 rounded-full bg-slate-800 text-white text-[9px] font-bold flex items-center justify-center">
              {helpingRequests.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('DONE')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
            activeFilter === 'DONE'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Completed
        </button>
      </div>

      {/* Requests List */}
      <div className="space-y-3">
        {displayedRequests.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-2 shadow-2xs">
            <CheckCircle2 className="w-8 h-8 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-900">
              {activeFilter === 'NEW'
                ? 'No Shoppers Currently Need Help'
                : activeFilter === 'HELPING'
                ? 'No Active Assistance Sessions'
                : 'No Completed Assistance Records'}
            </h3>
            <p className="text-xs text-slate-400">
              {activeFilter === 'NEW'
                ? 'New requests from the Customer app will appear here instantly.'
                : 'Completed requests will be archived.'}
            </p>
          </div>
        ) : (
          displayedRequests.map((req) => {
            const isNew = req.status === 'REQUESTED'
            const isBackroom = req.isBackroomFlow

            return (
              <div
                key={req.id}
                onClick={() => onOpenAssistDetails(req)}
                className={`bg-white rounded-2xl border p-4.5 space-y-3 cursor-pointer shadow-[0_1px_3px_rgba(0,0,0,0.03)] transition-all hover:border-slate-300 ${
                  isNew ? 'border-blue-300 ring-2 ring-blue-100/50' : 'border-slate-200/90'
                }`}
              >
                {/* Header info */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                        isBackroom
                          ? 'bg-blue-50 text-blue-800 border border-blue-200/80'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {req.typeLabel}
                    </span>
                    <span className="text-[10px] font-medium text-slate-400 font-mono">#{req.id}</span>
                  </div>
                  <span className="text-[11px] font-medium text-slate-400 font-mono">{req.receivedAt}</span>
                </div>

                {/* Body Content */}
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-700 font-semibold mb-1">
                    <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>{req.zoneName}</span>
                    {req.shelfCode && (
                      <span className="bg-slate-100 text-slate-900 px-1.5 py-0.2 rounded font-mono text-[10px]">
                        Shelf {req.shelfCode}
                      </span>
                    )}
                  </div>

                  {req.productName && (
                    <h4 className="text-sm font-bold text-slate-900 leading-snug">
                      Looking for: {req.productName}
                    </h4>
                  )}

                  <p className="text-xs text-slate-600 mt-1 italic line-clamp-2">"{req.message}"</p>
                </div>

                {/* Backroom Callout if applicable */}
                {isBackroom && (
                  <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-slate-900 font-bold">
                      <Inbox className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>Backroom: {req.backroomBay || 'Bay D2'}</span>
                    </div>
                    <span className="text-[10px] text-emerald-700 font-semibold font-mono">18 units in stock</span>
                  </div>
                )}

                {/* Action Row */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>{req.messages.length} messages</span>
                  </div>

                  {isNew ? (
                    <button
                      type="button"
                      onClick={(e) => handleQuickAccept(e, req.id)}
                      className="py-2 px-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs shadow-blue-500/20 flex items-center gap-1.5 transition-all"
                    >
                      <Check className="w-3.5 h-3.5 text-white" />
                      <span>Accept Request</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onOpenAssistDetails(req)}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <span>View Session</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
