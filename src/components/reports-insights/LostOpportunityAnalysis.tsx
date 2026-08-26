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
    <div className="rounded-lg border border-[#1E293B] bg-[#0F172A] p-4 flex flex-col justify-between shadow-sm select-none font-mono h-full min-h-[440px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#1E293B] mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-rose-950 border border-rose-500/40 text-rose-400">
            <DollarSign className="h-3.5 w-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Lost-Opportunity Zone Ranking
            </h3>
          </div>
        </div>

        <span className="text-[10px] text-rose-400 font-bold bg-rose-950 px-2 py-0.5 rounded border border-rose-500/40">
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
                'p-3 rounded-lg border text-xs space-y-2',
                isHigh
                  ? 'bg-rose-950/20 border-rose-500/50'
                  : isMedium
                  ? 'bg-amber-950/20 border-amber-500/40'
                  : 'bg-[#090D14] border-[#1E293B]'
              )}
            >
              {/* Top Row: Rank & Zone Name */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'text-xs font-bold px-2 py-0.5 rounded font-mono text-white',
                      isHigh ? 'bg-rose-600' : isMedium ? 'bg-amber-600' : 'bg-slate-700'
                    )}
                  >
                    #{zone.rank}
                  </span>
                  <span className="font-bold text-white font-sans text-xs">{zone.zoneName}</span>
                </div>

                <span
                  className={cn(
                    'px-2 py-0.5 rounded font-bold text-[10px] uppercase border',
                    isHigh
                      ? 'bg-rose-950 text-rose-300 border-rose-500/50'
                      : isMedium
                      ? 'bg-amber-950 text-amber-300 border-amber-500/40'
                      : 'bg-[#0F172A] text-slate-400 border-slate-700'
                  )}
                >
                  {zone.riskLevel} Risk • {zone.estimatedLossPrevented}
                </span>
              </div>

              {/* Causes Breakdown */}
              <div className="bg-[#090D14] p-2 rounded border border-[#1E293B] space-y-1 text-[10px]">
                <span className="text-slate-500 block font-bold uppercase text-[9px]">Contributing Root Causes:</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 text-slate-300 font-sans">
                  {zone.causes.map((c, idx) => (
                    <span key={idx} className="flex items-center gap-1">
                      <span className="text-cyan-400">•</span>
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
