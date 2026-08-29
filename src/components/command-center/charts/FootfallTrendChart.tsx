import React, { useMemo } from 'react'
import ReactECharts from 'echarts-for-react'
import { useMetricHistory } from '@/hooks/useMetricHistory'

const fmtTime = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

export const FootfallTrendChart: React.FC = () => {
  const { points, isLoading } = useMetricHistory('FOOTFALL', 60000)

  const sorted = useMemo(
    () => [...points].sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()),
    [points]
  )

  const option = useMemo(() => {
    const labels = sorted.map((p) => fmtTime(p.recordedAt))
    const actual = sorted.map((p) => p.value)

    // A short, clearly-labeled linear projection from the recent real trend —
    // not a fabricated demand model, just where the current trend points.
    const projected: (number | null)[] = new Array(actual.length).fill(null)
    if (actual.length >= 3) {
      const lastTs = new Date(sorted[sorted.length - 1].recordedAt).getTime()
      const prevTs = new Date(sorted[sorted.length - 2].recordedAt).getTime()
      const intervalMs = Math.max(1, lastTs - prevTs)
      const window = Math.min(4, actual.length)
      const recent = actual.slice(-window)
      const avgDelta = recent.slice(1).reduce((acc, v, i) => acc + (v - recent[i]), 0) / (window - 1)
      const lastActual = actual[actual.length - 1]
      projected[actual.length - 1] = lastActual
      for (let step = 1; step <= 2; step++) {
        labels.push(fmtTime(new Date(lastTs + intervalMs * step).toISOString()))
        actual.push(NaN)
        projected.push(Math.max(0, Math.round(lastActual + avgDelta * step)))
      }
    }

    return {
      backgroundColor: 'transparent',
      grid: { top: 30, right: 15, bottom: 20, left: 35 },
      legend: {
        top: 0,
        data: ['Actual Footfall', 'Projected'],
        textStyle: { color: '#475569', fontSize: 10, fontFamily: 'system-ui, sans-serif' },
        itemWidth: 12,
        itemHeight: 8,
      },
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
          name: 'Actual Footfall',
          type: 'line',
          data: actual,
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          lineStyle: { color: '#0284C7', width: 2 },
          itemStyle: { color: '#0284C7' },
          areaStyle: { color: 'rgba(2,132,199,0.08)' },
          connectNulls: false,
        },
        {
          name: 'Projected',
          type: 'line',
          data: projected,
          smooth: true,
          symbol: 'circle',
          symbolSize: 5,
          lineStyle: { color: '#16A34A', width: 2, type: 'dashed' },
          itemStyle: { color: '#16A34A' },
          connectNulls: true,
        },
      ],
    }
  }, [sorted])

  if (!isLoading && points.length < 2) {
    return (
      <div className="w-full h-36 flex items-center justify-center text-center px-4">
        <p className="text-[11px] text-slate-400">
          Collecting footfall history — trend line appears once a few readings are recorded.
        </p>
      </div>
    )
  }

  return (
    <div className="w-full h-36">
      <ReactECharts option={option} style={{ height: '100%', width: '100%' }} opts={{ renderer: 'canvas' }} />
    </div>
  )
}
