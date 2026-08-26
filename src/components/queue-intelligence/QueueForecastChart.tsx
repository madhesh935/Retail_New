import React, { useMemo } from 'react'
import ReactECharts from 'echarts-for-react'

interface QueueForecastChartProps {
  threshold?: number
}

export const QueueForecastChart: React.FC<QueueForecastChartProps> = ({
  threshold = 10,
}) => {
  const option = useMemo(() => {
    return {
      backgroundColor: 'transparent',
      grid: {
        top: 30,
        right: 25,
        bottom: 25,
        left: 35,
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#0F172A',
        borderColor: '#1E293B',
        textStyle: {
          color: '#F8FAFC',
          fontFamily: 'JetBrains Mono',
          fontSize: 11,
        },
        padding: [6, 10],
      },
      legend: {
        data: ['Unmitigated Queue (Counter C1)', 'Mitigated (Open Counter C3)'],
        top: 0,
        right: 0,
        textStyle: {
          color: '#94A3B8',
          fontSize: 10,
          fontFamily: 'JetBrains Mono',
        },
        itemWidth: 12,
        itemHeight: 6,
      },
      xAxis: {
        type: 'category',
        data: ['Now (18:40)', '+3 min (18:43)', '+5 min (18:45)', '+10 min (18:50)'],
        axisLine: { lineStyle: { color: '#1E293B' } },
        axisLabel: {
          color: '#64748B',
          fontSize: 9,
          fontFamily: 'JetBrains Mono',
        },
      },
      yAxis: {
        type: 'value',
        max: 20,
        min: 0,
        splitLine: { lineStyle: { color: '#131D31', type: 'dashed' } },
        axisLabel: {
          color: '#64748B',
          fontSize: 9,
          fontFamily: 'JetBrains Mono',
          formatter: '{value} q',
        },
      },
      series: [
        {
          name: 'Unmitigated Queue (Counter C1)',
          type: 'line',
          smooth: true,
          data: [8, 10, 13, 16],
          showSymbol: true,
          symbolSize: 8,
          lineStyle: { color: '#F43F5E', width: 2.5 },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(244, 63, 94, 0.35)' },
                { offset: 1, color: 'rgba(244, 63, 94, 0.0)' },
              ],
            },
          },
          markLine: {
            silent: true,
            symbol: 'none',
            data: [
              {
                yAxis: threshold,
                lineStyle: { color: '#F59E0B', type: 'dashed', width: 2 },
                label: {
                  position: 'insideEndTop',
                  formatter: `Max Desired Queue Threshold = ${threshold}`,
                  color: '#F59E0B',
                  fontSize: 10,
                  fontFamily: 'JetBrains Mono',
                },
              },
            ],
          },
        },
        {
          name: 'Mitigated (Open Counter C3)',
          type: 'line',
          smooth: true,
          data: [8, 7, 5, 4],
          showSymbol: true,
          symbolSize: 6,
          lineStyle: { color: '#10B981', width: 2, type: 'dashed' },
        },
      ],
    }
  }, [threshold])

  return (
    <div className="w-full h-56">
      <ReactECharts
        option={option}
        style={{ height: '100%', width: '100%' }}
        opts={{ renderer: 'canvas' }}
      />
    </div>
  )
}
