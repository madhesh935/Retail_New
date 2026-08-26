import React, { useState } from 'react'
import {
  TrendingDown,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

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

  const risks: LostSaleItem[] = [
    {
      id: 'risk-01',
      category: 'Cold Beverages (Aisle B)',
      riskLevel: 'HIGH',
      traffic: 'High traffic density',
      shelfAvailability: '17% (Shelf B4)',
      backroomStock: '14 units available',
      likelyIssue: 'Replenishment gap',
      recommendation: 'Replenish immediately',
    },
    {
      id: 'risk-02',
      category: 'Dairy & Chilled (Cooler Wall)',
      riskLevel: 'HIGH',
      traffic: 'High traffic density',
      shelfAvailability: '0% (Shelf C2 Whole Milk)',
      backroomStock: '24 units available',
      likelyIssue: 'Floor stockout',
      recommendation: 'Restock milk chiller wall',
    },
    {
      id: 'risk-03',
      category: 'Snacks & Confectionery (Aisle D)',
      riskLevel: 'MEDIUM',
      traffic: 'Moderate traffic',
      shelfAvailability: '24% (Shelf D2)',
      backroomStock: '18 units available',
      likelyIssue: 'Fast evening depletion',
      recommendation: 'Queue for next cycle',
    },
  ]

  return (
    <div className="rounded-lg border border-[#1E293B] bg-[#0F172A] p-4 flex flex-col justify-between shadow-sm select-none">
      {/* Collapsible Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-[#1E293B] text-amber-400">
            <TrendingDown className="h-3.5 w-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-white tracking-wide flex items-center gap-2">
              <span>Sales Opportunity Risk</span>
              <span className="text-amber-400 font-bold text-xs bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-500/30">
                2 High-Risk Zones
              </span>
            </h3>
            <span className="text-[11px] text-slate-400">
              High foot traffic zones with low shelf inventory
            </span>
          </div>
        </div>

        <Button
          variant="outline"
          size="xs"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-[11px] h-7 px-2.5 gap-1 text-slate-300 border-[#1E293B]"
        >
          <span>{isExpanded ? 'Collapse' : 'View Risks'}</span>
          {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </Button>
      </div>

      {/* Expanded Risk Items */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-[#1E293B] space-y-2.5">
          {risks.map((item) => {
            const isHigh = item.riskLevel === 'HIGH'

            return (
              <div
                key={item.id}
                className="p-3 rounded-lg border border-[#1E293B] bg-[#090D14] space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white text-xs">{item.category}</span>
                  <span
                    className={`px-2 py-0.5 rounded font-medium text-[10px] uppercase border ${
                      isHigh
                        ? 'bg-rose-950/80 text-rose-300 border-rose-500/40'
                        : 'bg-amber-950/80 text-amber-300 border-amber-500/30'
                    }`}
                  >
                    {item.riskLevel} RISK
                  </span>
                </div>

                {/* Attributes Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] bg-[#0F172A] p-2 rounded border border-[#1E293B]">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Traffic</span>
                    <span className="font-medium text-white">{item.traffic}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Shelf Availability</span>
                    <span className="font-medium text-rose-400">{item.shelfAvailability}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Backroom Stock</span>
                    <span className="font-medium text-emerald-400">{item.backroomStock}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Likely Issue</span>
                    <span className="font-medium text-amber-300">{item.likelyIssue}</span>
                  </div>
                </div>

                {/* Action */}
                <div className="flex items-center justify-between pt-1 text-[11px]">
                  <div className="text-slate-300">
                    <span className="text-slate-400">Action: </span>
                    <strong className="text-cyan-300 font-semibold">{item.recommendation}</strong>
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
