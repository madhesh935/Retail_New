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
import type { StaffMember } from './staffData'

interface WorkloadDistributionCardProps {
  staff?: StaffMember[]
  onFocusRecommendation?: (staff: StaffMember) => void
}

export const WorkloadDistributionCard: React.FC<WorkloadDistributionCardProps> = ({
  staff = [],
  onFocusRecommendation,
}) => {
  const deptCounts = {
    Billing: staff.filter((s) => s.department === 'Billing').length,
    Replenishment: staff.filter((s) => s.department === 'Replenishment').length,
    Support: staff.filter((s) => s.department === 'Support').length,
    Operations: staff.filter((s) => s.department === 'Operations').length,
  }
  const total = Math.max(staff.length, 1)
  const categories = [
    {
      name: 'Checkout & Billing',
      percentage: Math.round((deptCounts.Billing / total) * 100),
      staffCount: deptCounts.Billing,
      status: deptCounts.Billing >= 3 ? 'Adequate' : 'Needs Cover',
      statusColor: deptCounts.Billing >= 3 ? 'bg-slate-100 text-slate-700 border-slate-200' : 'bg-rose-50 text-rose-700 border-rose-200',
      barColor: '#0F766E',
      icon: Zap,
    },
    {
      name: 'Inventory Replenishment',
      percentage: Math.round((deptCounts.Replenishment / total) * 100),
      staffCount: deptCounts.Replenishment,
      status: deptCounts.Replenishment >= 2 ? 'Adequate' : 'High Demand',
      statusColor: deptCounts.Replenishment >= 2 ? 'bg-slate-100 text-slate-700 border-slate-200' : 'bg-rose-50 text-rose-700 border-rose-200',
      barColor: '#E11D48',
      icon: PackageCheck,
    },
    {
      name: 'Customer Support',
      percentage: Math.round((deptCounts.Support / total) * 100),
      staffCount: deptCounts.Support,
      status: deptCounts.Support >= 2 ? 'Adequate' : 'Needs Cover',
      statusColor: deptCounts.Support >= 2 ? 'bg-slate-100 text-slate-700 border-slate-200' : 'bg-rose-50 text-rose-700 border-rose-200',
      barColor: '#0369A1',
      icon: Headphones,
    },
    {
      name: 'Operations',
      percentage: Math.round((deptCounts.Operations / total) * 100),
      staffCount: deptCounts.Operations,
      status: deptCounts.Operations >= 2 ? 'Adequate' : 'Needs Cover',
      statusColor: deptCounts.Operations >= 2 ? 'bg-slate-100 text-slate-700 border-slate-200' : 'bg-rose-50 text-rose-700 border-rose-200',
      barColor: '#7C3AED',
      icon: ShieldCheck,
    },
  ]

  // Find the most understaffed department, then a real AVAILABLE staff member
  // from a different, adequately-staffed department who could cross-support.
  const understaffed = categories.find((c) => c.status !== 'Adequate')
  const crossSupportStaff = understaffed
    ? staff.find(
        (s) =>
          s.status === 'AVAILABLE' &&
          !(
            (understaffed.name === 'Checkout & Billing' && s.department === 'Billing') ||
            (understaffed.name === 'Inventory Replenishment' && s.department === 'Replenishment')
          )
      )
    : undefined

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
      {understaffed && (
        <div className="mt-2 p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs shadow-2xs">
          <div className="flex items-center justify-between text-amber-800 font-bold text-[11px]">
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-600" />
              <span>Workload Advisory</span>
            </span>
          </div>

          <p className="text-[11px] text-slate-600 leading-relaxed font-sans">
            {understaffed.name} workload is high ({understaffed.staffCount} staff).{' '}
            {crossSupportStaff
              ? `${crossSupportStaff.name} (${crossSupportStaff.code}) is available for cross-support.`
              : 'No available staff member found for cross-support right now.'}
          </p>

          {crossSupportStaff && onFocusRecommendation && (
            <Button
              variant="outline"
              size="xs"
              onClick={() => onFocusRecommendation(crossSupportStaff)}
              className="h-7 text-[11px] gap-1 text-amber-800 border-amber-200 bg-white hover:bg-amber-50"
            >
              View {crossSupportStaff.name.split(' ')[0]}
              <ArrowRight className="h-3 w-3" />
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
