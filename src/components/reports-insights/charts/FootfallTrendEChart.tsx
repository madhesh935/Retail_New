import React, { useMemo } from 'react'
import ReactECharts from 'echarts-for-react'
import { useMetricHistory } from '@/hooks/useMetricHistory'

const fmtTime = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

export const FootfallTrendEChart: React.FC = () => {
  const { points, isLoading } = useMetricHistory('FOOTFALL', 60000)

  const sorted = useMemo(
    () => [...points].sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()),
    [points]
  )

  const option = useMemo(() => {
    const labels = sorted.map((p) => fmtTime(p.recordedAt))
    const values = sorted.map((p) => p.value)

    return {
      backgroundColor: 'transparent',
      grid: { top: 15, right: 15, bottom: 20, left: 40 },
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#FFFFFF',
        borderColor: '#E2E8F0',
        textStyle: { color: '#0F172A', fontFamily: 'system-ui, sans-serif', fontSize: 11 },
        extraCssText: 'box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1); border-radius: 8px;',
      },
      xAxis: {
        type: 'category',
        data: labels,
        axisLine: { lineStyle: { color: '#CBD5E1' } },
        axisLabel: { color: '#64748B', fontSize: 9, fontFamily: 'system-ui, sans-serif' },
      },
      yAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: '#F1F5F9', type: 'dashed' } },
        axisLabel: { color: '#64748B', fontSize: 10, fontFamily: 'system-ui, sans-serif' },
      },
      series: [
        {
          name: 'Today',
          type: 'line',
          data: values,
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          lineStyle: { color: '#0284C7', width: 2 },
          itemStyle: { color: '#0284C7' },
          areaStyle: { color: 'rgba(2,132,199,0.08)' },
        },
      ],
    }
  }, [sorted])

  // Honest "vs earlier today" delta — no fabricated "vs Yesterday" comparison
  // since the app doesn't retain a prior day's readings yet.
  const changeLabel = useMemo(() => {
    if (sorted.length < 2) return null
    const first = sorted[0].value
    const last = sorted[sorted.length - 1].value
    if (first <= 0) return null
    const pct = Math.round(((last - first) / first) * 100)
    return `${pct >= 0 ? '+' : ''}${pct}% since ${fmtTime(sorted[0].recordedAt)}`
  }, [sorted])

  if (!isLoading && points.length < 2) {
    return (
      <div className="w-full h-44 flex items-center justify-center text-center px-4">
        <p className="text-[11px] text-slate-400">
          Collecting footfall history — trend appears once a few readings are recorded.
        </p>
      </div>
    )
  }

  return (
    <div className="w-full h-44 relative">
      {changeLabel && (
        <span className="absolute top-0 right-0 text-[10px] font-semibold text-emerald-700 z-10">{changeLabel}</span>
      )}
      <ReactECharts option={option} style={{ height: '100%', width: '100%' }} opts={{ renderer: 'canvas' }} />
    </div>
  )
}
