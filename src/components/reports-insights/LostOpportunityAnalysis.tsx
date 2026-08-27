import React from 'react'
import {
  TrendingDown,
  AlertTriangle,
  Compass,
  DollarSign,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export interface OpportunityZone {
  rank: number
  zoneName: string
  riskLevel: 'HIGH' | 'MEDIUM' | 'LOW'
  causes: string[]
  estimatedLossPrevented: string
  keySku: string
  availability: number
}

export const OPPORTUNITY_ZONES: OpportunityZone[] = [
  {
    rank: 1,
    zoneName: 'Beverages (Aisle 4)',
    riskLevel: 'HIGH',
    causes: ['High Traffic Density (382 visitors)', 'High Dwell Time (52s avg)', 'Low Shelf Availability (17%)'],
    estimatedLossPrevented: '$1,240 / day',
    keySku: 'Sparkling Cola Zero 12pk (Shelf B4)',
    availability: 17,
  },
  {
    rank: 2,
    zoneName: 'Dairy & Chilled (Cooler Wall)',
    riskLevel: 'MEDIUM',
    causes: ['Moderate Traffic Inflow (315 visitors)', 'Cold Storage Bay Restock Lag', 'Zero Whole Milk on Floor (20m)'],
    estimatedLossPrevented: '$680 / day',
    keySku: 'Horizon Organic Whole Milk 1Gal (Shelf C2)',
    availability: 72,
  },
  {
    rank: 3,
    zoneName: 'Snacks & Pantry (Aisle 3)',
    riskLevel: 'LOW',
    causes: ['Minor Facing Gap in Almonds 200g', 'Prompt Restock from Bay 2A'],
    estimatedLossPrevented: '$190 / day',
    keySku: 'Whole Roasted Almonds 200g (Shelf D2)',
    availability: 84,
  },
]

export const LostOpportunityAnalysis: React.FC = () => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 flex flex-col justify-between shadow-2xs select-none font-sans h-full min-h-[440px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-rose-50 border border-rose-200 text-rose-600">
            <DollarSign className="h-3.5 w-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Lost-Opportunity Zone Ranking
            </h3>
          </div>
        </div>

        <span className="text-[10px] text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
          Ranked by Preventable Lost Sales
        </span>
      </div>

      {/* Ranked Zone Cards */}
      <div className="space-y-2.5">
        {OPPORTUNITY_ZONES.map((zone) => {
          const isHigh = zone.riskLevel === 'HIGH'
          const isMedium = zone.riskLevel === 'MEDIUM'

          return (
            <div
              key={zone.rank}
              className={cn(
                'p-3 rounded-xl border text-xs space-y-2 shadow-2xs',
                isHigh
                  ? 'bg-rose-50/20 border-rose-200'
                  : isMedium
                  ? 'bg-amber-50/20 border-amber-200'
                  : 'bg-slate-50 border-slate-200'
              )}
            >
              {/* Top Row: Rank & Zone Name */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'text-xs font-bold px-2 py-0.5 rounded-md font-mono text-white',
                      isHigh ? 'bg-rose-600' : isMedium ? 'bg-amber-600' : 'bg-slate-600'
                    )}
                  >
                    #{zone.rank}
                  </span>
                  <span className="font-bold text-slate-900 text-xs">{zone.zoneName}</span>
                </div>

                <span
                  className={cn(
                    'px-2 py-0.5 rounded-md font-bold text-[10px] uppercase border',
                    isHigh
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : isMedium
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-white text-slate-700 border-slate-200'
                  )}
                >
                  {zone.riskLevel} Risk • {zone.estimatedLossPrevented}
                </span>
              </div>

              {/* Causes Breakdown */}
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1 text-[10px] shadow-2xs">
                <span className="text-slate-500 block font-bold uppercase text-[9px]">Contributing Root Causes:</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 text-slate-700">
                  {zone.causes.map((c, idx) => (
                    <span key={idx} className="flex items-center gap-1">
                      <span className="text-sky-600 font-bold">•</span>
                      <span>{c}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
