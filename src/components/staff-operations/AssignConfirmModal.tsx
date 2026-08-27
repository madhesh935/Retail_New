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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none font-sans">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in-0"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-2xl z-10 space-y-4 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-sky-50 text-sky-600 border border-sky-200">
              <UserCheck className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900">
                Confirm Task Assignment
              </h3>
              <span className="text-[11px] text-slate-500">
                Dispatching {recommendation.recommendedStaffName} ({recommendation.recommendedStaffId})
              </span>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon-xs"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-900"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Task & Staff Summary */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs shadow-2xs">
          <div>
            <span className="text-[10px] text-slate-500 block font-bold uppercase">
              Target Task
            </span>
            <div className="font-bold text-slate-900 text-xs mt-0.5">
              {recommendation.taskTitle}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/60">
            <div>
              <span className="text-[10px] text-slate-500 block">Current Location</span>
              <span className="font-medium text-slate-700 text-xs">
                {recommendation.currentStaffZone}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 block">Destination</span>
              <span className="font-bold text-sky-700 text-xs">
                {recommendation.destinationZone}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60 font-mono">
            <span>Estimated Walk Time:</span>
            <strong className="text-slate-900">~{recommendation.estimatedWalkingSeconds} sec ({recommendation.distanceMeters}m)</strong>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-xs text-slate-700 border-slate-200 bg-white hover:bg-slate-50 shadow-2xs"
          >
            Cancel
          </Button>

          <Button
            variant="action"
            size="sm"
            onClick={() => onConfirm(recommendation)}
            className="text-xs px-4 bg-sky-600 hover:bg-sky-700 text-white font-semibold"
          >
            Confirm Assignment
          </Button>
        </div>
      </div>
    </div>
  )
}
