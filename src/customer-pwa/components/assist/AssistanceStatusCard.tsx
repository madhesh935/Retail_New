import React from 'react'
import { HandHelping, ArrowRight, CheckCircle2, Clock } from 'lucide-react'
import { useCustomerAssist } from '../../context/CustomerAssistContext'

export const AssistanceStatusCard: React.FC = () => {
  const { activeRequest, viewActiveRequest } = useCustomerAssist()

  if (!activeRequest || activeRequest.status === 'COMPLETED' || activeRequest.status === 'CANCELLED') {
    return null
  }

  const isArrived = activeRequest.status === 'ARRIVED'
  const isEnRoute = activeRequest.status === 'ON_THE_WAY'
  const associateFirstName = activeRequest.assignedAssociate?.name.split(' ')[0] || 'Associate'

  return (
    <div
      onClick={viewActiveRequest}
      className={`rounded-2xl p-4 transition-all cursor-pointer border shadow-sm active:scale-[0.99] ${
        isArrived
          ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-300 text-emerald-950'
          : 'bg-gradient-to-r from-cyan-50 to-blue-50 border-cyan-300 text-cyan-950'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`h-10 w-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs ${
              isArrived ? 'bg-emerald-600' : 'bg-cyan-600 animate-pulse'
            }`}
          >
            {isArrived ? <CheckCircle2 className="h-5 w-5" /> : <HandHelping className="h-5 w-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-800">
                Staff Assistance
              </span>
              <span
                className={`px-1.5 py-0.2 text-[9px] font-bold rounded-full border ${
                  isArrived
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : 'bg-cyan-100 text-cyan-800 border-cyan-300'
                }`}
              >
                {isArrived ? 'ARRIVED' : isEnRoute ? 'ON THE WAY' : 'ASSIGNING'}
              </span>
            </div>
            <h4 className="text-xs font-bold text-slate-900 mt-0.5">
              {isArrived
                ? `${associateFirstName} has arrived`
                : activeRequest.assignedAssociate
                ? `${associateFirstName} is on the way`
                : 'Finding store associate...'}
            </h4>
            <p className="text-[11px] text-slate-600 font-medium mt-0.5 flex items-center gap-1.5">
              <span>{activeRequest.zoneName}</span>
              {activeRequest.assignedAssociate?.estimatedArrival && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-0.5 text-cyan-800 font-semibold">
                    <Clock className="h-3 w-3" />
                    {activeRequest.assignedAssociate.estimatedArrival}
                  </span>
                </>
              )}
            </p>
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation()
            viewActiveRequest()
          }}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs font-bold shadow-2xs hover:bg-slate-50 shrink-0 cursor-pointer"
        >
          <span>View</span>
          <ArrowRight className="h-3 w-3" />
        </button>
      </div>
    </div>
  )
}
