import React, { useMemo } from 'react'
import ReactECharts from 'echarts-for-react'
import { SHOPPING_ZONES, CanonicalZoneAnalytics } from './shopperData'

interface EngagementVsAvailabilityChartProps {
  onSelectZone?: (zone: CanonicalZoneAnalytics) => void
}

export const EngagementVsAvailabilityChart: React.FC<EngagementVsAvailabilityChartProps> = ({
  onSelectZone,
}) => {
  const option = useMemo(() => {
    // Data format: [interestScore, shelfAvailability, zoneName, zoneObject, color]
    const scatterData = SHOPPING_ZONES.map((zone) => {
      let color = '#38BDF8'
      if (zone.opportunityRisk === 'HIGH') color = '#F43F5E'
      else if (zone.shelfAvailability >= 85) color = '#10B981'
      else if (zone.shelfAvailability < 80) color = '#F59E0B'

      return [
        zone.interestScore,
        zone.shelfAvailability,
        zone.name,
        zone,
        color,
      ]
    })

    return {
      backgroundColor: 'transparent',
      grid: {
        top: 25,
        right: 20,
        bottom: 40,
        left: 45,
      },
      tooltip: {
        trigger: 'item',
        backgroundColor: '#0F172A',
        borderColor: '#1E293B',
        textStyle: {
          color: '#F8FAFC',
          fontFamily: 'Inter, sans-serif',
          fontSize: 11,
        },
        padding: [8, 12],
        formatter: (params: any) => {
          const d = params.data
          const zone = d[3] as CanonicalZoneAnalytics
          return `<strong>${zone.name}</strong> (${zone.aisle})<br/>Shopper Interest: <strong>${zone.interestScore}%</strong><br/>Shelf Availability: <strong>${zone.shelfAvailability}%</strong><br/>Traffic: <strong>${zone.trafficLevel}</strong><br/>Status: <strong>${zone.opportunityRisk === 'HIGH' ? 'Needs Attention' : 'Healthy Opportunity'}</strong>`
        },
      },
      xAxis: {
        name: 'Shopper Interest (%)',
        nameLocation: 'middle',
        nameGap: 24,
        nameTextStyle: { color: '#94A3B8', fontSize: 10, fontFamily: 'Inter, sans-serif' },
        min: 0,
        max: 100,
        splitLine: { lineStyle: { color: '#1E293B', type: 'dashed' } },
        axisLine: { lineStyle: { color: '#1E293B' } },
        axisLabel: { color: '#64748B', fontSize: 9, fontFamily: 'Inter, sans-serif' },
      },
      yAxis: {
        name: 'Shelf Availability (%)',
        nameLocation: 'middle',
        nameGap: 30,
        nameTextStyle: { color: '#94A3B8', fontSize: 10, fontFamily: 'Inter, sans-serif' },
        min: 0,
        max: 100,
        splitLine: { lineStyle: { color: '#1E293B', type: 'dashed' } },
        axisLine: { lineStyle: { color: '#1E293B' } },
        axisLabel: { color: '#64748B', fontSize: 9, fontFamily: 'Inter, sans-serif' },
      },
      series: [
        {
          name: 'Zones',
          type: 'scatter',
          data: scatterData,
          symbolSize: 18,
          itemStyle: {
            color: (params: any) => params.data[4],
            shadowBlur: 8,
            shadowColor: 'rgba(0,0,0,0.5)',
          },
          markArea: {
            silent: true,
            itemStyle: {
              color: 'transparent',
              borderWidth: 1,
              borderColor: '#1E293B',
            },
            data: [
              // Bottom-Right Quadrant: High Interest + Low Availability = Needs Attention (Red tint)
              [
                {
                  name: 'NEEDS ATTENTION',
                  xAxis: 50,
                  yAxis: 0,
                  itemStyle: { color: 'rgba(244, 63, 94, 0.08)' },
                  label: {
                    position: 'insideBottomRight',
                    color: '#F43F5E',
                    fontSize: 9,
                    fontWeight: 'bold',
                    fontFamily: 'Inter, sans-serif',
                  },
                },
                {
                  xAxis: 100,
                  yAxis: 75,
                },
              ],
              // Top-Right: High Interest + High Availability = Healthy Opportunity (Emerald tint)
              [
                {
                  name: 'HEALTHY OPPORTUNITY',
                  xAxis: 50,
                  yAxis: 75,
                  itemStyle: { color: 'rgba(16, 185, 129, 0.06)' },
                  label: {
                    position: 'insideTopRight',
                    color: '#34D399',
                    fontSize: 9,
                    fontWeight: 'bold',
                    fontFamily: 'Inter, sans-serif',
                  },
                },
                {
                  xAxis: 100,
                  yAxis: 100,
                },
              ],
            ],
          },
        },
      ],
    }
  }, [])

  return (
    <div className="w-full h-64">
      <ReactECharts
        option={option}
        style={{ height: '100%', width: '100%' }}
        onEvents={{
          click: (params: any) => {
            if (params.data && params.data[3] && onSelectZone) {
              onSelectZone(params.data[3])
            }
          },
        }}
      />
    </div>
  )
}
