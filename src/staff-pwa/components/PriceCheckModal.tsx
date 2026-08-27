import React, { useState } from 'react'
import { X, Tag, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react'

interface PriceCheckModalProps {
  isOpen: boolean
  onClose: () => void
  productName: string
  sku: string
  systemPrice: number
  shelfTagPrice?: number
  onReportMismatch?: (shelfPrice: number) => void | Promise<void>
}

export const PriceCheckModal: React.FC<PriceCheckModalProps> = ({
  isOpen,
  onClose,
  productName,
  sku,
  systemPrice,
  shelfTagPrice = 64,
  onReportMismatch,
}) => {
  const [shelfInput, setShelfInput] = useState(shelfTagPrice.toString())
  const [isReported, setIsReported] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const inputPrice = parseFloat(shelfInput) || systemPrice
  const hasMismatch = inputPrice !== systemPrice

  const handleReport = async () => {
    setIsSubmitting(true)
    try {
      await onReportMismatch?.(inputPrice)
      setIsReported(true)
      setTimeout(() => {
        setIsReported(false)
        onClose()
      }, 1500)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[130] flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 leading-tight">Price Verification</h3>
              <p className="text-[11px] text-slate-500 font-medium">POS Price vs Physical Shelf Tag</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Product Banner */}
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">{sku}</span>
          <h4 className="text-sm font-bold text-slate-900">{productName}</h4>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">System Price (POS)</span>
              <span className="text-2xl font-black text-slate-900 font-mono mt-1 block">₹{systemPrice}</span>
              <span className="text-[10px] text-slate-400 font-medium">Live catalog rate</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Shelf Tag Display</span>
              <div className="flex items-center justify-center gap-1 mt-1">
                <span className="text-lg font-bold text-slate-400 font-mono">₹</span>
                <input
                  type="number"
                  value={shelfInput}
                  onChange={(e) => setShelfInput(e.target.value)}
                  className="w-16 text-2xl font-black text-slate-900 font-mono border-b border-slate-300 focus:outline-none focus:border-purple-600 text-center"
                />
              </div>
              <span className="text-[10px] text-slate-400 font-medium">Editable shelf tag</span>
            </div>
          </div>

          {/* Status Verdict */}
          {hasMismatch ? (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>PRICE MISMATCH DETECTED</span>
              </div>
              <p className="text-amber-800">
                Physical shelf tag (₹{inputPrice}) differs from POS system price (₹{systemPrice}). A new shelf label must be printed.
              </p>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs flex items-center gap-2 text-emerald-900 font-bold">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>✓ Price Correct. Physical shelf label matches system database.</span>
            </div>
          )}

          {isReported && (
            <div className="p-3 bg-slate-900 text-white rounded-xl text-center text-xs font-bold animate-in fade-in">
              ✓ Price discrepancy dispatched to POS Label Queue!
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-white flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
          >
            Done
          </button>
          {hasMismatch && (
            <button
              type="button"
              onClick={handleReport}
              disabled={isSubmitting}
              className="flex-1 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5"
            >
              <span>{isSubmitting ? 'Dispatching…' : 'Report Mismatch'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
