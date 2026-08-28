import React, { useState } from 'react'
import {
  X,
  AlertTriangle,
  RotateCw,
  Tag,
  CheckCircle2,
  Calendar,
  Layers,
  MapPin,
  Clock,
  Sparkles,
  TrendingDown,
  Trash2,
  Edit3,
} from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { InventoryBatch } from '@/types/expiry.types'
import { formatExpiryTime, calculateHoursRemaining } from '@/services/expiry/expiryRiskEngine'
import { cn } from '@/lib/utils'

interface ExpiryDetailDrawerProps {
  batch: InventoryBatch | null
  isOpen: boolean
  onClose: () => void
  onOpenMarkdown?: (batchId: string) => void
}

export const ExpiryDetailDrawer: React.FC<ExpiryDetailDrawerProps> = ({
  batch,
  isOpen,
  onClose,
  onOpenMarkdown,
}) => {
  const {
    expiryRiskAssessments,
    createRotationTask,
    createExpiryCheckTask,
    removeExpiredBatch,
    correctBatchExpiryAudit,
    inventoryBatches,
    authenticatedStaff,
  } = useAppStore()

  const [taskCreatedToast, setTaskCreatedToast] = useState<string | null>(null)
  const [isEditingExpiry, setIsEditingExpiry] = useState(false)
  const [newExpiryInput, setNewExpiryInput] = useState('')
  const [auditReasonInput, setAuditReasonInput] = useState('')

  if (!isOpen || !batch) return null

  const assessment = expiryRiskAssessments.find((a) => a.batchId === batch.id)
  const hours = calculateHoursRemaining(batch.expiresAt)
  const isExpired = hours <= 0 || batch.status === 'EXPIRED'

  // Find other batches of same product for FEFO comparison
  const siblingBatches = inventoryBatches.filter(
    (b) => b.productId === batch.productId && b.id !== batch.id
  )

  const showToast = (msg: string) => {
    setTaskCreatedToast(msg)
    setTimeout(() => setTaskCreatedToast(null), 3000)
  }

  const handleCreateRotation = () => {
    createRotationTask(batch.id)
    showToast(`✓ Stock Rotation task dispatched to Floor Staff for Shelf ${batch.shelfCode || 'Unassigned'}!`)
  }

  const handleCreateCheck = () => {
    createExpiryCheckTask(batch.id)
    showToast(`✓ Expiry Verification audit dispatched to Staff Work Queue!`)
  }

  const handleRemoveExpired = () => {
    removeExpiredBatch(batch.id)
    showToast(`✓ Remove Expired Stock task dispatched & removed from customer availability.`)
    setTimeout(onClose, 1500)
  }

  const handleSaveAuditDate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newExpiryInput) return
    correctBatchExpiryAudit(
      batch.id,
      new Date(newExpiryInput).toISOString(),
      auditReasonInput || 'Physical packaging date verified by Manager',
      authenticatedStaff?.id || 'MGR-01'
    )
    setIsEditingExpiry(false)
    showToast(`✓ Batch expiry updated with permanent audit record.`)
  }

  return (
    <div className="fixed inset-0 z-[120] flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'w-9 h-9 rounded-xl flex items-center justify-center font-mono font-bold text-xs',
                isExpired
                  ? 'bg-rose-100 text-rose-700'
                  : assessment?.riskLevel === 'HIGH'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-sky-100 text-sky-800'
              )}
            >
              {batch.shelfCode || 'Unassigned'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 leading-none">{batch.productName}</h3>
                <span className="text-[10px] font-mono text-slate-400">({batch.productSku})</span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Batch <span className="font-mono font-bold text-slate-700">{batch.batchNumber}</span> · {batch.category}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-5">
          {taskCreatedToast && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{taskCreatedToast}</span>
            </div>
          )}

          {/* Core Risk Banner */}
          <div
            className={cn(
              'p-4 rounded-2xl border flex items-start gap-3.5',
              isExpired
                ? 'bg-rose-50 border-rose-200 text-rose-950'
                : assessment?.riskLevel === 'HIGH'
                ? 'bg-amber-50/80 border-amber-200 text-amber-950'
                : 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
            )}
          >
            <AlertTriangle
              className={cn(
                'w-5 h-5 mt-0.5 shrink-0',
                isExpired
                  ? 'text-rose-600'
                  : assessment?.riskLevel === 'HIGH'
                  ? 'text-amber-600'
                  : 'text-emerald-600'
              )}
            />
            <div className="space-y-1 text-xs">
              <div className="font-extrabold uppercase tracking-wide flex items-center gap-2">
                <span>
                  {isExpired ? 'Batch Expired' : `${assessment?.riskLevel || 'LOW'} Expiry Risk`}
                </span>
                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-white/80 border border-current/20">
                  {formatExpiryTime(hours)}
                </span>
              </div>
              <p className="leading-relaxed opacity-90">
                {assessment?.actionReason ||
                  `Batch expires on ${new Date(batch.expiresAt).toLocaleDateString()}. Monitor inventory sell-through.`}
              </p>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-3 gap-2.5 text-center">
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Remaining</span>
              <span className="text-lg font-black text-slate-900 font-mono mt-0.5 block">{batch.quantity}</span>
              <span className="text-[10px] text-slate-400">{batch.shelfQuantity} shelf · {batch.backroomQuantity} back</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Expected Sales</span>
              <span className="text-lg font-black text-slate-900 font-mono mt-0.5 block">
                {assessment?.expectedSalesBeforeExpiry ?? 0}
              </span>
              <span className="text-[10px] text-slate-400">before expiry</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">At-Risk Units</span>
              <span
                className={cn(
                  'text-lg font-black font-mono mt-0.5 block',
                  (assessment?.atRiskQuantity || 0) > 0 ? 'text-amber-600' : 'text-emerald-600'
                )}
              >
                {assessment?.atRiskQuantity ?? 0}
              </span>
              <span className="text-[10px] text-slate-400">projected waste</span>
            </div>
          </div>

          {/* Location & Batch Details */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-2xs">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-slate-500" />
              <span>Location & Storage Breakdown</span>
            </h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-sky-600 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-500 block">Shelf Display</span>
                  <span className="font-bold text-slate-900">{batch.shelfCode || 'Unassigned'} ({batch.shelfQuantity} units)</span>
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-600 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-500 block">Stockroom Pallet</span>
                  <span className="font-bold text-slate-900">{batch.storageLocationId} ({batch.backroomQuantity} units)</span>
                </div>
              </div>
            </div>

            {/* Expiry Timestamp Audit Row */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <div>
                  <span className="text-[10px] text-slate-500 block">Expiry Threshold</span>
                  <span className="font-mono font-bold text-slate-900">
                    {new Date(batch.expiresAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditingExpiry(!isEditingExpiry)}
                className="text-xs text-sky-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Audit Date</span>
              </button>
            </div>

            {/* Inline Expiry Edit Form */}
            {isEditingExpiry && (
              <form onSubmit={handleSaveAuditDate} className="p-3 bg-sky-50 border border-sky-200 rounded-xl space-y-2 text-xs">
                <div className="font-bold text-sky-950">Update Verified Physical Expiry</div>
                <input
                  type="datetime-local"
                  value={newExpiryInput}
                  onChange={(e) => setNewExpiryInput(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-sky-300 rounded-lg text-xs font-mono"
                  required
                />
                <input
                  type="text"
                  placeholder="Audit reason (e.g. Physical package label verified)..."
                  value={auditReasonInput}
                  onChange={(e) => setAuditReasonInput(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-sky-300 rounded-lg text-xs"
                  required
                />
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsEditingExpiry(false)}
                    className="px-2.5 py-1 bg-slate-200 text-slate-700 rounded-lg font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-bold shadow-xs"
                  >
                    Save Audit
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* FEFO Stock Rotation Multi-Batch Context */}
          {siblingBatches.length > 0 && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <RotateCw className="w-3.5 h-3.5 text-sky-600" />
                  <span>FEFO Multi-Batch Analysis</span>
                </h4>
                <span className="text-[10px] text-slate-500 font-medium">First Expire, First Out</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Other batches of {batch.productName} in store:
              </p>
              <div className="space-y-1.5">
                {siblingBatches.map((sb) => {
                  const sbHours = calculateHoursRemaining(sb.expiresAt)
                  const isNewer = new Date(sb.expiresAt).getTime() > new Date(batch.expiresAt).getTime()
                  return (
                    <div key={sb.id} className="p-2 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900 font-mono">{sb.batchNumber}</span>
                        <span className="text-slate-400 text-[11px] ml-1.5">({sb.quantity} units)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-slate-500">{formatExpiryTime(sbHours)}</span>
                        <span
                          className={cn(
                            'text-[9px] font-bold px-1.5 py-0.5 rounded',
                            isNewer ? 'bg-sky-100 text-sky-800' : 'bg-amber-100 text-amber-800'
                          )}
                        >
                          {isNewer ? 'Newer Stock' : 'Older Stock'}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Actions Footer */}
        <div className="p-5 border-t border-slate-200 bg-white space-y-2">
          {isExpired ? (
            <button
              onClick={handleRemoveExpired}
              className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs shadow-rose-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Remove Expired Stock from Floor</span>
            </button>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleCreateRotation}
                  className="py-2.5 px-3 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-xs shadow-sky-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Create Rotation Task</span>
                </button>
                <button
                  onClick={handleCreateCheck}
                  className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>Audit Expiry Task</span>
                </button>
              </div>

              {assessment?.recommendedAction === 'CONSIDER_MARKDOWN' && onOpenMarkdown && (
                <button
                  onClick={() => {
                    onClose()
                    onOpenMarkdown(batch.id)
                  }}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs shadow-amber-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Tag className="w-3.5 h-3.5" />
                  <span>Review Markdown Proposal</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
