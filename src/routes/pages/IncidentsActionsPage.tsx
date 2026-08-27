import React, { useState, useMemo } from 'react'
import {
  ShieldAlert,
  AlertTriangle,
  Clock,
  Sparkles,
  Search,
  ChevronDown,
  RotateCcw,
} from 'lucide-react'
import { IncidentSummaryKpis } from '@/components/incidents-actions/IncidentSummaryKpis'
import { IncidentFilterState } from '@/components/incidents-actions/IncidentFiltersBar'
import {
  IncidentListCard,
} from '@/components/incidents-actions/IncidentListCard'
import { IncidentDetailDrawer } from '@/components/incidents-actions/IncidentDetailDrawer'
import { ResolvedIncidentShowcase } from '@/components/incidents-actions/ResolvedIncidentShowcase'
import { IncidentAssignModal } from '@/components/incidents-actions/IncidentAssignModal'
import {
  WhyRecommendationDialog,
  WhyDialogData,
} from '@/components/command-center/WhyRecommendationDialog'
import { ZoneCameraDrawer } from '@/components/shopper-analytics/ZoneCameraDrawer'
import {
  CANONICAL_INCIDENTS,
  CANONICAL_RESOLUTIONS,
  OperationalIncident,
} from '@/components/incidents-actions/incidentData'
import { useAppStore } from '@/store/useAppStore'
import { cn } from '@/lib/utils'

export const IncidentsActionsPage: React.FC = () => {
  const storeInfo = useAppStore((s) => s.storeInfo)

  const [incidents, setIncidents] = useState<OperationalIncident[]>(CANONICAL_INCIDENTS)
  const [selectedIncident, setSelectedIncident] = useState<OperationalIncident | null>(null)

  // Modals & Drawers state
  const [assignModalIncident, setAssignModalIncident] = useState<OperationalIncident | null>(null)
  const [whyDialogData, setWhyDialogData] = useState<WhyDialogData | null>(null)
  const [cameraDrawerInfo, setCameraDrawerInfo] = useState<{
    camCode: string
    title: string
  } | null>(null)

  // Filters State
  const [filters, setFilters] = useState<IncidentFilterState>({
    severity: 'ALL',
    category: 'ALL',
    status: 'ALL',
    timeRange: 'LIVE',
    searchQuery: '',
  })

  // Derived counts and dynamic messages
  const activeCritical = incidents.filter((i) => i.severity === 'CRITICAL' && i.status !== 'RESOLVED')
  const activeHigh = incidents.filter((i) => i.severity === 'HIGH' && i.status !== 'RESOLVED')
  
  const criticalCount = activeCritical.length
  const highCount = activeHigh.length
  const activeCount = incidents.filter((i) => i.status !== 'RESOLVED').length
  const resolvedTodayCount = CANONICAL_RESOLUTIONS.length + incidents.filter((i) => i.status === 'RESOLVED').length + 15

  const latestCriticalMessage = activeCritical.length > 0
    ? `${activeCritical[0].title} · ${activeCritical[0].zone}`
    : 'No critical incidents'

  const latestHighMessage = activeHigh.length > 0
    ? `${activeHigh[0].title} · ${activeHigh[0].zone}`
    : 'No high severity incidents'

  // Filtered Incidents
  const filteredIncidents = useMemo(() => {
    return incidents.filter((inc) => {
      // Severity Filter
      if (filters.severity !== 'ALL' && inc.severity !== filters.severity) return false

      // Category Filter
      if (filters.category !== 'ALL' && inc.category !== filters.category) return false

      // Status Filter
      if (filters.status !== 'ALL' && inc.status !== filters.status) return false

      // Search Query Filter
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase()
        const matchTitle = inc.title.toLowerCase().includes(q)
        const matchZone = inc.zone.toLowerCase().includes(q)
        const matchRec = inc.recommendation.toLowerCase().includes(q)
        const matchStaff = (inc.assignedStaffName || inc.suggestedStaffName || '').toLowerCase().includes(q)
        if (!matchTitle && !matchZone && !matchRec && !matchStaff) return false
      }

      return true
    })
  }, [incidents, filters])

  // Handle staff assignment confirmation
  const handleConfirmAssignment = (inc: OperationalIncident) => {
    setIncidents((prev) =>
      prev.map((item) => {
        if (item.id === inc.id) {
          return {
            ...item,
            status: 'ASSIGNED',
            assignedStaffName: inc.suggestedStaffName || 'Liam O\'Connor',
          }
        }
        return item
      })
    )

    if (selectedIncident && selectedIncident.id === inc.id) {
      setSelectedIncident({
        ...selectedIncident,
        status: 'ASSIGNED',
        assignedStaffName: inc.suggestedStaffName || 'Liam O\'Connor',
      })
    }

    setAssignModalIncident(null)
  }

  const handleResetFilters = () => {
    setFilters({
      severity: 'ALL',
      category: 'ALL',
      status: 'ALL',
      timeRange: 'LIVE',
      searchQuery: '',
    })
  }

  const isFiltered =
    filters.severity !== 'ALL' ||
    filters.category !== 'ALL' ||
    filters.status !== 'ALL' ||
    filters.timeRange !== 'LIVE' ||
    filters.searchQuery.trim().length > 0

  return (
    <div className="space-y-4 select-none pb-6 font-sans">
      {/* ======================================================= */}
      {/* 1. ENHANCED PAGE HEADER WITH TOP FILTERS */}
      {/* ======================================================= */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        {/* Title */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
            <ShieldAlert className="h-4.5 w-4.5" />
          </div>
          <h1 className="text-base font-bold text-slate-900 tracking-tight leading-tight">
            Incidents &amp; Actions
          </h1>
        </div>

        {/* Enhanced Top Controls Bar (Search + Dropdowns + Time Filter + Reset) */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search incidents, staff, zones..."
              value={filters.searchQuery}
              onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
              className="w-44 sm:w-52 bg-white hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs transition-all font-sans"
            />
          </div>

          {/* Severity Dropdown */}
          <div className="relative">
            <select
              value={filters.severity}
              onChange={(e) => setFilters({ ...filters, severity: e.target.value as any })}
              className={cn(
                'appearance-none pl-2.5 pr-7 py-1.5 rounded-xl text-xs font-semibold cursor-pointer border shadow-2xs transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20',
                filters.severity !== 'ALL'
                  ? 'bg-blue-50 text-blue-900 border-blue-200 font-bold'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              )}
            >
              <option value="ALL">All Severity</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Category Dropdown */}
          <div className="relative">
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value as any })}
              className={cn(
                'appearance-none pl-2.5 pr-7 py-1.5 rounded-xl text-xs font-semibold cursor-pointer border shadow-2xs transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20',
                filters.category !== 'ALL'
                  ? 'bg-blue-50 text-blue-900 border-blue-200 font-bold'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              )}
            >
              <option value="ALL">All Categories</option>
              <option value="QUEUE">Queue</option>
              <option value="INVENTORY">Inventory</option>
              <option value="SAFETY">Safety</option>
              <option value="CAMERA_SYSTEM">Camera / System</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Time Ranges Pill */}
          <div className="flex items-center rounded-xl bg-white p-0.5 border border-slate-200 shadow-2xs">
            {(['LIVE', 'LAST_HOUR', 'TODAY'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setFilters({ ...filters, timeRange: t })}
                className={cn(
                  'px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer',
                  filters.timeRange === t
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900'
                )}
              >
                {t === 'LIVE' ? 'Live' : t === 'LAST_HOUR' ? 'Last Hour' : 'Today'}
              </button>
            ))}
          </div>

          {/* Reset button */}
          {isFiltered && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-2 py-1 text-[11px] font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Top 4 Incident Summary KPI Cards */}
      <IncidentSummaryKpis
        criticalCount={criticalCount}
        highCount={highCount}
        activeCount={activeCount}
        resolvedTodayCount={resolvedTodayCount}
        latestCriticalMessage={latestCriticalMessage}
        latestHighMessage={latestHighMessage}
      />

      {/* 3. All Incidents Table */}
      <IncidentListCard
        incidents={filteredIncidents}
        selectedIncidentId={selectedIncident?.id}
        onSelectIncident={(inc) => setSelectedIncident(inc)}
        onAssignStaff={(inc) => setAssignModalIncident(inc)}
        onViewCamera={(camCode, title) =>
          setCameraDrawerInfo({ camCode, title })
        }
      />

      {/* 4. Recent Resolutions Showcase */}
      <ResolvedIncidentShowcase />

      {/* ======================================================= */}
      {/* DRAWERS & MODALS */}
      {/* ======================================================= */}

      {/* Incident Detail Drawer */}
      <IncidentDetailDrawer
        incident={selectedIncident}
        onClose={() => setSelectedIncident(null)}
        onAssignStaff={(inc) => setAssignModalIncident(inc)}
        onViewCamera={(camCode, title) =>
          setCameraDrawerInfo({ camCode, title })
        }
      />

      {/* Camera Live Drawer */}
      <ZoneCameraDrawer
        isOpen={!!cameraDrawerInfo}
        onClose={() => setCameraDrawerInfo(null)}
        cameraCode={cameraDrawerInfo?.camCode}
        zoneName={cameraDrawerInfo?.title}
      />

      {/* Staff Assignment Modal */}
      {assignModalIncident && (
        <IncidentAssignModal
          incident={assignModalIncident}
          onClose={() => setAssignModalIncident(null)}
          onConfirm={handleConfirmAssignment}
        />
      )}

      {/* Explainability "Why?" Dialog */}
      <WhyRecommendationDialog
        data={whyDialogData}
        open={!!whyDialogData}
        onOpenChange={(open) => {
          if (!open) setWhyDialogData(null)
        }}
      />
    </div>
  )
}
