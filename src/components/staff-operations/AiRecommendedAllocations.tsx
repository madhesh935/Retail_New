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
    <div className="rounded-lg border border-[#1E293B] bg-[#0F172A] p-4 flex flex-col justify-between shadow-sm select-none h-full min-h-[340px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#1E293B] mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-[#1E293B] text-amber-400">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-white tracking-wide flex items-center gap-2">
              <span>Recommended Assignments</span>
              <span className="text-[10px] text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/30 font-medium">
                AI Assisted
              </span>
            </h3>
          </div>
        </div>

        <span className="text-[11px] text-slate-400">
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
                'p-3.5 rounded-lg border space-y-3 transition-all flex flex-col justify-between',
                isAssigned
                  ? 'bg-[#0F172A] border-emerald-500/50'
                  : 'bg-[#0F172A] border-rose-500/40'
              )}
            >
              {/* Header: Priority & Destination */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-500/40 text-[10px] font-semibold uppercase">
                    CRITICAL TASK
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {item.distanceMeters}m · ~{item.estimatedWalkingSeconds}s walk
                  </span>
                </div>

                <div className="font-semibold text-white text-xs pt-1">
                  {item.taskTitle}
                </div>
                <div className="text-[11px] text-cyan-400 font-medium">
                  Destination: {item.destinationZone}
                </div>
              </div>

              {/* Matched Staff Card */}
              <div className="p-2.5 rounded-lg bg-[#090D14] border border-[#1E293B] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-7 w-7 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center font-bold text-xs text-cyan-300 font-mono">
                    {item.recommendedStaffId}
                  </span>
                  <div>
                    <div className="font-semibold text-white text-xs">
                      {item.recommendedStaffName}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Currently in {item.currentStaffZone}
                    </div>
                  </div>
                </div>

                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 font-medium">
                  Available Now
                </span>
              </div>

              {/* Clean Reason Chips */}
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-medium block">
                  Why this match?
                </span>
                <div className="flex flex-wrap gap-1.5 text-[10px]">
                  {item.reasons.map((reason, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-[#090D14] text-slate-300 border border-[#1E293B]"
                    >
                      ✓ {reason}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-[#1E293B] flex items-center justify-between gap-2">
                <div className="text-[10px] text-slate-400 truncate">
                  {item.operationalImpact}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => onViewRoute(item)}
                    className="h-7 px-2.5 text-[11px] gap-1 text-slate-300 border-[#1E293B] hover:bg-[#1E293B]"
                  >
                    <Route className="h-3 w-3 text-cyan-400" />
                    <span>View Route</span>
                  </Button>

                  {isAssigned ? (
                    <span className="inline-flex items-center gap-1 text-emerald-400 text-[11px] font-medium px-2 py-1">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Assigned</span>
                    </span>
                  ) : (
                    <Button
                      variant="action"
                      size="xs"
                      onClick={() => onAssignRequest(item)}
                      className="h-7 px-3 text-[11px] gap-1"
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
