import React, { useState } from 'react'
import {
  ArrowLeft,
  HandHelping,
  Clock,
  MapPin,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react'
import { useCustomerAssist } from '../context/CustomerAssistContext'
import { useCustomerShopping } from '../context/CustomerShoppingContext'
import { AssistanceTimeline } from '../components/assist/AssistanceTimeline'
import { AssistanceMessagePanel } from '../components/assist/AssistanceMessagePanel'

export const CustomerAssistStatusPage: React.FC = () => {
  const {
    activeRequest,
    cancelRequest,
    sendAssistMessage,
    confirmMetStaff,
    reportStaffNotFound,
    completeRequest,
    clearCompletedRequest,
    openHelpSheet,
  } = useCustomerAssist()
  const { setActiveTab } = useCustomerShopping()

  const [showCancelModal, setShowCancelModal] = useState(false)

  if (!activeRequest) {
    return (
      <div className="space-y-4 pb-20">
        <div className="p-8 rounded-3xl bg-white border border-slate-200 text-center space-y-3 shadow-sm">
          <div className="h-12 w-12 rounded-2xl bg-cyan-100 text-cyan-800 flex items-center justify-center mx-auto">
            <HandHelping className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No Active Help Request</h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Need help finding an item, checking backroom stock, or store advice?
          </p>
          <button
            onClick={() => openHelpSheet()}
            className="px-5 py-2.5 rounded-2xl bg-cyan-700 text-white font-bold text-xs shadow-sm hover:bg-cyan-800 active:scale-95 transition-all cursor-pointer"
          >
            Ask Store Staff
          </button>
        </div>
      </div>
    )
  }

  const isCompleted = activeRequest.status === 'COMPLETED'
  const isCancelled = activeRequest.status === 'CANCELLED'
  const isArrived = activeRequest.status === 'ARRIVED'
  const isEnRoute = activeRequest.status === 'ON_THE_WAY'
  const isBackroom = activeRequest.isBackroomFlow

  const associate = activeRequest.assignedAssociate
  const associateFirstName = associate?.name.split(' ')[0] || 'Associate'

  return (
    <div className="space-y-4 pb-24 font-sans text-slate-800">
      {/* Top Bar with Back Button */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('HOME')}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer p-1 -ml-1 rounded-lg hover:bg-slate-100"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Store</span>
        </button>

        <span
          className={`px-2.5 py-1 text-[10px] font-extrabold rounded-full border tracking-wide ${
            isCompleted
              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
              : isCancelled
              ? 'bg-slate-200 text-slate-700 border-slate-300'
              : isArrived
              ? 'bg-emerald-100 text-emerald-800 border-emerald-300 animate-pulse'
              : isEnRoute
              ? 'bg-cyan-100 text-cyan-800 border-cyan-300'
              : 'bg-amber-100 text-amber-800 border-amber-300'
          }`}
        >
          {isCompleted
            ? 'RESOLVED'
            : isCancelled
            ? 'CANCELLED'
            : isArrived
            ? 'ASSOCIATE ARRIVED'
            : isEnRoute
            ? 'ON THE WAY'
            : 'FINDING ASSOCIATE'}
        </span>
      </div>

      {/* Main Status Hero Card */}
      <div
        className={`rounded-3xl p-5 border shadow-sm space-y-3 ${
          isCompleted
            ? 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200'
            : isCancelled
            ? 'bg-slate-100 border-slate-200'
            : isArrived
            ? 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-300'
            : 'bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-200'
        }`}
      >
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-800">
              {activeRequest.typeLabel}
            </span>
            <h2 className="text-lg font-bold text-slate-900 mt-0.5">
              {isCompleted
                ? 'Help Request Completed'
                : isCancelled
                ? 'Request Cancelled'
                : isArrived
                ? `${associateFirstName} is here`
                : isEnRoute
                ? `${associateFirstName} on the way`
                : 'Finding available staff...'}
            </h2>
            <p className="text-xs text-slate-600 font-medium mt-1">
              {isCompleted
                ? `Assistance concluded in ${activeRequest.resolvedInMinutes ?? '—'} min`
                : isCancelled
                ? 'You cancelled this assistance request.'
                : isArrived
                ? `Look for ${associateFirstName} at ${activeRequest.zoneName}`
                : isEnRoute
                ? isBackroom
                  ? 'Fetching item from backroom stock'
                  : `Walking to ${activeRequest.zoneName}`
                : 'Connecting with the nearest on-shift associate'}
            </p>
          </div>

          <div
            className={`h-12 w-12 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-xs ${
              isCompleted || isArrived ? 'bg-emerald-600' : isCancelled ? 'bg-slate-500' : 'bg-cyan-600 animate-pulse'
            }`}
          >
            {isCompleted || isArrived ? (
              <CheckCircle2 className="h-6 w-6" />
            ) : (
              <HandHelping className="h-6 w-6" />
            )}
          </div>
        </div>

        {/* Live Stepper Timeline */}
        {!isCancelled && (
          <div className="pt-2 border-t border-slate-200/60">
            <AssistanceTimeline status={activeRequest.status} isBackroom={isBackroom} />
          </div>
        )}
      </div>

      {/* Store Associate Details (Privacy Safe - First Name & Role Only) */}
      {associate && !isCancelled && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2.5 shadow-2xs">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
            Store Associate
          </span>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="h-11 w-11 rounded-2xl text-white flex items-center justify-center font-bold text-sm shadow-2xs"
                style={{ backgroundColor: associate.avatarColor || '#06B6D4' }}
              >
                {associateFirstName[0]}
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">{associate.name}</h4>
                <p className="text-[11px] text-slate-500 font-medium">{associate.role}</p>
              </div>
            </div>

            {associate.estimatedArrival && !isArrived && !isCompleted && (
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-medium">Status</span>
                <span className="text-xs font-bold text-cyan-800 flex items-center gap-1 justify-end">
                  <Clock className="h-3 w-3" />
                  {associate.estimatedArrival}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Request Details & Location Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3 shadow-2xs">
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
          Request Summary
        </span>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] text-slate-400 block font-medium">Meeting Location</span>
            <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
              <MapPin className="h-3.5 w-3.5 text-cyan-700" />
              {activeRequest.zoneName}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] text-slate-400 block font-medium">Shelf / Section</span>
            <span className="font-bold text-slate-800 mt-0.5 block">
              {activeRequest.shelfCode ? `Shelf ${activeRequest.shelfCode}` : 'Store Floor'}
            </span>
          </div>
        </div>

        {activeRequest.product && (
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">Product</span>
              <span className="font-bold text-slate-900">{activeRequest.product.name}</span>
            </div>
            <span className="font-bold text-cyan-800">{activeRequest.product.price}</span>
          </div>
        )}

        {activeRequest.accessibilityNeed && (
          <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-200 text-xs">
            <span className="text-[10px] text-indigo-700 block font-bold">Assistance Need:</span>
            <span className="text-indigo-950 font-medium mt-0.5 block">
              {activeRequest.accessibilityNeed}
            </span>
          </div>
        )}

        {activeRequest.message && (
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
            <span className="text-[10px] text-slate-400 block font-medium">Your Note:</span>
            <p className="text-slate-700 italic mt-0.5">"{activeRequest.message}"</p>
          </div>
        )}
      </div>

      {/* Lightweight Chat / Messaging Area */}
      {!isCompleted && !isCancelled && (
        <AssistanceMessagePanel
          messages={activeRequest.messages}
          onSendMessage={sendAssistMessage}
        />
      )}

      {/* Primary Context Actions */}
      {!isCompleted && !isCancelled && (
        <div className="space-y-2 pt-2">
          {isArrived ? (
            <div className="space-y-2">
              <button
                onClick={confirmMetStaff}
                className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>I've Met The Associate</span>
              </button>

              <button
                onClick={reportStaffNotFound}
                className="w-full py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer"
              >
                Can't Find Staff
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowCancelModal(true)}
              className="w-full py-2.5 rounded-2xl bg-slate-100 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 text-slate-600 font-bold text-xs transition-all border border-slate-200 cursor-pointer"
            >
              Cancel Request
            </button>
          )}
        </div>
      )}

      {/* Resolution Prompt for Completed State */}
      {isCompleted && (
        <div className="p-4 rounded-3xl bg-white border border-slate-200 space-y-3 shadow-2xs">
          <div className="text-center space-y-1">
            <h4 className="text-xs font-bold text-slate-900">Was your request resolved?</h4>
            <p className="text-[11px] text-slate-500">
              Let us know if you got the help you needed.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={clearCompletedRequest}
              className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all cursor-pointer shadow-2xs"
            >
              Yes, All Good
            </button>
            <button
              onClick={() => completeRequest(false)}
              className="py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer"
            >
              Still Need Help
            </button>
          </div>
        </div>
      )}

      {/* Cancelled State Reopen / Dismiss */}
      {isCancelled && (
        <div className="space-y-2">
          <button
            onClick={clearCompletedRequest}
            className="w-full py-3 rounded-2xl bg-cyan-700 text-white font-bold text-xs shadow-sm hover:bg-cyan-800 cursor-pointer"
          >
            Return to Store Home
          </button>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-5 max-w-xs w-full space-y-4 shadow-2xl border border-slate-200 text-center">
            <div className="h-10 w-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Cancel staff assistance?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Your assigned store associate will be notified to return to their regular tasks.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setShowCancelModal(false)}
                className="py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 cursor-pointer"
              >
                Keep Request
              </button>
              <button
                onClick={() => {
                  setShowCancelModal(false)
                  cancelRequest()
                }}
                className="py-2.5 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 cursor-pointer"
              >
                Cancel Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
