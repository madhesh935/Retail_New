import React from 'react'
import { Calendar, Download, FileSpreadsheet, FileText, Sparkles, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type ReportPeriod = 'TODAY' | 'YESTERDAY' | '7_DAYS' | '30_DAYS' | 'CUSTOM'

interface ReportsTimeFilterBarProps {
  period: ReportPeriod
  onChangePeriod: (period: ReportPeriod) => void
  onExportDaily: () => void
  onExportWeekly: () => void
}

export const ReportsTimeFilterBar: React.FC<ReportsTimeFilterBarProps> = ({
  period,
  onChangePeriod,
  onExportDaily,
  onExportWeekly,
}) => {
  const periods: { id: ReportPeriod; label: string }[] = [
    { id: 'TODAY', label: 'Today' },
    { id: 'YESTERDAY', label: 'Yesterday' },
    { id: '7_DAYS', label: '7 Days' },
    { id: '30_DAYS', label: '30 Days' },
    { id: 'CUSTOM', label: 'Custom' },
  ]

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 select-none font-sans text-xs shadow-2xs">
      {/* Time Period Tabs */}
      <div className="flex flex-wrap items-center gap-1">
        <span className="text-slate-500 font-bold mr-1 flex items-center gap-1 text-[11px]">
          <Calendar className="h-3.5 w-3.5 text-sky-600" />
          <span>Period:</span>
        </span>
        <div className="flex items-center rounded-lg bg-slate-100 p-1 border border-slate-200 gap-0.5">
          {periods.map((p) => (
            <button
              key={p.id}
              onClick={() => onChangePeriod(p.id)}
              className={cn(
                'px-2.5 py-1 rounded-md transition-colors cursor-pointer text-[10px] font-semibold',
                period === p.id
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Export Action Buttons */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="xs"
          onClick={onExportDaily}
          className="text-[10px] h-7 px-2.5 gap-1.5 text-slate-700 border-slate-200 bg-white hover:bg-slate-50 shadow-2xs font-semibold"
        >
          <FileSpreadsheet className="h-3.5 w-3.5 text-sky-600" />
          <span>Export Daily Report</span>
        </Button>

        <Button
          variant="action"
          size="xs"
          onClick={onExportWeekly}
          className="text-[10px] h-7 px-2.5 gap-1.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold"
        >
          <Download className="h-3.5 w-3.5" />
          <span>Export Weekly Report</span>
        </Button>
      </div>
    </div>
  )
}
