import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X, Trash2, CheckCircle2, Package } from 'lucide-react'
import { PhotoEvidenceField } from './PhotoEvidenceField'
import { useAppStore } from '@/store/useAppStore'
import { WasteReason } from '@/types/expiry.types'
import { cn } from '@/lib/utils'
import { realStoreApi } from '@/services/api/realStoreApi'

interface RecordWasteModalProps {
  isOpen: boolean
  onClose: () => void
  productName?: string
  productId?: string
  productSku?: string
  batchId?: string
  batchNumber?: string
  shelfCode?: string
  defaultQuantity?: number
  maxQuantity?: number
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
  productId,
  productSku = 'SKU-DAIRY-101',
  batchId,
  batchNumber,
  shelfCode = 'C2',
  defaultQuantity = 1,
  maxQuantity,
  unitCost = 42,
}) => {
  const { recordWasteEvent, authenticatedStaff, fetchStoreData } = useAppStore()

  const [quantity, setQuantity] = useState<number>(defaultQuantity)
  const [reason, setReason] = useState<WasteReason>('EXPIRED')
  const [notes, setNotes] = useState('')
  const [evidencePhoto, setEvidencePhoto] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const availableQuantity = maxQuantity ?? defaultQuantity
  const quantityCap = Math.max(availableQuantity, 0)

  useEffect(() => {
    if (!isOpen) return
    setQuantity(quantityCap > 0 ? Math.min(defaultQuantity, quantityCap) : 0)
    setReason('EXPIRED')
    setNotes('')
    setEvidencePhoto(null)
    setSubmitted(false)
    setSubmitError(null)
  }, [isOpen, defaultQuantity, quantityCap, batchId])

  if (!isOpen || typeof document === 'undefined') return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (quantityCap <= 0) {
      setSubmitError('This batch has no remaining units to record as waste.')
      return
    }
    if (quantity <= 0 || quantity > quantityCap) {
      setSubmitError(`Quantity must be between 1 and ${quantityCap}.`)
      return
    }
    if (!authenticatedStaff?.id) {
      // Never attribute a waste record to a fabricated staff id.
      setSubmitError('Unable to identify the logged-in staff member. Please sign in again.')
      return
    }
    setIsSubmitting(true)
    setSubmitError(null)

    const wasteInput = {
      storeId: authenticatedStaff?.storeId || 'STORE-01',
      productId: productId || productSku,
      productSku,
      productName,
      batchId,
      batchNumber,
      quantity,
      reason,
      recordedByStaffId: authenticatedStaff.id,
      recordedByStaffName: authenticatedStaff.name || 'Staff',
      locationId: shelfCode,
      locationName: `Shelf ${shelfCode}`,
      unitCost,
      totalLossCost: unitCost * quantity,
      notes: notes.trim() || undefined,
      evidencePhoto: evidencePhoto || undefined,
    }

    try {
      await realStoreApi.recordWaste({
        store_id: wasteInput.storeId,
        product_id: wasteInput.productId,
        product_sku: wasteInput.productSku,
        product_name: wasteInput.productName,
        batch_id: wasteInput.batchId,
        batch_number: wasteInput.batchNumber,
        quantity: wasteInput.quantity,
        reason: wasteInput.reason,
        recorded_by_staff_id: wasteInput.recordedByStaffId,
        recorded_by_staff_name: wasteInput.recordedByStaffName,
        location_id: wasteInput.locationId,
        location_name: wasteInput.locationName,
        unit_cost: wasteInput.unitCost,
        notes: wasteInput.notes,
        evidence_photo: evidencePhoto || undefined,
      })
      recordWasteEvent(wasteInput)
      await fetchStoreData()

      setSubmitted(true)
      setTimeout(() => {
        setSubmitted(false)
        onClose()
      }, 1400)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Could not record waste')
    } finally {
      setIsSubmitting(false)
    }
  }

  return createPortal(
    <>
      <button
        type="button"
        aria-label="Close waste record dialog"
        className="fixed inset-0 z-[200] cursor-default bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
        onClick={onClose}
      />

      <div
        className="fixed inset-x-0 bottom-0 z-[201] mx-auto flex w-full max-w-md max-h-[min(92dvh,820px)] flex-col overflow-hidden rounded-t-3xl border border-slate-200 bg-white shadow-2xl animate-in slide-in-from-bottom-4 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="record-waste-title"
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 bg-rose-50/70 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-600 text-white shadow-xs">
              <Trash2 className="h-4 w-4" />
            </div>
            <div>
              <h3 id="record-waste-title" className="text-sm font-bold leading-tight text-slate-900">
                Record Store Waste
              </h3>
              <p className="text-[11px] font-medium text-rose-800">Log Shrink & Adjust Inventory</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-200/60 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain p-5 text-xs">
            {submitted ? (
              <div className="space-y-2 py-12 text-center">
                <CheckCircle2 className="mx-auto h-12 w-12 animate-bounce text-emerald-600" />
                <h4 className="text-base font-bold text-slate-900">Waste Logged Successfully</h4>
                <p className="text-xs text-slate-500">
                  Inventory decremented by {quantity} units. Store database synchronized.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-3.5">
                  <div>
                    <h4 className="font-bold text-slate-900">{productName}</h4>
                    <div className="font-mono text-[11px] text-slate-500">
                      {productSku} {batchNumber ? `· Batch ${batchNumber}` : ''} · Shelf {shelfCode}
                    </div>
                  </div>
                  <Package className="h-5 w-5 text-slate-400" />
                </div>

                <div>
                  <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Wasted Units Quantity
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl bg-slate-100 text-base font-black text-slate-800 hover:bg-slate-200"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min={1}
                      max={quantityCap}
                      value={quantity}
                      onChange={(e) =>
                        setQuantity(
                          Math.min(quantityCap, Math.max(1, parseInt(e.target.value, 10) || 1))
                        )
                      }
                      className="flex-1 rounded-xl border border-slate-200 py-2 text-center font-mono text-xl font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.min(quantityCap, quantity + 1))}
                      disabled={quantity >= quantityCap}
                      className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl bg-slate-100 text-base font-black text-slate-800 hover:bg-slate-200 disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>
                  <span className="mt-1 block text-[10px] text-slate-400">
                    Est. Inventory Cost Loss:{' '}
                    <strong className="font-mono text-rose-600">₹{unitCost * quantity}</strong>
                    {maxQuantity !== undefined && (
                      <span className="ml-1 text-slate-500">· Max {quantityCap} in batch</span>
                    )}
                  </span>
                </div>

                <div>
                  <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
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
                            'flex cursor-pointer items-start justify-between rounded-xl border p-2.5 text-left transition-all',
                            isSelected
                              ? 'border-rose-500 bg-rose-50/80 text-rose-950 shadow-2xs ring-1 ring-rose-300'
                              : 'border-slate-200 bg-white hover:bg-slate-50'
                          )}
                        >
                          <div>
                            <div className="text-xs font-bold">{r.label}</div>
                            <div
                              className={cn(
                                'mt-0.5 text-[10px]',
                                isSelected ? 'text-rose-700' : 'text-slate-500'
                              )}
                            >
                              {r.desc}
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Optional Disposal Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Broken seal found during morning restock audit..."
                    rows={2}
                    className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <PhotoEvidenceField
                  value={evidencePhoto}
                  onChange={setEvidencePhoto}
                  attachedLabel="Waste evidence photo attached"
                />
              </>
            )}
          </div>

          {!submitted && (
            <div className="shrink-0 space-y-2 border-t border-slate-100 bg-white px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
              {submitError && (
                <p className="rounded-lg bg-rose-50 p-2 text-[11px] font-semibold text-rose-700" role="alert">
                  {submitError}
                </p>
              )}
              <button
                type="submit"
                disabled={isSubmitting || quantityCap <= 0}
                className="flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-rose-600 py-3.5 text-xs font-bold text-white shadow-xs shadow-rose-500/20 transition-all hover:bg-rose-700 disabled:opacity-60"
              >
                <Trash2 className="h-4 w-4" />
                <span>
                  {quantityCap <= 0
                    ? 'Batch already depleted'
                    : isSubmitting
                      ? 'Saving to store database…'
                      : `Confirm & Record Waste (${quantity} units)`}
                </span>
              </button>
            </div>
          )}
        </form>
      </div>
    </>,
    document.body
  )
}
