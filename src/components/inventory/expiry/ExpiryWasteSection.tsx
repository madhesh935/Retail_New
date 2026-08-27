import React, { useState } from 'react'
import {
  CalendarClock,
  AlertTriangle,
  Tag,
  Trash2,
  CheckCircle2,
  Clock,
  RotateCw,
  Eye,
  Filter,
  ArrowRight,
  TrendingDown,
  Layers,
  ChevronRight,
  Sparkles,
} from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { InventoryBatch, MarkdownCandidate } from '@/types/expiry.types'
import { formatExpiryTime, calculateHoursRemaining } from '@/services/expiry/expiryRiskEngine'
import { ExpiryDetailDrawer } from './ExpiryDetailDrawer'
import { MarkdownApprovalModal } from './MarkdownApprovalModal'
import { cn } from '@/lib/utils'

export const ExpiryWasteSection: React.FC = () => {
  const {
    inventoryBatches,
    expiryRiskAssessments,
    markdownCandidates,
    wasteRecords,
    expiryAnalyticsSummary,
    expiryTimelineFilter,
    setExpiryTimelineFilter,
    expiryQuickFilter,
    setExpiryQuickFilter,
    expiryCategoryFilter,
    setExpiryCategoryFilter,
    createRotationTask,
  } = useAppStore()

  // Selected batch for detail drawer
  const [selectedBatch, setSelectedBatch] = useState<InventoryBatch | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  // Markdown approval modal state
  const [selectedMarkdown, setSelectedMarkdown] = useState<MarkdownCandidate | null>(null)
  const [isMarkdownModalOpen, setIsMarkdownModalOpen] = useState(false)

  // Distinct categories for filter
  const categories = ['ALL', ...Array.from(new Set(inventoryBatches.map((b) => b.category)))]

  // Filtered batch rows
  const filteredBatches = inventoryBatches.filter((batch) => {
    const assessment = expiryRiskAssessments.find((a) => a.batchId === batch.id)
    const hours = calculateHoursRemaining(batch.expiresAt)

    // Category filter
    if (expiryCategoryFilter !== 'ALL' && batch.category !== expiryCategoryFilter) {
      return false
    }

    // Timeline filter (e.g. 'Today', 'Tomorrow', '2–3 Days', '4–7 Days')
    if (expiryTimelineFilter === 'Today' && (hours <= 0 || hours > 24)) return false
    if (expiryTimelineFilter === 'Tomorrow' && (hours <= 24 || hours > 48)) return false
    if (expiryTimelineFilter === '2–3 Days' && (hours <= 48 || hours > 72)) return false
    if (expiryTimelineFilter === '4–7 Days' && (hours <= 72 || hours > 168)) return false

    // Quick filters
    if (expiryQuickFilter === '<24H') {
      return hours > 0 && hours <= 24
    }
    if (expiryQuickFilter === '1-3DAYS') {
      return hours > 24 && hours <= 72
    }
    if (expiryQuickFilter === 'HIGH_RISK') {
      return assessment?.riskLevel === 'HIGH'
    }
    if (expiryQuickFilter === 'MARKDOWN') {
      return batch.status === 'MARKDOWN' || assessment?.recommendedAction === 'CONSIDER_MARKDOWN'
    }
    if (expiryQuickFilter === 'EXPIRED') {
      return hours <= 0 || batch.status === 'EXPIRED'
    }

    return true
  })

  const handleOpenDetail = (batch: InventoryBatch) => {
    setSelectedBatch(batch)
    setIsDetailOpen(true)
  }

  const handleOpenMarkdownModal = (batchId: string) => {
    const candidate = markdownCandidates.find((c) => c.batchId === batchId)
    if (candidate) {
      setSelectedMarkdown(candidate)
      setIsMarkdownModalOpen(true)
    }
  }

  return (
    <div className="space-y-5 select-none">
      {/* ======================================================= */}
      {/* 1. SECTION HEADER */}
      {/* ======================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-sky-600" />
            <span>EXPIRY & WASTE</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Track expiring inventory, markdown opportunities and recorded waste
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Real-time Batch Engine</span>
        </div>
      </div>

      {/* ======================================================= */}
      {/* 2. TOP 4 KPIS ONLY (Clean Apple/Shopify POS Style) */}
      {/* ======================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* KPI 1: Expiring Soon */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400">
            <span>Expiring Soon</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">
            {expiryAnalyticsSummary.expiringSoonSkusCount} <span className="text-sm font-semibold text-slate-500">SKUs</span>
          </div>
          <div className="text-[11px] text-amber-700 font-medium">In the next 72 hours</div>
        </div>

        {/* KPI 2: At-Risk Units */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400">
            <span>At-Risk Units</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-600 font-mono tracking-tight">
            {expiryAnalyticsSummary.atRiskUnitsTotal} <span className="text-sm font-semibold text-slate-500">units</span>
          </div>
          <div className="text-[11px] text-slate-500">Exceeds expected sales velocity</div>
        </div>

        {/* KPI 3: Markdown Candidates */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400">
            <span>Markdown Candidates</span>
            <Tag className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-purple-700 font-mono tracking-tight">
            {expiryAnalyticsSummary.markdownCandidatesCount} <span className="text-sm font-semibold text-slate-500">pending</span>
          </div>
          <div className="text-[11px] text-purple-800 font-medium">Requires Manager approval</div>
        </div>

        {/* KPI 4: Waste Today */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400">
            <span>Waste Today</span>
            <Trash2 className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-2xl font-black text-slate-800 font-mono tracking-tight">
            {expiryAnalyticsSummary.wasteTodayUnits} <span className="text-sm font-semibold text-slate-500">units</span>
          </div>
          <div className="text-[11px] text-emerald-700 font-medium">
            ✓ {expiryAnalyticsSummary.wasteAvoidedUnits} units waste avoided
          </div>
        </div>
      </div>

      {/* ======================================================= */}
      {/* 3. VISUALS: EXPIRY TIMELINE & CATEGORY RISK */}
      {/* ======================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Left: Expiry Timeline (Interactive Filter) */}
        <div className="lg:col-span-2 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-sky-600" />
              <span>Expiry Timeline Horizon</span>
            </h3>
            {expiryTimelineFilter && (
              <button
                onClick={() => setExpiryTimelineFilter(null)}
                className="text-[11px] text-sky-600 font-bold hover:underline cursor-pointer"
              >
                Reset Timeline
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {expiryAnalyticsSummary.timeline.map((bucket) => {
              const isSelected = expiryTimelineFilter === bucket.label
              return (
                <button
                  key={bucket.label}
                  onClick={() => setExpiryTimelineFilter(isSelected ? null : bucket.label)}
                  className={cn(
                    'p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between',
                    isSelected
                      ? 'border-sky-500 bg-sky-50/80 ring-1 ring-sky-500 shadow-2xs'
                      : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100/80'
                  )}
                >
                  <div className="flex items-center justify-between text-slate-500 text-[10px] font-bold uppercase">
                    <span>{bucket.label}</span>
                    <span className="font-mono">{bucket.hoursRange}</span>
                  </div>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span
                      className={cn(
                        'text-xl font-black font-mono',
                        bucket.count > 0 && bucket.label === 'Today'
                          ? 'text-rose-600'
                          : bucket.count > 0
                          ? 'text-slate-900'
                          : 'text-slate-400'
                      )}
                    >
                      {bucket.count}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">batches</span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Right: At-Risk By Category Visual */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-purple-600" />
            <span>At-Risk By Category</span>
          </h3>

          <div className="space-y-2 text-xs">
            {expiryAnalyticsSummary.categoryRisk.slice(0, 4).map((cat) => (
              <div key={cat.category} className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-medium text-slate-700">{cat.category}</span>
                  <span className="font-bold font-mono text-slate-900">{cat.atRiskUnits} units at risk</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full',
                      cat.category === 'Dairy'
                        ? 'bg-amber-500'
                        : cat.category === 'Bakery'
                        ? 'bg-purple-500'
                        : cat.category === 'Fresh Produce'
                        ? 'bg-emerald-500'
                        : 'bg-sky-500'
                    )}
                    style={{ width: `${Math.min(100, Math.max(15, cat.atRiskUnits * 5))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ======================================================= */}
      {/* 4. MARKDOWN APPROVAL QUEUE (IF ANY CANDIDATES) */}
      {/* ======================================================= */}
      {markdownCandidates.filter((c) => c.status === 'RECOMMENDED').length > 0 && (
        <div className="bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-white border border-amber-200 rounded-2xl p-4 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-amber-700" />
              <h3 className="text-xs font-bold text-amber-950 uppercase tracking-wide">
                Markdown Candidates Requiring Manager Approval
              </h3>
            </div>
            <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
              {markdownCandidates.filter((c) => c.status === 'RECOMMENDED').length} Actions Pending
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {markdownCandidates
              .filter((c) => c.status === 'RECOMMENDED')
              .map((c) => (
                <div
                  key={c.id}
                  className="bg-white p-3 rounded-xl border border-amber-200 shadow-2xs flex flex-col justify-between space-y-2 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase text-slate-400">{c.category}</span>
                      <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.2 rounded text-slate-600 font-bold">
                        {c.shelfCode}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 leading-tight">{c.productName}</h4>
                    <p className="text-[11px] text-slate-500">{c.atRiskQuantity} units at risk (expires in {formatExpiryTime(c.hoursRemaining)})</p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-mono">
                      <span className="text-slate-400 line-through text-xs">₹{c.currentPrice}</span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                      <span className="text-emerald-700 font-black text-sm">₹{c.suggestedNewPrice}</span>
                      <span className="text-[10px] text-amber-700 font-bold">(-{c.suggestedDiscountPercent}%)</span>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedMarkdown(c)
                        setIsMarkdownModalOpen(true)
                      }}
                      className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold shadow-2xs transition-all cursor-pointer"
                    >
                      Review
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* 5. COMPACT FILTERS */}
      {/* ======================================================= */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Quick Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1">
          {[
            { id: 'ALL', label: 'All Batches' },
            { id: '<24H', label: '< 24 Hours' },
            { id: '1-3DAYS', label: '1–3 Days' },
            { id: 'HIGH_RISK', label: 'High Risk' },
            { id: 'MARKDOWN', label: 'Markdown' },
            { id: 'EXPIRED', label: 'Expired' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setExpiryQuickFilter(tab.id as any)}
              className={cn(
                'px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer',
                expiryQuickFilter === tab.id
                  ? 'bg-slate-900 text-white shadow-2xs font-bold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Category Dropdown */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={expiryCategoryFilter}
            onChange={(e) => setExpiryCategoryFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'ALL' ? 'All Categories' : cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ======================================================= */}
      {/* 6. MAIN EXPIRY LIST (TABLE) */}
      {/* ======================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-3">Batch</th>
                <th className="py-3 px-3">Location</th>
                <th className="py-3 px-3 text-right">Quantity</th>
                <th className="py-3 px-3">Expires</th>
                <th className="py-3 px-3 text-right">At Risk</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBatches.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-1.5 opacity-60" />
                    <span className="font-bold text-slate-700 block">No immediate expiry risk</span>
                    <span className="text-[11px]">No products match the selected criteria.</span>
                  </td>
                </tr>
              ) : (
                filteredBatches.map((batch) => {
                  const assessment = expiryRiskAssessments.find((a) => a.batchId === batch.id)
                  const hours = calculateHoursRemaining(batch.expiresAt)
                  const isExpired = hours <= 0 || batch.status === 'EXPIRED'

                  return (
                    <tr
                      key={batch.id}
                      onClick={() => handleOpenDetail(batch)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      {/* Product */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 group-hover:text-sky-700 transition-colors">
                          {batch.productName}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">{batch.category} · {batch.productSku}</div>
                      </td>

                      {/* Batch */}
                      <td className="py-3 px-3 font-mono font-bold text-slate-700">
                        {batch.batchNumber}
                      </td>

                      {/* Location */}
                      <td className="py-3 px-3">
                        <span className="font-mono text-slate-900 font-bold bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                          {batch.shelfCode || 'C2'}
                        </span>
                        <span className="text-[10px] text-slate-400 ml-1">({batch.storageLocationId})</span>
                      </td>

                      {/* Quantity */}
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                        {batch.quantity}
                        <span className="text-[10px] text-slate-400 block font-sans">
                          {batch.shelfQuantity}s / {batch.backroomQuantity}b
                        </span>
                      </td>

                      {/* Expires */}
                      <td className="py-3 px-3">
                        <span
                          className={cn(
                            'font-mono font-bold',
                            isExpired
                              ? 'text-rose-700'
                              : hours <= 24
                              ? 'text-amber-700'
                              : 'text-slate-700'
                          )}
                        >
                          {formatExpiryTime(hours)}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          {new Date(batch.expiresAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                      </td>

                      {/* At Risk */}
                      <td className="py-3 px-3 text-right">
                        <span
                          className={cn(
                            'font-mono font-bold',
                            (assessment?.atRiskQuantity || 0) > 0 ? 'text-amber-600' : 'text-emerald-600'
                          )}
                        >
                          {assessment?.atRiskQuantity || 0} units
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 text-center">
                        <span
                          className={cn(
                            'px-2 py-0.5 rounded text-[10px] font-extrabold uppercase',
                            isExpired
                              ? 'bg-rose-100 text-rose-800'
                              : assessment?.riskLevel === 'HIGH'
                              ? 'bg-amber-100 text-amber-800'
                              : assessment?.riskLevel === 'MEDIUM'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-emerald-100 text-emerald-800'
                          )}
                        >
                          {isExpired ? 'EXPIRED' : assessment?.riskLevel || 'LOW'}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleOpenDetail(batch)
                          }}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-700 rounded-lg text-xs font-bold transition-all"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ======================================================= */}
      {/* 7. WASTE ANALYTICS & LOGGED RECORDS */}
      {/* ======================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Waste Logged Today */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Trash2 className="w-4 h-4 text-slate-500" />
              <span>Waste Activity Log (Today)</span>
            </h3>
            <span className="text-[11px] font-mono text-slate-400">
              {wasteRecords.length} records
            </span>
          </div>

          <div className="space-y-2 text-xs">
            {wasteRecords.map((w) => (
              <div key={w.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">{w.productName}</div>
                  <div className="text-[10px] text-slate-500">
                    {w.reason.replace(/_/g, ' ')} · {w.locationName} · Logged by {w.recordedByStaffName}
                  </div>
                </div>
                <div className="text-right font-mono">
                  <span className="font-bold text-rose-600 block">{w.quantity} units</span>
                  <span className="text-[10px] text-slate-400">₹{w.totalLossCost || 0} loss</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Waste Avoided & Top Waste Causes */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Waste Avoidance Intelligence</span>
            </h3>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              ✓ {expiryAnalyticsSummary.wasteAvoidedUnits} Units Saved
            </span>
          </div>

          <div className="p-3 bg-emerald-50/60 border border-emerald-100 rounded-xl space-y-1 text-xs text-emerald-950">
            <div className="font-bold">FEFO & Markdown Sell-Through Impact</div>
            <p className="text-[11px] leading-relaxed text-emerald-800">
              By rotating earliest-expiring stock to front facings and providing timely promotional markdowns, {expiryAnalyticsSummary.wasteAvoidedUnits} units have been successfully converted to customer sales instead of store shrink.
            </p>
          </div>

          <div className="space-y-2 text-xs">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Top Causes of Recorded Waste</div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Expired</span>
                <span className="font-bold text-slate-900 font-mono text-sm">3 units</span>
              </div>
              <div className="p-2 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Spoiled</span>
                <span className="font-bold text-slate-900 font-mono text-sm">2 units</span>
              </div>
              <div className="p-2 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Damaged</span>
                <span className="font-bold text-slate-900 font-mono text-sm">2 units</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Drawer & Markdown Modal */}
      <ExpiryDetailDrawer
        batch={selectedBatch}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onOpenMarkdown={handleOpenMarkdownModal}
      />

      <MarkdownApprovalModal
        candidate={selectedMarkdown}
        isOpen={isMarkdownModalOpen}
        onClose={() => setIsMarkdownModalOpen(false)}
      />
    </div>
  )
}
