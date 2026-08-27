import React, { useState } from 'react'
import {
  ListOrdered,
  UserCheck,
  Eye,
  HelpCircle,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { WhyDialogData } from '@/components/command-center/WhyRecommendationDialog'
import { cn } from '@/lib/utils'

export interface PriorityItem {
  rank: number
  shelfId: string
  code: string
  name: string
  priorityScore: number
  availability: number
  demand: 'Very High' | 'High' | 'Moderate'
  stockoutMinutes: number
  posStock: number
  visibleUnits: number
  sku: string
  recommendation: string
  backroomBay: string
  suggestedStaff: string
  taskStatus: 'Needs Action' | 'Assigned' | 'In Progress' | 'Verified'
  assignedTo?: string
  whyData: WhyDialogData
}

interface ReplenishmentPriorityListProps {
  onSelectShelf: (shelfCode: string) => void
  onOpenWhy: (data: WhyDialogData) => void
}

export const REPLENISHMENT_PRIORITIES: PriorityItem[] = [
  {
    rank: 1,
    shelfId: 'shelf-b4',
    code: 'B4',
    name: 'Shelf B4',
    priorityScore: 94,
    availability: 17,
    demand: 'Very High',
    stockoutMinutes: 9,
    posStock: 14,
    visibleUnits: 3,
    sku: 'Sparkling Cola Zero 12-Pack',
    recommendation: 'Replenish immediately',
    backroomBay: 'Bay 3B (14 units in stockroom)',
    suggestedStaff: 'Liam O\'Connor (S04)',
    taskStatus: 'Needs Action',
    whyData: {
      title: 'Replenishment Priority #1: Beverage B4',
      actionType: 'STOCKOUT',
      targetEntity: 'Shelf B4 — Beverage Zone',
      signals: [
        { label: 'Current Visible Units', value: '3 units', highlight: true },
        { label: 'Consumption Velocity', value: '0.33 units / min (20.4/hr)' },
        { label: 'Store Backroom Stock', value: '14 units' },
        { label: 'Predicted Empty Time', value: '~9 min', highlight: true },
        { label: 'Priority Score', value: '94 / 100' },
      ],
      mathFormula: 'T_empty = Visible / Velocity = 3 / 0.333 = 9.0 min (Threshold < 15 min)',
      threshold: '< 15 mins to Stockout Threshold',
      confidence: '94% (Camera + POS Validation)',
      conclusion: 'Dispatch Liam O\'Connor to restock Shelf B4 with 14 units from Backroom Bay 3B',
      edgeModel: 'Vision + Inventory Sync (Live Engine)',
    },
  },
  {
    rank: 2,
    shelfId: 'shelf-d2',
    code: 'D2',
    name: 'Shelf D2',
    priorityScore: 81,
    availability: 24,
    demand: 'High',
    stockoutMinutes: 17,
    posStock: 18,
    visibleUnits: 5,
    sku: 'Whole Roasted Almonds 200g',
    recommendation: 'Restock within 15 min',
    backroomBay: 'Bay 2A (18 units in stockroom)',
    suggestedStaff: 'Sarah Jenkins (S05)',
    taskStatus: 'Assigned',
    assignedTo: 'S05',
    whyData: {
      title: 'Replenishment Priority #2: Snacks D2',
      actionType: 'STOCKOUT',
      targetEntity: 'Shelf D2 — Snacks Gondola',
      signals: [
        { label: 'Current Visible Units', value: '5 units', highlight: true },
        { label: 'Consumption Velocity', value: '0.29 units / min' },
        { label: 'Store Backroom Stock', value: '18 units' },
        { label: 'Predicted Empty Time', value: '~17 min', highlight: true },
        { label: 'Priority Score', value: '81 / 100' },
      ],
      mathFormula: 'T_empty = 5 / 0.294 = 17.0 min',
      threshold: '< 20 mins to Stockout',
      confidence: '91%',
      conclusion: 'Sarah Jenkins assigned to restock Shelf D2',
      edgeModel: 'Vision + Inventory Sync',
    },
  },
  {
    rank: 3,
    shelfId: 'shelf-d4',
    code: 'D4',
    name: 'Shelf D4',
    priorityScore: 73,
    availability: 31,
    demand: 'Moderate',
    stockoutMinutes: 28,
    posStock: 22,
    visibleUnits: 8,
    sku: 'Kettle Cooked Potato Chips',
    recommendation: 'Queue for next cycle',
    backroomBay: 'Bay 4B (22 units in stockroom)',
    suggestedStaff: 'Marcus Vance (S02)',
    taskStatus: 'Needs Action',
    whyData: {
      title: 'Replenishment Priority #3: Snacks D4',
      actionType: 'STOCKOUT',
      targetEntity: 'Shelf D4 — Snacks Gondola',
      signals: [
        { label: 'Current Visible Units', value: '8 units', highlight: true },
        { label: 'Consumption Velocity', value: '0.28 units / min' },
        { label: 'Store Backroom Stock', value: '22 units' },
        { label: 'Predicted Empty Time', value: '~28 min' },
        { label: 'Priority Score', value: '73 / 100' },
      ],
      mathFormula: 'T_empty = 8 / 0.285 = 28.0 min',
      threshold: '< 30 mins to Stockout',
      confidence: '88%',
      conclusion: 'Queue for next replenishment cycle',
      edgeModel: 'Vision + Inventory Sync',
    },
  },
  {
    rank: 4,
    shelfId: 'shelf-a3',
    code: 'A3',
    name: 'Shelf A3',
    priorityScore: 68,
    availability: 42,
    demand: 'Moderate',
    stockoutMinutes: 45,
    posStock: 30,
    visibleUnits: 12,
    sku: 'Organic Hass Avocados',
    recommendation: 'Restock within 45 min',
    backroomBay: 'Produce Cold Bay 1',
    suggestedStaff: 'Elena Rostova (S01)',
    taskStatus: 'Needs Action',
    whyData: {
      title: 'Replenishment Priority #4: Produce A3',
      actionType: 'STOCKOUT',
      targetEntity: 'Shelf A3 — Fresh Produce',
      signals: [
        { label: 'Current Visible Units', value: '12 units' },
        { label: 'Consumption Velocity', value: '0.26 units / min' },
        { label: 'Store Backroom Stock', value: '30 units' },
        { label: 'Predicted Empty Time', value: '~45 min' },
      ],
      mathFormula: 'T_empty = 12 / 0.266 = 45.1 min',
      threshold: '< 60 mins',
      confidence: '90%',
      conclusion: 'Schedule restock in next produce sweep',
      edgeModel: 'Vision + Inventory Sync',
    },
  },
]

export const ReplenishmentPriorityList: React.FC<ReplenishmentPriorityListProps> = ({
  onSelectShelf,
  onOpenWhy,
}) => {
  const [showAll, setShowAll] = useState(false)
  const [assignedTasks, setAssignedTasks] = useState<Record<number, string>>({
    2: 'S05', // D2 is pre-assigned to S05
  })

  const handleAssign = (rank: number, staffCode: string) => {
    setAssignedTasks((prev) => ({ ...prev, [rank]: staffCode }))
  }

  const displayedPriorities = showAll
    ? REPLENISHMENT_PRIORITIES
    : REPLENISHMENT_PRIORITIES.slice(0, 3)

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 flex flex-col justify-between shadow-2xs select-none h-full min-h-[460px] font-sans">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-amber-50 text-amber-600 border border-amber-200">
            <ListOrdered className="h-3.5 w-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 tracking-wide">
              Replenishment Priorities
            </h3>
          </div>
        </div>

        <span className="text-[10px] text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
          AI Ranked
        </span>
      </div>

      {/* Priority Cards (Top 3 by Default) */}
      <div className="space-y-2.5 flex-1">
        {displayedPriorities.map((item) => {
          const isCritical = item.rank === 1
          const assignedStaff = assignedTasks[item.rank]
          const isAssigned = !!assignedStaff

          return (
            <div
              key={item.rank}
              className={cn(
                'p-3 rounded-xl border space-y-2 transition-all shadow-2xs',
                isCritical
                  ? 'bg-rose-50/20 border-rose-200'
                  : item.rank === 2
                  ? 'bg-amber-50/20 border-amber-200'
                  : 'bg-slate-50 border-slate-200'
              )}
            >
              {/* Header Row: Rank, Shelf & Status */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={cn(
                      'text-[10px] font-bold px-1.5 py-0.5 rounded font-mono text-white shrink-0',
                      isCritical ? 'bg-rose-600' : item.rank === 2 ? 'bg-amber-600' : 'bg-slate-700'
                    )}
                  >
                    #{item.rank}
                  </span>
                  <span className="text-xs font-bold text-slate-900 font-mono shrink-0">{item.name}</span>
                  <span className="text-xs text-slate-700 font-medium truncate">
                    {item.sku}
                  </span>
                </div>

                <span
                  className={cn(
                    'text-[9px] px-2 py-0.5 rounded-md font-bold shrink-0 uppercase tracking-wide border',
                    isCritical
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  )}
                >
                  {isCritical ? 'CRITICAL' : 'HIGH'}
                </span>
              </div>

              {/* Middle Metrics Row */}
              <div className="flex items-center justify-between gap-2 text-[11px] bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-2xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 text-[10px] font-sans">Availability:</span>
                  <strong className={isCritical ? 'text-rose-700' : 'text-amber-800'}>
                    {item.availability}%
                  </strong>
                  <span className="text-slate-300">·</span>
                  <span className="text-slate-500 text-[10px] font-sans">Backroom:</span>
                  <span className="text-slate-900 font-bold">{item.posStock}</span>
                </div>

                <div className="flex items-center gap-1.5 text-right">
                  <span className="text-slate-500 text-[10px] font-sans">Stockout:</span>
                  <strong className="text-rose-700">~{item.stockoutMinutes} min</strong>
                </div>
              </div>

              {/* Bottom Action Row: Recommendation on Left, Actions on Right */}
              <div className="flex items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-1.5 text-[11px]">
                  {isAssigned ? (
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-[11px] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Assigned ({assignedStaff})</span>
                    </span>
                  ) : (
                    <span className="text-amber-800 font-medium text-[11px] font-sans">
                      {item.recommendation}
                    </span>
                  )}
                </div>

                {/* Right-aligned Buttons */}
                <div className="flex items-center gap-1.5 shrink-0 font-sans">
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => onOpenWhy(item.whyData)}
                    className="text-sky-700 hover:text-sky-800 gap-1 text-[11px] h-7 px-2"
                  >
                    <HelpCircle className="h-3 w-3" />
                    <span>Why?</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => onSelectShelf(item.shelfId)}
                    className="gap-1 text-[11px] h-7 px-2 text-slate-700 border-slate-200 bg-white hover:bg-slate-50 shadow-2xs"
                  >
                    <Eye className="h-3 w-3" />
                    <span>View Shelf</span>
                  </Button>

                  {!isAssigned && (
                    <Button
                      variant="action"
                      size="xs"
                      onClick={() => handleAssign(item.rank, 'S04')}
                      className="gap-1 text-[11px] h-7 px-2.5 bg-sky-600 hover:bg-sky-700 text-white"
                    >
                      <UserCheck className="h-3 w-3" />
                      <span>Assign</span>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer / View All Toggle */}
      <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between text-xs font-sans">
        <span className="text-slate-500 text-[11px]">
          Showing top {displayedPriorities.length} of {REPLENISHMENT_PRIORITIES.length} urgent facings
        </span>
        <button
          onClick={() => setShowAll(!showAll)}
          className="text-sky-700 hover:text-sky-800 font-semibold text-[11px] flex items-center gap-1 cursor-pointer"
        >
          <span>{showAll ? 'Show Top 3 Only' : 'View All Priorities →'}</span>
        </button>
      </div>
    </div>
  )
}
