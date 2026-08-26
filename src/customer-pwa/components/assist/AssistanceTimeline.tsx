import React from 'react'
import { Check, Circle } from 'lucide-react'
import { CustomerAssistStatus } from '../../types/customerAssist.types'

interface AssistanceTimelineProps {
  status: CustomerAssistStatus
  isBackroom?: boolean
}

export const AssistanceTimeline: React.FC<AssistanceTimelineProps> = ({ status, isBackroom = false }) => {
  const steps = isBackroom
    ? [
        { key: 'REQUESTED', label: 'Requested' },
        { key: 'ASSIGNED', label: 'Assigned' },
        { key: 'ON_THE_WAY', label: 'Fetching' },
        { key: 'ARRIVED', label: 'Delivered' },
        { key: 'COMPLETED', label: 'Completed' },
      ]
    : [
        { key: 'REQUESTED', label: 'Requested' },
        { key: 'ASSIGNED', label: 'Assigned' },
        { key: 'ON_THE_WAY', label: 'On Way' },
        { key: 'ARRIVED', label: 'Arrived' },
        { key: 'COMPLETED', label: 'Completed' },
      ]

  const getStepIndex = (st: CustomerAssistStatus): number => {
    switch (st) {
      case 'REQUESTED':
        return 0
      case 'ASSIGNED':
      case 'ACCEPTED':
        return 1
      case 'ON_THE_WAY':
        return 2
      case 'ARRIVED':
        return 3
      case 'COMPLETED':
        return 4
      default:
        return -1
    }
  }

  const currentIndex = getStepIndex(status)

  return (
    <div className="w-full py-2">
      <div className="relative flex items-center justify-between">
        {/* Background Line */}
        <div className="absolute left-3 right-3 top-3 h-0.5 bg-slate-200 -z-0" />
        {/* Progress Line */}
        <div
          className="absolute left-3 top-3 h-0.5 bg-cyan-600 transition-all duration-500 -z-0"
          style={{
            width: `${Math.max(0, Math.min(100, (currentIndex / (steps.length - 1)) * 100))}%`,
          }}
        />

        {steps.map((step, idx) => {
          const isDone = idx < currentIndex
          const isCurrent = idx === currentIndex
          const isPending = idx > currentIndex

          return (
            <div key={step.key} className="flex flex-col items-center z-10">
              <div
                className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-xs ${
                  isDone
                    ? 'bg-emerald-600 text-white'
                    : isCurrent
                    ? 'bg-cyan-600 text-white ring-4 ring-cyan-100 animate-pulse'
                    : 'bg-white border-2 border-slate-300 text-slate-400'
                }`}
              >
                {isDone ? (
                  <Check className="h-3.5 w-3.5" />
                ) : isCurrent ? (
                  <Circle className="h-2.5 w-2.5 fill-current" />
                ) : (
                  <span className="text-[10px]">{idx + 1}</span>
                )}
              </div>
              <span
                className={`text-[10px] font-semibold mt-1.5 whitespace-nowrap ${
                  isCurrent
                    ? 'text-cyan-800 font-bold'
                    : isDone
                    ? 'text-slate-800'
                    : 'text-slate-400'
                }`}
              >
                {step.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
