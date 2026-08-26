import React from 'react'
import { MapPin, AlertCircle, ShieldAlert, AlertTriangle, Compass, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { OperationalIncident } from './incidentData'
import { useNavigate } from 'react-router-dom'

interface StoreIncidentMapProps {
  incidents: OperationalIncident[]
  selectedIncidentId?: string | null
  onSelectIncident: (incident: OperationalIncident) => void
}

export const StoreIncidentMap: React.FC<StoreIncidentMapProps> = ({
  incidents,
  selectedIncidentId,
  onSelectIncident,
}) => {
  const navigate = useNavigate()

  const activeIncidents = incidents.filter((i) => i.status !== 'RESOLVED')
  const criticalCount = activeIncidents.filter((i) => i.severity === 'CRITICAL').length
  const highCount = activeIncidents.filter((i) => i.severity === 'HIGH').length

  const findIncidentByZone = (zoneKeyword: string) => {
    return activeIncidents.find((i) =>
      i.zone.toLowerCase().includes(zoneKeyword.toLowerCase())
    )
  }

  const produceInc = findIncidentByZone('Produce')
  const beverageInc = findIncidentByZone('Beverage') || findIncidentByZone('B4')
  const checkoutInc = findIncidentByZone('Checkout') || findIncidentByZone('C1') || findIncidentByZone('C2')
  const dairyInc = findIncidentByZone('Dairy')
  const aisleInc = findIncidentByZone('Aisle 3') || findIncidentByZone('Snacks')
  const camInc = findIncidentByZone('Cam')

  return (
    <div className="rounded-lg border border-[#1E293B] bg-[#0F172A] p-4 flex flex-col justify-between shadow-sm select-none h-full min-h-[380px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-[#1E293B] text-cyan-400">
            <MapPin className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-white tracking-wide">
              Store Incident Map
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Active incident locations across store zones
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <span className="flex items-center gap-1 text-rose-400 font-medium">
            <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
            <span>{criticalCount} Critical</span>
          </span>
          <span>•</span>
          <span className="text-amber-400 font-medium">{highCount} High</span>
        </div>
      </div>

      {/* Spatial Store Map Layout */}
      <div className="relative w-full h-[260px] my-2 rounded-lg bg-[#070A0F] border border-[#1E293B] overflow-hidden p-3 flex flex-col justify-between">
        {/* Entrance Lobby */}
        <div className="flex justify-center">
          <div className="px-3 py-1 rounded bg-[#0F172A] border border-[#1E293B] text-[10px] text-slate-400 flex items-center gap-2">
            <span>Store Entrance & Inflow</span>
          </div>
        </div>

        {/* Store Floor 6-Zone Grid */}
        <div className="grid grid-cols-3 gap-2 my-auto">
          {/* Fresh Produce Zone */}
          <button
            onClick={() => produceInc && onSelectIncident(produceInc)}
            className={cn(
              'p-2 rounded-lg border text-left flex flex-col justify-between h-18 transition-all cursor-pointer',
              produceInc
                ? selectedIncidentId === produceInc.id
                  ? 'bg-[#131D31] border-rose-500 shadow-sm ring-1 ring-rose-500'
                  : 'bg-[#0F172A] border-amber-500/50 hover:border-amber-400'
                : 'bg-[#0F172A]/70 border-[#1E293B]'
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-white">Produce</span>
              {produceInc && (
                <span className="px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/40 text-[8px] font-bold">
                  ! Spill
                </span>
              )}
            </div>
            <div className="text-[9px] text-slate-400 truncate">
              {produceInc ? produceInc.primaryMetric : 'Normal'}
            </div>
          </button>

          {/* Dairy & Chilled Zone */}
          <button
            onClick={() => dairyInc && onSelectIncident(dairyInc)}
            className={cn(
              'p-2 rounded-lg border text-left flex flex-col justify-between h-18 transition-all cursor-pointer',
              dairyInc
                ? selectedIncidentId === dairyInc.id
                  ? 'bg-[#131D31] border-amber-500 shadow-sm ring-1 ring-amber-500'
                  : 'bg-[#0F172A] border-amber-500/50 hover:border-amber-400'
                : 'bg-[#0F172A]/70 border-[#1E293B]'
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-white">Dairy Wall</span>
              {dairyInc && (
                <span className="px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/40 text-[8px] font-bold">
                  ! Temp
                </span>
              )}
            </div>
            <div className="text-[9px] text-slate-400 truncate">
              {dairyInc ? dairyInc.primaryMetric : 'Normal'}
            </div>
          </button>

          {/* Cold Beverages Zone */}
          <button
            onClick={() => beverageInc && onSelectIncident(beverageInc)}
            className={cn(
              'p-2 rounded-lg border text-left flex flex-col justify-between h-18 transition-all cursor-pointer',
              beverageInc
                ? selectedIncidentId === beverageInc.id
                  ? 'bg-[#131D31] border-rose-500 shadow-sm ring-1 ring-rose-500'
                  : 'bg-[#0F172A] border-rose-500/50 hover:border-rose-400'
                : 'bg-[#0F172A]/70 border-[#1E293B]'
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-white">Beverages B4</span>
              {beverageInc && (
                <span className="px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-500/50 text-[8px] font-bold animate-pulse">
                  ! Stockout
                </span>
              )}
            </div>
            <div className="text-[9px] text-rose-300 truncate">
              {beverageInc ? beverageInc.primaryMetric : 'Normal'}
            </div>
          </button>

          {/* Aisle 3 / Household Zone */}
          <button
            onClick={() => aisleInc && onSelectIncident(aisleInc)}
            className={cn(
              'p-2 rounded-lg border text-left flex flex-col justify-between h-18 transition-all cursor-pointer',
              aisleInc
                ? selectedIncidentId === aisleInc.id
                  ? 'bg-[#131D31] border-amber-500 shadow-sm ring-1 ring-amber-500'
                  : 'bg-[#0F172A] border-amber-500/50 hover:border-amber-400'
                : 'bg-[#0F172A]/70 border-[#1E293B]'
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-white">Aisle 3 (Snacks)</span>
              {aisleInc && (
                <span className="px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/40 text-[8px] font-bold">
                  ! Aisle
                </span>
              )}
            </div>
            <div className="text-[9px] text-slate-400 truncate">
              {aisleInc ? aisleInc.primaryMetric : 'Normal'}
            </div>
          </button>

          {/* Electronics Zone */}
          <button
            onClick={() => camInc && onSelectIncident(camInc)}
            className={cn(
              'p-2 rounded-lg border text-left flex flex-col justify-between h-18 transition-all cursor-pointer',
              camInc
                ? selectedIncidentId === camInc.id
                  ? 'bg-[#131D31] border-cyan-500 shadow-sm ring-1 ring-cyan-500'
                  : 'bg-[#0F172A] border-cyan-500/40 hover:border-cyan-400'
                : 'bg-[#0F172A]/70 border-[#1E293B]'
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-white">Electronics</span>
              {camInc && (
                <span className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40 text-[8px] font-bold">
                  ! Cam C04
                </span>
              )}
            </div>
            <div className="text-[9px] text-slate-400 truncate">
              {camInc ? camInc.primaryMetric : 'Normal'}
            </div>
          </button>

          {/* Checkout Plaza Zone */}
          <button
            onClick={() => checkoutInc && onSelectIncident(checkoutInc)}
            className={cn(
              'p-2 rounded-lg border text-left flex flex-col justify-between h-18 transition-all cursor-pointer',
              checkoutInc
                ? selectedIncidentId === checkoutInc.id
                  ? 'bg-[#131D31] border-rose-500 shadow-sm ring-1 ring-rose-500'
                  : 'bg-[#0F172A] border-rose-500/50 hover:border-rose-400'
                : 'bg-[#0F172A]/70 border-[#1E293B]'
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-white">Checkout C1</span>
              {checkoutInc && (
                <span className="px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-500/50 text-[8px] font-bold animate-pulse">
                  CRITICAL
                </span>
              )}
            </div>
            <div className="text-[9px] text-rose-300 truncate">
              {checkoutInc ? checkoutInc.primaryMetric : 'Normal'}
            </div>
          </button>
        </div>

        {/* Footer Map Link */}
        <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
          <span>Click zone marker to inspect incident</span>
          <button
            onClick={() => navigate('/digital-twin')}
            className="text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 cursor-pointer"
          >
            <span>View Full Digital Twin</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  )
}
