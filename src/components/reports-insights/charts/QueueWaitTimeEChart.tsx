import React, { useMemo } from 'react'
import ReactECharts from 'echarts-for-react'

export const QueueWaitTimeEChart: React.FC = () => {
  const option = useMemo(() => {
    return {
      backgroundColor: 'transparent',
      grid: { top: 25, right: 15, bottom: 20, left: 35 },
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#0F172A',
        borderColor: '#1E293B',
        textStyle: { color: '#F8FAFC', fontFamily: 'JetBrains Mono', fontSize: 10 },
      },
      xAxis: {
        type: 'category',
        data: ['10:00', '12:00', '14:00', '16:00', '18:00', '20:00'],
        axisLine: { lineStyle: { color: '#1E293B' } },
        axisLabel: { color: '#64748B', fontSize: 9, fontFamily: 'JetBrains Mono' },
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: 6,
        splitLine: { lineStyle: { color: '#131D31', type: 'dashed' } },
        axisLabel: { color: '#64748B', fontSize: 9, fontFamily: 'JetBrains Mono', formatter: '{value}m' },
      },
      series: [
        {
          name: 'Avg Wait (min)',
          type: 'line',
          smooth: true,
          data: [1.8, 2.4, 2.2, 3.8, 2.7, 2.1],
          lineStyle: { color: '#F59E0B', width: 2 },
          markLine: {
            silent: true,
            symbol: 'none',
            data: [{ yAxis: 3.0, lineStyle: { color: '#F43F5E', type: 'dashed' }, label: { formatter: 'Max SLA 3m', color: '#F43F5E', fontSize: 9 } }],
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
