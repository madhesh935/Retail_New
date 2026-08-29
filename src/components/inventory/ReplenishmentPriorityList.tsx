import React, { useMemo, useState } from 'react'
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
import { useAppStore } from '@/store/useAppStore'
import { ShelfItem, StaffMember } from '@/types'

export interface PriorityItem {
  rank: number
  shelfId: string
  code: string
  name: string
  priorityScore: number
  availability: number
  demand: 'Very High' | 'High' | 'Moderate'
  stockoutMinutes: number | null
  backroomUnits: number
  visibleUnits: number
  sku: string
  recommendation: string
  suggestedStaff: string
  taskStatus: 'Needs Action' | 'Assigned' | 'In Progress' | 'Verified'
  assignedTo?: string
  whyData: WhyDialogData
}

interface ReplenishmentPriorityListProps {
  onSelectShelf: (shelfCode: string) => void
  onOpenWhy: (data: WhyDialogData) => void
}

function buildPriorityItems(shelfItems: ShelfItem[], staffMembers: StaffMember[]): PriorityItem[] {
  const availableStaff = staffMembers.filter((s) => s.status === 'ON_DUTY_AVAILABLE')

  const atRisk = shelfItems
    .filter((item) => item.status === 'LOW' || item.status === 'CRITICAL' || item.status === 'OUT_OF_STOCK')
    .map((item) => {
      const availability = item.capacityCount > 0
        ? Math.round((item.currentCount / item.capacityCount) * 100)
        : 0
      const statusWeight = item.status === 'OUT_OF_STOCK' ? 40 : item.status === 'CRITICAL' ? 25 : 10
      const priorityScore = Math.max(0, Math.min(100, Math.round((100 - availability) * 0.6 + statusWeight)))
      return { item, availability, priorityScore }
    })
    .sort((a, b) => b.priorityScore - a.priorityScore)

  return atRisk.map(({ item, availability, priorityScore }, idx) => {
    const demand: PriorityItem['demand'] = item.status === 'OUT_OF_STOCK'
      ? 'Very High'
      : item.status === 'CRITICAL'
      ? 'High'
      : 'Moderate'
    const stockoutMinutes = typeof item.minutesUntilStockout === 'number'
      ? Math.round(item.minutesUntilStockout)
      : null
    const staff = availableStaff.length > 0 ? availableStaff[idx % availableStaff.length] : undefined
    const suggestedStaff = staff ? `${staff.name} (${staff.employeeId})` : 'No staff currently available'
    const recommendation = item.status === 'OUT_OF_STOCK' || item.status === 'CRITICAL'
      ? 'Replenish immediately'
      : 'Restock soon'

    const signals: WhyDialogData['signals'] = [
      { label: 'Current Visible Units', value: `${item.currentCount} units`, highlight: true },
      ...(typeof item.depletionRatePerHour === 'number' && item.depletionRatePerHour > 0
        ? [{ label: 'Consumption Velocity', value: `${item.depletionRatePerHour.toFixed(1)} units / hr` }]
        : []),
      { label: 'Store Backroom Stock', value: `${item.backroomUnits || 0} units` },
      ...(stockoutMinutes !== null
        ? [{ label: 'Predicted Empty Time', value: `~${stockoutMinutes} min`, highlight: true }]
        : []),
      { label: 'Priority Score', value: `${priorityScore} / 100` },
    ]

    return {
      rank: idx + 1,
      shelfId: item.id,
      code: item.shelfId,
      name: item.shelfName,
      priorityScore,
      availability,
      demand,
      stockoutMinutes,
      backroomUnits: item.backroomUnits || 0,
      visibleUnits: item.currentCount,
      sku: item.productName,
      recommendation,
      suggestedStaff,
      taskStatus: 'Needs Action',
      whyData: {
        title: `Replenishment Priority #${idx + 1}: ${item.productName}`,
        actionType: 'STOCKOUT',
        targetEntity: `Shelf ${item.shelfId} — ${item.zoneName}`,
        signals,
        threshold: `${availability}% shelf availability`,
        confidence: `${Math.round((item.confidenceScore || 0) * 100)}% (Vision Model Confidence)`,
        conclusion: staff
          ? `Dispatch ${staff.name} to restock Shelf ${item.shelfId}`
          : `Queue Shelf ${item.shelfId} for next replenishment cycle`,
        edgeModel: 'Vision + Inventory Sync (Live Engine)',
      },
    }
  })
}

export const ReplenishmentPriorityList: React.FC<ReplenishmentPriorityListProps> = ({
  onSelectShelf,
  onOpenWhy,
}) => {
  const [showAll, setShowAll] = useState(false)
  const [assignedTasks, setAssignedTasks] = useState<Record<number, string>>({})
  const shelfItems = useAppStore((s) => s.shelfItems)
  const staffMembers = useAppStore((s) => s.staffMembers)

  const priorities = useMemo(
    () => buildPriorityItems(shelfItems, staffMembers),
    [shelfItems, staffMembers]
  )
  const availableStaff = useMemo(
    () => staffMembers.filter((s) => s.status === 'ON_DUTY_AVAILABLE'),
    [staffMembers]
  )

  const handleAssign = (rank: number, staffCode: string) => {
    setAssignedTasks((prev) => ({ ...prev, [rank]: staffCode }))
  }

  const displayedPriorities = showAll
    ? priorities
    : priorities.slice(0, 3)

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
        {displayedPriorities.length === 0 && (
          <div className="text-center py-8">
            <span className="text-xs font-semibold text-slate-500">No shelves currently need replenishment</span>
          </div>
        )}
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
                  <span className="text-slate-900 font-bold">{item.backroomUnits}</span>
                </div>

                <div className="flex items-center gap-1.5 text-right">
                  <span className="text-slate-500 text-[10px] font-sans">Stockout:</span>
                  <strong className="text-rose-700">
                    {item.stockoutMinutes !== null ? `~${item.stockoutMinutes} min` : '—'}
                  </strong>
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
                      onClick={() => {
                        const staff = availableStaff[(item.rank - 1) % Math.max(availableStaff.length, 1)]
                        handleAssign(item.rank, staff?.employeeId || staff?.id || 'Unassigned')
                      }}
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
          Showing top {displayedPriorities.length} of {priorities.length} urgent facings
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
