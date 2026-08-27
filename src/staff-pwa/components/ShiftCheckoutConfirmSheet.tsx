import React from 'react'
import { createPortal } from 'react-dom'
import { X, LogOut, CalendarClock, ClipboardList } from 'lucide-react'

interface ShiftCheckoutConfirmSheetProps {
  isOpen: boolean
  staffName: string
  unfinishedTaskCount: number
  onClose: () => void
  onConfirm: () => void
}

export const ShiftCheckoutConfirmSheet: React.FC<ShiftCheckoutConfirmSheetProps> = ({
  isOpen,
  staffName,
  unfinishedTaskCount,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || typeof document === 'undefined') return null

  return createPortal(
    <>
      <button
        type="button"
        aria-label="Close checkout dialog"
        className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 cursor-default"
        onClick={onClose}
      />

      <div
        className="fixed inset-x-0 bottom-0 z-[201] mx-auto w-full max-w-md bg-white rounded-t-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in slide-in-from-bottom-4 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-sheet-title"
      >
        <div className="px-5 py-4 border-b border-rose-100 flex items-center justify-between bg-rose-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
              <LogOut className="w-4 h-4" />
            </div>
            <div>
              <h3 id="checkout-sheet-title" className="text-sm font-bold text-slate-900 leading-tight">
                Check out of shift?
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">End shift for {staffName}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-3">
          {unfinishedTaskCount > 0 && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200/80">
              <ClipboardList className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-amber-900">
                  {unfinishedTaskCount} open task{unfinishedTaskCount === 1 ? '' : 's'} will carry over
                </p>
                <p className="text-[11px] text-amber-800/80 mt-0.5">
                  Add handover notes before leaving if anything needs follow-up.
                </p>
              </div>
            </div>
          )}

          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <CalendarClock className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Your attendance will be logged and you&apos;ll return to the sign-in screen.
            </p>
          </div>
        </div>

        <div className="px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-0 flex gap-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 min-h-11 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Stay on shift
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 min-h-11 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            Check out
          </button>
        </div>
      </div>
    </>,
    document.body
  )
}
