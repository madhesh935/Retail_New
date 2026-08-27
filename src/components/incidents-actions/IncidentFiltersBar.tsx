import React from 'react'
import { Search, RotateCcw, Filter, ChevronDown, Check } from 'lucide-react'
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
  totalCount?: number
}

export const IncidentFiltersBar: React.FC<IncidentFiltersBarProps> = ({
  filters,
  onChange,
  onReset,
  totalCount,
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

  const isFiltered =
    filters.severity !== 'ALL' ||
    filters.category !== 'ALL' ||
    filters.status !== 'ALL' ||
    filters.timeRange !== 'LIVE' ||
    filters.searchQuery.trim().length > 0

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-2 sm:p-2.5 shadow-2xs select-none font-sans flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
      {/* Left: Quick Search Bar */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
        <input
          type="text"
          placeholder="Search incidents, shelves, registers, staff..."
          value={filters.searchQuery}
          onChange={(e) => onChange({ ...filters, searchQuery: e.target.value })}
          className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs transition-all"
        />
      </div>

      {/* Right: Compact Filter Dropdowns & Time Selector */}
      <div className="flex flex-wrap items-center gap-1.5 justify-end">
        {/* Severity Selector */}
        <div className="relative">
          <select
            value={filters.severity}
            onChange={(e) => onChange({ ...filters, severity: e.target.value as any })}
            className={cn(
              'appearance-none pl-2.5 pr-7 py-1.5 rounded-xl text-xs font-semibold cursor-pointer border shadow-2xs transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20',
              filters.severity !== 'ALL'
                ? 'bg-blue-50 text-blue-900 border-blue-200 font-bold'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            )}
          >
            {severities.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Category Selector */}
        <div className="relative">
          <select
            value={filters.category}
            onChange={(e) => onChange({ ...filters, category: e.target.value as any })}
            className={cn(
              'appearance-none pl-2.5 pr-7 py-1.5 rounded-xl text-xs font-semibold cursor-pointer border shadow-2xs transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20',
              filters.category !== 'ALL'
                ? 'bg-blue-50 text-blue-900 border-blue-200 font-bold'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            )}
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Status Selector */}
        <div className="relative">
          <select
            value={filters.status}
            onChange={(e) => onChange({ ...filters, status: e.target.value as any })}
            className={cn(
              'appearance-none pl-2.5 pr-7 py-1.5 rounded-xl text-xs font-semibold cursor-pointer border shadow-2xs transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20',
              filters.status !== 'ALL'
                ? 'bg-blue-50 text-blue-900 border-blue-200 font-bold'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            )}
          >
            {statuses.map((st) => (
              <option key={st.id} value={st.id}>
                {st.label}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        <div className="h-4 w-px bg-slate-200 mx-0.5 hidden sm:block" />

        {/* Time Ranges Pill */}
        <div className="flex items-center rounded-xl bg-slate-100 p-0.5 border border-slate-200/80">
          {timeRanges.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => onChange({ ...filters, timeRange: t.id })}
              className={cn(
                'px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer',
                filters.timeRange === t.id
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Reset Filters */}
        {isFiltered && (
          <button
            type="button"
            onClick={onReset}
            className="px-2 py-1 text-[11px] font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
            title="Reset all filters"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset</span>
          </button>
        )}
      </div>
    </div>
  )
}
