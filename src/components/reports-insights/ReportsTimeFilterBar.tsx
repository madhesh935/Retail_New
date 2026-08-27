import React from 'react'
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  FileSpreadsheet,
  FileText,
  LoaderCircle,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type {
  OperationalReportFormat,
  OperationalReportType,
} from '@/lib/operationalReport'

export type ReportPeriod = 'TODAY' | 'YESTERDAY' | '7_DAYS' | '30_DAYS' | 'CUSTOM'

interface ReportsTimeFilterBarProps {
  period: ReportPeriod
  format: OperationalReportFormat
  onChangePeriod: (period: ReportPeriod) => void
  onChangeFormat: (format: OperationalReportFormat) => void
  onExportDaily: () => void
  onExportWeekly: () => void
  exportFeedback: {
    reportType: OperationalReportType | null
    format: OperationalReportFormat | null
    status: 'IDLE' | 'PREPARING' | 'SUCCESS' | 'ERROR'
    message: string
  }
  onDismissFeedback?: () => void
}

export const ReportsTimeFilterBar: React.FC<ReportsTimeFilterBarProps> = ({
  period,
  format,
  onChangePeriod,
  onChangeFormat,
  onExportDaily,
  onExportWeekly,
  exportFeedback,
  onDismissFeedback,
}) => {
  const periods: { id: ReportPeriod; label: string }[] = [
    { id: 'TODAY', label: 'Today' },
    { id: 'YESTERDAY', label: 'Yesterday' },
    { id: '7_DAYS', label: '7 Days' },
    { id: '30_DAYS', label: '30 Days' },
    { id: 'CUSTOM', label: 'Custom' },
  ]
  const formats: { id: OperationalReportFormat; label: string; extension: string }[] = [
    { id: 'PDF', label: 'PDF', extension: '.pdf' },
    { id: 'EXCEL', label: 'Excel', extension: '.xlsx' },
  ]
  const selectedPeriodLabel = periods.find((item) => item.id === period)?.label || 'Selected period'
  const selectedFormatLabel = format === 'PDF' ? 'PDF' : 'Excel'
  const isPreparing = exportFeedback.status === 'PREPARING'
  const periodExportSucceeded =
    exportFeedback.status === 'SUCCESS' &&
    exportFeedback.reportType === 'PERIOD' &&
    exportFeedback.format === format
  const weeklyExportSucceeded =
    exportFeedback.status === 'SUCCESS' &&
    exportFeedback.reportType === 'WEEKLY' &&
    exportFeedback.format === format

  const renderDownloadIcon = (reportType: OperationalReportType, succeeded: boolean) => {
    if (isPreparing && exportFeedback.reportType === reportType) {
      return <LoaderCircle className="h-3.5 w-3.5 animate-spin motion-reduce:animate-none" aria-hidden="true" />
    }
    if (succeeded) return <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
    return format === 'PDF' ? (
      <FileText className="h-3.5 w-3.5" aria-hidden="true" />
    ) : (
      <FileSpreadsheet className="h-3.5 w-3.5" aria-hidden="true" />
    )
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 select-none font-sans text-xs shadow-2xs">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <div className="flex flex-wrap items-center gap-1">
              <span className="text-slate-600 font-bold mr-1 flex items-center gap-1 text-[11px]">
                <Calendar className="h-3.5 w-3.5 text-sky-600" aria-hidden="true" />
                <span>Report period:</span>
              </span>
              <div
                className="flex flex-wrap items-center rounded-lg bg-slate-100 p-1 border border-slate-200 gap-0.5"
                aria-label="Report period"
              >
                {periods.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={period === item.id}
                    disabled={isPreparing}
                    onClick={() => onChangePeriod(item.id)}
                    className={cn(
                      'min-h-8 px-2.5 py-1 rounded-md transition-colors cursor-pointer text-[10px] font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/40 disabled:cursor-not-allowed disabled:opacity-50',
                      period === item.id
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-600 font-bold text-[11px]">Download format:</span>
              <div
                className="flex items-center rounded-lg bg-slate-100 p-1 border border-slate-200 gap-0.5"
                aria-label="Download format"
              >
                {formats.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={format === item.id}
                    disabled={isPreparing}
                    onClick={() => onChangeFormat(item.id)}
                    className={cn(
                      'min-h-8 px-2.5 py-1 rounded-md transition-colors cursor-pointer text-[10px] font-semibold inline-flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/40 disabled:cursor-not-allowed disabled:opacity-50',
                      format === item.id
                        ? 'bg-white text-sky-800 shadow-2xs ring-1 ring-sky-200'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                    )}
                  >
                    {item.id === 'PDF' ? (
                      <FileText className="h-3.5 w-3.5 text-rose-600" aria-hidden="true" />
                    ) : (
                      <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-700" aria-hidden="true" />
                    )}
                    <span>{item.label}</span>
                    <span className="text-[9px] font-medium text-slate-500">{item.extension}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isPreparing}
              onClick={onExportDaily}
              aria-label={`Download complete ${selectedFormatLabel} report for ${selectedPeriodLabel}`}
              className="min-h-9 px-3 gap-1.5 text-slate-700 border-slate-300 bg-white hover:bg-slate-50 shadow-2xs font-semibold"
            >
              {renderDownloadIcon('PERIOD', periodExportSucceeded)}
              <span>
                {isPreparing && exportFeedback.reportType === 'PERIOD'
                  ? `Preparing ${selectedFormatLabel}...`
                  : periodExportSucceeded
                    ? `${selectedFormatLabel} downloaded`
                    : `Download ${selectedPeriodLabel} ${selectedFormatLabel}`}
              </span>
            </Button>

            <Button
              type="button"
              variant="action"
              size="sm"
              disabled={isPreparing}
              onClick={onExportWeekly}
              aria-label={`Download complete weekly ${selectedFormatLabel} executive report`}
              className="min-h-9 px-3 gap-1.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold"
            >
              {renderDownloadIcon('WEEKLY', weeklyExportSucceeded)}
              <span>
                {isPreparing && exportFeedback.reportType === 'WEEKLY'
                  ? `Preparing ${selectedFormatLabel}...`
                  : weeklyExportSucceeded
                    ? `Weekly ${selectedFormatLabel} downloaded`
                    : `Download weekly ${selectedFormatLabel}`}
              </span>
            </Button>
          </div>
        </div>
      </div>

      <div
        aria-live="polite"
        className={cn(
          'grid transition-[grid-template-rows,opacity,margin] duration-300 motion-reduce:transition-none',
          exportFeedback.message ? 'grid-rows-[1fr] opacity-100 mt-2.5' : 'grid-rows-[0fr] opacity-0 mt-0'
        )}
      >
        <div className="overflow-hidden">
          <div
            className={cn(
              'flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-[11px] font-medium transition-all',
              exportFeedback.status === 'ERROR'
                ? 'border-rose-200 bg-rose-50 text-rose-800'
                : exportFeedback.status === 'SUCCESS'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                  : 'border-sky-200 bg-sky-50 text-sky-800'
            )}
          >
            <div className="flex items-center gap-2">
              {exportFeedback.status === 'ERROR' ? (
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" aria-hidden="true" />
              ) : exportFeedback.status === 'PREPARING' ? (
                <LoaderCircle className="h-4 w-4 shrink-0 animate-spin text-sky-600 motion-reduce:animate-none" aria-hidden="true" />
              ) : (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
              )}
              <span>{exportFeedback.message}</span>
            </div>

            {onDismissFeedback && exportFeedback.status !== 'PREPARING' && (
              <button
                type="button"
                onClick={onDismissFeedback}
                className="p-1 hover:bg-black/5 rounded-md transition-colors text-slate-500 hover:text-slate-900 cursor-pointer"
                title="Dismiss message"
                aria-label="Dismiss notification"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
