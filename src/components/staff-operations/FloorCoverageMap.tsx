import React from 'react'
import { MapPin, Users, CheckSquare, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { StaffMember, OperationalTask } from './staffData'

interface FloorCoverageMapProps {
  staff?: StaffMember[]
  tasks?: OperationalTask[]
  onSelectStaff?: (staffId: string) => void
  onSelectTask?: (taskId: string) => void
  onSelectZone?: (zoneName: string) => void
}

export const FloorCoverageMap: React.FC<FloorCoverageMapProps> = ({
  staff = [],
  tasks = [],
  onSelectStaff,
  onSelectTask,
  onSelectZone,
}) => {
  const urgentCount = tasks.filter((t) => t.priority === 'CRITICAL' && t.status !== 'COMPLETED').length
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 flex flex-col justify-between shadow-2xs select-none h-[440px] font-sans">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-sky-50 text-sky-600 border border-sky-200">
            <MapPin className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 tracking-wide">
              Floor Coverage
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-sky-500" />
            <span>Staff ({staff.length})</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
            <span>Urgent Task ({urgentCount})</span>
          </span>
        </div>
      </div>

      {/* Spatial Store Floor Map Canvas */}
      <div className="relative w-full flex-1 my-2 min-h-0 rounded-xl bg-slate-50 border border-slate-200 overflow-hidden p-3 flex flex-col justify-between shadow-inner">
        {/* Top Entrance Banner */}
        <div className="flex justify-center shrink-0 mb-1">
          <button
            type="button"
            onClick={() => onSelectZone && onSelectZone('Entrance')}
            className="px-3 py-1 rounded-lg bg-white border border-slate-200 text-[10px] text-slate-700 hover:text-slate-900 shadow-2xs transition-colors cursor-pointer flex items-center gap-2"
          >
            <span className="font-semibold">Entrance Lobby</span>
            <span
              onClick={(e) => {
                e.stopPropagation()
                if (onSelectStaff) onSelectStaff('staff-s05')
              }}
              className="px-1.5 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200 text-[9px] font-bold font-mono"
            >
              S05
            </span>
          </button>
        </div>

        {/* Middle Main Floor Grid */}
        <div className="grid grid-cols-3 gap-2 flex-1 my-1">
          {/* Produce */}
          <div
            onClick={() => onSelectZone && onSelectZone('Produce')}
            className="p-2 rounded-lg bg-white border border-slate-200 text-[10px] flex flex-col justify-between cursor-pointer hover:border-slate-400 transition-colors shadow-2xs"
          >
            <div className="flex items-center justify-between text-slate-700">
              <span className="font-semibold">Fresh Produce</span>
              <span
                onClick={(e) => {
                  e.stopPropagation()
                  if (onSelectTask) onSelectTask('task-101')
                }}
                className="px-1 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[8px] font-bold"
                title="Spill Cleanup Task"
              >
                ! Spill
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span
                onClick={(e) => {
                  e.stopPropagation()
                  if (onSelectStaff) onSelectStaff('staff-s04')
                }}
                className="px-1.5 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200 text-[9px] font-bold font-mono"
              >
                S04
              </span>
            </div>
          </div>

          {/* Dairy */}
          <div
            onClick={() => onSelectZone && onSelectZone('Dairy')}
            className="p-2 rounded-lg bg-white border border-slate-200 text-[10px] flex flex-col justify-between cursor-pointer hover:border-slate-400 transition-colors shadow-2xs"
          >
            <div className="flex items-center justify-between text-slate-700">
              <span className="font-semibold">Dairy &amp; Chilled</span>
              <span className="text-[9px] text-slate-400 font-mono">Aisle C</span>
            </div>
            <div className="flex items-center gap-1">
              <span
                onClick={(e) => {
                  e.stopPropagation()
                  if (onSelectStaff) onSelectStaff('staff-s08')
                }}
                className="px-1.5 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200 text-[9px] font-bold font-mono"
              >
                S08
              </span>
            </div>
          </div>

          {/* Beverages */}
          <div
            onClick={() => onSelectZone && onSelectZone('Beverages')}
            className="p-2 rounded-lg bg-white border border-rose-200 text-[10px] flex flex-col justify-between cursor-pointer hover:border-rose-400 transition-colors shadow-2xs"
          >
            <div className="flex items-center justify-between text-slate-700">
              <span className="font-semibold">Beverages</span>
              <span
                onClick={(e) => {
                  e.stopPropagation()
                  if (onSelectTask) onSelectTask('task-104')
                }}
                className="px-1 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 text-[8px] font-bold animate-pulse"
                title="Critical Restock B4"
              >
                ! B4
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[9px] text-slate-400 font-mono">Aisle B</span>
            </div>
          </div>

          {/* Household & Snacks */}
          <div
            onClick={() => onSelectZone && onSelectZone('Household')}
            className="p-2 rounded-lg bg-white border border-slate-200 text-[10px] flex flex-col justify-between cursor-pointer hover:border-slate-400 transition-colors shadow-2xs"
          >
            <div className="flex items-center justify-between text-slate-700">
              <span className="font-semibold">Aisle 3 &amp; Snacks</span>
              <span className="text-[9px] text-slate-400 font-mono">Aisle D</span>
            </div>
            <div className="flex items-center gap-1">
              <span
                onClick={(e) => {
                  e.stopPropagation()
                  if (onSelectStaff) onSelectStaff('staff-s02')
                }}
                className="px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-bold font-mono"
                title="Marcus Vance (Available)"
              >
                S02
              </span>
              <span
                onClick={(e) => {
                  e.stopPropagation()
                  if (onSelectStaff) onSelectStaff('staff-s10')
                }}
                className="px-1.5 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200 text-[9px] font-bold font-mono"
              >
                S10
              </span>
            </div>
          </div>

          {/* Electronics */}
          <div
            onClick={() => onSelectZone && onSelectZone('Electronics')}
            className="p-2 rounded-lg bg-white border border-slate-200 text-[10px] flex flex-col justify-between cursor-pointer hover:border-slate-400 transition-colors shadow-2xs"
          >
            <div className="flex items-center justify-between text-slate-700">
              <span className="font-semibold">Electronics</span>
              <span className="text-[9px] text-slate-400 font-mono">Aisle E</span>
            </div>
            <div className="flex items-center gap-1">
              <span
                onClick={(e) => {
                  e.stopPropagation()
                  if (onSelectStaff) onSelectStaff('staff-s07')
                }}
                className="px-1.5 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200 text-[9px] font-bold font-mono"
              >
                S07
              </span>
            </div>
          </div>

          {/* Checkout Plaza */}
          <div
            onClick={() => onSelectZone && onSelectZone('Checkout')}
            className="p-2 rounded-lg bg-white border border-rose-200 text-[10px] flex flex-col justify-between cursor-pointer hover:border-rose-400 transition-colors shadow-2xs"
          >
            <div className="flex items-center justify-between text-slate-700">
              <span className="font-semibold">Checkout Plaza</span>
              <span
                onClick={(e) => {
                  e.stopPropagation()
                  if (onSelectTask) onSelectTask('task-102')
                }}
                className="px-1 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 text-[8px] font-bold"
                title="Critical Open C3 Task"
              >
                ! C3
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span
                onClick={(e) => {
                  e.stopPropagation()
                  if (onSelectStaff) onSelectStaff('staff-s01')
                }}
                className="px-1.5 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200 text-[9px] font-bold font-mono"
              >
                S01
              </span>
              <span
                onClick={(e) => {
                  e.stopPropagation()
                  if (onSelectStaff) onSelectStaff('staff-s09')
                }}
                className="px-1.5 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200 text-[9px] font-bold font-mono"
              >
                S09
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Stockroom & Center Floor */}
        <div className="flex items-center justify-between text-[10px] text-slate-500 px-1 font-sans shrink-0 mt-1">
          <div className="flex items-center gap-1.5">
            <span>Stockroom:</span>
            <span
              onClick={() => onSelectStaff && onSelectStaff('staff-s03')}
              className="px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-bold font-mono cursor-pointer"
              title="Liam O'Connor (Available)"
            >
              S03
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span>Center Floor:</span>
            <span
              onClick={() => onSelectStaff && onSelectStaff('staff-s06')}
              className="px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-bold font-mono cursor-pointer"
              title="Priya Sharma (Available)"
            >
              S06
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-500 flex items-center justify-between">
        <span>Click staff badge or task alert to inspect details</span>
        <span className="text-emerald-700 font-semibold">● Zone presence live</span>
      </div>
    </div>
  )
}
