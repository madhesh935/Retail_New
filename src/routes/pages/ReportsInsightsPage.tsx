import React, { useState } from 'react'
import {
  FileText,
  Clock,
  Sparkles,
  Download,
  Calendar,
  Layers,
} from 'lucide-react'
import {
  ReportsTimeFilterBar,
  ReportPeriod,
} from '@/components/reports-insights/ReportsTimeFilterBar'
import { ExecutiveSummaryRow } from '@/components/reports-insights/ExecutiveSummaryRow'
import { BusinessImpactMetrics } from '@/components/reports-insights/BusinessImpactMetrics'
import { FourCoreTrendGrid } from '@/components/reports-insights/FourCoreTrendGrid'
import { LostOpportunityAnalysis } from '@/components/reports-insights/LostOpportunityAnalysis'
import { ActionHistoryBeforeAfter } from '@/components/reports-insights/ActionHistoryBeforeAfter'
import { useAppStore } from '@/store/useAppStore'

export const ReportsInsightsPage: React.FC = () => {
  const storeInfo = useAppStore((s) => s.storeInfo)
  const [period, setPeriod] = useState<ReportPeriod>('TODAY')

  const handleExportDaily = () => {
    // Frontend trigger preparing report download
    const reportData = {
      store: 'Store 01 — Chennai Central',
      date: new Date().toISOString().split('T')[0],
      period: 'Daily Operations Audit',
      footfall: 1284,
      availability: '91%',
      avgWait: '2.7 min',
      aiActions: 18,
      stockoutsPrevented: 8,
      waitReduction: '34%',
    }
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `RetailEdge_Daily_Report_${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleExportWeekly = () => {
    alert('Export Weekly Executive Report: Generating multi-zone summary slide deck and CSV analytics...')
  }

  return (
    <div className="space-y-4 select-none font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1E293B]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-2 font-mono">
              <FileText className="h-4 w-4 text-cyan-400" />
              <span>Reports &amp; Insights</span>
            </h1>
            <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/30 font-medium">
              Daily Audit
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <div className="flex items-center gap-1.5 bg-[#0F172A] px-2.5 py-1 rounded border border-[#1E293B]">
            <Clock className="h-3.5 w-3.5 text-cyan-400" />
            <span>Reporting Cycle: <strong>Shift B (Audited)</strong></span>
          </div>
        </div>
      </div>

      {/* 1. Time Filter Bar & Export Action Buttons */}
      <ReportsTimeFilterBar
        period={period}
        onChangePeriod={setPeriod}
        onExportDaily={handleExportDaily}
        onExportWeekly={handleExportWeekly}
      />

      {/* 2. Executive Summary KPI Row (6 Cards) */}
      <ExecutiveSummaryRow />

      {/* 3. Business Impact Metrics (5 Cards) */}
      <BusinessImpactMetrics />

      {/* 4. 4 Core Trend Charts (Footfall, Shelf Health, Queue Wait, Staff Response) */}
      <FourCoreTrendGrid />

      {/* 5. Bottom Grid: Lost-Opportunity Analysis (Left) & Action History Before/After (Right) */}
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
