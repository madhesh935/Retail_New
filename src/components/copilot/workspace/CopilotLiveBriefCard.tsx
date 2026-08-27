import React from 'react'
import {
  Sparkles,
  ArrowRight,
  HelpCircle,
  Camera,
  UserCheck,
  ExternalLink,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import { WhyDialogData } from '@/components/command-center/WhyRecommendationDialog'

interface CopilotLiveBriefCardProps {
  onViewCamera: (cameraCode: string, title: string) => void
  onOpenWhy: (data: WhyDialogData) => void
  onAssignStaff: (staffId: string, taskTitle: string) => void
}

export const CopilotLiveBriefCard: React.FC<CopilotLiveBriefCardProps> = ({
  onViewCamera,
  onOpenWhy,
  onAssignStaff,
}) => {
  const navigate = useNavigate()

  const c1WhyData: WhyDialogData = {
    title: 'Counter C1 Congestion Rate Breakdown',
    actionType: 'QUEUE',
    targetEntity: 'Checkout Counter C1',
    signals: [
      { label: 'Current Queue Depth', value: '8 shoppers', highlight: true },
      { label: 'Arrival Rate (λ)', value: '2.8 / min' },
      { label: 'Service Rate (μ)', value: '1.5 / min' },
      { label: 'Forecast +5 min', value: '13 shoppers', highlight: true },
    ],
    threshold: '10 Shoppers Queue / 3.0 min Wait SLA',
    confidence: '92% telemetry confidence',
    conclusion: 'Open Standby Counter C3 and reallocate Marcus Vance (S02)',
    edgeModel: 'Queue Analysis Stream',
  }

  const b4WhyData: WhyDialogData = {
    title: 'Replenishment Priority: Beverage B4',
    actionType: 'STOCKOUT',
    targetEntity: 'Shelf B4 — Cold Beverages',
    signals: [
      { label: 'Current Visible Units', value: '3 units', highlight: true },
      { label: 'Consumption Velocity', value: '0.33 units / min' },
      { label: 'Backroom Available', value: '14 units (Bay 3B)' },
      { label: 'Predicted Stockout', value: '9 min', highlight: true },
    ],
    threshold: '< 25% Shelf Stockout Threshold',
    confidence: '94% inventory confidence',
    conclusion: 'Dispatch Liam O\'Connor to replenish 24 units from stockroom',
    edgeModel: 'Shelf Inventory Vision',
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-3 select-none text-xs shadow-2xs font-sans">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-rose-50 border border-rose-200 text-rose-600">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 tracking-wide">
              Store Operations Brief
            </h3>
            <span className="text-[10px] text-rose-700 font-semibold">
              2 issues require attention right now
            </span>
          </div>
        </div>

        <button
          onClick={() => navigate('/incidents-actions')}
          className="text-[11px] text-sky-700 hover:text-sky-800 font-bold flex items-center gap-1 cursor-pointer"
        >
          <span>View All Incidents</span>
          <ArrowRight className="h-3 w-3" />
        </button>
      </div>

      {/* Grid: 2 Priority Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {/* Issue 1: Checkout C1 */}
        <div className="p-3 rounded-xl bg-rose-50/20 border border-rose-200 flex flex-col justify-between space-y-2 shadow-2xs">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200 uppercase font-mono">
                CRITICAL
              </span>
              <span className="text-[11px] text-slate-900 font-bold">Checkout C1</span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 my-2 text-[11px]">
              <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                <span className="text-slate-500 block text-[10px]">Queue Depth</span>
                <strong className="text-rose-700 text-xs font-mono font-bold">8 (Wait: 5.4m)</strong>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                <span className="text-slate-500 block text-[10px]">Forecast +5m</span>
                <strong className="text-amber-800 text-xs font-mono font-bold">13 shoppers</strong>
              </div>
            </div>

            <div className="text-[11px] text-slate-700 leading-tight">
              <span className="text-emerald-800 font-bold block">Recommended: Open Counter C3</span>
              <span className="text-slate-500">Suggested: <strong className="text-slate-900">Marcus Vance (S02)</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 pt-2 border-t border-rose-200/60 flex-wrap">
            <Button
              variant="outline"
              size="xs"
              onClick={() => navigate('/queues')}
              className="text-[11px] h-6 px-2 text-slate-700 border-slate-200 bg-white hover:bg-slate-50 gap-1 shadow-2xs font-semibold"
            >
              <ExternalLink className="h-3 w-3" />
              <span>View Queue</span>
            </Button>
            <Button
              variant="ghost"
              size="xs"
              onClick={() => onOpenWhy(c1WhyData)}
              className="text-[11px] h-6 px-1.5 text-sky-700 font-bold hover:bg-sky-50"
            >
              <HelpCircle className="h-3 w-3" />
              <span>Why?</span>
            </Button>
            <Button
              variant="action"
              size="xs"
              onClick={() => onAssignStaff('S02', 'Open Counter C3')}
              className="text-[11px] h-6 px-2.5 ml-auto bg-sky-600 hover:bg-sky-700 text-white font-semibold"
            >
              <span>Assign</span>
            </Button>
          </div>
        </div>

        {/* Issue 2: Beverage Shelf B4 */}
        <div className="p-3 rounded-xl bg-amber-50/20 border border-amber-200 flex flex-col justify-between space-y-2 shadow-2xs">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 uppercase font-mono">
                HIGH PRIORITY
              </span>
              <span className="text-[11px] text-slate-900 font-bold">Beverage B4</span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 my-2 text-[11px]">
              <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                <span className="text-slate-500 block text-[10px]">Shelf Stock</span>
                <strong className="text-rose-700 text-xs font-mono font-bold">17% (3 units)</strong>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                <span className="text-slate-500 block text-[10px]">Backroom</span>
                <strong className="text-emerald-700 text-xs font-mono font-bold">14 units in Bay 3B</strong>
              </div>
            </div>

            <div className="text-[11px] text-slate-700 leading-tight">
              <span className="text-emerald-800 font-bold block">Recommended: Restock now</span>
              <span className="text-slate-500">Suggested: <strong className="text-slate-900">Liam O&apos;Connor (S03)</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 pt-2 border-t border-amber-200/60 flex-wrap">
            <Button
              variant="outline"
              size="xs"
              onClick={() => navigate('/inventory')}
              className="text-[11px] h-6 px-2 text-slate-700 border-slate-200 bg-white hover:bg-slate-50 gap-1 shadow-2xs font-semibold"
            >
              <ExternalLink className="h-3 w-3" />
              <span>View Shelf</span>
            </Button>
            <Button
              variant="ghost"
              size="xs"
              onClick={() => onOpenWhy(b4WhyData)}
              className="text-[11px] h-6 px-1.5 text-sky-700 font-bold hover:bg-sky-50"
            >
              <HelpCircle className="h-3 w-3" />
              <span>Why?</span>
            </Button>
            <Button
              variant="action"
              size="xs"
              onClick={() => onAssignStaff('S03', 'Replenish Beverage B4')}
              className="text-[11px] h-6 px-2.5 ml-auto bg-sky-600 hover:bg-sky-700 text-white font-semibold"
            >
              <span>Assign</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
