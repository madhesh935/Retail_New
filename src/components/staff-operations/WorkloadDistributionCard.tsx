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
      statusColor: 'bg-[#1E293B] text-slate-300',
      barColor: '#06B6D4',
      icon: Zap,
    },
    {
      name: 'Inventory Replenishment',
      percentage: 30,
      staffCount: 3,
      status: 'High Demand',
      statusColor: 'bg-rose-950/80 text-rose-300 border border-rose-500/40',
      barColor: '#F59E0B',
      icon: PackageCheck,
    },
    {
      name: 'Customer Support',
      percentage: 20,
      staffCount: 2,
      status: 'Available',
      statusColor: 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30',
      barColor: '#A855F7',
      icon: Headphones,
    },
    {
      name: 'Store Operations',
      percentage: 15,
      staffCount: 2,
      status: 'Limited',
      statusColor: 'bg-[#1E293B] text-slate-400',
      barColor: '#10B981',
      icon: ShieldCheck,
    },
  ]

  return (
    <div className="rounded-lg border border-[#1E293B] bg-[#0F172A] p-4 flex flex-col justify-between shadow-sm select-none h-full min-h-[400px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#1E293B] mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-[#1E293B] text-purple-400">
            <Layers className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-white tracking-wide">
              Workload by Function
            </h3>
          </div>
        </div>

        <span className="text-[11px] text-slate-400">
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
                <span className="flex items-center gap-1.5 text-white font-medium text-xs">
                  <Icon className="h-3.5 w-3.5 text-slate-400" />
                  <span>{cat.name}</span>
                </span>
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="text-slate-400">{cat.staffCount} staff</span>
                  <span
                    className={cn(
                      'text-[9px] font-medium px-1.5 py-0.5 rounded',
                      cat.statusColor
                    )}
                  >
                    {cat.status}
                  </span>
                  <strong className="text-white w-7 text-right">{cat.percentage}%</strong>
                </div>
              </div>

              <div className="w-full h-2 bg-[#090D14] rounded-full overflow-hidden border border-[#1E293B]">
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
      <div className="mt-2 p-3 rounded-lg bg-[#090D14] border border-[#1E293B] space-y-1.5 text-xs">
        <div className="flex items-center justify-between text-amber-300 font-semibold text-[11px]">
          <span className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>Workload Advisory</span>
          </span>
          <span className="text-[10px] text-slate-400 font-normal">Shift B</span>
        </div>

        <p className="text-[11px] text-slate-300 leading-relaxed">
          Inventory replenishment workload is high. 1 flexible staff member (S06 Priya Sharma) is available for cross-support.
        </p>
      </div>
    </div>
  )
}
