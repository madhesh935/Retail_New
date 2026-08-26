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
    <div className="rounded-lg border border-[#1E293B] bg-[#0F172A] p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 select-none font-mono text-xs shadow-sm">
      {/* Time Period Tabs */}
      <div className="flex flex-wrap items-center gap-1">
        <span className="text-slate-500 font-bold mr-1 flex items-center gap-1 text-[11px]">
          <Calendar className="h-3.5 w-3.5 text-cyan-400" />
          <span>Period:</span>
        </span>
        {periods.map((p) => (
          <button
            key={p.id}
            onClick={() => onChangePeriod(p.id)}
            className={cn(
              'px-2.5 py-1 rounded border transition-colors cursor-pointer text-[10px]',
              period === p.id
                ? 'bg-cyan-950 text-cyan-300 border-cyan-500/60 font-bold'
                : 'bg-[#090D14] text-slate-400 border-[#1E293B] hover:text-white'
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Export Action Buttons */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="xs"
          onClick={onExportDaily}
          className="text-[10px] h-7 px-2.5 gap-1.5 text-slate-300 border-[#1E293B] hover:text-white hover:bg-[#131D31]"
        >
          <FileSpreadsheet className="h-3.5 w-3.5 text-cyan-400" />
          <span>Export Daily Report</span>
        </Button>

        <Button
          variant="action"
          size="xs"
          onClick={onExportWeekly}
          className="text-[10px] h-7 px-2.5 gap-1.5 font-mono"
        >
          <Download className="h-3.5 w-3.5" />
          <span>Export Weekly Report</span>
        </Button>
      </div>
    </div>
  )
}
