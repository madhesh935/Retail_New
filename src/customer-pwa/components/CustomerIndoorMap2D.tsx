import React, { useState, useRef, useEffect, useMemo } from 'react'
import {
  MapPin,
  Navigation,
  ShoppingBag,
  Sparkles,
  CheckCircle2,
  ZoomIn,
  ZoomOut,
  Compass,
  X,
  CreditCard,
  Tag,
  AlertTriangle,
  ChevronRight,
  Plus,
  Check,
  Footprints,
  LocateFixed,
  Zap,
} from 'lucide-react'
import { useCustomerShopping, CustomerProduct } from '../context/CustomerShoppingContext'

interface WaypointPoint {
  index: number
  x: number
  y: number
  title: string
  location: string
  shelf: string
  productId?: string
  aisle: string
}

export const CustomerIndoorMap2D: React.FC = () => {
  const {
    optimizedRoute,
    navigationPlan,
    activeStepIndex,
    setActiveStepIndex,
    isAisle4Congested,
    useCrowdAlternativeRoute,
    isNavigatingToCheckout,
    targetCheckoutCounter,
    shoppingList,
    addToShoppingList,
  } = useCustomerShopping()

  const [selectedPin, setSelectedPin] = useState<CustomerProduct | null>(null)
  const [zoomLevel, setZoomLevel] = useState<number>(1.18)
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [isAutoFollowing, setIsAutoFollowing] = useState(true)
  const dragStartRef = useRef({ x: 0, y: 0, initialPanX: 0, initialPanY: 0 })

  // Define 6 primary sequence waypoints on store coordinate grid (600 × 420)
  const WAYPOINTS: WaypointPoint[] = useMemo(
    () => optimizedRoute.map((step, index) => ({
      index,
      x: step.mapCoord.x,
      y: step.mapCoord.y,
      title: step.title,
      location: step.location,
      shelf: step.item?.shelf || (index === 0 ? 'Start' : `Lane ${targetCheckoutCounter}`),
      aisle: step.item?.aisle || (index === 0 ? 'Entry' : 'Checkout'),
      productId: step.item?.id,
    })),
    [optimizedRoute, targetCheckoutCounter]
  )

  // Current active waypoint target
  const currentWaypointIndex = Math.min(WAYPOINTS.length - 1, Math.max(0, activeStepIndex))
  const currentTarget = WAYPOINTS[currentWaypointIndex] || WAYPOINTS[1]
  const finalWaypointIndex = Math.max(0, WAYPOINTS.length - 1)
  const activeAisle = currentTarget?.aisle

  // Customer marker position follows active step coordinates
  const customerCoord = useMemo(() => {
    const waypoint = WAYPOINTS[currentWaypointIndex]
    return waypoint ? { x: waypoint.x, y: waypoint.y } : { x: 75, y: 345 }
  }, [WAYPOINTS, currentWaypointIndex])

  // Dynamic Camera Auto-Center with spring-like smooth movement
  useEffect(() => {
    if (!isAutoFollowing) return

    const targetX = customerCoord.x
    const targetY = customerCoord.y

    const newPanX = Math.max(-140, Math.min(140, (300 - targetX) * 0.7))
    const newPanY = Math.max(-100, Math.min(100, (210 - targetY) * 0.7))

    setPanOffset({ x: newPanX, y: newPanY })
    setZoomLevel(1.22)
  }, [activeStepIndex, customerCoord, isAutoFollowing])

  // Touch & Mouse Drag to Pan
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setIsAutoFollowing(false)
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      initialPanX: panOffset.x,
      initialPanY: panOffset.y,
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    const dx = e.clientX - dragStartRef.current.x
    const dy = e.clientY - dragStartRef.current.y
    setPanOffset({
      x: Math.max(-160, Math.min(160, dragStartRef.current.initialPanX + dx * 0.8)),
      y: Math.max(-120, Math.min(120, dragStartRef.current.initialPanY + dy * 0.8)),
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true)
      setIsAutoFollowing(false)
      dragStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        initialPanX: panOffset.x,
        initialPanY: panOffset.y,
      }
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return
    const dx = e.touches[0].clientX - dragStartRef.current.x
    const dy = e.touches[0].clientY - dragStartRef.current.y
    setPanOffset({
      x: Math.max(-160, Math.min(160, dragStartRef.current.initialPanX + dx * 0.8)),
      y: Math.max(-120, Math.min(120, dragStartRef.current.initialPanY + dy * 0.8)),
    })
  }

  const recenterOnCustomer = () => {
    setIsAutoFollowing(true)
    const targetX = customerCoord.x
    const targetY = customerCoord.y
    setPanOffset({
      x: Math.max(-140, Math.min(140, (300 - targetX) * 0.7)),
      y: Math.max(-100, Math.min(100, (210 - targetY) * 0.7)),
    })
    setZoomLevel(1.22)
  }

  const routeLegs = useMemo(() => {
    if (navigationPlan?.legs.length) {
      return navigationPlan.legs.map((leg) => ({
        id: leg.id,
        legIndex: leg.legIndex,
        d: leg.svgPath,
        from: leg.nodes[0]?.label || 'Previous stop',
        to: leg.destinationLabel,
      }))
    }
    return WAYPOINTS.slice(1).map((waypoint, index) => {
      const previous = WAYPOINTS[index]
      return {
        id: `fallback-leg-${index + 1}`,
        legIndex: index + 1,
        d: `M ${previous.x} ${previous.y} L ${previous.x} ${waypoint.y} L ${waypoint.x} ${waypoint.y}`,
        from: previous.title,
        to: waypoint.title,
      }
    })
  }, [navigationPlan, WAYPOINTS])

  return (
    <div className="relative w-full h-full flex flex-col justify-between select-none overflow-hidden rounded-3xl bg-[#F8FAFC]">
      {/* 1. Dynamic Live Turn-by-Turn Header Overlay */}
      <div className="absolute top-3 left-3 right-16 z-20 pointer-events-auto">
        <div className="bg-white/95 backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative flex items-center justify-center">
              <span className="absolute -inset-1 rounded-xl bg-cyan-400 opacity-40 animate-ping" />
              <div className="relative h-8 w-8 rounded-xl bg-gradient-to-tr from-teal-700 to-teal-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-sm">
                {currentWaypointIndex >= finalWaypointIndex ? '✓' : currentWaypointIndex}
              </div>
            </div>

            <div className="min-w-0">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-700 flex items-center gap-1.5 leading-none">
                <span>{currentWaypointIndex >= finalWaypointIndex ? 'ARRIVED AT BILLING' : `NAVIGATING TO STOP ${currentWaypointIndex} OF ${Math.max(0, finalWaypointIndex - 1)}`}</span>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-600" />
                </span>
              </div>
              <div className="text-xs font-black text-slate-900 truncate mt-0.5 flex items-center gap-1.5">
                <span>{currentTarget?.title}</span>
                <span className="text-[10px] font-bold text-cyan-800 bg-cyan-100 px-1.5 py-0.2 rounded">
                  {currentTarget?.shelf}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={recenterOnCustomer}
            className={`px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer shrink-0 flex items-center gap-1.5 text-[11px] font-bold shadow-2xs ${
              isAutoFollowing
                ? 'bg-cyan-600 border-cyan-600 text-white'
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
            }`}
            title="Auto-Follow Active Step"
          >
            <LocateFixed className="h-3.5 w-3.5" />
            <span className="text-[10px]">{isAutoFollowing ? 'Tracking' : 'Follow'}</span>
          </button>
        </div>
      </div>

      {/* Floating Map Controls (Top-Right) */}
      <div className="absolute top-3 right-3 z-20 flex flex-col items-center gap-1 bg-white/95 backdrop-blur-md p-1 rounded-2xl border border-slate-200 shadow-sm pointer-events-auto">
        <button
          onClick={recenterOnCustomer}
          className="p-1.5 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Center on Target Stop"
        >
          <Compass className="h-3.5 w-3.5 text-cyan-600" />
        </button>
        <button
          onClick={() => setZoomLevel((z) => Math.min(1.65, z + 0.15))}
          className="p-1.5 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Zoom In"
        >
          <ZoomIn className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => setZoomLevel((z) => Math.max(0.85, z - 0.15))}
          className="p-1.5 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Zoom Out"
        >
          <ZoomOut className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* 2. INTERACTIVE SVG MAP CANVAS WITH LIVELY ANIMATIONS */}
      <div
        className="relative flex-1 w-full h-full overflow-hidden flex items-center justify-center cursor-grab active:cursor-grabbing touch-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={() => setIsDragging(false)}
      >
        <svg
          viewBox="0 0 600 420"
          className="w-full h-full transition-transform duration-600 cubic-bezier(0.25, 1, 0.5, 1)"
          style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
          }}
        >
          {/* DEFINITIONS & LIVELY CSS KEYFRAMES */}
          <defs>
            {/* Embedded CSS Animations for smooth continuous route flow */}
            <style>
              {`
                @keyframes livelyFlow {
                  0% { stroke-dashoffset: 40; }
                  100% { stroke-dashoffset: 0; }
                }
                @keyframes pulseBeaconGlow {
                  0% { r: 12px; opacity: 0.7; }
                  50% { r: 24px; opacity: 0.15; }
                  100% { r: 12px; opacity: 0.7; }
                }
                @keyframes floatingTargetPin {
                  0%, 100% { transform: translateY(0px); }
                  50% { transform: translateY(-4px); }
                }
                .lively-route-dash {
                  animation: livelyFlow 1s linear infinite;
                }
                .floating-target-pin {
                  animation: floatingTargetPin 1.8s ease-in-out infinite;
                }
              `}
            </style>

            {/* Tile Floor Grid Pattern */}
            <pattern id="supermarketTiles" width="25" height="25" patternUnits="userSpaceOnUse">
              <rect width="25" height="25" fill="#F8FAFC" />
              <path d="M 25 0 L 0 0 0 25" fill="none" stroke="#E2E8F0" strokeWidth="0.75" />
            </pattern>

            {/* Gondola Shelf 3D Shadow */}
            <filter id="gondolaShadow" x="-8%" y="-8%" width="120%" height="120%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#0F172A" floodOpacity="0.08" />
            </filter>

            {/* Glowing Active Laser Aura */}
            <filter id="routeGlowFilter" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="0" stdDeviation="4.5" floodColor="#0F766E" floodOpacity="0.8" />
            </filter>

            {/* Intense Photon Glow */}
            <filter id="photonGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#2DD4BF" floodOpacity="1" />
            </filter>

            {/* Crowd Congestion Heatmap Gradient */}
            <radialGradient id="heatGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.35" />
              <stop offset="60%" stopColor="#FEF3C7" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#FEF3C7" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* STORE FOUNDATION & FLOOR */}
          <rect x="0" y="0" width="600" height="420" fill="#F1F5F9" />
          <rect
            x="10"
            y="10"
            width="580"
            height="400"
            rx="20"
            fill="url(#supermarketTiles)"
            stroke="#CBD5E1"
            strokeWidth="3"
          />

          {/* MAIN PROMENADE & WALKWAY CORRIDORS */}
          {/* North Bypass Concourse */}
          <rect x="18" y="28" width="564" height="24" rx="6" fill="#FFFFFF" opacity="0.7" />
          <text x="28" y="44" fill="#94A3B8" fontSize="8" fontWeight="bold">NORTH CONCOURSE</text>

          {/* Middle Walkway Concourse */}
          <rect x="18" y="148" width="564" height="28" rx="6" fill="#FFFFFF" opacity="0.85" />
          <text x="28" y="165" fill="#94A3B8" fontSize="8" fontWeight="bold">CENTRAL MAIN AISLE</text>

          {/* South Walkway Concourse */}
          <rect x="18" y="282" width="564" height="28" rx="6" fill="#FFFFFF" opacity="0.85" />
          <text x="28" y="300" fill="#94A3B8" fontSize="8" fontWeight="bold">CHECKOUT CONCOURSE</text>

          {/* STORE AMENITIES (LEFT FLANK) */}
          {/* Customer Service Help Desk */}
          <g transform="translate(18, 62)">
            <rect x="0" y="0" width="75" height="55" rx="8" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.5" filter="url(#gondolaShadow)" />
            <text x="37.5" y="20" fill="#0F766E" fontSize="8" fontWeight="800" textAnchor="middle">HELP DESK</text>
            <text x="37.5" y="33" fill="#64748B" fontSize="6.5" fontWeight="600" textAnchor="middle">Customer Care</text>
            <text x="37.5" y="44" fill="#94A3B8" fontSize="6" textAnchor="middle">Lost &amp; Found</text>
          </g>

          {/* Restrooms Area */}
          <g transform="translate(18, 185)">
            <rect x="0" y="0" width="75" height="55" rx="8" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.5" filter="url(#gondolaShadow)" />
            <text x="37.5" y="20" fill="#475569" fontSize="8" fontWeight="800" textAnchor="middle">RESTROOMS</text>
            <text x="37.5" y="33" fill="#64748B" fontSize="6.5" fontWeight="600" textAnchor="middle">Men &amp; Women</text>
            <text x="37.5" y="44" fill="#94A3B8" fontSize="6" textAnchor="middle">Accessible</text>
          </g>

          {/* Entrance & Cart Station */}
          <g transform="translate(18, 318)">
            <rect x="0" y="0" width="85" height="78" rx="10" fill="#ECFDF5" stroke="#6EE7B7" strokeWidth="2" filter="url(#gondolaShadow)" />
            <rect x="10" y="6" width="65" height="8" rx="3" fill="#059669" />
            <text x="42.5" y="12.5" fill="#FFFFFF" fontSize="5.5" fontWeight="bold" textAnchor="middle">AUTOMATIC GLASS ENTRY</text>
            <text x="42.5" y="32" fill="#065F46" fontSize="9" fontWeight="800" textAnchor="middle">ENTRANCE</text>
            <text x="42.5" y="46" fill="#047857" fontSize="7.5" fontWeight="600" textAnchor="middle">Cart &amp; Basket Corral</text>
            <text x="42.5" y="60" fill="#64748B" fontSize="6.5" fontWeight="bold" textAnchor="middle">START POINT</text>
          </g>

          {/* AISLES 1 TO 6 */}
          {/* AISLE 1: FRESH PRODUCE */}
          <g transform="translate(115, 60)">
            <rect x="0" y="0" width="90" height="80" rx="8" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" filter="url(#gondolaShadow)" />
            <rect x="0" y="0" width="90" height="22" rx="8" fill="#ECFDF5" />
            <text x="45" y="15" fill="#065F46" fontSize="8.5" fontWeight="800" textAnchor="middle">AISLE 1 • Produce</text>
            <rect x="8" y="28" width="34" height="20" rx="4" fill="#F0FDF4" stroke="#BBF7D0" strokeWidth="1" />
            <text x="25" y="41" fill="#15803D" fontSize="7.5" fontWeight="bold" textAnchor="middle">Shelf A1</text>
            <rect x="48" y="28" width="34" height="20" rx="4" fill="#F0FDF4" stroke="#BBF7D0" strokeWidth="1" />
            <text x="65" y="41" fill="#15803D" fontSize="7.5" fontWeight="bold" textAnchor="middle">Shelf A2</text>
            <text x="45" y="65" fill="#047857" fontSize="7" fontWeight="600" textAnchor="middle">Fruits &amp; Vegetables</text>
          </g>

          {/* AISLE 2: DAIRY & CHILLED */}
          <g transform="translate(115, 185)">
            <rect
              x="0"
              y="0"
              width="90"
              height="88"
              rx="8"
              fill="#FFFFFF"
              stroke={activeAisle === 'Aisle 2' ? '#0F766E' : '#2DD4BF'}
              strokeWidth={activeAisle === 'Aisle 2' ? '2.5' : '1.5'}
              filter="url(#gondolaShadow)"
            />
            <rect x="0" y="0" width="90" height="22" rx="8" fill="#E0F2FE" />
            <text x="45" y="15" fill="#0F766E" fontSize="8.5" fontWeight="800" textAnchor="middle">AISLE 2 • Dairy &amp; Milk</text>
            <rect x="8" y="28" width="22" height="22" rx="4" fill="#E0F2FE" stroke="#99F6E4" strokeWidth="1" />
            <text x="19" y="42" fill="#0F766E" fontSize="7" fontWeight="bold" textAnchor="middle">C1</text>
            <rect
              x="34"
              y="28"
              width="22"
              height="22"
              rx="4"
              fill={activeAisle === 'Aisle 2' ? '#BAE6FD' : '#E0F2FE'}
              stroke={activeAisle === 'Aisle 2' ? '#0F766E' : '#99F6E4'}
              strokeWidth={activeAisle === 'Aisle 2' ? '2' : '1'}
            />
            <text x="45" y="42" fill="#0F766E" fontSize="7" fontWeight="800" textAnchor="middle">C2★</text>
            <rect x="60" y="28" width="22" height="22" rx="4" fill="#E0F2FE" stroke="#99F6E4" strokeWidth="1" />
            <text x="71" y="42" fill="#0F766E" fontSize="7" fontWeight="bold" textAnchor="middle">C3</text>
            <text x="45" y="62" fill="#0F766E" fontSize="7" fontWeight="bold" textAnchor="middle">REFRIGERATED WALL</text>
            <text x="45" y="75" fill="#64748B" fontSize="6.5" textAnchor="middle">Milk, Butter &amp; Yogurt</text>
          </g>

          {/* AISLE 3: ARTISAN BAKERY */}
          <g transform="translate(225, 60)">
            <rect
              x="0"
              y="0"
              width="90"
              height="80"
              rx="8"
              fill="#FFFFFF"
              stroke={activeAisle === 'Aisle 3' ? '#D97706' : '#CBD5E1'}
              strokeWidth={activeAisle === 'Aisle 3' ? '2.5' : '1.5'}
              filter="url(#gondolaShadow)"
            />
            <rect x="0" y="0" width="90" height="22" rx="8" fill="#FEF3C7" />
            <text x="45" y="15" fill="#92400E" fontSize="8.5" fontWeight="800" textAnchor="middle">AISLE 3 • Bakery</text>
            <rect x="8" y="28" width="34" height="20" rx="4" fill="#FFFBEB" stroke="#FDE68A" strokeWidth="1" />
            <text x="25" y="41" fill="#B45309" fontSize="7.5" fontWeight="bold" textAnchor="middle">Shelf D1</text>
            <rect
              x="48"
              y="28"
              width="34"
              height="20"
              rx="4"
              fill={activeAisle === 'Aisle 3' ? '#FEF3C7' : '#FFFBEB'}
              stroke={activeAisle === 'Aisle 3' ? '#D97706' : '#FDE68A'}
              strokeWidth={activeAisle === 'Aisle 3' ? '2' : '1'}
            />
            <text x="65" y="41" fill="#92400E" fontSize="7.5" fontWeight="800" textAnchor="middle">D2</text>
            <text x="45" y="65" fill="#B45309" fontSize="7" fontWeight="600" textAnchor="middle">Bakery &amp; Ready Meals</text>
          </g>

          {/* AISLE 4: SNACKS & BISCUITS */}
          <g transform="translate(225, 185)">
            {isAisle4Congested && (
              <rect x="-12" y="-12" width="114" height="112" rx="16" fill="url(#heatGradient)" />
            )}
            <rect
              x="0"
              y="0"
              width="90"
              height="88"
              rx="8"
              fill="#FFFFFF"
              stroke={activeAisle === 'Aisle 4' ? '#F59E0B' : isAisle4Congested ? '#F59E0B' : '#CBD5E1'}
              strokeWidth={activeAisle === 'Aisle 4' ? '2.5' : isAisle4Congested ? '2' : '1.5'}
              filter="url(#gondolaShadow)"
            />
            <rect x="0" y="0" width="90" height="22" rx="8" fill={isAisle4Congested ? '#FEF3C7' : '#F8FAFC'} />
            <text x="45" y="15" fill={isAisle4Congested ? '#B45309' : '#334155'} fontSize="8.5" fontWeight="800" textAnchor="middle">AISLE 4 • Snacks</text>
            <rect x="8" y="28" width="34" height="20" rx="4" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1" />
            <text x="25" y="41" fill="#475569" fontSize="7.5" fontWeight="bold" textAnchor="middle">Shelf B2</text>
            <rect
              x="48"
              y="28"
              width="34"
              height="20"
              rx="4"
              fill={activeAisle === 'Aisle 4' ? '#FEF3C7' : '#F8FAFC'}
              stroke={activeAisle === 'Aisle 4' ? '#F59E0B' : '#CBD5E1'}
              strokeWidth={activeAisle === 'Aisle 4' ? '2' : '1'}
            />
            <text x="65" y="41" fill="#92400E" fontSize="7.5" fontWeight="800" textAnchor="middle">B4</text>
            <text x="45" y="62" fill="#64748B" fontSize="6.5" textAnchor="middle">Snacks, Juice &amp; Soft Drinks</text>
            {isAisle4Congested && (
              <text x="45" y="76" fill="#D97706" fontSize="6.5" fontWeight="800" textAnchor="middle">BUSY AISLE</text>
            )}
          </g>

          {/* AISLE 5: BEVERAGES */}
          <g transform="translate(335, 60)">
            <rect x="0" y="0" width="90" height="80" rx="8" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" filter="url(#gondolaShadow)" />
            <rect x="0" y="0" width="90" height="22" rx="8" fill="#F0FDF4" />
            <text x="45" y="15" fill="#166534" fontSize="8.5" fontWeight="800" textAnchor="middle">AISLE 5 • Staples</text>
            <rect x="8" y="28" width="34" height="20" rx="4" fill="#F0FDF4" stroke="#BBF7D0" strokeWidth="1" />
            <text x="25" y="41" fill="#15803D" fontSize="7.5" fontWeight="bold" textAnchor="middle">Shelf E1</text>
            <rect x="48" y="28" width="34" height="20" rx="4" fill="#F0FDF4" stroke="#BBF7D0" strokeWidth="1" />
            <text x="65" y="41" fill="#15803D" fontSize="7.5" fontWeight="bold" textAnchor="middle">Shelf E3</text>
            <text x="45" y="65" fill="#166534" fontSize="7" fontWeight="600" textAnchor="middle">Staples &amp; Personal Care</text>
          </g>

          {/* AISLE 6: PERSONAL CARE */}
          <g transform="translate(335, 185)">
            <rect
              x="0"
              y="0"
              width="90"
              height="88"
              rx="8"
              fill="#FFFFFF"
              stroke={activeAisle === 'Aisle 6' ? '#0F766E' : '#CBD5E1'}
              strokeWidth={activeAisle === 'Aisle 6' ? '2.5' : '1.5'}
              filter="url(#gondolaShadow)"
            />
            <rect x="0" y="0" width="90" height="22" rx="8" fill="#F3E8FF" />
            <text x="45" y="15" fill="#7E22CE" fontSize="8.5" fontWeight="800" textAnchor="middle">AISLE 6 • Home &amp; Tech</text>
            <rect x="8" y="28" width="34" height="20" rx="4" fill="#FAF5FF" stroke="#E9D5FF" strokeWidth="1" />
            <text x="25" y="41" fill="#7E22CE" fontSize="7.5" fontWeight="bold" textAnchor="middle">Shelf F2</text>
            <rect
              x="48"
              y="28"
              width="34"
              height="20"
              rx="4"
              fill={activeAisle === 'Aisle 6' ? '#F3E8FF' : '#FAF5FF'}
              stroke={activeAisle === 'Aisle 6' ? '#7E22CE' : '#E9D5FF'}
              strokeWidth={activeAisle === 'Aisle 6' ? '2' : '1'}
            />
            <text x="65" y="41" fill="#7E22CE" fontSize="7.5" fontWeight="800" textAnchor="middle">G1</text>
            <text x="45" y="62" fill="#64748B" fontSize="6.5" textAnchor="middle">Household &amp; Electronics</text>
          </g>

          {/* CHECKOUT COUNTERS FLANK */}
          <g transform="translate(455, 60)">
            <rect x="0" y="0" width="115" height="215" rx="12" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="1.5" filter="url(#gondolaShadow)" />
            <rect x="0" y="0" width="115" height="24" rx="12" fill="#0F172A" />
            <text x="57.5" y="16" fill="#FFFFFF" fontSize="8.5" fontWeight="800" textAnchor="middle">CHECKOUT LANES</text>

            {/* Counter C1 */}
            <rect x="10" y="32" width="95" height="42" rx="6" fill="#FFF1F2" stroke="#FDA4AF" strokeWidth="1.5" />
            <text x="18" y="48" fill="#E11D48" fontSize="8" fontWeight="800">Counter C1 (Express)</text>
            <text x="18" y="60" fill="#9F1239" fontSize="7">8 in queue · ~5.4m wait</text>
            <rect x="74" y="38" width="24" height="12" rx="3" fill="#E11D48" />
            <text x="86" y="47" fill="#FFFFFF" fontSize="6.5" fontWeight="bold" textAnchor="middle">BUSY</text>

            {/* Counter C2 - TARGET RECOMMENDED */}
            <rect
              x="10"
              y="82"
              width="95"
              height="48"
              rx="6"
              fill="#ECFDF5"
              stroke="#059669"
              strokeWidth={targetCheckoutCounter === 'C2' ? '2.5' : '1.5'}
            />
            <rect x="10" y="82" width="95" height="12" rx="4" fill="#059669" />
            <text x="57.5" y="91" fill="#FFFFFF" fontSize="6.5" fontWeight="bold" textAnchor="middle">FASTEST BILLING</text>
            <text x="18" y="108" fill="#047857" fontSize="8" fontWeight="800">Counter C2 ★</text>
            <text x="18" y="121" fill="#065F46" fontSize="7">2 in queue · ~1.8m wait</text>

            {/* Counter C3 */}
            <rect x="10" y="138" width="95" height="42" rx="6" fill="#FEF3C7" stroke="#FCD34D" strokeWidth="1" />
            <text x="18" y="154" fill="#B45309" fontSize="8" fontWeight="800">Counter C3 (Standard)</text>
            <text x="18" y="166" fill="#92400E" fontSize="7">3 in queue · ~3.1m wait</text>
          </g>

          {/* ========================================================================= */}
          {/* LIVELY DYNAMIC ROUTE LEGS WITH FLOWING PHOTON PARTICLES */}
          {/* ========================================================================= */}

          {routeLegs.map((leg) => {
            const isCompletedLeg = leg.legIndex < activeStepIndex
            const isCurrentLeg = leg.legIndex === activeStepIndex
            const isFutureLeg = leg.legIndex > activeStepIndex

            return (
              <g key={leg.id}>
                {/* 1. Completed Leg: Solid Emerald Green Path with Clear Completed Look */}
                {isCompletedLeg && (
                  <path
                    d={leg.d}
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.85"
                  />
                )}

                {/* 2. Current Active Leg: Multi-Layer Lively Glowing Laser & Moving Dashes */}
                {isCurrentLeg && (
                  <>
                    {/* Layer A: Ambient Glow Halo */}
                    <path
                      d={leg.d}
                      fill="none"
                      stroke="#0F766E"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      opacity="0.35"
                      filter="url(#routeGlowFilter)"
                    />

                    {/* Layer B: Solid Electric Cyan Base */}
                    <path
                      d={leg.d}
                      fill="none"
                      stroke="#0F766E"
                      strokeWidth="4.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {/* Layer C: Lively Animated Dashed Flow Line */}
                    <path
                      d={leg.d}
                      fill="none"
                      stroke="#FFFFFF"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeDasharray="8 8"
                      className="lively-route-dash"
                    />

                    {/* Layer D: Travelling High-Energy Photon Beads (Moving continuously along path) */}
                    <circle r="4.5" fill="#2DD4BF" filter="url(#photonGlow)">
                      <animateMotion dur="2.2s" repeatCount="indefinite" path={leg.d} />
                    </circle>
                    <circle r="3" fill="#FFFFFF">
                      <animateMotion dur="2.2s" begin="1.1s" repeatCount="indefinite" path={leg.d} />
                    </circle>
                  </>
                )}

                {/* 3. Future Upcoming Leg: Faint Dotted Path */}
                {isFutureLeg && (
                  <path
                    d={leg.d}
                    fill="none"
                    stroke="#CBD5E1"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                    strokeLinecap="round"
                    opacity="0.55"
                  />
                )}
              </g>
            )
          })}

          {/* ========================================================================= */}
          {/* SEQUENCED WAYPOINT PINS WITH LIVELY TARGET PIN & RIPPLE BEACONS */}
          {/* ========================================================================= */}

          {WAYPOINTS.map((wp) => {
            const isVisited = wp.index < activeStepIndex
            const isCurrent = wp.index === activeStepIndex
            const isNext = wp.index > activeStepIndex
            const product = wp.productId ? shoppingList.find((item) => item.id === wp.productId) || null : null

            return (
              <g
                key={wp.index}
                transform={`translate(${wp.x}, ${wp.y})`}
                className="cursor-pointer transition-all duration-300"
                onClick={() => product && setSelectedPin(product)}
              >
                {/* Active Target Multi-Ring Radar Pulses */}
                {isCurrent && (
                  <>
                    <circle cx="0" cy="0" r="26" fill="#0F766E" opacity="0.2" className="animate-ping" />
                    <circle cx="0" cy="0" r="16" fill="#2DD4BF" opacity="0.3" className="animate-pulse" />
                  </>
                )}

                {/* Waypoint Pin Circle */}
                <circle
                  cx="0"
                  cy="0"
                  r={isCurrent ? '14' : isVisited ? '10' : '11'}
                  fill={isCurrent ? '#0F766E' : isVisited ? '#10B981' : '#64748B'}
                  stroke="#FFFFFF"
                  strokeWidth={isCurrent ? '3' : '2'}
                  filter="url(#gondolaShadow)"
                />

                {/* Waypoint Icon / Number */}
                <text
                  x="0"
                  y={isVisited ? '3' : '3.5'}
                  fill="#FFFFFF"
                  fontSize={isCurrent ? '9.5' : '8'}
                  fontWeight="black"
                  textAnchor="middle"
                >
                  {isVisited ? '✓' : isCurrent ? '★' : wp.index === 0 ? '1' : wp.index}
                </text>

                {/* Floating Animated Target Badge Flag */}
                {isCurrent && (
                  <g transform="translate(0, -22)" className="floating-target-pin">
                    <rect x="-28" y="-14" width="56" height="15" rx="5" fill="#0F172A" stroke="#2DD4BF" strokeWidth="1" />
                    <text x="0" y="-3.5" fill="#2DD4BF" fontSize="7.5" fontWeight="900" textAnchor="middle">
                      {wp.shelf}
                    </text>
                  </g>
                )}
              </g>
            )
          })}

          {/* ========================================================================= */}
          {/* LIVELY MOVING CUSTOMER POSITION MARKER (● YOU) */}
          {/* ========================================================================= */}
          <g
            transform={`translate(${customerCoord.x}, ${customerCoord.y})`}
            style={{ transition: 'transform 800ms cubic-bezier(0.34, 1.56, 0.64, 1)' }}
            className="pointer-events-none"
          >
            {/* Triple Layer Pulsing Radar */}
            <circle cx="0" cy="0" r="28" fill="#0F766E" opacity="0.15" className="animate-ping" />
            <circle cx="0" cy="0" r="18" fill="#0F766E" opacity="0.25" className="animate-pulse" />
            <circle cx="0" cy="0" r="11" fill="#0F766E" stroke="#FFFFFF" strokeWidth="2.5" />
            <circle cx="0" cy="0" r="4" fill="#FFFFFF" />

            {/* Glowing Heading Arrow */}
            <polygon points="0,-16 -4,-11 4,-11" fill="#0F766E" />

            {/* YOU Floating Badge */}
            <g transform="translate(0, 14)">
              <rect x="-16" y="0" width="32" height="13" rx="4" fill="#0F766E" stroke="#FFFFFF" strokeWidth="1" />
              <text x="0" y="9" fill="#FFFFFF" fontSize="7.5" fontWeight="900" textAnchor="middle">
                YOU
              </text>
            </g>
          </g>
        </svg>

        {/* 3. INTERACTIVE FLOATING ITEM CARD ON PIN TAP */}
        {selectedPin && (
          <div className="absolute bottom-3 left-3 right-3 z-30 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-slate-200 shadow-2xl flex items-center justify-between gap-3 animate-in slide-in-from-bottom-2 duration-200">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-cyan-100 text-cyan-800">
                  {selectedPin.category}
                </span>
                <span className="text-[9px] font-bold text-emerald-700">
                  {selectedPin.isLowStock ? 'LOW STOCK' : 'IN STOCK'}
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 truncate mt-0.5">{selectedPin.name}</h4>
              <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium mt-0.5">
                <span className="font-extrabold text-cyan-800">{selectedPin.price}</span>
                <span>•</span>
                <span>{selectedPin.aisle} ({selectedPin.shelf})</span>
                <span>•</span>
                <span className="text-slate-400">{selectedPin.stockCount} on shelf</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => {
                  addToShoppingList(selectedPin, 1)
                  setSelectedPin(null)
                }}
                className="bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold py-2 px-3 rounded-xl flex items-center gap-1 shadow-2xs cursor-pointer"
              >
                <Plus className="h-3 w-3" />
                <span>Add</span>
              </button>

              <button
                onClick={() => setSelectedPin(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 bg-slate-100 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
