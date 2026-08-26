import React from 'react'
import {
  X,
  UserCheck,
  MapPin,
  Clock,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StaffRecommendation } from './staffData'

interface AssignConfirmModalProps {
  recommendation: StaffRecommendation | null
  onClose: () => void
  onConfirm: (recommendation: StaffRecommendation) => void
}

export const AssignConfirmModal: React.FC<AssignConfirmModalProps> = ({
  recommendation,
  onClose,
  onConfirm,
}) => {
  if (!recommendation) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity animate-in fade-in-0"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md rounded-lg border border-[#1E293B] bg-[#0B0F17] p-5 shadow-2xl z-10 space-y-4 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-[#1E293B] text-cyan-400">
              <UserCheck className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-white">
                Confirm Task Assignment
              </h3>
              <span className="text-[11px] text-slate-400">
                Dispatching {recommendation.recommendedStaffName} ({recommendation.recommendedStaffId})
              </span>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon-xs"
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Task & Staff Summary */}
        <div className="p-3.5 rounded-lg bg-[#0F172A] border border-[#1E293B] space-y-2.5 text-xs">
          <div>
            <span className="text-[10px] text-slate-500 block font-medium uppercase">
              Target Task
            </span>
            <div className="font-semibold text-white text-xs mt-0.5">
              {recommendation.taskTitle}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#1E293B]">
            <div>
              <span className="text-[10px] text-slate-500 block">Current Location</span>
              <span className="font-medium text-slate-200 text-xs">
                {recommendation.currentStaffZone}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 block">Destination</span>
              <span className="font-medium text-cyan-300 text-xs">
                {recommendation.destinationZone}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-[#1E293B]">
            <span>Estimated Walk Time:</span>
            <strong className="text-white">~{recommendation.estimatedWalkingSeconds} sec ({recommendation.distanceMeters}m)</strong>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-xs text-slate-300 border-[#1E293B] hover:bg-[#1E293B]"
          >
            Cancel
          </Button>

          <Button
            variant="action"
            size="sm"
            onClick={() => onConfirm(recommendation)}
            className="text-xs px-4"
          >
            Confirm Assignment
          </Button>
        </div>
      </div>
    </div>
  )
}
