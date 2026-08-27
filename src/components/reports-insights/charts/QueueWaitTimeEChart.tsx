import React, { useMemo } from 'react'
import ReactECharts from 'echarts-for-react'

export const QueueWaitTimeEChart: React.FC = () => {
  const option = useMemo(() => {
    return {
      backgroundColor: 'transparent',
      grid: { top: 25, right: 15, bottom: 20, left: 35 },
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#FFFFFF',
        borderColor: '#E2E8F0',
        textStyle: { color: '#0F172A', fontFamily: 'system-ui, sans-serif', fontSize: 11 },
        extraCssText: 'box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1); border-radius: 8px;',
      },
      xAxis: {
        type: 'category',
        data: ['10:00', '12:00', '14:00', '16:00', '18:00', '20:00'],
        axisLine: { lineStyle: { color: '#CBD5E1' } },
        axisLabel: { color: '#64748B', fontSize: 10, fontFamily: 'system-ui, sans-serif' },
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: 6,
        splitLine: { lineStyle: { color: '#F1F5F9', type: 'dashed' } },
        axisLabel: { color: '#64748B', fontSize: 10, fontFamily: 'system-ui, sans-serif', formatter: '{value}m' },
      },
      series: [
        {
          name: 'Avg Wait (min)',
          type: 'line',
          smooth: true,
          data: [1.8, 2.4, 2.2, 3.8, 2.7, 2.1],
          lineStyle: { color: '#D97706', width: 2 },
          markLine: {
            silent: true,
            symbol: 'none',
            data: [{ yAxis: 3.0, lineStyle: { color: '#E11D48', type: 'dashed' }, label: { formatter: 'Max SLA 3m', color: '#E11D48', fontSize: 10 } }],
          },
        },
      ],
    }
  }, [])

  return (
    <div className="w-full h-44">
      <ReactECharts option={option} style={{ height: '100%', width: '100%' }} opts={{ renderer: 'canvas' }} />
    </div>
  )
}
