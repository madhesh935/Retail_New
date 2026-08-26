import React from 'react'
import { Search, RotateCcw, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  IncidentSeverity,
  IncidentCategory,
  IncidentLifecycleStatus,
} from './incidentData'

export type IncidentTimeRange = 'LIVE' | 'LAST_HOUR' | 'TODAY'

export interface IncidentFilterState {
  severity: 'ALL' | IncidentSeverity
  category: 'ALL' | IncidentCategory
  status: 'ALL' | IncidentLifecycleStatus
  timeRange: IncidentTimeRange
  searchQuery: string
}

interface IncidentFiltersBarProps {
  filters: IncidentFilterState
  onChange: (filters: IncidentFilterState) => void
  onReset: () => void
}

export const IncidentFiltersBar: React.FC<IncidentFiltersBarProps> = ({
  filters,
  onChange,
  onReset,
}) => {
  const severities: { id: 'ALL' | IncidentSeverity; label: string }[] = [
    { id: 'ALL', label: 'All Severity' },
    { id: 'CRITICAL', label: 'Critical' },
    { id: 'HIGH', label: 'High' },
    { id: 'MEDIUM', label: 'Medium' },
  ]

  const categories: { id: 'ALL' | IncidentCategory; label: string }[] = [
    { id: 'ALL', label: 'All Categories' },
    { id: 'QUEUE', label: 'Queue' },
    { id: 'INVENTORY', label: 'Inventory' },
    { id: 'SAFETY', label: 'Safety' },
    { id: 'CAMERA_SYSTEM', label: 'Camera / System' },
  ]

  const statuses: { id: 'ALL' | IncidentLifecycleStatus; label: string }[] = [
    { id: 'ALL', label: 'All Statuses' },
    { id: 'NEEDS_ACTION', label: 'Needs Action' },
    { id: 'IN_PROGRESS', label: 'In Progress' },
    { id: 'ASSIGNED', label: 'Assigned' },
    { id: 'RESOLVED', label: 'Resolved' },
  ]

  const timeRanges: { id: IncidentTimeRange; label: string }[] = [
    { id: 'LIVE', label: 'Live' },
    { id: 'LAST_HOUR', label: 'Last Hour' },
    { id: 'TODAY', label: 'Today' },
  ]

  return (
    <div className="rounded-lg border border-[#1E293B] bg-[#0F172A] p-3 space-y-2.5 select-none text-xs shadow-sm">
      {/* Row 1: Search, Time Filter, Reset */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search incidents, shelves, registers..."
            value={filters.searchQuery}
            onChange={(e) => onChange({ ...filters, searchQuery: e.target.value })}
            className="w-full bg-[#090D14] border border-[#1E293B] rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50"
          />
        </div>

        {/* Time Ranges & Reset */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center rounded-lg bg-[#090D14] p-1 border border-[#1E293B]">
            {timeRanges.map((t) => (
              <button
                key={t.id}
                onClick={() => onChange({ ...filters, timeRange: t.id })}
                className={cn(
                  'px-2.5 py-0.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer',
                  filters.timeRange === t.id
                    ? 'bg-[#1E293B] text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          <Button
            variant="ghost"
            size="xs"
            onClick={onReset}
            className="text-[11px] h-7 px-2 text-slate-400 hover:text-white gap-1"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset</span>
          </Button>
        </div>
      </div>

      {/* Row 2: Selectors for Severity, Category, Status */}
      <div className="pt-2 border-t border-[#1E293B] flex flex-wrap items-center gap-2 text-xs">
        {/* Severity Selector */}
        <select
          value={filters.severity}
          onChange={(e) => onChange({ ...filters, severity: e.target.value as any })}
          className="bg-[#090D14] border border-[#1E293B] rounded-lg px-2.5 py-1 text-[11px] text-slate-300 focus:outline-none focus:border-cyan-500/50 cursor-pointer"
        >
          {severities.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>

        {/* Category Selector */}
        <select
          value={filters.category}
          onChange={(e) => onChange({ ...filters, category: e.target.value as any })}
          className="bg-[#090D14] border border-[#1E293B] rounded-lg px-2.5 py-1 text-[11px] text-slate-300 focus:outline-none focus:border-cyan-500/50 cursor-pointer"
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>

        {/* Status Selector */}
        <select
          value={filters.status}
          onChange={(e) => onChange({ ...filters, status: e.target.value as any })}
          className="bg-[#090D14] border border-[#1E293B] rounded-lg px-2.5 py-1 text-[11px] text-slate-300 focus:outline-none focus:border-cyan-500/50 cursor-pointer"
        >
          {statuses.map((st) => (
            <option key={st.id} value={st.id}>
              {st.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
