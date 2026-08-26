import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  X,
  Box,
  ListOrdered,
  Layers,
  Camera,
  User,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  PackageCheck,
  TrendingDown,
  Clock,
  ExternalLink,
  MessageSquare,
  ShieldCheck,
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

  return (
    <div className="fixed inset-0 z-50 flex justify-end font-sans">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in-0"
        onClick={onClose}
      />

      {/* Slide-over panel */}
      <div className="relative w-full max-w-md h-full bg-[#0B0F17] border-l border-[#1E293B] z-10 flex flex-col shadow-2xl p-4 animate-in slide-in-from-right duration-200 select-none">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-md bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-mono font-bold text-xs">
              {entity.code}
            </div>
            <div>
              <h3 className="text-xs font-bold text-white font-mono uppercase">
                {entity.name}
              </h3>
              <span className="text-[10px] text-cyan-400 font-mono">
                Type: {entity.type.toUpperCase()} • Live Telemetry
              </span>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon-xs"
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content Body based on Entity Type */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs">
          {/* ========================================================================= */}
          {/* 1. SHELF INSPECTION (e.g. Shelf B4, C2, A1) */}
          {/* ========================================================================= */}
          {entity.type === 'shelf' && (
            <div className="space-y-3.5">
              <div className="p-3.5 rounded-lg bg-[#0F172A] border border-[#1E293B] space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-[11px]">Availability Status</span>
                  <StatusBadge
                    status={entity.data.status === 'CRITICAL' ? 'CRITICAL' : 'ONLINE'}
                    label={entity.data.status || 'OPTIMAL'}
                    size="sm"
                  />
                </div>

                <div className="text-sm font-bold text-white font-sans">
                  {entity.data.sku || entity.name}
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 font-mono">
                  <div className="bg-[#090D14] p-2 rounded border border-[#1E293B]">
                    <span className="text-[10px] text-slate-500 block font-sans">Visible Units</span>
                    <span className={cn('text-base font-bold', entity.data.status === 'CRITICAL' ? 'text-rose-400' : 'text-emerald-400')}>
                      {entity.data.visibleUnits !== undefined ? entity.data.visibleUnits : (entity.data.stock ?? 3)} units
                    </span>
                  </div>
                  <div className="bg-[#090D14] p-2 rounded border border-[#1E293B]">
                    <span className="text-[10px] text-slate-500 block font-sans">Backroom Stock</span>
                    <span className="text-base font-bold text-white">
                      {entity.data.backroomStock || entity.data.backroom || entity.data.posStock || 14} units
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-slate-300 pt-1">
                  <span>Demand Velocity: <strong className="text-amber-400">{entity.data.demand || 'High'}</strong></span>
                  <span>Updated: <strong className="text-slate-400">2 sec ago</strong></span>
                </div>

                {entity.data.predictedStockout && (
                  <div className="text-[11px] font-mono bg-rose-950/40 p-2 rounded border border-rose-500/30 text-rose-300 flex items-center justify-between">
                    <span>Predicted Stock-Out:</span>
                    <strong className="text-rose-400 font-bold">{entity.data.predictedStockout}</strong>
                  </div>
                )}
              </div>

              {/* Action Buttons for Shelf */}
              <div className="space-y-2 pt-1">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Operational Actions
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={isActionDispatched ? 'outline' : 'action'}
                    size="sm"
                    onClick={handleDispatch}
                    className="gap-1.5 text-xs justify-center"
                  >
                    {isActionDispatched ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                        <span>Refill Assigned</span>
                      </>
                    ) : (
                      <>
                        <PackageCheck className="h-3.5 w-3.5" />
                        <span>Assign Refill</span>
                      </>
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/inventory')}
                    className="gap-1.5 text-xs justify-center text-slate-300 hover:text-white"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>Open Inventory</span>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 2. CHECKOUT INSPECTION (e.g. Counter C1, C2, C3) */}
          {/* ========================================================================= */}
          {entity.type === 'checkout' && (
            <div className="space-y-3.5">
              <div className="p-3.5 rounded-lg bg-[#0F172A] border border-[#1E293B] space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-[11px]">Lane Status</span>
                  <StatusBadge
                    status={entity.data.status === 'CRITICAL' || entity.data.status === 'CONGESTED' ? 'CRITICAL' : entity.data.status === 'STANDBY' ? 'WARNING' : 'ONLINE'}
                    label={entity.data.status || 'ACTIVE'}
                    size="sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 font-mono">
                  <div className="bg-[#090D14] p-2 rounded border border-[#1E293B]">
                    <span className="text-[10px] text-slate-500 block font-sans">Current Queue</span>
                    <span className={cn('text-base font-bold', (entity.data.queueLength || 0) > 5 ? 'text-rose-400' : 'text-emerald-400')}>
                      {entity.data.queueLength} shoppers
                    </span>
                  </div>
                  <div className="bg-[#090D14] p-2 rounded border border-[#1E293B]">
                    <span className="text-[10px] text-slate-500 block font-sans">Estimated Wait</span>
                    <span className="text-base font-bold text-amber-400">
                      {entity.data.waitTime}
                    </span>
                  </div>
                </div>

                {entity.data.predictedIn5m && (
                  <div className="p-2 rounded bg-rose-950/30 border border-rose-500/30 text-[11px] font-mono text-rose-300 flex items-center justify-between">
                    <span>Forecast in +5 min:</span>
                    <strong className="text-rose-400 font-bold">{entity.data.predictedIn5m} shoppers (Risk: 92%)</strong>
                  </div>
                )}

                <div className="text-[11px] text-slate-300 font-mono flex items-center justify-between pt-1">
                  <span>Assigned Cashier:</span>
                  <strong className="text-white">{entity.data.staffName || 'Unassigned'}</strong>
                </div>
              </div>

              {/* Action Buttons for Checkout */}
              <div className="space-y-2 pt-1">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Queue Actions
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={isActionDispatched ? 'outline' : 'action'}
                    size="sm"
                    onClick={handleDispatch}
                    className="gap-1.5 text-xs justify-center"
                  >
                    {isActionDispatched ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                        <span>Staff Dispatched</span>
                      </>
                    ) : (
                      <>
                        <User className="h-3.5 w-3.5" />
                        <span>Assign Staff</span>
                      </>
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
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
                    className="gap-1.5 text-xs justify-center text-cyan-300 hover:text-cyan-200 border-cyan-500/40"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                    <span>Why Recommendation?</span>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 3. ZONE INSPECTION (e.g. Cold Beverages, Fresh Produce, Electronics) */}
          {/* ========================================================================= */}
          {entity.type === 'zone' && (
            <div className="space-y-3.5">
              <div className="p-3.5 rounded-lg bg-[#0F172A] border border-[#1E293B] space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-[11px]">Spatial Telemetry</span>
                  <StatusBadge status="ONLINE" label="Active Monitoring" size="sm" />
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 font-mono">
                  <div className="bg-[#090D14] p-2 rounded border border-[#1E293B]">
                    <span className="text-[10px] text-slate-500 block font-sans">Current Shoppers</span>
                    <span className="text-base font-bold text-cyan-400">
                      {entity.data.occupancy || 18}
                    </span>
                  </div>
                  <div className="bg-[#090D14] p-2 rounded border border-[#1E293B]">
                    <span className="text-[10px] text-slate-500 block font-sans">Avg Dwell</span>
                    <span className="text-base font-bold text-white">
                      {entity.data.avgDwell || '2m 14s'}
                    </span>
                  </div>
                </div>

                {entity.data.shelfHealth && (
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-300 pt-1">
                    <span>Shelf Health: <strong className="text-emerald-400">{entity.data.shelfHealth}</strong></span>
                    <span>Traffic: <strong className="text-cyan-300">{entity.data.traffic || 'High'}</strong></span>
                  </div>
                )}

                {entity.data.highRiskSku && (
                  <div className="p-2 rounded bg-[#090D14] border border-[#1E293B] text-[11px] font-mono space-y-1">
                    <div className="text-slate-400">High-Risk SKU: <strong className="text-rose-400">{entity.data.highRiskSku}</strong></div>
                    <div className="text-slate-400">Predicted Stock-Out: <strong className="text-amber-400">{entity.data.predictedStockout || '9 min'}</strong></div>
                    <div className="text-slate-400">Backroom Buffer: <strong className="text-white">{entity.data.backroom || 14} units</strong></div>
                  </div>
                )}
              </div>

              {/* Action Buttons for Zone */}
              <div className="space-y-2 pt-1">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Zone Operations
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/inventory')}
                    className="gap-1.5 text-xs justify-center text-slate-300 hover:text-white"
                  >
                    <Box className="h-3.5 w-3.5" />
                    <span>View Inventory</span>
                  </Button>

                  <Button
                    variant="action"
                    size="sm"
                    onClick={handleDispatch}
                    className="gap-1.5 text-xs justify-center"
                  >
                    <PackageCheck className="h-3.5 w-3.5" />
                    <span>Assign Refill</span>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* 4. INCIDENT INSPECTION */}
          {entity.type === 'incident' && (
            <div className="space-y-3.5">
              <div className="p-3.5 rounded-lg bg-[#0F172A] border border-amber-500/40 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-amber-400 text-[11px] font-bold flex items-center gap-1">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Floor Incident
                  </span>
                  <StatusBadge status="WARNING" label="IN PROGRESS" size="sm" />
                </div>

                <div className="text-sm font-bold text-white font-sans">
                  {entity.name}
                </div>

                <div className="p-2.5 rounded bg-[#090D14] border border-[#1E293B] text-[11px] font-mono space-y-1">
                  <div>Location: <strong className="text-white">{entity.data.location}</strong></div>
                  <div>Assigned: <strong className="text-purple-300">{entity.data.assignedTo}</strong></div>
                  <div>Status: <strong className="text-amber-400">Cone deployed • Cleaning</strong></div>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/incidents')}
                className="w-full gap-1.5 text-xs justify-center text-amber-300 border-amber-500/40 hover:bg-amber-950/40"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Open Incidents</span>
              </Button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-[#1E293B] flex items-center justify-between">
          <Button variant="ghost" size="xs" onClick={onClose} className="text-slate-400 hover:text-white">
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}
