import React, { useMemo } from 'react'
import {
  Flame,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
  Users,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@/store/useAppStore'
import ReactECharts from 'echarts-for-react'

export const PeakForecastCard: React.FC = () => {
  const navigate = useNavigate()
  const currentOccupancy = useAppStore((s) => s.currentOccupancy)
  const storeInfo = useAppStore((s) => s.storeInfo)
  const zones = useAppStore((s) => s.zones)

  const maxCapacity = storeInfo?.maxCapacity || 500
  const occupancyPct = Math.round((currentOccupancy / maxCapacity) * 100)

  const busiestZone = zones.length > 0
    ? [...zones].sort((a, b) => b.currentOccupancy - a.currentOccupancy)[0]
    : null

  // Projected Hourly Curve
  const chartOption = useMemo(() => {
    const hours = ['10:00', '12:00', '14:00', '16:00', '18:00 (Peak)', '20:00', '22:00']
    const volume = [120, 240, 195, 270, 420, 310, 140]

    return {
      backgroundColor: 'transparent',
      animationDuration: 400,
      grid: { top: 15, right: 10, bottom: 20, left: 30 },
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#FFFFFF',
        borderColor: '#E2E8F0',
        textStyle: { color: '#0F172A', fontFamily: 'system-ui, sans-serif', fontSize: 11 },
        extraCssText: 'box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); border-radius: 8px;',
        formatter: (params: any) => {
          const p = Array.isArray(params) ? params[0] : params
          return `${p.name}: <strong>${p.value} shoppers</strong>`
        },
      },
      xAxis: {
        type: 'category',
        data: hours,
        boundaryGap: false,
        axisLine: { lineStyle: { color: '#CBD5E1' } },
        axisLabel: {
          color: '#64748B',
          fontSize: 9,
          fontFamily: 'system-ui, sans-serif',
          formatter: (val: string) => val.split(' ')[0],
        },
        axisTick: { show: false },
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: 500,
        interval: 150,
        splitLine: { lineStyle: { color: '#F1F5F9', type: 'dashed' } },
        axisLabel: { color: '#64748B', fontSize: 9, fontFamily: 'system-ui, sans-serif' },
        axisLine: { show: false },
        axisTick: { show: false },
      },
      series: [
        {
          name: 'Forecast Traffic',
          type: 'line',
          data: volume,
          smooth: 0.35,
          showSymbol: true,
          symbol: 'circle',
          symbolSize: (val: number) => (val === 420 ? 8 : 5),
          lineStyle: { color: '#D97706', width: 2.5 },
          itemStyle: {
            color: (params: any) => (params.value === 420 ? '#DC2626' : '#D97706'),
            borderColor: '#FFFFFF',
            borderWidth: 1.5,
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(217, 119, 6, 0.20)' },
                { offset: 0.8, color: 'rgba(217, 119, 6, 0.03)' },
                { offset: 1, color: 'rgba(217, 119, 6, 0.00)' },
              ],
            },
          },
          markPoint: {
            symbol: 'pin',
            symbolSize: 32,
            data: [
              {
                name: 'Peak Rush',
                value: 'Peak',
                xAxis: '18:00 (Peak)',
                yAxis: 420,
                itemStyle: { color: '#DC2626' },
                label: { fontSize: 9, fontWeight: 'bold', color: '#FFFFFF', offset: [0, -2] },
              },
            ],
          },
        },
      ],
    }
  }, [])

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 flex flex-col justify-between shadow-2xs select-none h-full min-h-[420px] font-sans">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600 border border-amber-200 shadow-2xs">
            <Flame className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 tracking-wide flex items-center gap-2">
              <span>Peak Hour &amp; Traffic Forecast</span>
              <span className="text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 font-semibold font-mono">
                AI Predictive Engine
              </span>
            </h3>
            <p className="text-[11px] text-slate-500 font-normal mt-0.5">
              Hourly footfall density forecast and predictive surge mitigation window
            </p>
          </div>
        </div>

        <span className="text-[10px] text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200 font-bold font-mono shadow-2xs">
          Peak Rush at 18:00
        </span>
      </div>

      {/* 3 Core Stats Cards */}
      <div className="grid grid-cols-3 gap-2.5 my-2">
        <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/90 shadow-2xs">
          <span className="text-[10px] text-slate-500 block font-medium">Next Surge Window</span>
          <div className="text-sm font-bold text-rose-700 font-mono mt-0.5">18:00 – 19:30</div>
          <div className="text-[10px] text-slate-500 mt-0.5">~420 peak shoppers</div>
        </div>

        <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/90 shadow-2xs">
          <span className="text-[10px] text-slate-500 block font-medium">Current vs Peak</span>
          <div className="text-sm font-bold text-slate-900 font-mono mt-0.5">{currentOccupancy} / 420</div>
          <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">
            {occupancyPct}% of capacity
          </div>
        </div>

        <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/90 shadow-2xs">
          <span className="text-[10px] text-slate-500 block font-medium">Top Traffic Zone</span>
          <div className="text-sm font-bold text-sky-700 truncate mt-0.5">
            {busiestZone && busiestZone.currentOccupancy > 0 ? busiestZone.name : 'Produce A1'}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {busiestZone ? `${busiestZone.currentOccupancy} active shoppers` : '18 active shoppers'}
          </div>
        </div>
      </div>

      {/* Mini Projected Hourly Curve Chart */}
      <div className="h-28 w-full my-1 rounded-xl bg-slate-50/50 border border-slate-100 p-1">
        <ReactECharts option={chartOption} style={{ height: '100%', width: '100%' }} opts={{ renderer: 'canvas' }} />
      </div>

      {/* AI Surge Advisory Banner */}
      <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-200/80 text-xs flex flex-col justify-between shadow-2xs mt-2">
        <div className="space-y-1">
          <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-amber-600" />
            <span>AI Surge Advisory for Peak Window</span>
          </div>
          <p className="text-[11px] text-slate-700 leading-relaxed font-sans">
            Expected +35% traffic surge in <strong className="text-slate-900">Fresh Produce</strong> and <strong className="text-slate-900">Checkout C1/C2</strong> from 18:00. Pre-stage 2 express registers and restock produce aisle A1 before 17:45.
          </p>
        </div>

        <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between mt-2">
          <span className="text-[10px] text-amber-800 font-mono font-semibold">
            ✓ 2 Staff Reallocations Recommended
          </span>
          <Button
            variant="ghost"
            size="xs"
            onClick={() => navigate('/staff')}
            className="text-sky-700 hover:text-sky-800 gap-1 text-[11px] h-6 px-2 font-bold cursor-pointer"
          >
            <span>Staff Roster</span>
            <ArrowRight className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  )
}
