import React, { useState, useRef, useEffect } from 'react'
import { FileText } from 'lucide-react'
import {
  ReportsTimeFilterBar,
  type ReportPeriod,
} from '@/components/reports-insights/ReportsTimeFilterBar'
import { ExecutiveSummaryRow } from '@/components/reports-insights/ExecutiveSummaryRow'
import { BusinessImpactMetrics } from '@/components/reports-insights/BusinessImpactMetrics'
import { FourCoreTrendGrid } from '@/components/reports-insights/FourCoreTrendGrid'
import { LostOpportunityAnalysis } from '@/components/reports-insights/LostOpportunityAnalysis'
import { ActionHistoryBeforeAfter } from '@/components/reports-insights/ActionHistoryBeforeAfter'
import { useAppStore } from '@/store/useAppStore'
import {
  downloadOperationalReport,
  type OperationalReportFormat,
  type OperationalReportType,
} from '@/lib/operationalReport'

type ExportFeedback = {
  reportType: OperationalReportType | null
  format: OperationalReportFormat | null
  status: 'IDLE' | 'PREPARING' | 'SUCCESS' | 'ERROR'
  message: string
}

export const ReportsInsightsPage: React.FC = () => {
  const [period, setPeriod] = useState<ReportPeriod>('TODAY')
  const [format, setFormat] = useState<OperationalReportFormat>('PDF')
  const [exportFeedback, setExportFeedback] = useState<ExportFeedback>({
    reportType: null,
    format: null,
    status: 'IDLE',
    message: '',
  })

  const dismissTimerRef = useRef<number | null>(null)

  const clearDismissTimer = () => {
    if (dismissTimerRef.current !== null) {
      window.clearTimeout(dismissTimerRef.current)
      dismissTimerRef.current = null
    }
  }

  useEffect(() => {
    return () => clearDismissTimer()
  }, [])

  const handleFormatChange = (nextFormat: OperationalReportFormat) => {
    clearDismissTimer()
    setFormat(nextFormat)
    setExportFeedback({ reportType: null, format: null, status: 'IDLE', message: '' })
  }

  const handleDismissFeedback = () => {
    clearDismissTimer()
    setExportFeedback({ reportType: null, format: null, status: 'IDLE', message: '' })
  }

  const handleExport = async (reportType: OperationalReportType) => {
    if (exportFeedback.status === 'PREPARING') return
    clearDismissTimer()

    setExportFeedback({
      reportType,
      format,
      status: 'PREPARING',
      message: `Preparing your ${format === 'PDF' ? 'PDF' : 'Excel'} report...`,
    })

    await new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()))

    try {
      const fileName = await downloadOperationalReport({
        state: useAppStore.getState(),
        reportType,
        period,
        format,
      })
      setExportFeedback({
        reportType,
        format,
        status: 'SUCCESS',
        message: `${fileName} downloaded successfully.`,
      })

      // Auto-dismiss the success notification after 4 seconds
      clearDismissTimer()
      dismissTimerRef.current = window.setTimeout(() => {
        setExportFeedback({ reportType: null, format: null, status: 'IDLE', message: '' })
      }, 4000)
    } catch (error) {
      console.error('Report download failed:', error)
      setExportFeedback({
        reportType,
        format,
        status: 'ERROR',
        message: `The ${format === 'PDF' ? 'PDF' : 'Excel'} report could not be downloaded. Please retry after the dashboard finishes loading.`,
      })

      // Auto-dismiss the error notification after 6 seconds
      clearDismissTimer()
      dismissTimerRef.current = window.setTimeout(() => {
        setExportFeedback({ reportType: null, format: null, status: 'IDLE', message: '' })
      }, 6000)
    }
  }

  return (
    <div className="space-y-4 select-none font-sans">
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <h1 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2 font-sans">
            <FileText className="h-4 w-4 text-sky-600" aria-hidden="true" />
            <span>Reports &amp; Insights</span>
          </h1>
        </div>
      </div>

      <ReportsTimeFilterBar
        period={period}
        format={format}
        onChangePeriod={setPeriod}
        onChangeFormat={handleFormatChange}
        onExportDaily={() => void handleExport('PERIOD')}
        onExportWeekly={() => void handleExport('WEEKLY')}
        exportFeedback={exportFeedback}
        onDismissFeedback={handleDismissFeedback}
      />

      <ExecutiveSummaryRow />
      <BusinessImpactMetrics />
      <FourCoreTrendGrid />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
        <div className="lg:col-span-5 flex flex-col">
          <LostOpportunityAnalysis />
        </div>
        <div className="lg:col-span-7 flex flex-col">
          <ActionHistoryBeforeAfter />
        </div>
      </div>
    </div>
  )
}
