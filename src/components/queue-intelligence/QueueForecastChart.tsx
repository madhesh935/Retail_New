import React, { useMemo } from 'react'
import ReactECharts from 'echarts-for-react'
import { useAppStore } from '@/store/useAppStore'
import { OperationalLaneData } from './OperationalCounterCards'

interface QueueForecastChartProps {
  threshold?: number
  activeLane?: OperationalLaneData
}

export const QueueForecastChart: React.FC<QueueForecastChartProps> = ({
  threshold = 10,
  activeLane,
}) => {
  // Subscribe directly to the raw queue store so we get live Zustand updates
  const queues = useAppStore((s) => s.queues)

  // Resolve the active lane's live queue data from store (most up-to-date)
  const laneCode = activeLane?.code ?? 'C1'
  const laneNum = parseInt(laneCode.replace('C', '')) || 1
  const liveQ = queues.find((q) => q.laneNumber === laneNum)

  // Prefer live store value over prop (prop may be 1 render stale)
  const currentQ = liveQ ? liveQ.currentQueueLength : (activeLane?.queueLength ?? 4)

  const f3 = Math.round(currentQ * 1.3)
  const f5 = Math.round(currentQ * 1.6)
  const f10 = Math.round(currentQ * 2.1)

  const maxQueue = Math.max(f10, currentQ + 5, threshold + 4, 16)

  // Generate dynamic live time labels — regenerate every render (cheap)
  const now = new Date()
  const fmt = (d: Date) =>
    `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  const timeLabels = [
    `Now (${fmt(now)})`,
    `+3 min (${fmt(new Date(now.getTime() + 3 * 60000))})`,
    `+5 min (${fmt(new Date(now.getTime() + 5 * 60000))})`,
    `+10 min (${fmt(new Date(now.getTime() + 10 * 60000))})`,
  ]

  // Use primitive values as deps so option recomputes every time any count changes
  const option = useMemo(() => {
    return {
      backgroundColor: 'transparent',
      animationDuration: 300,
      animationEasing: 'cubicOut' as const,
      grid: { top: 30, right: 25, bottom: 25, left: 35 },
      tooltip: {
        trigger: 'axis' as const,
        backgroundColor: '#0F172A',
        borderColor: '#1E293B',
        textStyle: { color: '#F8FAFC', fontFamily: 'JetBrains Mono', fontSize: 11 },
        padding: [6, 10],
      },
      legend: {
        data: [`Unmitigated Queue (${laneCode})`, 'Mitigated (Open Counter C3)'],
        top: 0,
        right: 0,
        textStyle: { color: '#94A3B8', fontSize: 10, fontFamily: 'JetBrains Mono' },
        itemWidth: 12,
        itemHeight: 6,
      },
      xAxis: {
        type: 'category' as const,
        data: timeLabels,
        axisLine: { lineStyle: { color: '#E2E8F0' } },
        axisLabel: { color: '#64748B', fontSize: 9, fontFamily: 'JetBrains Mono' },
      },
      yAxis: {
        type: 'value' as const,
        max: maxQueue,
        min: 0,
        splitLine: { lineStyle: { color: '#F1F5F9', type: 'dashed' as const } },
        axisLabel: {
          color: '#64748B',
          fontSize: 9,
          fontFamily: 'JetBrains Mono',
          formatter: '{value} q',
        },
      },
      series: [
        {
          name: `Unmitigated Queue (${laneCode})`,
          type: 'line' as const,
          smooth: true,
          data: [currentQ, f3, f5, f10],
          showSymbol: true,
          symbolSize: 8,
          lineStyle: { color: '#F43F5E', width: 2.5 },
          areaStyle: {
            color: {
              type: 'linear' as const,
              x: 0, y: 0, x2: 0, y2: 1,
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
                lineStyle: { color: '#F59E0B', type: 'dashed' as const, width: 2 },
                label: {
                  position: 'insideEndTop' as const,
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
          type: 'line' as const,
          smooth: true,
          data: [currentQ, Math.max(0, f3 - 3), Math.max(0, f5 - 5), Math.max(0, f10 - 8)],
          showSymbol: true,
          symbolSize: 6,
          lineStyle: { color: '#10B981', width: 2, type: 'dashed' as const },
        },
      ],
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threshold, laneCode, currentQ, f3, f5, f10, maxQueue, timeLabels.join(',')])

  return (
    <div className="w-full h-56">
      <ReactECharts
        key={`${laneCode}-${currentQ}`}
        option={option}
        notMerge={true}
        lazyUpdate={false}
        style={{ height: '100%', width: '100%' }}
        opts={{ renderer: 'canvas' }}
      />
    </div>
  )
}
