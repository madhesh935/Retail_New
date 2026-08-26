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
      { label: 'Arrival Rate (Î»)', value: '2.8 / min' },
      { label: 'Service Rate (Î¼)', value: '1.5 / min' },
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
    <div className="rounded-lg border border-[#1E293B] bg-[#0F172A] p-3.5 space-y-3 select-none text-xs shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#1E293B]">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-[#1E293B] text-rose-400">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-white tracking-wide">
              Store Operations Brief
            </h3>
            <span className="text-[10px] text-rose-400 font-medium">
              2 issues require attention right now
            </span>
          </div>
        </div>

        <button
          onClick={() => navigate('/incidents-actions')}
          className="text-[11px] text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 cursor-pointer"
        >
          <span>View All Incidents</span>
          <ArrowRight className="h-3 w-3" />
        </button>
      </div>

      {/* Grid: 2 Priority Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {/* Issue 1: Checkout C1 */}
        <div className="p-3 rounded-lg bg-[#090D14] border border-rose-500/40 flex flex-col justify-between space-y-2">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-semibold text-rose-300 bg-rose-950/80 px-1.5 py-0.5 rounded border border-rose-500/40 uppercase">
                CRITICAL
              </span>
              <span className="text-[11px] text-white font-semibold">Checkout C1</span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 my-2 text-[11px]">
              <div className="bg-[#0F172A] p-2 rounded border border-[#1E293B]">
                <span className="text-slate-500 block text-[10px]">Queue Depth</span>
                <strong className="text-rose-400 text-xs">8 (Wait: 5.4m)</strong>
              </div>
              <div className="bg-[#0F172A] p-2 rounded border border-[#1E293B]">
                <span className="text-slate-500 block text-[10px]">Forecast +5m</span>
                <strong className="text-amber-300 text-xs">13 shoppers</strong>
              </div>
            </div>

            <div className="text-[11px] text-slate-300 leading-tight">
              <span className="text-emerald-400 font-medium block">Recommended: Open Counter C3</span>
              <span className="text-slate-400">Suggested: <strong className="text-white">Marcus Vance (S02)</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 pt-2 border-t border-[#1E293B] flex-wrap">
            <Button
              variant="outline"
              size="xs"
              onClick={() => navigate('/queues')}
              className="text-[11px] h-6 px-2 text-slate-300 border-[#1E293B] gap-1"
            >
              <ExternalLink className="h-3 w-3" />
              <span>View Queue</span>
            </Button>
            <Button
              variant="ghost"
              size="xs"
              onClick={() => onOpenWhy(c1WhyData)}
              className="text-[11px] h-6 px-1.5 text-cyan-400"
            >
              <HelpCircle className="h-3 w-3" />
              <span>Why?</span>
            </Button>
            <Button
              variant="action"
              size="xs"
              onClick={() => onAssignStaff('S02', 'Open Counter C3')}
              className="text-[11px] h-6 px-2.5 ml-auto"
            >
              <span>Assign</span>
            </Button>
          </div>
        </div>

        {/* Issue 2: Beverage Shelf B4 */}
        <div className="p-3 rounded-lg bg-[#090D14] border border-amber-500/40 flex flex-col justify-between space-y-2">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-semibold text-amber-300 bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-500/30 uppercase">
                HIGH PRIORITY
              </span>
              <span className="text-[11px] text-white font-semibold">Beverage B4</span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 my-2 text-[11px]">
              <div className="bg-[#0F172A] p-2 rounded border border-[#1E293B]">
                <span className="text-slate-500 block text-[10px]">Shelf Stock</span>
                <strong className="text-rose-400 text-xs">17% (3 units)</strong>
              </div>
              <div className="bg-[#0F172A] p-2 rounded border border-[#1E293B]">
                <span className="text-slate-500 block text-[10px]">Backroom</span>
                <strong className="text-emerald-400 text-xs">14 units in Bay 3B</strong>
              </div>
            </div>

            <div className="text-[11px] text-slate-300 leading-tight">
              <span className="text-emerald-400 font-medium block">Recommended: Restock now</span>
              <span className="text-slate-400">Suggested: <strong className="text-white">Liam O&apos;Connor (S03)</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 pt-2 border-t border-[#1E293B] flex-wrap">
            <Button
              variant="outline"
              size="xs"
              onClick={() => navigate('/inventory')}
              className="text-[11px] h-6 px-2 text-slate-300 border-[#1E293B] gap-1"
            >
              <ExternalLink className="h-3 w-3" />
              <span>View Shelf</span>
            </Button>
            <Button
              variant="ghost"
              size="xs"
              onClick={() => onOpenWhy(b4WhyData)}
              className="text-[11px] h-6 px-1.5 text-cyan-400"
            >
              <HelpCircle className="h-3 w-3" />
              <span>Why?</span>
            </Button>
            <Button
              variant="action"
              size="xs"
              onClick={() => onAssignStaff('S03', 'Replenish Beverage B4')}
              className="text-[11px] h-6 px-2.5 ml-auto"
            >
              <span>Assign</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
