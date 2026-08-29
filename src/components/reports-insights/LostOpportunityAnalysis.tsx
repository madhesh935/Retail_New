import React, { useMemo } from 'react'
import { DollarSign } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/useAppStore'
import type { ShelfItem } from '@/types'

interface ZoneRisk {
  rank: number
  zoneName: string
  riskLevel: 'HIGH' | 'MEDIUM' | 'LOW'
  causes: string[]
  estimatedLossPerDay: number
  atRiskShelves: ShelfItem[]
}

export const LostOpportunityAnalysis: React.FC = () => {
  const shelfItems = useAppStore((s) => s.shelfItems)

  const zoneRisks = useMemo<ZoneRisk[]>(() => {
    const byZone = new Map<string, ShelfItem[]>()
    shelfItems.forEach((s) => {
      const key = s.zoneName || 'Unassigned Zone'
      if (!byZone.has(key)) byZone.set(key, [])
      byZone.get(key)!.push(s)
    })

    const zones: ZoneRisk[] = Array.from(byZone.entries()).map(([zoneName, items]) => {
      const atRisk = items.filter((s) => s.status === 'CRITICAL' || s.status === 'LOW' || s.status === 'OUT_OF_STOCK')
      const estimatedLossPerDay = Math.round(
        atRisk.reduce((acc, s) => acc + (s.unitPrice || 0) * (s.depletionRatePerHour || 1) * 24, 0)
      )
      const worstAvailability = items.length > 0
        ? Math.min(...items.map((s) => (s.capacityCount > 0 ? Math.round((s.currentCount / s.capacityCount) * 100) : 0)))
        : 100
      const riskLevel: ZoneRisk['riskLevel'] =
        atRisk.some((s) => s.status === 'OUT_OF_STOCK' || s.status === 'CRITICAL') ? 'HIGH'
        : atRisk.length > 0 ? 'MEDIUM'
        : 'LOW'
      const causes = atRisk.slice(0, 3).map((s) => {
        const pct = s.capacityCount > 0 ? Math.round((s.currentCount / s.capacityCount) * 100) : 0
        return `${s.shelfId} ${s.productName} (${pct}% availability)`
      })

      return { rank: 0, zoneName, riskLevel, causes, estimatedLossPerDay, atRiskShelves: atRisk, worstAvailability } as ZoneRisk & { worstAvailability: number }
    })

    return zones
      .filter((z) => z.atRiskShelves.length > 0)
      .sort((a, b) => b.estimatedLossPerDay - a.estimatedLossPerDay)
      .slice(0, 3)
      .map((z, idx) => ({ ...z, rank: idx + 1 }))
  }, [shelfItems])

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
          Ranked by Est. Lost Sales
        </span>
      </div>

      {/* Ranked Zone Cards */}
      {zoneRisks.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-center text-xs text-slate-400 py-8">
          No zones currently at risk — all shelves healthy
        </div>
      ) : (
        <div className="space-y-2.5">
          {zoneRisks.map((zone) => {
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
                    {zone.riskLevel} Risk • ~₹{zone.estimatedLossPerDay} / day
                  </span>
                </div>

                {/* Causes Breakdown */}
                <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1 text-[10px] shadow-2xs">
                  <span className="text-slate-500 block font-bold uppercase text-[9px]">At-Risk Shelves:</span>
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
      )}
    </div>
  )
}
