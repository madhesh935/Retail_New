import React, { useMemo } from 'react'
import ReactECharts from 'echarts-for-react'

export const FootfallTrendChart: React.FC = () => {
  const hourlyData = [
    { hour: '08:00', count: 65, predicted: 70 },
    { hour: '09:00', count: 110, predicted: 115 },
    { hour: '10:00', count: 160, predicted: 155 },
    { hour: '11:00', count: 215, predicted: 220 },
    { hour: '12:00', count: 275, predicted: 270 },
    { hour: '13:00', count: 235, predicted: 240 },
    { hour: '14:00', count: 195, predicted: 200 },
    { hour: '15:00', count: 225, predicted: 230 },
    { hour: '16:00', count: 246, predicted: 250 },
    { hour: '17:00', count: 280, predicted: 285 },
    { hour: '18:00', count: 420, predicted: 420 },
    { hour: '19:00', count: null, predicted: 310 },
    { hour: '20:00', count: null, predicted: 190 },
  ]

  const option = useMemo(() => {
    const hours = hourlyData.map((d) => d.hour)
    const actualCounts = hourlyData.map((d) => d.count)
    const predictedCounts = hourlyData.map((d) => d.predicted)

    return {
      backgroundColor: 'transparent',
      grid: {
        top: 25,
        right: 15,
        bottom: 25,
        left: 35,
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#0F172A',
        borderColor: '#1E293B',
        textStyle: {
          color: '#F8FAFC',
          fontFamily: 'Inter, sans-serif',
          fontSize: 11,
        },
        padding: [6, 10],
      },
      legend: {
        data: ['Actual Footfall', 'Forecast Demand'],
        top: 0,
        right: 0,
        textStyle: {
          color: '#94A3B8',
          fontSize: 10,
          fontFamily: 'Inter, sans-serif',
        },
        itemWidth: 12,
        itemHeight: 6,
      },
      xAxis: {
        type: 'category',
        data: hours,
        axisLine: { lineStyle: { color: '#1E293B' } },
        axisLabel: {
          color: '#64748B',
          fontSize: 9,
          fontFamily: 'monospace',
        },
      },
      yAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: '#131D31', type: 'dashed' } },
        axisLabel: {
          color: '#64748B',
          fontSize: 9,
          fontFamily: 'monospace',
        },
      },
      series: [
        {
          name: 'Actual Footfall',
          type: 'line',
          smooth: true,
          data: actualCounts,
          showSymbol: false,
          lineStyle: { color: '#06B6D4', width: 2.5 },
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
          name: 'Forecast Demand',
          type: 'line',
          smooth: true,
          data: predictedCounts,
          showSymbol: false,
          lineStyle: {
            color: '#3B82F6',
            width: 2,
            type: 'dashed',
          },
        },
      ],
    }
  }, [hourlyData])

  return (
    <div className="w-full h-36">
      <ReactECharts
        option={option}
        style={{ height: '100%', width: '100%' }}
        opts={{ renderer: 'canvas' }}
      />
    </div>
  )
}
