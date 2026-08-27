import React, { useState } from 'react'
import {
  X,
  MapPin,
  MessageSquare,
  CheckCircle2,
  Package,
  Send,
  Navigation,
  Inbox,
  AlertCircle,
  Check,
} from 'lucide-react'
import { CustomerHelpRequest } from '@/store/slices/customerRequestSlice'
import { useAppStore } from '@/store/useAppStore'

interface AssistDetailSheetProps {
  request: CustomerHelpRequest | null
  isOpen: boolean
  onClose: () => void
  onOpenMap: (zoneName: string, shelfCode?: string) => void
}

export const AssistDetailSheet: React.FC<AssistDetailSheetProps> = ({
  request,
  isOpen,
  onClose,
  onOpenMap,
}) => {
  const {
    acceptCustomerRequest,
    startAssistingCustomer,
    markBackroomStockFound,
    sendStaffCustomerMessage,
    completeCustomerRequest,
    authenticatedStaff,
  } = useAppStore()

  const [messageInput, setMessageInput] = useState('')

  if (!isOpen || !request) return null

  const isRequested = request.status === 'REQUESTED'
  const isAccepted = request.status === 'ACCEPTED' || request.status === 'ASSIGNED'
  const isAssisting = request.status === 'ASSISTING'
  const isCompleted = request.status === 'COMPLETED'
  const staffName = authenticatedStaff?.name || 'Liam'
  const staffId = authenticatedStaff?.id || 'STAFF-03'

  const handleAccept = () => {
    acceptCustomerRequest(request.id, staffId, staffName)
  }

  const handleStartAssisting = () => {
    startAssistingCustomer(request.id)
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageInput.trim()) return
    sendStaffCustomerMessage(request.id, messageInput.trim())
    setMessageInput('')
  }

  const handleItemFound = (found: boolean) => {
    markBackroomStockFound(request.id, found)
  }

  const handleComplete = () => {
    completeCustomerRequest(request.id, 'Assistance resolved at shelf')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider bg-blue-50 text-blue-800 border border-blue-200/80">
              {request.typeLabel}
            </span>
            <span className="text-xs font-bold text-slate-500 font-mono">#{request.id}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {/* Customer Location & Target */}
          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-700 font-semibold mb-1">
              <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Customer Location: {request.zoneName}</span>
              {request.shelfCode && <span className="bg-slate-100 px-1.5 rounded text-slate-900 font-mono">Shelf {request.shelfCode}</span>}
            </div>
            {request.productName && (
              <h3 className="text-base font-bold text-slate-900 mt-1">
                Looking for: <span className="text-slate-950">{request.productName}</span>
              </h3>
            )}
            <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 mt-2 italic">
              "{request.message}"
            </p>
          </div>

          {/* Backroom Flow Standout Card */}
          {request.isBackroomFlow && (
            <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-950">
                  <Inbox className="w-4 h-4 text-blue-600" />
                  <span>BACKROOM STOCK LOCATOR</span>
                </div>
                <span className="text-[10px] bg-blue-200/70 text-blue-900 font-extrabold px-2 py-0.5 rounded">
                  Stock Storage
                </span>
              </div>

              <div className="text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Storage Location:</span>
                  <span className="font-bold text-slate-900 font-mono">{request.backroomBay || 'Bay D2 (Cold Room Rack 2)'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Shelf Availability:</span>
                  <span className="font-bold text-rose-600">0% (Empty)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Backroom Status:</span>
                  <span className="font-bold text-emerald-700">18 units available</span>
                </div>
              </div>

              {/* Backroom Actions */}
              <div className="pt-2 border-t border-blue-200/60 flex gap-2">
                <button
                  type="button"
                  onClick={() => handleItemFound(true)}
                  className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                    request.backroomItemFound === true
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-white border border-blue-300 text-blue-900 hover:bg-blue-100/50'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{request.backroomItemFound ? '✓ Item Located' : 'Item Found in Bay'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleItemFound(false)}
                  className={`py-2 px-3 rounded-xl font-bold text-xs transition-all ${
                    request.backroomItemFound === false
                      ? 'bg-rose-600 text-white'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Unavailable
                </button>
              </div>
            </div>
          )}

          {/* Direct Live Messages with Shopper */}
          <div className="space-y-2 pt-1">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
              <span>Direct Shopper Messages</span>
            </h4>

            <div className="space-y-2 max-h-40 overflow-y-auto p-2 bg-slate-50 rounded-2xl border border-slate-100">
              {request.messages.length === 0 ? (
                <div className="text-center py-4 text-xs text-slate-400 font-medium">
                  No chat messages yet. Send a quick update to the customer.
                </div>
              ) : (
                request.messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex flex-col text-xs max-w-[85%] ${
                      m.sender === 'ASSOCIATE' ? 'ml-auto items-end' : 'mr-auto items-start'
                    }`}
                  >
                    <div
                      className={`px-3 py-2 rounded-2xl leading-relaxed ${
                        m.sender === 'ASSOCIATE'
                          ? 'bg-blue-600 text-white rounded-br-xs font-medium'
                          : 'bg-white border border-slate-200 text-slate-900 rounded-bl-xs'
                      }`}
                    >
                      {m.text}
                    </div>
                    <span className="text-[9px] text-slate-400 mt-0.5 px-1">{m.timestamp}</span>
                  </div>
                ))
              )}
            </div>

            {/* Quick send form */}
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Message customer (e.g. On my way with the item!)..."
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={!messageInput.trim()}
                className="p-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl shadow-xs transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-white space-y-2">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onOpenMap(request.zoneName, request.shelfCode)}
              className="flex-1 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
            >
              <Navigation className="w-3.5 h-3.5 text-blue-600" />
              <span>Navigate to Shopper</span>
            </button>
          </div>

          {isRequested && (
            <button
              type="button"
              onClick={handleAccept}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4 text-white" />
              <span>Accept Customer Request</span>
            </button>
          )}

          {isAccepted && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleStartAssisting}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
              >
                I Have Arrived
              </button>
              <button
                type="button"
                onClick={handleComplete}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
              >
                Complete Assist
              </button>
            </div>
          )}

          {isAssisting && (
            <button
              type="button"
              onClick={handleComplete}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Mark Assistance Complete</span>
            </button>
          )}

          {isCompleted && (
            <div className="p-2.5 bg-emerald-50 rounded-xl text-center text-xs font-bold text-emerald-800 border border-emerald-200">
              ✓ Customer Assistance Resolved & Closed
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
