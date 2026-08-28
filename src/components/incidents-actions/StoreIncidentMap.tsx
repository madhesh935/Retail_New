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

  // Live incidents carry the real backend zone id ("zone-2".."zone-7", see
  // backend/app/db/seed_data.py); the legacy mock dataset used a different
  // convention ("zone-produce" etc). Match on zoneId first — falling back to
  // the free-text zone name only for older records without one — instead of
  // matching purely on display text, which drifts from the real zone ids.
  const findIncidentByZone = (zoneKeyword: string, zoneIds: string[] = []) => {
    return activeIncidents.find(
      (i) =>
        (i.zoneId && zoneIds.includes(i.zoneId)) ||
        i.zone.toLowerCase().includes(zoneKeyword.toLowerCase())
    )
  }

  const produceInc = findIncidentByZone('Produce', ['zone-produce', 'zone-2'])
  const dairyInc = findIncidentByZone('Dairy', ['zone-dairy', 'zone-3'])
  // Beverages and the Aisle 3 snacks bay share a single real backend zone
  // (zone-4), so they're split by keyword within that zone rather than by id.
  const beverageInc =
    activeIncidents.find(
      (i) => (i.zoneId === 'zone-4' || i.zoneId === 'zone-beverages') && /beverage|b4/i.test(i.zone)
    ) || findIncidentByZone('Beverage') || findIncidentByZone('B4')
  const aisleInc =
    activeIncidents.find(
      (i) => (i.zoneId === 'zone-4' || i.zoneId === 'zone-household') && /aisle|snack/i.test(i.zone)
    ) || findIncidentByZone('Aisle 3') || findIncidentByZone('Snacks')
  const checkoutInc = findIncidentByZone('Checkout', ['zone-checkout', 'zone-7']) || findIncidentByZone('C1') || findIncidentByZone('C2')
  // This tile surfaces camera-system health issues, not an "Electronics zone"
  // — match by the incident's real category instead of a zone-text keyword
  // that never appears in any live incident's zone field.
  const camInc = activeIncidents.find((i) => i.category === 'CAMERA_SYSTEM') || findIncidentByZone('Cam')

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 flex flex-col justify-between shadow-2xs select-none h-full min-h-[380px] font-sans">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-sky-50 text-sky-600 border border-sky-200">
            <MapPin className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 tracking-wide">
              Store Incident Map
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Active incident locations across store zones
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-slate-500">
          <span className="flex items-center gap-1 text-rose-700 font-bold">
            <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
            <span>{criticalCount} Critical</span>
          </span>
          <span>•</span>
          <span className="text-amber-800 font-bold">{highCount} High</span>
        </div>
      </div>

      {/* Spatial Store Map Layout */}
      <div className="relative w-full h-[260px] my-2 rounded-xl bg-slate-50 border border-slate-200 overflow-hidden p-3 flex flex-col justify-between shadow-inner">
        {/* Entrance Lobby */}
        <div className="flex justify-center">
          <div className="px-3 py-1 rounded-lg bg-white border border-slate-200 text-[10px] text-slate-600 flex items-center gap-2 shadow-2xs font-semibold">
            <span>Store Entrance & Inflow</span>
          </div>
        </div>

        {/* Store Floor 6-Zone Grid */}
        <div className="grid grid-cols-3 gap-2 my-auto">
          {/* Fresh Produce Zone */}
          <button
            onClick={() => produceInc && onSelectIncident(produceInc)}
            className={cn(
              'p-2 rounded-xl border text-left flex flex-col justify-between h-18 transition-all cursor-pointer shadow-2xs',
              produceInc
                ? selectedIncidentId === produceInc.id
                  ? 'bg-amber-50 border-amber-500 shadow-sm ring-1 ring-amber-500'
                  : 'bg-white border-amber-200 hover:border-amber-400'
                : 'bg-white/80 border-slate-200'
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-900">Produce</span>
              {produceInc && (
                <span className="px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[8px] font-bold">
                  ! Spill
                </span>
              )}
            </div>
            <div className="text-[9px] text-slate-500 truncate">
              {produceInc ? produceInc.primaryMetric : 'Normal'}
            </div>
          </button>

          {/* Dairy & Chilled Zone */}
          <button
            onClick={() => dairyInc && onSelectIncident(dairyInc)}
            className={cn(
              'p-2 rounded-xl border text-left flex flex-col justify-between h-18 transition-all cursor-pointer shadow-2xs',
              dairyInc
                ? selectedIncidentId === dairyInc.id
                  ? 'bg-amber-50 border-amber-500 shadow-sm ring-1 ring-amber-500'
                  : 'bg-white border-amber-200 hover:border-amber-400'
                : 'bg-white/80 border-slate-200'
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-900">Dairy Wall</span>
              {dairyInc && (
                <span className="px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[8px] font-bold">
                  ! Temp
                </span>
              )}
            </div>
            <div className="text-[9px] text-slate-500 truncate">
              {dairyInc ? dairyInc.primaryMetric : 'Normal'}
            </div>
          </button>

          {/* Cold Beverages Zone */}
          <button
            onClick={() => beverageInc && onSelectIncident(beverageInc)}
            className={cn(
              'p-2 rounded-xl border text-left flex flex-col justify-between h-18 transition-all cursor-pointer shadow-2xs',
              beverageInc
                ? selectedIncidentId === beverageInc.id
                  ? 'bg-rose-50 border-rose-500 shadow-sm ring-1 ring-rose-500'
                  : 'bg-white border-rose-200 hover:border-rose-400'
                : 'bg-white/80 border-slate-200'
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-900">Beverages B4</span>
              {beverageInc && (
                <span className="px-1.5 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 text-[8px] font-bold animate-pulse">
                  ! Stockout
                </span>
              )}
            </div>
            <div className="text-[9px] text-rose-700 font-semibold truncate">
              {beverageInc ? beverageInc.primaryMetric : 'Normal'}
            </div>
          </button>

          {/* Aisle 3 / Household Zone */}
          <button
            onClick={() => aisleInc && onSelectIncident(aisleInc)}
            className={cn(
              'p-2 rounded-xl border text-left flex flex-col justify-between h-18 transition-all cursor-pointer shadow-2xs',
              aisleInc
                ? selectedIncidentId === aisleInc.id
                  ? 'bg-amber-50 border-amber-500 shadow-sm ring-1 ring-amber-500'
                  : 'bg-white border-amber-200 hover:border-amber-400'
                : 'bg-white/80 border-slate-200'
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-900">Aisle 3 (Snacks)</span>
              {aisleInc && (
                <span className="px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[8px] font-bold">
                  ! Aisle
                </span>
              )}
            </div>
            <div className="text-[9px] text-slate-500 truncate">
              {aisleInc ? aisleInc.primaryMetric : 'Normal'}
            </div>
          </button>

          {/* Electronics Zone */}
          <button
            onClick={() => camInc && onSelectIncident(camInc)}
            className={cn(
              'p-2 rounded-xl border text-left flex flex-col justify-between h-18 transition-all cursor-pointer shadow-2xs',
              camInc
                ? selectedIncidentId === camInc.id
                  ? 'bg-sky-50 border-sky-500 shadow-sm ring-1 ring-sky-500'
                  : 'bg-white border-sky-200 hover:border-sky-400'
                : 'bg-white/80 border-slate-200'
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-900">Electronics</span>
              {camInc && (
                <span className="px-1.5 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200 text-[8px] font-bold">
                  ! Cam C04
                </span>
              )}
            </div>
            <div className="text-[9px] text-slate-500 truncate">
              {camInc ? camInc.primaryMetric : 'Normal'}
            </div>
          </button>

          {/* Checkout Plaza Zone */}
          <button
            onClick={() => checkoutInc && onSelectIncident(checkoutInc)}
            className={cn(
              'p-2 rounded-xl border text-left flex flex-col justify-between h-18 transition-all cursor-pointer shadow-2xs',
              checkoutInc
                ? selectedIncidentId === checkoutInc.id
                  ? 'bg-rose-50 border-rose-500 shadow-sm ring-1 ring-rose-500'
                  : 'bg-white border-rose-200 hover:border-rose-400'
                : 'bg-white/80 border-slate-200'
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-900">Checkout C1</span>
              {checkoutInc && (
                <span className="px-1.5 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 text-[8px] font-bold animate-pulse">
                  CRITICAL
                </span>
              )}
            </div>
            <div className="text-[9px] text-rose-700 font-semibold truncate">
              {checkoutInc ? checkoutInc.primaryMetric : 'Normal'}
            </div>
          </button>
        </div>

        {/* Footer Map Link */}
        <div className="flex items-center justify-between text-[10px] text-slate-500 px-1 font-sans">
          <span>Click zone marker to inspect incident</span>
          <button
            onClick={() => navigate('/digital-twin')}
            className="text-sky-700 hover:text-sky-800 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <span>View Full Digital Twin</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  )
}

