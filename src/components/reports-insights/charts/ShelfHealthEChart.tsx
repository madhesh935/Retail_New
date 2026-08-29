import React, { useMemo } from 'react'
import ReactECharts from 'echarts-for-react'
import { useMetricHistory } from '@/hooks/useMetricHistory'

const SHELF_AVAILABILITY_TARGET_PCT = 90
const fmtTime = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

export const ShelfHealthEChart: React.FC = () => {
  const { points, isLoading } = useMetricHistory('SHELF_AVAILABILITY', 60000)

  const sorted = useMemo(
    () => [...points].sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()),
    [points]
  )

  const option = useMemo(() => {
    const labels = sorted.map((p) => fmtTime(p.recordedAt))
    const values = sorted.map((p) => p.value)

    return {
      backgroundColor: 'transparent',
      grid: { top: 20, right: 55, bottom: 20, left: 40 },
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
        min: 0,
        max: 100,
        splitLine: { lineStyle: { color: '#F1F5F9', type: 'dashed' } },
        axisLabel: { color: '#64748B', fontSize: 10, fontFamily: 'system-ui, sans-serif', formatter: '{value}%' },
      },
      series: [
        {
          name: 'Shelf Availability',
          type: 'line',
          data: values,
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          lineStyle: { color: '#059669', width: 2 },
          itemStyle: { color: '#059669' },
          areaStyle: { color: 'rgba(5,150,105,0.08)' },
          markLine: {
            silent: true,
            symbol: 'none',
            data: [{ yAxis: SHELF_AVAILABILITY_TARGET_PCT, lineStyle: { color: '#D97706', type: 'dashed' }, label: { formatter: `Target ${SHELF_AVAILABILITY_TARGET_PCT}%`, color: '#D97706', fontSize: 10 } }],
          },
        },
      ],
    }
  }, [sorted])

  if (!isLoading && points.length < 2) {
    return (
      <div className="w-full h-44 flex items-center justify-center text-center px-4">
        <p className="text-[11px] text-slate-400">
          Collecting shelf availability history — trend appears once a few readings are recorded.
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
