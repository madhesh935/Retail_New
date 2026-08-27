import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X, ShieldAlert, CheckCircle2, MapPin } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { PhotoEvidenceField } from './PhotoEvidenceField'
import { realStoreApi } from '@/services/api/realStoreApi'

interface ReportIssueModalProps {
  isOpen: boolean
  onClose: () => void
}

const CATEGORIES = [
  { id: 'SHELF', label: 'Shelf / Inventory', desc: 'Missing stock, incorrect facing, broken shelf' },
  { id: 'SAFETY', label: 'Safety Hazard', desc: 'Liquid spill, broken glass, blocked exit' },
  { id: 'PRICE', label: 'Price / Tag Error', desc: 'Missing shelf tag or price discrepancy' },
  { id: 'EQUIPMENT', label: 'Equipment Issue', desc: 'Scanner offline, POS glitch, cart malfunction' },
  { id: 'FACILITY', label: 'Store Facility', desc: 'Lighting, refrigeration, AC or door issue' },
]

export const ReportIssueModal: React.FC<ReportIssueModalProps> = ({ isOpen, onClose }) => {
  const { authenticatedStaff, fetchStoreData } = useAppStore()
  const [category, setCategory] = useState('SHELF')
  const [location, setLocation] = useState('Aisle 4 (Beverages)')
  const [description, setDescription] = useState('')
  const [evidencePhoto, setEvidencePhoto] = useState<string | null>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) return
    setCategory('SHELF')
    setLocation('Aisle 4 (Beverages)')
    setDescription('')
    setEvidencePhoto(null)
    setIsSubmitted(false)
    setSubmitError(null)
  }, [isOpen])

  if (!isOpen || typeof document === 'undefined') return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError(null)
    const label = CATEGORIES.find((c) => c.id === category)?.label || category

    try {
      await realStoreApi.createStaffTask({
        title: `[Worker Report] ${label}: ${description.slice(0, 40)}`,
        type: category === 'SAFETY' ? 'SPILL_CLEANUP' : category === 'SHELF' ? 'RESTOCK' : 'FACILITY',
        priority: category === 'SAFETY' ? 'HIGH' : 'MEDIUM',
        target_location: location,
        description,
        assigned_staff_id: authenticatedStaff?.id,
        customer_request_data: evidencePhoto
          ? { evidence_photo: evidencePhoto, source: 'staff_scan_report' }
          : { source: 'staff_scan_report' },
      })
      await fetchStoreData()
      setIsSubmitted(true)
      window.setTimeout(() => {
        setIsSubmitted(false)
        setDescription('')
        onClose()
      }, 800)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Could not submit issue report')
    } finally {
      setIsSubmitting(false)
    }
  }

  return createPortal(
    <>
      <button
        type="button"
        aria-label="Close issue report dialog"
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
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
              <ShieldAlert className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold leading-tight text-slate-900">Report Store Issue</h3>
              <p className="text-[11px] font-medium text-slate-500">Log Hazard or Discrepancy to Floor Lead</p>
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
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain p-5">
            {isSubmitted ? (
              <div className="space-y-2 py-12 text-center">
                <CheckCircle2 className="mx-auto h-12 w-12 animate-bounce text-emerald-600" />
                <h4 className="text-base font-bold text-slate-900">Issue Dispatched</h4>
                <p className="text-xs text-slate-500">Incident logged to Staff Operations Command Center.</p>
              </div>
            ) : (
              <>
                {/* Category */}
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Category
                  </label>
                  <div className="grid grid-cols-1 gap-1.5">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.id)}
                        className={`flex items-start justify-between rounded-xl border p-2.5 text-left transition-all ${
                          category === cat.id
                            ? 'border-blue-500 bg-blue-50/80 text-blue-950 shadow-2xs ring-1 ring-blue-300'
                            : 'border-slate-200 bg-white text-slate-900 hover:bg-slate-50'
                        }`}
                      >
                        <div>
                          <div className="text-xs font-bold">{cat.label}</div>
                          <div
                            className={`mt-0.5 text-[10px] ${category === cat.id ? 'text-blue-700' : 'text-slate-500'}`}
                          >
                            {cat.desc}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Location
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Aisle 4 • Shelf B4"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the issue (e.g. Water leak under beverage cooler)..."
                    rows={2}
                    className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Photo Evidence */}
                <PhotoEvidenceField value={evidencePhoto} onChange={setEvidencePhoto} />
              </>
            )}
          </div>

          {!isSubmitted && (
            <div className="shrink-0 space-y-2 border-t border-slate-100 bg-white px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
              {submitError && (
                <p className="rounded-lg bg-rose-50 p-2 text-[11px] font-semibold text-rose-700" role="alert">
                  {submitError}
                </p>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="min-h-12 w-full cursor-pointer rounded-xl bg-blue-600 py-3.5 text-xs font-bold text-white shadow-xs shadow-blue-500/20 transition-all hover:bg-blue-700 disabled:opacity-60"
              >
                {isSubmitting ? 'Submitting…' : 'Submit Issue Report'}
              </button>
            </div>
          )}
        </form>
      </div>
    </>,
    document.body
  )
}
