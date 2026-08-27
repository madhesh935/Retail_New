import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  X,
  Box,
  CreditCard,
  Layers,
  Camera,
  User,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  PackageCheck,
  TrendingDown,
  Clock,
  ExternalLink,
  MapPin,
  ShieldAlert,
} from 'lucide-react'
import { SelectedEntity } from './StoreMapDigitalTwin'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/common/StatusBadge'
import { cn } from '@/lib/utils'

interface EntityDetailDrawerProps {
  entity: SelectedEntity | null
  onClose: () => void
  onOpenWhy?: (actionData: any) => void
}

export const EntityDetailDrawer: React.FC<EntityDetailDrawerProps> = ({
  entity,
  onClose,
  onOpenWhy,
}) => {
  const navigate = useNavigate()
  const [isActionDispatched, setIsActionDispatched] = useState(false)

  if (!entity) return null

  const handleDispatch = () => {
    setIsActionDispatched(true)
  }

  const getEntityIcon = () => {
    switch (entity.type) {
      case 'shelf':
        return <Box className="w-4 h-4 text-blue-600" />
      case 'checkout':
        return <CreditCard className="w-4 h-4 text-emerald-600" />
      case 'zone':
        return <Layers className="w-4 h-4 text-purple-600" />
      case 'incident':
        return <AlertTriangle className="w-4 h-4 text-amber-600" />
      case 'camera':
        return <Camera className="w-4 h-4 text-sky-600" />
      default:
        return <Box className="w-4 h-4 text-slate-600" />
    }
  }

  const getIconBg = () => {
    switch (entity.type) {
      case 'shelf':
        return 'bg-blue-50 border-blue-200'
      case 'checkout':
        return 'bg-emerald-50 border-emerald-200'
      case 'zone':
        return 'bg-purple-50 border-purple-200'
      case 'incident':
        return 'bg-amber-50 border-amber-200'
      case 'camera':
        return 'bg-sky-50 border-sky-200'
      default:
        return 'bg-slate-50 border-slate-200'
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end font-sans">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in-0"
        onClick={onClose}
      />

      {/* Slide-over panel */}
      <div className="relative w-full max-w-md h-full bg-white border-l border-slate-200 z-10 flex flex-col shadow-2xl p-5 animate-in slide-in-from-right duration-200 select-none">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className={cn('w-9 h-9 rounded-xl border flex items-center justify-center shadow-2xs shrink-0', getIconBg())}>
              {getEntityIcon()}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-slate-900 leading-tight">
                  {entity.name}
                </h3>
                {entity.code && (
                  <span className="font-mono text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded border border-slate-200/80 font-bold">
                    {entity.code}
                  </span>
                )}
              </div>
              <span className="text-[11px] text-slate-500 font-medium capitalize">
                {entity.type} inspection · Live Telemetry
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Body based on Entity Type */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs">
          {/* ========================================================================= */}
          {/* 1. SHELF INSPECTION (e.g. Shelf B4, C2, A1) */}
          {/* ========================================================================= */}
          {entity.type === 'shelf' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-xs font-semibold">Availability Status</span>
                  <StatusBadge
                    status={entity.data.status === 'CRITICAL' ? 'CRITICAL' : 'ONLINE'}
                    label={entity.data.status || 'OPTIMAL'}
                    size="sm"
                  />
                </div>

                <div className="text-base font-bold text-slate-900 leading-tight">
                  {entity.data.sku || entity.name}
                </div>

                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                    <span className="text-[11px] text-slate-500 block font-medium">Visible Units</span>
                    <span className={cn('text-lg font-bold font-mono', entity.data.status === 'CRITICAL' ? 'text-rose-600' : 'text-emerald-700')}>
                      {entity.data.visibleUnits !== undefined ? entity.data.visibleUnits : (entity.data.stock ?? 3)} units
                    </span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                    <span className="text-[11px] text-slate-500 block font-medium">Backroom Stock</span>
                    <span className="text-lg font-bold text-slate-900 font-mono">
                      {entity.data.backroomStock || entity.data.backroom || entity.data.posStock || 14} units
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600 pt-1 border-t border-slate-200/60">
                  <span>Demand: <strong className="text-amber-800">{entity.data.demand || 'High velocity'}</strong></span>
                  <span>Updated: <strong className="text-slate-500 font-mono">2s ago</strong></span>
                </div>

                {entity.data.predictedStockout && (
                  <div className="text-xs bg-rose-50 p-2.5 rounded-xl border border-rose-200 text-rose-800 flex items-center justify-between shadow-2xs">
                    <span className="font-semibold">Predicted Stock-Out:</span>
                    <strong className="text-rose-700 font-bold font-mono">{entity.data.predictedStockout}</strong>
                  </div>
                )}
              </div>

              {/* Action Buttons for Shelf */}
              <div className="space-y-2 pt-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Operational Actions
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleDispatch}
                    className={cn(
                      'py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs',
                      isActionDispatched
                        ? 'bg-emerald-600 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
                    )}
                  >
                    {isActionDispatched ? (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Refill Assigned</span>
                      </>
                    ) : (
                      <>
                        <PackageCheck className="h-4 w-4" />
                        <span>Assign Refill</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate('/inventory')}
                    className="py-2.5 px-3 rounded-xl text-xs font-bold text-slate-700 border border-slate-200 bg-white hover:bg-slate-100 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <ExternalLink className="h-4 w-4 text-slate-500" />
                    <span>Open Inventory</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 2. CHECKOUT INSPECTION (e.g. Counter C1, C2, C3) */}
          {/* ========================================================================= */}
          {entity.type === 'checkout' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-xs font-semibold">Lane Status</span>
                  <StatusBadge
                    status={entity.data.status === 'CRITICAL' || entity.data.status === 'CONGESTED' ? 'CRITICAL' : entity.data.status === 'STANDBY' ? 'WARNING' : 'ONLINE'}
                    label={entity.data.status || 'ACTIVE'}
                    size="sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                    <span className="text-[11px] text-slate-500 block font-medium">Current Queue</span>
                    <span className={cn('text-lg font-bold font-mono', (entity.data.queueLength || 0) > 5 ? 'text-rose-600' : 'text-emerald-700')}>
                      {entity.data.queueLength} shoppers
                    </span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                    <span className="text-[11px] text-slate-500 block font-medium">Estimated Wait</span>
                    <span className="text-lg font-bold text-amber-700 font-mono">
                      {entity.data.waitTime}
                    </span>
                  </div>
                </div>

                {entity.data.predictedIn5m && (
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center justify-between shadow-2xs">
                    <span className="font-semibold">Forecast in +5 min:</span>
                    <strong className="text-rose-700 font-bold font-mono">{entity.data.predictedIn5m} shoppers (Risk: 92%)</strong>
                  </div>
                )}

                <div className="text-xs text-slate-700 flex items-center justify-between pt-1 border-t border-slate-200/60">
                  <span className="text-slate-500">Assigned Cashier:</span>
                  <strong className="text-slate-900 font-bold">{entity.data.staffName || 'Unassigned'}</strong>
                </div>
              </div>

              {/* Action Buttons for Checkout */}
              <div className="space-y-2 pt-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Queue Operations
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleDispatch}
                    className={cn(
                      'py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs',
                      isActionDispatched
                        ? 'bg-emerald-600 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
                    )}
                  >
                    {isActionDispatched ? (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Staff Dispatched</span>
                      </>
                    ) : (
                      <>
                        <User className="h-4 w-4" />
                        <span>Assign Staff</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenWhy) {
                        onOpenWhy({
                          title: 'Why Open Standby Counter C3?',
                          recommendation: 'Open Standby Counter C3 & Reallocate Marcus Vance',
                          confidenceScore: 92,
                          arrivalRate: '4.2 shoppers/min (Rising)',
                          serviceRate: '1.8 transactions/min (Counter C1)',
                          predictedWaitIn5Min: '8.5 minutes (Threshold SLA: 4.0 min)',
                          impactSummary: 'Reduces peak queue from 13 to 4 shoppers in 3.5 minutes.',
                          alternativeAction: 'Keep Counter C1 single-lane: wait climbs to 9.2 min by 18:07.',
                        })
                      }
                    }}
                    className="py-2.5 px-3 rounded-xl text-xs font-bold text-blue-700 hover:text-blue-800 border border-slate-200 bg-white hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Sparkles className="h-4 w-4 text-blue-600" />
                    <span>Why Recommendation?</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 3. ZONE INSPECTION (e.g. Cold Beverages, Fresh Produce, Electronics) */}
          {/* ========================================================================= */}
          {entity.type === 'zone' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-xs font-semibold">Spatial Telemetry</span>
                  <StatusBadge status="ONLINE" label="Active Monitoring" size="sm" />
                </div>

                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                    <span className="text-[11px] text-slate-500 block font-medium">Current Shoppers</span>
                    <span className="text-lg font-bold text-blue-700 font-mono">
                      {entity.data.occupancy || 18}
                    </span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                    <span className="text-[11px] text-slate-500 block font-medium">Avg Dwell</span>
                    <span className="text-lg font-bold text-slate-900 font-mono">
                      {entity.data.avgDwell || '2m 14s'}
                    </span>
                  </div>
                </div>

                {entity.data.shelfHealth && (
                  <div className="flex items-center justify-between text-xs text-slate-700 pt-1 border-t border-slate-200/60">
                    <span>Shelf Health: <strong className="text-emerald-700">{entity.data.shelfHealth}</strong></span>
                    <span>Traffic: <strong className="text-blue-700">{entity.data.traffic || 'High'}</strong></span>
                  </div>
                )}

                {entity.data.highRiskSku && (
                  <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs space-y-1.5 shadow-2xs">
                    <div className="text-slate-600 flex justify-between">
                      <span>High-Risk SKU:</span>
                      <strong className="text-rose-600 font-bold">{entity.data.highRiskSku}</strong>
                    </div>
                    <div className="text-slate-600 flex justify-between">
                      <span>Predicted Stock-Out:</span>
                      <strong className="text-amber-700 font-bold font-mono">{entity.data.predictedStockout || '9 min'}</strong>
                    </div>
                    <div className="text-slate-600 flex justify-between">
                      <span>Backroom Buffer:</span>
                      <strong className="text-slate-900 font-bold font-mono">{entity.data.backroom || 14} units</strong>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons for Zone */}
              <div className="space-y-2 pt-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Zone Operations
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => navigate('/inventory')}
                    className="py-2.5 px-3 rounded-xl text-xs font-bold text-slate-700 border border-slate-200 bg-white hover:bg-slate-100 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Box className="h-4 w-4 text-slate-500" />
                    <span>View Inventory</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDispatch}
                    className="py-2.5 px-3 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs shadow-blue-500/20"
                  >
                    <PackageCheck className="h-4 w-4" />
                    <span>Assign Refill</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 4. INCIDENT INSPECTION (Fixed Clean Box) */}
          {/* ========================================================================= */}
          {entity.type === 'incident' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/90 space-y-3.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-amber-900 text-xs font-bold flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <span>Floor Incident</span>
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300 font-mono uppercase">
                    In Progress
                  </span>
                </div>

                <div>
                  <h4 className="text-base font-bold text-slate-900 leading-tight">
                    {entity.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Live floor hazard detected by Computer Vision
                  </p>
                </div>

                {/* Structured Clean Key-Value List */}
                <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-2 shadow-2xs text-xs">
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Location</span>
                    <strong className="text-slate-900 font-semibold flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-blue-600" />
                      <span>{entity.data.location || 'Cooler 2 Floor'}</span>
                    </strong>
                  </div>

                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Assigned Associate</span>
                    <strong className="text-blue-700 font-semibold flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-blue-600" />
                      <span>{entity.data.assignedTo || 'Sarah Jenkins'}</span>
                    </strong>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Mitigation Status</span>
                    <strong className="text-amber-700 font-semibold">
                      Caution Cone Deployed · Cleaning
                    </strong>
                  </div>
                </div>
              </div>

              {/* Primary Action Button */}
              <button
                type="button"
                onClick={() => navigate('/incidents')}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <ExternalLink className="h-4 w-4" />
                <span>Open Incidents Hub</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3.5 border-t border-slate-100 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
