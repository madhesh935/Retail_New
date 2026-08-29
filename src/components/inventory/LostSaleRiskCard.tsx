import React, { useMemo, useState } from 'react'
import {
  TrendingDown,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/store/useAppStore'

export interface LostSaleItem {
  id: string
  category: string
  riskLevel: 'HIGH' | 'MEDIUM' | 'LOW'
  traffic: string
  shelfAvailability: string
  backroomStock: string
  likelyIssue: string
  recommendation: string
}

export const LostSaleRiskCard: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(true)
  const shelfItems = useAppStore((s) => s.shelfItems)

  const risks: LostSaleItem[] = useMemo(() => {
    const atRiskShelves = shelfItems.filter(
      (item) => item.status === 'LOW' || item.status === 'CRITICAL' || item.status === 'OUT_OF_STOCK'
    )

    const byZone = new Map<string, typeof atRiskShelves>()
    atRiskShelves.forEach((item) => {
      const key = item.zoneName || item.category
      const group = byZone.get(key)
      if (group) {
        group.push(item)
      } else {
        byZone.set(key, [item])
      }
    })

    return Array.from(byZone.entries()).map(([zone, items]) => {
      const hasOutOfStock = items.some((i) => i.status === 'OUT_OF_STOCK')
      const hasCritical = items.some((i) => i.status === 'CRITICAL')
      const riskLevel: 'HIGH' | 'MEDIUM' = hasOutOfStock || hasCritical ? 'HIGH' : 'MEDIUM'

      const worst = items.reduce((a, b) => {
        const aAvail = a.capacityCount > 0 ? a.currentCount / a.capacityCount : 0
        const bAvail = b.capacityCount > 0 ? b.currentCount / b.capacityCount : 0
        return bAvail < aAvail ? b : a
      })
      const worstAvailability = worst.capacityCount > 0
        ? Math.round((worst.currentCount / worst.capacityCount) * 100)
        : 0
      const totalBackroom = items.reduce((sum, i) => sum + (i.backroomUnits || 0), 0)

      const likelyIssue = hasOutOfStock
        ? 'Floor stockout'
        : hasCritical
        ? 'Replenishment gap'
        : 'Fast depletion'
      const recommendation = hasOutOfStock || hasCritical
        ? 'Replenish immediately'
        : 'Queue for next cycle'

      return {
        id: `risk-${worst.zoneId || zone}`,
        category: `${zone} (${items.length} shelf${items.length > 1 ? 's' : ''} at risk)`,
        riskLevel,
        traffic: `${items.length} at-risk shelf${items.length > 1 ? 's' : ''}`,
        shelfAvailability: `${worstAvailability}% (Shelf ${worst.shelfId})`,
        backroomStock: `${totalBackroom} units available`,
        likelyIssue,
        recommendation,
      }
    })
  }, [shelfItems])

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 flex flex-col justify-between shadow-2xs select-none font-sans">
      {/* Collapsible Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-amber-50 text-amber-600 border border-amber-200">
            <TrendingDown className="h-3.5 w-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 tracking-wide flex items-center gap-2">
              <span>Sales Opportunity Risk</span>
              <span className="text-amber-800 font-bold text-xs bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200">
                {risks.length} High-Risk Zone{risks.length === 1 ? '' : 's'}
              </span>
            </h3>
            <span className="text-[11px] text-slate-500">
              High foot traffic zones with low shelf inventory
            </span>
          </div>
        </div>

        <Button
          variant="outline"
          size="xs"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-[11px] h-7 px-2.5 gap-1 text-slate-700 border-slate-200 bg-white hover:bg-slate-50 shadow-2xs"
        >
          <span>{isExpanded ? 'Collapse' : 'View Risks'}</span>
          {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </Button>
      </div>

      {/* Expanded Risk Items */}
      {isExpanded && risks.length === 0 && (
        <div className="mt-3 pt-3 border-t border-slate-100 text-center py-4">
          <span className="text-xs font-semibold text-slate-500">No high-risk zones right now</span>
        </div>
      )}

      {isExpanded && risks.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-100 space-y-2.5">
          {risks.map((item) => {
            const isHigh = item.riskLevel === 'HIGH'

            return (
              <div
                key={item.id}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-2 text-xs shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs">{item.category}</span>
                  <span
                    className={`px-2 py-0.5 rounded-md font-semibold text-[10px] uppercase border ${
                      isHigh
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}
                  >
                    {item.riskLevel} RISK
                  </span>
                </div>

                {/* Attributes Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block font-sans">Traffic</span>
                    <span className="font-medium text-slate-900">{item.traffic}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block font-sans">Shelf Availability</span>
                    <span className="font-bold text-rose-700">{item.shelfAvailability}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block font-sans">Backroom Stock</span>
                    <span className="font-bold text-emerald-700">{item.backroomStock}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block font-sans">Likely Issue</span>
                    <span className="font-semibold text-amber-800">{item.likelyIssue}</span>
                  </div>
                </div>

                {/* Action */}
                <div className="flex items-center justify-between pt-1 text-[11px]">
                  <div className="text-slate-600">
                    <span className="text-slate-500 font-sans">Action: </span>
                    <strong className="text-sky-700 font-bold">{item.recommendation}</strong>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
