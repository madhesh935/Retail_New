import React from 'react'
import {
  Layers,
  Zap,
  PackageCheck,
  Headphones,
  ShieldCheck,
  Sparkles,
  ArrowRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface WorkloadDistributionCardProps {
  onFocusRecommendation?: () => void
}

export const WorkloadDistributionCard: React.FC<WorkloadDistributionCardProps> = ({
  onFocusRecommendation,
}) => {
  const categories = [
    {
      name: 'Checkout & Billing',
      percentage: 35,
      staffCount: 4,
      status: 'Adequate',
      statusColor: 'bg-slate-100 text-slate-700 border-slate-200',
      barColor: '#0284C7',
      icon: Zap,
    },
    {
      name: 'Inventory Replenishment',
      percentage: 30,
      staffCount: 3,
      status: 'High Demand',
      statusColor: 'bg-rose-50 text-rose-700 border-rose-200',
      barColor: '#E11D48',
      icon: PackageCheck,
    },
    {
      name: 'Customer Support',
      percentage: 20,
      staffCount: 2,
      status: 'Available',
      statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      barColor: '#7C3AED',
      icon: Headphones,
    },
    {
      name: 'Store Operations',
      percentage: 15,
      staffCount: 2,
      status: 'Limited',
      statusColor: 'bg-slate-100 text-slate-600 border-slate-200',
      barColor: '#059669',
      icon: ShieldCheck,
    },
  ]

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 flex flex-col justify-between shadow-2xs select-none h-full min-h-[400px] font-sans">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-purple-50 text-purple-600 border border-purple-200">
            <Layers className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 tracking-wide">
              Workload by Function
            </h3>
          </div>
        </div>

        <span className="text-[11px] text-slate-500">
          4 Departments
        </span>
      </div>

      {/* Progress Bars */}
      <div className="space-y-3 my-2 flex-1 justify-center flex flex-col">
        {categories.map((cat) => {
          const Icon = cat.icon

          return (
            <div key={cat.name} className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-900 font-bold text-xs">
                  <Icon className="h-3.5 w-3.5 text-slate-500" />
                  <span>{cat.name}</span>
                </span>
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="text-slate-500">{cat.staffCount} staff</span>
                  <span
                    className={cn(
                      'text-[9px] font-bold px-1.5 py-0.5 rounded-md border uppercase',
                      cat.statusColor
                    )}
                  >
                    {cat.status}
                  </span>
                  <strong className="text-slate-900 w-7 text-right font-mono">{cat.percentage}%</strong>
                </div>
              </div>

              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${cat.percentage}%`, backgroundColor: cat.barColor }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Overloaded Department Recommendation Box */}
      <div className="mt-2 p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs shadow-2xs">
        <div className="flex items-center justify-between text-amber-800 font-bold text-[11px]">
          <span className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-amber-600" />
            <span>Workload Advisory</span>
          </span>
          <span className="text-[10px] text-slate-500 font-normal">Shift B</span>
        </div>

        <p className="text-[11px] text-slate-600 leading-relaxed font-sans">
          Inventory replenishment workload is high. 1 flexible staff member (S06 Priya Sharma) is available for cross-support.
        </p>
      </div>
    </div>
  )
}
