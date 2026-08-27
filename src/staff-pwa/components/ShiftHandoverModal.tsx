import React, { useState } from 'react'
import { X, CalendarClock, CheckCircle2, AlertTriangle, Layers, Plus } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'

interface ShiftHandoverModalProps {
  isOpen: boolean
  onClose: () => void
}

export const ShiftHandoverModal: React.FC<ShiftHandoverModalProps> = ({ isOpen, onClose }) => {
  const { handoverItems, addHandoverItem, pendingTasks, authenticatedStaff } = useAppStore()
  const [noteTitle, setNoteTitle] = useState('')
  const [noteDesc, setNoteDesc] = useState('')
  const [category, setCategory] = useState<'WATCH' | 'IN_PROGRESS' | 'BLOCKED' | 'GENERAL'>('WATCH')
  const [showAddForm, setShowAddForm] = useState(false)
  const [submittedToast, setSubmittedToast] = useState(false)

  if (!isOpen) return null

  const completedCount = pendingTasks.filter((t) => t.status === 'COMPLETED' || t.status === 'VERIFIED').length
  const inProgressCount = pendingTasks.filter((t) => t.status === 'IN_PROGRESS').length
  const blockedCount = pendingTasks.filter((t) => t.status === 'BLOCKED').length

  const handleAddHandover = (e: React.FormEvent) => {
    e.preventDefault()
    if (!noteTitle.trim()) return

    addHandoverItem({
      title: noteTitle.trim(),
      description: noteDesc.trim() || 'No additional notes provided.',
      category,
      authorName: `${authenticatedStaff?.name || 'Liam'} (${authenticatedStaff?.shift || 'Shift B'})`,
    })

    setNoteTitle('')
    setNoteDesc('')
    setShowAddForm(false)
    setSubmittedToast(true)
    setTimeout(() => setSubmittedToast(false), 2500)
  }

  return (
    <div className="fixed inset-0 z-[130] flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <CalendarClock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 leading-tight">Shift Handover</h3>
              <p className="text-[11px] text-slate-500 font-medium">Shift B → Incoming Shift C</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Shift Activities Summary Metrics */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 grid grid-cols-3 gap-2 text-center text-xs">
          <div className="bg-white p-2.5 rounded-xl border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Completed</span>
            <span className="text-base font-bold text-emerald-600 font-mono">{completedCount}</span>
          </div>
          <div className="bg-white p-2.5 rounded-xl border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">In Progress</span>
            <span className="text-base font-bold text-sky-600 font-mono">{inProgressCount}</span>
          </div>
          <div className="bg-white p-2.5 rounded-xl border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Blocked</span>
            <span className="text-base font-bold text-rose-600 font-mono">{blockedCount}</span>
          </div>
        </div>

        {/* Content List */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {submittedToast && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>✓ Handover note logged for the incoming shift team!</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Handover Watch Items</h4>
            <button
              type="button"
              onClick={() => setShowAddForm(!showAddForm)}
              className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Item</span>
            </button>
          </div>

          {/* Add Item Form */}
          {showAddForm && (
            <form onSubmit={handleAddHandover} className="p-3.5 bg-sky-50/60 border border-sky-200 rounded-2xl space-y-2.5 animate-in fade-in">
              <div className="text-xs font-bold text-sky-950">New Handover Item</div>
              <input
                type="text"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                placeholder="e.g. Dairy Cooler 2 needs recheck at 16:00"
                className="w-full px-3 py-2 text-xs bg-white border border-sky-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                required
              />
              <textarea
                value={noteDesc}
                onChange={(e) => setNoteDesc(e.target.value)}
                placeholder="Details for incoming shift associates..."
                rows={2}
                className="w-full px-3 py-2 text-xs bg-white border border-sky-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
              />
              <div className="flex items-center justify-between gap-2 pt-1">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="px-2 py-1.5 bg-white border border-sky-200 rounded-lg text-xs font-semibold text-slate-700"
                >
                  <option value="WATCH">Watch Item</option>
                  <option value="IN_PROGRESS">In Progress Work</option>
                  <option value="BLOCKED">Blocked Item</option>
                  <option value="GENERAL">General Handover</option>
                </select>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs shadow-blue-500/20 transition-all"
                >
                  Save Note
                </button>
              </div>
            </form>
          )}

          {/* Handover List */}
          <div className="space-y-2">
            {handoverItems.map((item) => (
              <div key={item.id} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded uppercase ${
                      item.category === 'BLOCKED'
                        ? 'bg-rose-100 text-rose-800'
                        : item.category === 'IN_PROGRESS'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {item.category}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{item.createdAt}</span>
                </div>
                <h5 className="text-xs font-bold text-slate-900">{item.title}</h5>
                <p className="text-[11px] text-slate-600 leading-relaxed">{item.description}</p>
                <div className="text-[10px] text-slate-400 pt-1 font-medium">Logged by {item.authorName}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-white">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm shadow-blue-500/20 transition-all"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  )
}
