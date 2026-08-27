import React from 'react'
import {
  X,
  Route,
  MapPin,
  Clock,
  ArrowRight,
  Compass,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StaffRecommendation } from './staffData'
import { useNavigate } from 'react-router-dom'

interface StaffRouteModalProps {
  allocation: any | null
  onClose: () => void
}

export const StaffRouteModal: React.FC<StaffRouteModalProps> = ({
  allocation,
  onClose,
}) => {
  const navigate = useNavigate()

  if (!allocation) return null

  const staffName = allocation.recommendedStaffName || 'Staff Member'
  const staffId = allocation.recommendedStaffId || 'S02'
  const origin = allocation.currentStaffZone || 'Current Zone'
  const destination = allocation.destinationZone || 'Destination'
  const distance = allocation.distanceMeters || 18
  const walkSeconds = allocation.estimatedWalkingSeconds || 24

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none font-sans">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in-0"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg rounded-xl border border-slate-200 bg-white p-5 shadow-2xl z-10 space-y-4 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-sky-50 text-sky-600 border border-sky-200">
              <Route className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900">
                Staff Route Preview
              </h3>
              <span className="text-[11px] text-slate-500">
                {staffName} ({staffId})
              </span>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon-xs"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-900"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Route Stats */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] text-slate-500 block">Transit Distance</span>
            <div className="text-sm font-bold text-slate-900 font-mono">{distance} meters</div>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] text-slate-500 block">Est. Walking Time</span>
            <div className="text-sm font-bold text-sky-700 font-mono">~{walkSeconds} seconds</div>
          </div>
        </div>

        {/* Spatial Route Diagram */}
        <div className="relative h-44 rounded-xl bg-slate-50 border border-slate-200 overflow-hidden p-3 flex flex-col justify-between shadow-inner">
          <svg className="w-full h-full" viewBox="0 0 360 140">
            {/* Origin Node */}
            <circle cx="50" cy="70" r="16" fill="#FFFFFF" stroke="#0F766E" strokeWidth="2" />
            <text x="50" y="74" fill="#0F766E" fontSize="10" textAnchor="middle" fontWeight="bold" fontFamily="monospace">
              {staffId}
            </text>
            <text x="50" y="100" fill="#64748B" fontSize="9" textAnchor="middle" fontFamily="sans-serif">
              {origin}
            </text>

            {/* Destination Node */}
            <circle cx="310" cy="70" r="16" fill="#FFFFFF" stroke="#E11D48" strokeWidth="2" />
            <text x="310" y="74" fill="#E11D48" fontSize="9" textAnchor="middle" fontWeight="bold" fontFamily="sans-serif">
              DEST
            </text>
            <text x="310" y="100" fill="#64748B" fontSize="9" textAnchor="middle" fontFamily="sans-serif">
              {destination}
            </text>

            {/* Connecting Dashed Line */}
            <path
              d="M 68 70 Q 180 30 292 70"
              fill="none"
              stroke="#0F766E"
              strokeWidth="2.5"
              strokeDasharray="6 4"
            />

            {/* Distance Pill */}
            <rect x="150" y="38" width="60" height="18" rx="4" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" />
            <text x="180" y="50" fill="#0F766E" fontSize="8" textAnchor="middle" fontFamily="monospace" fontWeight="bold">
              {distance}m Walk
            </text>
          </svg>

          <div className="flex items-center justify-between text-[10px] text-slate-500 z-10 px-1 bg-white/80 p-1 rounded-md border border-slate-200">
            <span>From: <strong className="text-slate-900">{origin}</strong></span>
            <span className="text-sky-700 font-semibold">To: <strong className="text-slate-900">{destination}</strong></span>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
          <Button
            variant="outline"
            size="xs"
            onClick={() => {
              onClose()
              navigate('/digital-twin')
            }}
            className="h-7 text-[11px] gap-1 text-slate-700 border-slate-200 bg-white hover:bg-slate-50 shadow-2xs"
          >
            <Compass className="h-3 w-3 text-sky-600" />
            <span>Show on Digital Twin</span>
          </Button>

          <Button variant="action" size="xs" onClick={onClose} className="h-7 text-xs px-3 bg-sky-600 hover:bg-sky-700 text-white font-semibold">
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}
