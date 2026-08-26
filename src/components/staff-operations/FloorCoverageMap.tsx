import React from 'react'
import { MapPin, Users, CheckSquare, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { StaffMember, OperationalTask } from './staffData'

interface FloorCoverageMapProps {
  onSelectStaff?: (staffId: string) => void
  onSelectTask?: (taskId: string) => void
  onSelectZone?: (zoneName: string) => void
}

export const FloorCoverageMap: React.FC<FloorCoverageMapProps> = ({
  onSelectStaff,
  onSelectTask,
  onSelectZone,
}) => {
  return (
    <div className="rounded-lg border border-[#1E293B] bg-[#0F172A] p-4 flex flex-col justify-between shadow-sm select-none h-full min-h-[340px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-[#1E293B] text-cyan-400">
            <MapPin className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-white tracking-wide">
              Floor Coverage
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-cyan-400" />
            <span>Staff (12)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
            <span>Urgent Task (2)</span>
          </span>
        </div>
      </div>

      {/* Spatial Store Floor Map Canvas */}
      <div className="relative w-full h-[240px] my-2 rounded-lg bg-[#070A0F] border border-[#1E293B] overflow-hidden p-3 flex flex-col justify-between">
        {/* Top Entrance Banner */}
        <div className="flex justify-center">
          <button
            onClick={() => onSelectZone && onSelectZone('Entrance')}
            className="px-3 py-1 rounded bg-[#0F172A] border border-[#1E293B] text-[10px] text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center gap-2"
          >
            <span>Entrance Lobby</span>
            <span
              onClick={(e) => {
                e.stopPropagation()
                if (onSelectStaff) onSelectStaff('staff-s05')
              }}
              className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40 text-[9px] font-bold"
            >
              S05
            </span>
          </button>
        </div>

        {/* Middle Main Floor Grid */}
        <div className="grid grid-cols-3 gap-2 my-auto">
          {/* Produce */}
          <div
            onClick={() => onSelectZone && onSelectZone('Produce')}
            className="p-2 rounded bg-[#0F172A] border border-[#1E293B] text-[10px] flex flex-col justify-between h-16 cursor-pointer hover:border-slate-500 transition-colors"
          >
            <div className="flex items-center justify-between text-slate-400">
              <span>Fresh Produce</span>
              <span
                onClick={(e) => {
                  e.stopPropagation()
                  if (onSelectTask) onSelectTask('task-101')
                }}
                className="px-1 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/40 text-[8px] font-bold"
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
                className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40 text-[9px] font-bold"
              >
                S04
              </span>
            </div>
          </div>

          {/* Dairy */}
          <div
            onClick={() => onSelectZone && onSelectZone('Dairy')}
            className="p-2 rounded bg-[#0F172A] border border-[#1E293B] text-[10px] flex flex-col justify-between h-16 cursor-pointer hover:border-slate-500 transition-colors"
          >
            <div className="flex items-center justify-between text-slate-400">
              <span>Dairy & Chilled</span>
              <span className="text-[9px] text-slate-500">Aisle C</span>
            </div>
            <div className="flex items-center gap-1">
              <span
                onClick={(e) => {
                  e.stopPropagation()
                  if (onSelectStaff) onSelectStaff('staff-s08')
                }}
                className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40 text-[9px] font-bold"
              >
                S08
              </span>
            </div>
          </div>

          {/* Beverages */}
          <div
            onClick={() => onSelectZone && onSelectZone('Beverages')}
            className="p-2 rounded bg-[#0F172A] border border-[#1E293B] text-[10px] flex flex-col justify-between h-16 cursor-pointer hover:border-rose-500/50 transition-colors"
          >
            <div className="flex items-center justify-between text-slate-400">
              <span>Cold Beverages</span>
              <span
                onClick={(e) => {
                  e.stopPropagation()
                  if (onSelectTask) onSelectTask('task-104')
                }}
                className="px-1 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-500/50 text-[8px] font-bold animate-pulse"
                title="Critical Restock B4"
              >
                ! Task B4
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[9px] text-slate-500">Aisle B</span>
            </div>
          </div>

          {/* Household & Snacks */}
          <div
            onClick={() => onSelectZone && onSelectZone('Household')}
            className="p-2 rounded bg-[#0F172A] border border-[#1E293B] text-[10px] flex flex-col justify-between h-16 cursor-pointer hover:border-slate-500 transition-colors"
          >
            <div className="flex items-center justify-between text-slate-400">
              <span>Aisle 3 & Snacks</span>
              <span className="text-[9px] text-slate-500">Aisle D</span>
            </div>
            <div className="flex items-center gap-1">
              <span
                onClick={(e) => {
                  e.stopPropagation()
                  if (onSelectStaff) onSelectStaff('staff-s02')
                }}
                className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[9px] font-bold"
                title="Marcus Vance (Available)"
              >
                S02
              </span>
              <span
                onClick={(e) => {
                  e.stopPropagation()
                  if (onSelectStaff) onSelectStaff('staff-s10')
                }}
                className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40 text-[9px] font-bold"
              >
                S10
              </span>
            </div>
          </div>

          {/* Electronics */}
          <div
            onClick={() => onSelectZone && onSelectZone('Electronics')}
            className="p-2 rounded bg-[#0F172A] border border-[#1E293B] text-[10px] flex flex-col justify-between h-16 cursor-pointer hover:border-slate-500 transition-colors"
          >
            <div className="flex items-center justify-between text-slate-400">
              <span>Electronics</span>
              <span className="text-[9px] text-slate-500">Aisle E</span>
            </div>
            <div className="flex items-center gap-1">
              <span
                onClick={(e) => {
                  e.stopPropagation()
                  if (onSelectStaff) onSelectStaff('staff-s07')
                }}
                className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40 text-[9px] font-bold"
              >
                S07
              </span>
            </div>
          </div>

          {/* Checkout Plaza */}
          <div
            onClick={() => onSelectZone && onSelectZone('Checkout')}
            className="p-2 rounded bg-[#0F172A] border border-[#1E293B] text-[10px] flex flex-col justify-between h-16 cursor-pointer hover:border-rose-500/50 transition-colors"
          >
            <div className="flex items-center justify-between text-slate-400">
              <span>Checkout Plaza</span>
              <span
                onClick={(e) => {
                  e.stopPropagation()
                  if (onSelectTask) onSelectTask('task-102')
                }}
                className="px-1 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-500/50 text-[8px] font-bold"
                title="Critical Open C3 Task"
              >
                ! Open C3
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span
                onClick={(e) => {
                  e.stopPropagation()
                  if (onSelectStaff) onSelectStaff('staff-s01')
                }}
                className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40 text-[9px] font-bold"
              >
                S01
              </span>
              <span
                onClick={(e) => {
                  e.stopPropagation()
                  if (onSelectStaff) onSelectStaff('staff-s09')
                }}
                className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40 text-[9px] font-bold"
              >
                S09
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Stockroom & Center Floor */}
        <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
          <div className="flex items-center gap-1.5">
            <span>Stockroom:</span>
            <span
              onClick={() => onSelectStaff && onSelectStaff('staff-s03')}
              className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[9px] font-bold cursor-pointer"
              title="Liam O'Connor (Available)"
            >
              S03
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span>Center Floor:</span>
            <span
              onClick={() => onSelectStaff && onSelectStaff('staff-s06')}
              className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[9px] font-bold cursor-pointer"
              title="Priya Sharma (Available)"
            >
              S06
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-2 border-t border-[#1E293B] text-[10px] text-slate-400 flex items-center justify-between">
        <span>Click staff badge or task alert to inspect details</span>
        <span className="text-emerald-400">● Zone presence live</span>
      </div>
    </div>
  )
}
