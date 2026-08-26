import React, { useMemo } from 'react'
import ReactECharts from 'echarts-for-react'

export const StaffResponseEChart: React.FC = () => {
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
        max: 8,
        splitLine: { lineStyle: { color: '#131D31', type: 'dashed' } },
        axisLabel: { color: '#64748B', fontSize: 9, fontFamily: 'JetBrains Mono', formatter: '{value}m' },
      },
      series: [
        {
          name: 'Response Time (min)',
          type: 'bar',
          data: [4.2, 3.8, 3.1, 4.5, 3.2, 2.8],
          itemStyle: { color: '#A855F7', borderRadius: [3, 3, 0, 0] },
          markLine: {
            silent: true,
            symbol: 'none',
            data: [{ yAxis: 5.0, lineStyle: { color: '#EF4444', type: 'dashed' }, label: { formatter: 'SLA 5m', color: '#EF4444', fontSize: 9 } }],
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
