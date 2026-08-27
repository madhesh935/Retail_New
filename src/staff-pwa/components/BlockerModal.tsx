import React, { useState } from 'react'
import { X, AlertTriangle, Camera, Check, ShieldAlert } from 'lucide-react'
import { BlockerReason } from '@/types'

interface BlockerModalProps {
  isOpen: boolean
  onClose: () => void
  taskTitle: string
  taskId: string
  onSubmitBlocker: (reason: BlockerReason, note?: string, photo?: string) => void
}

const BLOCKER_OPTIONS: { reason: BlockerReason; label: string; description: string }[] = [
  { reason: 'BACKROOM_STOCK_UNAVAILABLE', label: 'Backroom stock unavailable', description: 'Depleted or pallet misplaced in stockroom' },
  { reason: 'PRODUCT_UNAVAILABLE', label: 'Product unavailable', description: 'Zero remaining units in store' },
  { reason: 'LOCATION_BLOCKED', label: 'Location blocked', description: 'Aisle or shelf obstructed by equipment or spill' },
  { reason: 'EQUIPMENT_UNAVAILABLE', label: 'Equipment unavailable', description: 'Missing pallet jack, ladder, or scanner' },
  { reason: 'NEED_ANOTHER_WORKER', label: 'Need second worker', description: 'Heavy lifting or high volume assistance required' },
  { reason: 'CUSTOMER_OCCUPYING_AREA', label: 'Customer occupying area', description: 'Crowd or shoppers currently active at shelf' },
  { reason: 'SAFETY_CONCERN', label: 'Safety concern', description: 'Broken glass, wet floor, or hazard requires clearance' },
  { reason: 'MANAGER_ASSISTANCE_NEEDED', label: 'Manager assistance needed', description: 'Requires supervisor override or decision' },
  { reason: 'OTHER', label: 'Other operational issue', description: 'Custom physical-world impediment' },
]

export const BlockerModal: React.FC<BlockerModalProps> = ({
  isOpen,
  onClose,
  taskTitle,
  taskId,
  onSubmitBlocker,
}) => {
  const [selectedReason, setSelectedReason] = useState<BlockerReason>('BACKROOM_STOCK_UNAVAILABLE')
  const [note, setNote] = useState('')
  const [hasPhoto, setHasPhoto] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const handleSubmit = () => {
    setIsSubmitting(true)
    setTimeout(() => {
      onSubmitBlocker(
        selectedReason,
        note,
        hasPhoto ? 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=300' : undefined
      )
      setIsSubmitting(false)
      onClose()
    }, 400)
  }

  return (
    <div className="fixed inset-0 z-[130] flex items-end sm:items-center justify-center bg-slate-900/70 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-rose-100 flex items-center justify-between bg-rose-50/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-rose-950 leading-tight">Cannot Complete Task</h3>
              <p className="text-[11px] text-rose-700 font-medium">Report Blocker to Staff Operations</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Task banner */}
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 text-xs">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Active Task</span>
          <span className="font-bold text-slate-900">{taskTitle}</span>
        </div>

        {/* Form Content */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
              Select Primary Blocker Reason
            </label>
            <div className="space-y-1.5">
              {BLOCKER_OPTIONS.map((opt) => {
                const isSelected = selectedReason === opt.reason
                return (
                  <button
                    key={opt.reason}
                    type="button"
                    onClick={() => setSelectedReason(opt.reason)}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                      isSelected
                        ? 'border-rose-500 bg-rose-50/50 shadow-xs'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className={`text-xs font-bold ${isSelected ? 'text-rose-950' : 'text-slate-800'}`}>
                        {opt.label}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{opt.description}</div>
                    </div>
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                        isSelected ? 'border-rose-600 bg-rose-600 text-white' : 'border-slate-300'
                      }`}
                    >
                      {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Optional Note */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              Additional Details (Optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Checked Bay 3B and 3C, pallet is empty..."
              rows={2}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-slate-900 resize-none"
            />
          </div>

          {/* Photo Evidence */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              Evidence Photo (Optional)
            </label>
            <button
              type="button"
              onClick={() => setHasPhoto(!hasPhoto)}
              className={`w-full py-2.5 px-3 rounded-xl border border-dashed flex items-center justify-center gap-2 text-xs font-semibold transition-all ${
                hasPhoto
                  ? 'border-emerald-400 bg-emerald-50 text-emerald-800'
                  : 'border-slate-300 bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>{hasPhoto ? '✓ Shelf / Backroom Photo Attached' : 'Attach Photo Evidence'}</span>
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-white flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 disabled:opacity-70 text-white font-bold text-sm rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? 'Logging Blocker...' : 'Submit Blocker'}
          </button>
        </div>
      </div>
    </div>
  )
}
