import React, { useState } from 'react'
import { X, Trash2, CheckCircle2, AlertTriangle, Camera, Package } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { WasteReason } from '@/types/expiry.types'
import { cn } from '@/lib/utils'

interface RecordWasteModalProps {
  isOpen: boolean
  onClose: () => void
  productName?: string
  productSku?: string
  batchId?: string
  batchNumber?: string
  shelfCode?: string
  defaultQuantity?: number
  unitCost?: number
}

const WASTE_REASONS: { id: WasteReason; label: string; desc: string }[] = [
  { id: 'EXPIRED', label: 'Expired Product', desc: 'Reached sell-by or best-before date' },
  { id: 'DAMAGED', label: 'Packaging Damage', desc: 'Torn box, broken seal, or dented can' },
  { id: 'SPOILED', label: 'Spoiled / Mold', desc: 'Visible decay, mold, or odor' },
  { id: 'QUALITY_FAILURE', label: 'Quality Failure', desc: 'Customer return or texture defect' },
  { id: 'TEMPERATURE_DAMAGE', label: 'Cold-Chain Failure', desc: 'Exceeded safe holding temperature' },
  { id: 'OTHER', label: 'Other Shrink', desc: 'Pest, demonstration, or inventory loss' },
]

export const RecordWasteModal: React.FC<RecordWasteModalProps> = ({
  isOpen,
  onClose,
  productName = 'Fresh Whole Milk 1L',
  productSku = 'SKU-DAIRY-101',
  batchId,
  batchNumber,
  shelfCode = 'C2',
  defaultQuantity = 1,
  unitCost = 42,
}) => {
  const { recordWasteEvent, authenticatedStaff } = useAppStore()

  const [quantity, setQuantity] = useState<number>(defaultQuantity)
  const [reason, setReason] = useState<WasteReason>('EXPIRED')
  const [notes, setNotes] = useState('')
  const [hasPhoto, setHasPhoto] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (quantity <= 0) return

    recordWasteEvent({
      storeId: authenticatedStaff?.storeId || 'STORE-01',
      productId: productSku,
      productSku,
      productName,
      batchId,
      batchNumber,
      quantity,
      reason,
      recordedByStaffId: authenticatedStaff?.id || 'STAFF-03',
      recordedByStaffName: authenticatedStaff?.name || 'Liam',
      locationId: `loc-${shelfCode}`,
      locationName: `Shelf ${shelfCode}`,
      unitCost,
      totalLossCost: unitCost * quantity,
      notes: notes.trim() || undefined,
      evidencePhoto: hasPhoto ? 'data:image/evidence_waste.jpg' : undefined,
    })

    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      onClose()
    }, 1400)
  }

  return (
    <div className="fixed inset-0 z-[140] flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-rose-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-xs">
              <Trash2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 leading-tight">Record Store Waste</h3>
              <p className="text-[11px] text-rose-800 font-medium">Log Shrink & Adjust Inventory</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 flex-1 overflow-y-auto space-y-4 text-xs">
          {submitted ? (
            <div className="py-12 text-center space-y-2">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
              <h4 className="text-base font-bold text-slate-900">Waste Logged Successfully</h4>
              <p className="text-xs text-slate-500">
                Inventory decremented by {quantity} units. Store database synchronized.
              </p>
            </div>
          ) : (
            <>
              {/* Product Card */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900">{productName}</h4>
                  <div className="text-[11px] text-slate-500 font-mono">
                    {productSku} {batchNumber ? `· Batch ${batchNumber}` : ''} · Shelf {shelfCode}
                  </div>
                </div>
                <Package className="w-5 h-5 text-slate-400" />
              </div>

              {/* Quantity Counter */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Wasted Units Quantity
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-base flex items-center justify-center cursor-pointer"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="flex-1 py-2 text-center text-xl font-mono font-black text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-base flex items-center justify-center cursor-pointer"
                  >
                    +
                  </button>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Est. Inventory Cost Loss: <strong className="text-rose-600 font-mono">₹{unitCost * quantity}</strong>
                </span>
              </div>

              {/* Reason Selector */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Primary Disposal Reason
                </label>
                <div className="grid grid-cols-1 gap-1.5">
                  {WASTE_REASONS.map((r) => {
                    const isSelected = reason === r.id
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setReason(r.id)}
                        className={cn(
                          'p-2.5 rounded-xl border text-left flex items-start justify-between transition-all cursor-pointer',
                          isSelected
                            ? 'border-rose-500 bg-rose-50/80 text-rose-950 ring-1 ring-rose-300 shadow-2xs'
                            : 'border-slate-200 bg-white hover:bg-slate-50'
                        )}
                      >
                        <div>
                          <div className="font-bold text-xs">{r.label}</div>
                          <div className={cn('text-[10px] mt-0.5', isSelected ? 'text-rose-700' : 'text-slate-500')}>
                            {r.desc}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Optional Disposal Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Broken seal found during morning restock audit..."
                  rows={2}
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
                />
              </div>

              {/* Evidence Photo */}
              <div>
                <button
                  type="button"
                  onClick={() => setHasPhoto(!hasPhoto)}
                  className={cn(
                    'w-full py-2.5 px-3 rounded-xl border border-dashed flex items-center justify-center gap-2 font-semibold transition-all cursor-pointer',
                    hasPhoto
                      ? 'border-emerald-400 bg-emerald-50 text-emerald-800'
                      : 'border-slate-300 bg-slate-50 text-slate-600 hover:bg-slate-100'
                  )}
                >
                  <Camera className="w-4 h-4" />
                  <span>{hasPhoto ? '✓ Photo Attached' : 'Attach Photo Evidence'}</span>
                </button>
              </div>

              {/* Submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs shadow-rose-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Confirm & Record Waste ({quantity} units)</span>
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  )
}
