import React, { useMemo } from 'react'
import ReactECharts from 'echarts-for-react'
import { useMetricHistory } from '@/hooks/useMetricHistory'

const MAX_SLA_SECONDS = 180
const fmtTime = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

export const QueueWaitTimeEChart: React.FC = () => {
  const { points, isLoading } = useMetricHistory('CHECKOUT_WAIT', 60000)

  const sorted = useMemo(
    () => [...points].sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()),
    [points]
  )

  const option = useMemo(() => {
    const labels = sorted.map((p) => fmtTime(p.recordedAt))
    const values = sorted.map((p) => p.value)
    const formatSeconds = (v: number) => (v < 60 ? `${Math.round(v)}s` : `${(v / 60).toFixed(1)}m`)

    return {
      backgroundColor: 'transparent',
      grid: { top: 20, right: 55, bottom: 20, left: 40 },
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#FFFFFF',
        borderColor: '#E2E8F0',
        textStyle: { color: '#0F172A', fontFamily: 'system-ui, sans-serif', fontSize: 11 },
        extraCssText: 'box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1); border-radius: 8px;',
        formatter: (params: any) => {
          const p = Array.isArray(params) ? params[0] : params
          return `${p.name}: ${formatSeconds(p.value)}`
        },
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
        axisLabel: { color: '#64748B', fontSize: 10, fontFamily: 'system-ui, sans-serif', formatter: formatSeconds },
      },
      series: [
        {
          name: 'Avg Checkout Wait',
          type: 'line',
          data: values,
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          lineStyle: { color: '#D97706', width: 2 },
          itemStyle: { color: '#D97706' },
          areaStyle: { color: 'rgba(217,119,6,0.08)' },
          markLine: {
            silent: true,
            symbol: 'none',
            data: [{ yAxis: MAX_SLA_SECONDS, lineStyle: { color: '#E11D48', type: 'dashed' }, label: { formatter: 'Max SLA 3m', color: '#E11D48', fontSize: 10 } }],
          },
        },
      ],
    }
  }, [sorted])

  if (!isLoading && points.length < 2) {
    return (
      <div className="w-full h-44 flex items-center justify-center text-center px-4">
        <p className="text-[11px] text-slate-400">
          Collecting checkout wait-time history — trend appears once a few readings are recorded.
        </p>
      </div>
    )
  }

  return (
    <div className="w-full h-44">
      <ReactECharts option={option} style={{ height: '100%', width: '100%' }} opts={{ renderer: 'canvas' }} />
    </div>
  )
}
