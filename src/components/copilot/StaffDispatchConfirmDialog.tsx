import React from 'react'
import {
  ShieldAlert,
  UserCheck,
  CheckCircle2,
  X,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface StaffDispatchConfirmDialogProps {
  isOpen: boolean
  staffId: string
  taskTitle: string
  onConfirm: () => void
  onCancel: () => void
}

export const StaffDispatchConfirmDialog: React.FC<StaffDispatchConfirmDialogProps> = ({
  isOpen,
  staffId,
  taskTitle,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none font-mono">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity animate-in fade-in-0"
        onClick={onCancel}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md rounded-lg border border-[#1E293B] bg-[#0B0F17] p-5 shadow-2xl z-10 space-y-3.5 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-[#1E293B]">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-amber-950 border border-amber-500/40 text-amber-400">
              <UserCheck className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Confirm Staff Allocation Dispatch
              </h3>
              <span className="text-[10px] text-slate-400">Manager Authorization Required</span>
            </div>
          </div>

          <Button variant="ghost" size="icon-xs" onClick={onCancel} className="text-slate-400 hover:text-white">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Dispatch Summary */}
        <div className="p-3 rounded bg-[#090D14] border border-[#1E293B] space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Target Employee:</span>
            <strong className="text-cyan-300 bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-500/40 font-mono">
              Associate {staffId}
            </strong>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">Assigned Mission:</span>
            <strong className="text-white font-sans text-xs">{taskTitle}</strong>
          </div>

          <div className="pt-2 border-t border-[#1E293B] text-[10px] text-amber-300 font-sans leading-tight">
            Dispatch notification will be pushed immediately to the associate&apos;s mobile handheld device with walking route and priority level.
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1E293B]">
          <Button variant="ghost" size="sm" onClick={onCancel} className="text-xs text-slate-400 hover:text-white">
            Cancel
          </Button>
          <Button variant="action" size="sm" onClick={onConfirm} className="gap-1.5 text-xs font-mono">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Confirm & Dispatch</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
