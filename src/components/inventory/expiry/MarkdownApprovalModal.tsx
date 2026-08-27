import React, { useState } from 'react'
import { X, Tag, CheckCircle2, AlertTriangle, ArrowRight, XCircle } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { MarkdownCandidate } from '@/types/expiry.types'
import { cn } from '@/lib/utils'

interface MarkdownApprovalModalProps {
  candidate: MarkdownCandidate | null
  isOpen: boolean
  onClose: () => void
}

export const MarkdownApprovalModal: React.FC<MarkdownApprovalModalProps> = ({
  candidate,
  isOpen,
  onClose,
}) => {
  const { approveMarkdownCandidate, rejectMarkdownCandidate, authenticatedStaff } = useAppStore()
  const [toast, setToast] = useState<string | null>(null)

  if (!isOpen || !candidate) return null

  const handleApprove = () => {
    approveMarkdownCandidate(candidate.id, authenticatedStaff?.name || 'Store Operations Lead')
    setToast('✓ Markdown approved & dispatched to Staff PWA for shelf label replacement!')
    setTimeout(() => {
      setToast(null)
      onClose()
    }, 1500)
  }

  const handleReject = () => {
    rejectMarkdownCandidate(candidate.id)
    setToast('Markdown proposal rejected.')
    setTimeout(() => {
      setToast(null)
      onClose()
    }, 1000)
  }

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-amber-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 leading-tight">Markdown Approval</h3>
              <p className="text-[11px] text-amber-800 font-medium">Dynamic Waste Avoidance Proposal</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4 text-xs">
          {toast && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{toast}</span>
            </div>
          )}

          {/* Product Banner */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-500">{candidate.category}</span>
              <span className="text-[10px] font-mono font-bold bg-slate-200 px-1.5 py-0.5 rounded text-slate-700">
                Shelf {candidate.shelfCode}
              </span>
            </div>
            <h4 className="text-sm font-bold text-slate-900">{candidate.productName}</h4>
            <div className="text-[11px] text-slate-500 flex items-center gap-2">
              <span>Remaining: <strong className="text-slate-900">{candidate.remainingQuantity} units</strong></span>
              <span>·</span>
              <span>At Risk: <strong className="text-amber-700">{candidate.atRiskQuantity} units</strong></span>
            </div>
          </div>

          {/* Pricing Comparison */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Current POS</span>
              <span className="text-base font-black text-slate-500 line-through font-mono mt-0.5 block">
                ₹{candidate.currentPrice}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
              <span className="text-[10px] uppercase font-bold text-amber-800 block">Proposed Discount</span>
              <span className="text-base font-black text-amber-600 font-mono mt-0.5 block">
                -{candidate.suggestedDiscountPercent}%
              </span>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
              <span className="text-[10px] uppercase font-bold text-emerald-800 block">New Customer Price</span>
              <span className="text-base font-black text-emerald-700 font-mono mt-0.5 block">
                ₹{candidate.suggestedNewPrice}
              </span>
            </div>
          </div>

          {/* Justification Reason */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Recommendation Rationale</span>
            <p className="text-slate-700 leading-relaxed font-medium">
              {candidate.reason}. Approving will display this item under <strong>Save Today</strong> in the Customer PWA once the floor associate replaces the shelf tag.
            </p>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>Markdowns follow configured Category Discount Policy rules.</span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-white flex gap-2.5">
          <button
            type="button"
            onClick={handleReject}
            className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <XCircle className="w-4 h-4 text-slate-400" />
            <span>Reject</span>
          </button>
          <button
            type="button"
            onClick={handleApprove}
            className="flex-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs shadow-emerald-500/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Approve & Dispatch Task</span>
          </button>
        </div>
      </div>
    </div>
  )
}
