import React, { useState } from 'react'
import { X, ShieldAlert, Camera, CheckCircle2, MapPin } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'

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
  const { addStaffTask } = useAppStore()
  const [category, setCategory] = useState('SHELF')
  const [location, setLocation] = useState('Aisle 4 (Beverages)')
  const [description, setDescription] = useState('')
  const [hasPhoto, setHasPhoto] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitted(true)
    // Dispatch new canonical task
    addStaffTask({
      id: `task-issue-${Date.now()}`,
      title: `[Worker Report] ${CATEGORIES.find((c) => c.id === category)?.label}: ${description.slice(0, 30)}...`,
      category: category === 'SAFETY' ? 'SPILL_CLEANUP' : category === 'SHELF' ? 'RESTOCK' : 'FACILITY',
      priority: category === 'SAFETY' ? 'HIGH' : 'MEDIUM',
      status: 'PENDING',
      zoneId: 'zone-4',
      zoneName: location,
      reason: description,
      createdAt: 'Just now',
      etaMinutes: 10,
    })

    setTimeout(() => {
      setIsSubmitted(false)
      setDescription('')
      onClose()
    }, 1200)
  }

  return (
    <div className="fixed inset-0 z-[130] flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 leading-tight">Report Store Issue</h3>
              <p className="text-[11px] text-slate-500 font-medium">Log Hazard or Discrepancy to Floor Lead</p>
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
        <form onSubmit={handleSubmit} className="p-5 flex-1 overflow-y-auto space-y-4">
          {isSubmitted ? (
            <div className="py-12 text-center space-y-2">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
              <h4 className="text-base font-bold text-slate-900">Issue Dispatched</h4>
              <p className="text-xs text-slate-500">Incident logged to Staff Operations Command Center.</p>
            </div>
          ) : (
            <>
              {/* Category */}
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">Category</label>
                <div className="grid grid-cols-1 gap-1.5">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`p-2.5 rounded-xl border text-left flex items-start justify-between transition-all ${
                        category === cat.id
                          ? 'border-blue-500 bg-blue-50/80 text-blue-950 ring-1 ring-blue-300 shadow-2xs'
                          : 'border-slate-200 bg-white text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold">{cat.label}</div>
                        <div className={`text-[10px] mt-0.5 ${category === cat.id ? 'text-blue-700' : 'text-slate-500'}`}>
                          {cat.desc}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">Location</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Aisle 4 • Shelf B4"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the issue (e.g. Water leak under beverage cooler)..."
                  rows={2}
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  required
                />
              </div>

              {/* Photo Evidence */}
              <div>
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
                  <span>{hasPhoto ? '✓ Photo Attached' : 'Attach Photo Evidence'}</span>
                </button>
              </div>

              {/* Submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs shadow-blue-500/20 transition-all cursor-pointer"
                >
                  Submit Issue Report
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  )
}
