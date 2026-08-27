import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X, CheckCircle2, Eye } from 'lucide-react'
import { PhotoEvidenceField } from './PhotoEvidenceField'

interface QuickShelfCheckModalProps {
  shelfCode: string
  shelfName: string
  isOpen: boolean
  onClose: () => void
  onSuccess?: (observation: string, status: string, photo?: string) => void | Promise<void>
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
  const [evidencePhoto, setEvidencePhoto] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) return
    setSelectedObs('CORRECT')
    setEvidencePhoto(null)
    setSubmitted(false)
    setSubmitError(null)
  }, [isOpen, shelfCode])

  if (!isOpen || typeof document === 'undefined') return null

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setSubmitError(null)
    const item = OBSERVATIONS.find((o) => o.id === selectedObs)

    try {
      if (onSuccess) {
        await onSuccess(item?.label || 'Shelf Observation', item?.status || 'OPTIMAL', evidencePhoto || undefined)
      }
      setSubmitted(true)
      window.setTimeout(() => {
        setSubmitted(false)
        onClose()
      }, 1000)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Could not save shelf observation')
    } finally {
      setIsSubmitting(false)
    }
  }

  return createPortal(
    <>
      <button
        type="button"
        aria-label="Close shelf check dialog"
        className="fixed inset-0 z-[200] cursor-default bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
        onClick={onClose}
      />

      <div
        className="fixed inset-x-0 bottom-0 z-[201] mx-auto flex w-full max-w-md max-h-[min(92dvh,820px)] flex-col overflow-hidden rounded-t-3xl border border-slate-200 bg-white shadow-2xl animate-in slide-in-from-bottom-4 duration-200"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 bg-slate-50/70 px-5 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
              <Eye className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold leading-tight text-slate-900">Quick Shelf Check</h3>
              <p className="text-[11px] font-medium text-slate-500">Record Observation for Shelf {shelfCode}</p>
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

        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-2.5 text-xs">
          <span className="font-bold text-slate-900">{shelfName || `Shelf ${shelfCode}`}</span>
          <span className="rounded bg-sky-100 px-2 py-0.5 font-mono font-bold text-sky-900">{shelfCode}</span>
        </div>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain p-5">
          {submitted ? (
            <div className="space-y-2 py-10 text-center">
              <CheckCircle2 className="mx-auto h-12 w-12 animate-bounce text-emerald-600" />
              <h4 className="text-base font-bold text-slate-900">Observation Recorded</h4>
              <p className="text-xs text-slate-500">Updated Store Inventory Intelligence in real time.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-2">
                {OBSERVATIONS.map((obs) => {
                  const isSelected = selectedObs === obs.id
                  return (
                    <button
                      key={obs.id}
                      type="button"
                      onClick={() => setSelectedObs(obs.id)}
                      className={`rounded-2xl border p-3 text-left transition-all ${
                        isSelected
                          ? 'border-sky-500 bg-sky-50/70 shadow-xs ring-1 ring-sky-500/20'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className={`text-xs font-bold ${isSelected ? 'text-sky-950' : 'text-slate-900'}`}>
                        {obs.label}
                      </div>
                      <div className="mt-0.5 text-[10px] leading-tight text-slate-500">{obs.desc}</div>
                    </button>
                  )
                })}
              </div>

              <PhotoEvidenceField
                value={evidencePhoto}
                onChange={setEvidencePhoto}
                label="Attach Shelf Photo (Optional)"
                attachedLabel="Shelf photo attached"
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
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="min-h-12 flex-1 rounded-xl bg-slate-100 py-3 text-xs font-bold text-slate-700 hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleSubmit()}
                disabled={isSubmitting}
                className="min-h-12 flex-1 cursor-pointer rounded-xl bg-blue-600 py-3 text-xs font-bold text-white shadow-sm shadow-blue-500/20 transition-all hover:bg-blue-700 disabled:opacity-70"
              >
                {isSubmitting ? 'Saving...' : 'Submit Observation'}
              </button>
            </div>
          </div>
        )}
      </div>
    </>,
    document.body
  )
}
