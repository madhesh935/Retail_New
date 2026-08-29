import React, { useState } from 'react'
import {
  Route,
  ArrowRight,
  Sparkles,
  Footprints,
  Compass,
  Clock,
  Navigation,
  CheckCircle2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export interface CustomerRoute {
  id: string
  name: string
  percentage: number
  steps: string[]
  description: string
  color: string
  svgPath: string
  avgTimeMinutes: number
  peakWindow: string
  activeZoneIds: string[]
  startCoords: { x: number; y: number }
  endCoords: { x: number; y: number }
  waypoints: { x: number; y: number; label: string }[]
}

export const CUSTOMER_ROUTES: CustomerRoute[] = [
  {
    id: 'route-a',
    name: 'Quick Refreshment & Snacks',
    percentage: 34,
    steps: ['Entrance', 'Beverages', 'Snacks', 'Checkout'],
    description: 'Fast convenience grab-and-go trip · Highest volume during evening rush',
    color: '#0284C7', // Sky Blue
    svgPath: 'M 200 42 Q 260 78 325 102 T 325 180 T 295 260',
    avgTimeMinutes: 4.2,
    peakWindow: '17:00 - 19:30',
    activeZoneIds: ['entrance', 'beverages', 'checkout'],
    startCoords: { x: 200, y: 42 },
    endCoords: { x: 295, y: 260 },
    waypoints: [
      { x: 325, y: 102, label: 'Beverages' },
    ],
  },
  {
    id: 'route-b',
    name: 'Fresh Grocery Basket',
    percentage: 28,
    steps: ['Entrance', 'Produce', 'Dairy', 'Checkout'],
    description: 'Perimeter fresh loop with large basket volume and high dwell time',
    color: '#059669', // Emerald Green
    svgPath: 'M 200 42 Q 130 65 75 102 T 200 102 T 200 180 T 280 260',
    avgTimeMinutes: 12.5,
    peakWindow: '11:00 - 14:00',
    activeZoneIds: ['entrance', 'produce', 'dairy', 'checkout'],
    startCoords: { x: 200, y: 42 },
    endCoords: { x: 280, y: 260 },
    waypoints: [
      { x: 75, y: 102, label: 'Produce' },
      { x: 200, y: 102, label: 'Dairy' },
    ],
  },
  {
    id: 'route-c',
    name: 'Household & Pantry Staples',
    percentage: 21,
    steps: ['Entrance', 'Household', 'Dairy', 'Checkout'],
    description: 'Routine weekly restocking loop with targeted item pickups',
    color: '#D97706', // Warm Amber
    svgPath: 'M 200 42 Q 95 105 75 180 T 175 180 T 270 260',
    avgTimeMinutes: 8.8,
    peakWindow: '15:00 - 18:00',
    activeZoneIds: ['entrance', 'household', 'dairy', 'checkout'],
    startCoords: { x: 200, y: 42 },
    endCoords: { x: 270, y: 260 },
    waypoints: [
      { x: 75, y: 180, label: 'Household' },
      { x: 175, y: 180, label: 'Dairy' },
    ],
  },
  {
    id: 'route-d',
    name: 'High-Value Electronics & Care',
    percentage: 17,
    steps: ['Entrance', 'Electronics', 'Personal Care', 'Checkout'],
    description: 'Extended dwell comparison browsing with high basket value conversion',
    color: '#7C3AED', // Royal Purple
    svgPath: 'M 200 42 Q 190 105 180 180 T 260 180 T 260 260',
    avgTimeMinutes: 16.2,
    peakWindow: '18:00 - 21:00',
    activeZoneIds: ['entrance', 'electronics', 'checkout'],
    startCoords: { x: 200, y: 42 },
    endCoords: { x: 260, y: 260 },
    waypoints: [
      { x: 180, y: 180, label: 'Electronics' },
    ],
  },
]

export const CustomerFlowMap: React.FC = () => {
  const [selectedRouteId, setSelectedRouteId] = useState<string>('route-a')

  const activeRoute =
    CUSTOMER_ROUTES.find((r) => r.id === selectedRouteId) || CUSTOMER_ROUTES[0]

  const isZoneActive = (zoneId: string) => activeRoute.activeZoneIds.includes(zoneId)

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 flex flex-col justify-between shadow-2xs select-none h-full min-h-[440px] font-sans">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-sky-50 text-sky-600 border border-sky-200 shadow-2xs">
            <Route className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 tracking-wide flex items-center gap-2">
              <span>Shopper Flow Patterns</span>
              <span className="text-[10px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200 font-semibold font-mono">
                Real-Time Pathways
              </span>
            </h3>
            <p className="text-[11px] text-slate-500 font-normal mt-0.5">
              Live sequential route progression mapped across retail floor zones
            </p>
          </div>
        </div>

        <span className="text-[10px] text-sky-700 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-200 font-bold font-mono shadow-2xs">
          4 Dominant Routes
        </span>
      </div>

      {/* Main Flow Content */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 my-3 flex-1 items-stretch">
        {/* Left 6 cols: Enhanced White-Theme SVG Floor Overlay */}
        <div className="md:col-span-6 relative h-72 md:h-auto rounded-xl bg-gradient-to-b from-slate-50/90 via-white to-slate-50/70 border border-slate-200/90 overflow-hidden p-3 flex flex-col justify-between shadow-xs">
          {/* Top Overlay Badge Bar */}
          <div className="flex items-center justify-between z-10 text-[10px]">
            <span className="px-2 py-1 rounded-md bg-white border border-slate-200 text-slate-700 font-bold font-mono flex items-center gap-1.5 shadow-2xs">
              <Compass className="h-3 w-3 text-sky-600" />
              <span>Store Floor Blueprint</span>
            </span>

            <span
              className="font-bold font-mono px-2.5 py-1 rounded-md border text-[10px] shadow-2xs"
              style={{
                backgroundColor: `${activeRoute.color}10`,
                borderColor: `${activeRoute.color}40`,
                color: activeRoute.color,
              }}
            >
              {activeRoute.percentage}% of Shoppers
            </span>
          </div>

          {/* SVG Map Canvas */}
          <svg className="w-full h-full my-1.5" viewBox="0 0 400 305">
            <defs>
              {/* Subtle Architectural Blueprint Grid */}
              <pattern id="flow-grid-light" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#F1F5F9" strokeWidth="1" />
                <circle cx="20" cy="20" r="0.8" fill="#E2E8F0" />
              </pattern>

              {/* Dynamic Path Glow Filter */}
              <filter id="route-shadow" x="-10%" y="-10%" width="130%" height="130%">
                <feDropShadow dx="0" dy="3" stdDeviation="3.5" floodColor={activeRoute.color} floodOpacity="0.30" />
              </filter>
            </defs>

            {/* Background Grid */}
            <rect width="400" height="305" fill="url(#flow-grid-light)" rx="8" />

            {/* 1. ENTRANCE ZONE */}
            <g>
              <rect
                x="140"
                y="14"
                width="120"
                height="32"
                rx="6"
                fill={isZoneActive('entrance') ? '#F0FDF4' : '#FFFFFF'}
                stroke={isZoneActive('entrance') ? '#10B981' : '#CBD5E1'}
                strokeWidth={isZoneActive('entrance') ? '2' : '1.2'}
                filter="drop-shadow(0 1px 2px rgba(0,0,0,0.04))"
              />
              <text
                x="200"
                y="34"
                fill={isZoneActive('entrance') ? '#065F46' : '#64748B'}
                fontSize="10"
                textAnchor="middle"
                fontWeight="bold"
                fontFamily="system-ui"
                letterSpacing="0.5"
              >
                ENTRANCE
              </text>
            </g>

            {/* 2. PRODUCE ZONE */}
            <g>
              <rect
                x="25"
                y="74"
                width="100"
                height="56"
                rx="6"
                fill={isZoneActive('produce') ? `${activeRoute.color}0D` : '#FFFFFF'}
                stroke={isZoneActive('produce') ? activeRoute.color : '#E2E8F0'}
                strokeWidth={isZoneActive('produce') ? '2' : '1.2'}
                filter="drop-shadow(0 1px 2px rgba(0,0,0,0.03))"
              />
              <rect x="33" y="82" width="6" height="6" rx="1.5" fill="#10B981" />
              <text
                x="75"
                y="104"
                fill={isZoneActive('produce') ? '#0F172A' : '#475569'}
                fontSize="10"
                textAnchor="middle"
                fontWeight={isZoneActive('produce') ? 'bold' : '600'}
                fontFamily="system-ui"
              >
                Produce
              </text>
              <text x="75" y="118" fill="#94A3B8" fontSize="8" textAnchor="middle" fontFamily="system-ui">
                Island A1
              </text>
            </g>

            {/* 3. DAIRY ZONE */}
            <g>
              <rect
                x="150"
                y="74"
                width="100"
                height="56"
                rx="6"
                fill={isZoneActive('dairy') ? `${activeRoute.color}0D` : '#FFFFFF'}
                stroke={isZoneActive('dairy') ? activeRoute.color : '#E2E8F0'}
                strokeWidth={isZoneActive('dairy') ? '2' : '1.2'}
                filter="drop-shadow(0 1px 2px rgba(0,0,0,0.03))"
              />
              <rect x="158" y="82" width="6" height="6" rx="1.5" fill="#0284C7" />
              <text
                x="200"
                y="104"
                fill={isZoneActive('dairy') ? '#0F172A' : '#475569'}
                fontSize="10"
                textAnchor="middle"
                fontWeight={isZoneActive('dairy') ? 'bold' : '600'}
                fontFamily="system-ui"
              >
                Dairy &amp; Chilled
              </text>
              <text x="200" y="118" fill="#94A3B8" fontSize="8" textAnchor="middle" fontFamily="system-ui">
                Wall Bay C2
              </text>
            </g>

            {/* 4. BEVERAGES ZONE */}
            <g>
              <rect
                x="275"
                y="74"
                width="100"
                height="56"
                rx="6"
                fill={isZoneActive('beverages') ? `${activeRoute.color}0D` : '#FFFFFF'}
                stroke={isZoneActive('beverages') ? activeRoute.color : '#E2E8F0'}
                strokeWidth={isZoneActive('beverages') ? '2' : '1.2'}
                filter="drop-shadow(0 1px 2px rgba(0,0,0,0.03))"
              />
              <rect x="283" y="82" width="6" height="6" rx="1.5" fill="#F59E0B" />
              <text
                x="325"
                y="104"
                fill={isZoneActive('beverages') ? '#0F172A' : '#475569'}
                fontSize="10"
                textAnchor="middle"
                fontWeight={isZoneActive('beverages') ? 'bold' : '600'}
                fontFamily="system-ui"
              >
                Beverages
              </text>
              <text x="325" y="118" fill="#94A3B8" fontSize="8" textAnchor="middle" fontFamily="system-ui">
                Gondola B4
              </text>
            </g>

            {/* 5. HOUSEHOLD ZONE */}
            <g>
              <rect
                x="25"
                y="155"
                width="100"
                height="56"
                rx="6"
                fill={isZoneActive('household') ? `${activeRoute.color}0D` : '#FFFFFF'}
                stroke={isZoneActive('household') ? activeRoute.color : '#E2E8F0'}
                strokeWidth={isZoneActive('household') ? '2' : '1.2'}
                filter="drop-shadow(0 1px 2px rgba(0,0,0,0.03))"
              />
              <rect x="33" y="163" width="6" height="6" rx="1.5" fill="#64748B" />
              <text
                x="75"
                y="185"
                fill={isZoneActive('household') ? '#0F172A' : '#475569'}
                fontSize="10"
                textAnchor="middle"
                fontWeight={isZoneActive('household') ? 'bold' : '600'}
                fontFamily="system-ui"
              >
                Household
              </text>
              <text x="75" y="199" fill="#94A3B8" fontSize="8" textAnchor="middle" fontFamily="system-ui">
                Bay E3
              </text>
            </g>

            {/* 6. ELECTRONICS / CARE ZONE */}
            <g>
              <rect
                x="150"
                y="155"
                width="100"
                height="56"
                rx="6"
                fill={isZoneActive('electronics') ? `${activeRoute.color}0D` : '#FFFFFF'}
                stroke={isZoneActive('electronics') ? activeRoute.color : '#E2E8F0'}
                strokeWidth={isZoneActive('electronics') ? '2' : '1.2'}
                filter="drop-shadow(0 1px 2px rgba(0,0,0,0.03))"
              />
              <rect x="158" y="163" width="6" height="6" rx="1.5" fill="#7C3AED" />
              <text
                x="200"
                y="185"
                fill={isZoneActive('electronics') ? '#0F172A' : '#475569'}
                fontSize="10"
                textAnchor="middle"
                fontWeight={isZoneActive('electronics') ? 'bold' : '600'}
                fontFamily="system-ui"
              >
                Electronics
              </text>
              <text x="200" y="199" fill="#94A3B8" fontSize="8" textAnchor="middle" fontFamily="system-ui">
                Hub D1
              </text>
            </g>

            {/* 7. CHECKOUT ZONE */}
            <g>
              <rect
                x="240"
                y="238"
                width="135"
                height="44"
                rx="6"
                fill={isZoneActive('checkout') ? '#F0F9FF' : '#FFFFFF'}
                stroke={isZoneActive('checkout') ? '#0284C7' : '#CBD5E1'}
                strokeWidth={isZoneActive('checkout') ? '2' : '1.2'}
                filter="drop-shadow(0 1px 3px rgba(2,132,199,0.08))"
              />
              <text
                x="307"
                y="265"
                fill={isZoneActive('checkout') ? '#0369A1' : '#64748B'}
                fontSize="10"
                textAnchor="middle"
                fontWeight="bold"
                fontFamily="system-ui"
                letterSpacing="0.5"
              >
                CHECKOUT (C1-C4)
              </text>
            </g>

            {/* Glowing Active Route Line */}
            <path
              d={activeRoute.svgPath}
              fill="none"
              stroke={activeRoute.color}
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="7 5"
              filter="url(#route-shadow)"
              className="transition-all duration-500"
            />

            {/* Route Start Point (Entrance) */}
            <circle cx={activeRoute.startCoords.x} cy={activeRoute.startCoords.y} r="8" fill={activeRoute.color} opacity="0.2" />
            <circle cx={activeRoute.startCoords.x} cy={activeRoute.startCoords.y} r="5" fill={activeRoute.color} stroke="#FFFFFF" strokeWidth="2" />

            {/* Intermediate Waypoints */}
            {activeRoute.waypoints.map((wp, i) => (
              <g key={i}>
                <circle cx={wp.x} cy={wp.y} r="6" fill={activeRoute.color} opacity="0.25" />
                <circle cx={wp.x} cy={wp.y} r="3.5" fill="#FFFFFF" stroke={activeRoute.color} strokeWidth="2" />
              </g>
            ))}

            {/* Destination Point (Checkout) */}
            <circle cx={activeRoute.endCoords.x} cy={activeRoute.endCoords.y} r="8" fill="#0284C7" opacity="0.25" />
            <circle cx={activeRoute.endCoords.x} cy={activeRoute.endCoords.y} r="4.5" fill="#0284C7" stroke="#FFFFFF" strokeWidth="2" />
          </svg>

          {/* Bottom Summary Bar */}
          <div className="text-[10px] text-slate-600 z-10 flex items-center justify-between border-t border-slate-200/80 pt-2 bg-white/80 backdrop-blur-xs px-2 py-1.5 rounded-lg">
            <span className="truncate">
              Selected: <strong className="text-slate-900 font-semibold">{activeRoute.name}</strong>
            </span>
            <span className="font-mono text-slate-700 shrink-0 font-medium">
              Avg Dwell: <strong className="text-slate-900">{activeRoute.avgTimeMinutes} min</strong>
            </span>
          </div>
        </div>

        {/* Right 6 cols: Clickable Route Cards */}
        <div className="md:col-span-6 space-y-2 flex flex-col justify-between">
          {CUSTOMER_ROUTES.map((route, idx) => {
            const isSelected = selectedRouteId === route.id

            return (
              <button
                key={route.id}
                type="button"
                onClick={() => setSelectedRouteId(route.id)}
                className={cn(
                  'p-3 rounded-xl border text-left transition-all cursor-pointer w-full flex flex-col justify-between shadow-2xs',
                  isSelected
                    ? 'bg-sky-50/40 border-sky-400 ring-2 ring-sky-300/80 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                )}
              >
                {/* Route Title & Percentage */}
                <div className="flex items-center justify-between w-full mb-1">
                  <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
                    <span
                      className="h-2.5 w-2.5 rounded-full shrink-0 shadow-2xs"
                      style={{ backgroundColor: route.color }}
                    />
                    <span>{idx + 1}. {route.name}</span>
                  </div>
                  <span
                    className="text-xs font-bold font-mono px-2 py-0.5 rounded-md border shadow-2xs"
                    style={{
                      backgroundColor: `${route.color}15`,
                      borderColor: `${route.color}35`,
                      color: route.color,
                    }}
                  >
                    {route.percentage}%
                  </span>
                </div>

                {/* Pathway Steps */}
                <div className="text-[11px] text-slate-700 flex items-center gap-1 flex-wrap my-1 font-mono">
                  {route.steps.map((step, i) => (
                    <React.Fragment key={i}>
                      <span
                        className={cn(
                          'px-1.5 py-0.5 rounded text-[10px]',
                          i === 0 || i === route.steps.length - 1
                            ? 'bg-slate-100 text-slate-900 font-bold'
                            : 'bg-slate-50 text-slate-700 font-medium'
                        )}
                      >
                        {step}
                      </span>
                      {i < route.steps.length - 1 && (
                        <ArrowRight className="h-2.5 w-2.5 text-slate-400 shrink-0" />
                      )}
                    </React.Fragment>
                  ))}
                </div>

                {/* Progress Density Bar */}
                <div className="w-full bg-slate-100 rounded-full h-1 my-1 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${route.percentage * 2}%`,
                      backgroundColor: route.color,
                    }}
                  />
                </div>

                {/* Route Description & Peak Window */}
                <div className="text-[10px] text-slate-500 mt-0.5 flex items-center justify-between">
                  <span className="truncate">{route.description}</span>
                  <span className="font-semibold text-slate-700 ml-2 shrink-0 font-mono flex items-center gap-1">
                    <Clock className="h-2.5 w-2.5 text-slate-400" />
                    <span>Peak: {route.peakWindow}</span>
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="pt-2.5 border-t border-slate-100 text-[10px] text-slate-500 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <Footprints className="h-3.5 w-3.5 text-sky-600" />
          <span>Anonymous multi-sensor pathway sequencing &amp; cross-zone transition graph</span>
        </span>
        <span className="text-emerald-700 font-bold flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3" />
          <span>96.4% Path Accuracy</span>
        </span>
      </div>
    </div>
  )
}
