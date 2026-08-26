import React, { useMemo } from 'react'
import ReactECharts from 'echarts-for-react'

export const FootfallTrendEChart: React.FC = () => {
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
      legend: {
        data: ['Today', 'Yesterday'],
        top: 0,
        right: 0,
        textStyle: { color: '#94A3B8', fontSize: 9, fontFamily: 'JetBrains Mono' },
        itemWidth: 10,
        itemHeight: 5,
      },
      xAxis: {
        type: 'category',
        data: ['10:00', '12:00', '14:00', '16:00', '18:00', '20:00'],
        axisLine: { lineStyle: { color: '#1E293B' } },
        axisLabel: { color: '#64748B', fontSize: 9, fontFamily: 'JetBrains Mono' },
      },
      yAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: '#131D31', type: 'dashed' } },
        axisLabel: { color: '#64748B', fontSize: 9, fontFamily: 'JetBrains Mono' },
      },
      series: [
        {
          name: 'Today',
          type: 'line',
          smooth: true,
          data: [120, 240, 310, 420, 520, 380],
          lineStyle: { color: '#06B6D4', width: 2 },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(6, 182, 212, 0.3)' },
                { offset: 1, color: 'rgba(6, 182, 212, 0.0)' },
              ],
            },
          },
        },
        {
          name: 'Yesterday',
          type: 'line',
          smooth: true,
          data: [100, 210, 280, 370, 460, 340],
          lineStyle: { color: '#64748B', width: 1.5, type: 'dashed' },
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
