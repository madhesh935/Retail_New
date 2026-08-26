import React, { useMemo } from 'react'
import ReactECharts from 'echarts-for-react'

export const ShelfHealthEChart: React.FC = () => {
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
        min: 60,
        max: 100,
        splitLine: { lineStyle: { color: '#131D31', type: 'dashed' } },
        axisLabel: { color: '#64748B', fontSize: 9, fontFamily: 'JetBrains Mono', formatter: '{value}%' },
      },
      series: [
        {
          name: 'Availability %',
          type: 'line',
          smooth: true,
          data: [94, 92, 88, 85, 91, 93],
          lineStyle: { color: '#10B981', width: 2 },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(16, 185, 129, 0.3)' },
                { offset: 1, color: 'rgba(16, 185, 129, 0.0)' },
              ],
            },
          },
          markLine: {
            silent: true,
            symbol: 'none',
            data: [{ yAxis: 90, lineStyle: { color: '#F59E0B', type: 'dashed' }, label: { formatter: 'Target 90%', color: '#F59E0B', fontSize: 9 } }],
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
