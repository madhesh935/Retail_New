import React, { useState } from 'react'
import { X, CheckCircle2, AlertTriangle, Layers, Tag, Eye } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'

interface QuickShelfCheckModalProps {
  shelfCode: string
  shelfName: string
  isOpen: boolean
  onClose: () => void
  onSuccess?: (observation: string) => void
}

const OBSERVATIONS = [
  { id: 'CORRECT', label: 'Shelf Correct', desc: 'Fully compliant, neat facings', status: 'OPTIMAL', color: 'emerald' },
  { id: 'LOW_STOCK', label: 'Low Stock', desc: '< 20% items remaining', status: 'LOW', color: 'amber' },
  { id: 'EMPTY', label: 'Empty Shelf', desc: '0 units on display', status: 'OUT_OF_STOCK', color: 'rose' },
  { id: 'WRONG_PRODUCT', label: 'Wrong Product', desc: 'Misplaced SKUs present', status: 'MISPLACED', color: 'amber' },
  { id: 'WRONG_PRICE', label: 'Wrong Price Label', desc: 'Shelf tag does not match POS', status: 'PRICE_MISMATCH', color: 'purple' },
  { id: 'DAMAGED_PRODUCT', label: 'Damaged Product', desc: 'Packaging torn or expired', status: 'DAMAGED', color: 'rose' },
  { id: 'PLANOGRAM_PROBLEM', label: 'Planogram Problem', desc: 'Incorrect facing orientation', status: 'PLANOGRAM_ERROR', color: 'amber' },
  { id: 'SHELF_OBSTRUCTED', label: 'Shelf Obstructed', desc: 'Cart or ladder blocking aisle', status: 'OBSTRUCTED', color: 'slate' },
]

export const QuickShelfCheckModal: React.FC<QuickShelfCheckModalProps> = ({
  shelfCode,
  shelfName,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [selectedObs, setSelectedObs] = useState('CORRECT')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  if (!isOpen) return null

  const handleSubmit = () => {
    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      setSubmitted(true)
      if (onSuccess) {
        const item = OBSERVATIONS.find((o) => o.id === selectedObs)
        onSuccess(item?.label || 'Shelf Observation')
      }
      setTimeout(() => {
        setSubmitted(false)
        onClose()
      }, 1000)
    }, 400)
  }

  return (
    <div className="fixed inset-0 z-[130] flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 leading-tight">Quick Shelf Check</h3>
              <p className="text-[11px] text-slate-500 font-medium">Record Observation for Shelf {shelfCode}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Shelf banner */}
        <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-200 text-xs flex justify-between items-center">
          <span className="font-bold text-slate-900">{shelfName || `Shelf ${shelfCode}`}</span>
          <span className="bg-sky-100 text-sky-900 px-2 py-0.5 rounded font-mono font-bold">{shelfCode}</span>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 overflow-y-auto space-y-3">
          {submitted ? (
            <div className="py-10 text-center space-y-2">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
              <h4 className="text-base font-bold text-slate-900">Observation Recorded</h4>
              <p className="text-xs text-slate-500">Updated Store Inventory Intelligence in real time.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {OBSERVATIONS.map((obs) => {
                const isSelected = selectedObs === obs.id
                return (
                  <button
                    key={obs.id}
                    type="button"
                    onClick={() => setSelectedObs(obs.id)}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'border-sky-500 bg-sky-50/70 shadow-xs ring-1 ring-sky-500/20'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className={`text-xs font-bold ${isSelected ? 'text-sky-950' : 'text-slate-900'}`}>
                      {obs.label}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">{obs.desc}</div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {!submitted && (
          <div className="p-4 border-t border-slate-100 bg-white flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white font-bold text-xs rounded-xl shadow-sm shadow-blue-500/20 transition-all cursor-pointer"
            >
              {isSubmitting ? 'Saving...' : 'Submit Observation'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
