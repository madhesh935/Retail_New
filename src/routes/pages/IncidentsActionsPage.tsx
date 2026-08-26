import React, { useState, useMemo } from 'react'
import {
  ShieldAlert,
  AlertTriangle,
  Clock,
  Sparkles,
} from 'lucide-react'
import { IncidentSummaryKpis } from '@/components/incidents-actions/IncidentSummaryKpis'
import {
  IncidentFiltersBar,
  IncidentFilterState,
} from '@/components/incidents-actions/IncidentFiltersBar'
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
            assignedStaffId: inc.suggestedStaffId || 'S02',
            assignedStaffName: inc.suggestedStaffName || 'Marcus Vance',
          }
        }
        return item
      })
    )

    // Update selected incident if open
    if (selectedIncident && selectedIncident.id === inc.id) {
      setSelectedIncident({
        ...selectedIncident,
        status: 'ASSIGNED',
        assignedStaffId: inc.suggestedStaffId || 'S02',
        assignedStaffName: inc.suggestedStaffName || 'Marcus Vance',
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

  return (
    <div className="space-y-4 select-none pb-6">
      {/* ======================================================= */}
      {/* 1. PAGE HEADER */}
      {/* ======================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1E293B]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-cyan-400" />
              <span>Incidents & Actions</span>
            </h1>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
              Live Incident Feed
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Updated 2 sec ago</span>
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

      {/* 3. Filter Toolbar */}
      <IncidentFiltersBar
        filters={filters}
        onChange={(newFilters) => setFilters(newFilters)}
        onReset={handleResetFilters}
      />

      {/* 5. All Incidents Table */}
      <IncidentListCard
        incidents={filteredIncidents}
        selectedIncidentId={selectedIncident?.id}
        onSelectIncident={(inc) => setSelectedIncident(inc)}
        onAssignStaff={(inc) => setAssignModalIncident(inc)}
        onViewCamera={(camCode, title) =>
          setCameraDrawerInfo({ camCode, title })
        }
      />

      {/* 6. Recent Resolutions */}
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

      {/* Assignment Confirmation Modal */}
      <IncidentAssignModal
        incident={assignModalIncident}
        onClose={() => setAssignModalIncident(null)}
        onConfirm={handleConfirmAssignment}
      />

      {/* Camera Live Stream Drawer */}
      {cameraDrawerInfo && (
        <ZoneCameraDrawer
          cameraCode={cameraDrawerInfo.camCode}
          zoneName={cameraDrawerInfo.title}
          onClose={() => setCameraDrawerInfo(null)}
        />
      )}

      {/* Why Recommendation Dialog */}
      <WhyRecommendationDialog
        data={whyDialogData}
        open={Boolean(whyDialogData)}
        onOpenChange={(isOpen) => {
          if (!isOpen) setWhyDialogData(null)
        }}
      />
    </div>
  )
}
