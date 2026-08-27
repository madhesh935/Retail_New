import React, { useState } from 'react'
import {
  Sparkles,
  UserCheck,
  CheckCircle2,
  Route,
  ArrowRight,
  Clock,
  HelpCircle,
  AlertTriangle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  CANONICAL_RECOMMENDATIONS,
  StaffRecommendation,
} from './staffData'

interface AiRecommendedAllocationsProps {
  onAssignRequest: (recommendation: StaffRecommendation) => void
  onViewRoute: (recommendation: StaffRecommendation) => void
  onOpenWhy?: (recommendation: StaffRecommendation) => void
  assignedIds?: Record<string, boolean>
}

export const AiRecommendedAllocations: React.FC<AiRecommendedAllocationsProps> = ({
  onAssignRequest,
  onViewRoute,
  onOpenWhy,
  assignedIds = {},
}) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 flex flex-col justify-between shadow-2xs select-none h-full min-h-[340px] font-sans">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-amber-50 text-amber-600 border border-amber-200">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 tracking-wide flex items-center gap-2">
              <span>Recommended Assignments</span>
              <span className="text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 font-semibold">
                AI Assisted
              </span>
            </h3>
          </div>
        </div>

        <span className="text-[11px] text-slate-500">
          2 Urgent Matches
        </span>
      </div>

      {/* Top 2 Recommended Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1">
        {CANONICAL_RECOMMENDATIONS.map((item) => {
          const isAssigned = assignedIds[item.id]

          return (
            <div
              key={item.id}
              className={cn(
                'p-3.5 rounded-xl border space-y-3 transition-all flex flex-col justify-between shadow-2xs',
                isAssigned
                  ? 'bg-emerald-50/30 border-emerald-300'
                  : 'bg-rose-50/20 border-rose-200'
              )}
            >
              {/* Header: Priority & Destination */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold uppercase">
                    CRITICAL TASK
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {item.distanceMeters}m · ~{item.estimatedWalkingSeconds}s walk
                  </span>
                </div>

                <div className="font-bold text-slate-900 text-xs pt-1">
                  {item.taskTitle}
                </div>
                <div className="text-[11px] text-sky-700 font-semibold">
                  Destination: {item.destinationZone}
                </div>
              </div>

              {/* Matched Staff Card */}
              <div className="p-2.5 rounded-lg bg-white border border-slate-200 flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-2">
                  <span className="h-7 w-7 rounded-md bg-sky-50 border border-sky-200 flex items-center justify-center font-bold text-xs text-sky-700 font-mono">
                    {item.recommendedStaffId}
                  </span>
                  <div>
                    <div className="font-bold text-slate-900 text-xs">
                      {item.recommendedStaffName}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Currently in {item.currentStaffZone}
                    </div>
                  </div>
                </div>

                <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                  Available Now
                </span>
              </div>

              {/* Clean Reason Chips */}
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 font-medium block">
                  Why this match?
                </span>
                <div className="flex flex-wrap gap-1.5 text-[10px]">
                  {item.reasons.map((reason, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200"
                    >
                      ✓ {reason}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="text-[10px] text-slate-500 truncate">
                  {item.operationalImpact}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => onViewRoute(item)}
                    className="h-7 px-2.5 text-[11px] gap-1 text-slate-700 border-slate-200 bg-white hover:bg-slate-50 shadow-2xs"
                  >
                    <Route className="h-3 w-3 text-sky-600" />
                    <span>View Route</span>
                  </Button>

                  {isAssigned ? (
                    <span className="inline-flex items-center gap-1 text-emerald-700 text-[11px] font-bold px-2 py-1 bg-emerald-50 rounded-md border border-emerald-200">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Assigned</span>
                    </span>
                  ) : (
                    <Button
                      variant="action"
                      size="xs"
                      onClick={() => onAssignRequest(item)}
                      className="h-7 px-3 text-[11px] gap-1 bg-sky-600 hover:bg-sky-700 text-white font-semibold"
                    >
                      <UserCheck className="h-3.5 w-3.5" />
                      <span>Assign</span>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
