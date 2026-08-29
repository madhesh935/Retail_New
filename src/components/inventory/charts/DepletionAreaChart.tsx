import React, { useMemo } from 'react'
import ReactECharts from 'echarts-for-react'

interface DepletionAreaChartProps {
  currentAvailability: number
  predictedStockoutLabel?: string
}

export const DepletionAreaChart: React.FC<DepletionAreaChartProps> = ({
  currentAvailability,
  predictedStockoutLabel,
}) => {
  const option = useMemo(() => {
    return {
      backgroundColor: 'transparent',
      grid: {
        top: 20,
        right: 15,
        bottom: 25,
        left: 35,
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#FFFFFF',
        borderColor: '#E2E8F0',
        textStyle: {
          color: '#0F172A',
          fontFamily: 'Inter, sans-serif',
          fontSize: 11,
        },
        padding: [6, 10],
        formatter: (params: any) => {
          const item = params[0]
          return `${item.name}<br/><span style="color:${item.color}">●</span> Availability: <strong>${item.value}%</strong>`
        },
      },
      xAxis: {
        type: 'category',
        data: ['Now', predictedStockoutLabel ? `Predicted (${predictedStockoutLabel})` : 'Predicted stockout'],
        axisLine: { lineStyle: { color: '#E2E8F0' } },
        axisLabel: {
          color: '#64748B',
          fontSize: 9,
          fontFamily: 'JetBrains Mono',
        },
      },
      yAxis: {
        type: 'value',
        max: 100,
        min: 0,
        splitLine: { lineStyle: { color: '#F1F5F9', type: 'dashed' } },
        axisLabel: {
          color: '#64748B',
          fontSize: 9,
          fontFamily: 'JetBrains Mono',
          formatter: '{value}%',
        },
      },
      series: [
        {
          name: 'Shelf Availability',
          type: 'line',
          smooth: false,
          data: [currentAvailability, 0],
          showSymbol: true,
          symbolSize: 6,
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
        },
      ],
    }
  }, [currentAvailability, predictedStockoutLabel])

  return (
    <div className="w-full h-40">
      <ReactECharts
        option={option}
        style={{ height: '100%', width: '100%' }}
        opts={{ renderer: 'canvas' }}
      />
    </div>
  )
}
