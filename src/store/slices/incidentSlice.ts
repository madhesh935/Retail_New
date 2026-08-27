import { StateCreator } from 'zustand'
import { RetailIncident, AiRecommendation, IncidentsAnalyticsPayload } from '@/types'
import { MOCK_INCIDENTS } from '@/services/mock/mockData'

export interface IncidentSlice {
  incidents: RetailIncident[]
  recentAiRecommendations: AiRecommendation[]
  activeIncidentsCount: number
  criticalIncidentsCount: number
  highIncidentsCount: number
  selectedIncidentId: string | null
  isLoadingIncidents: boolean

  setIncidentsPayload: (payload: IncidentsAnalyticsPayload) => void
  addIncident: (incident: RetailIncident) => void
  updateIncidentStatus: (incidentId: string, status: RetailIncident['status']) => void
  resolveIncident: (incidentId: string) => void
  executeRecommendation: (recId: string) => void
  setSelectedIncidentId: (id: string | null) => void
  setLoadingIncidents: (loading: boolean) => void
}

export const createIncidentSlice: StateCreator<IncidentSlice, [], [], IncidentSlice> = (set) => ({
  incidents: MOCK_INCIDENTS.incidents || [],
  recentAiRecommendations: MOCK_INCIDENTS.recentAiRecommendations || [],
  activeIncidentsCount: MOCK_INCIDENTS.activeCount || 0,
  criticalIncidentsCount: MOCK_INCIDENTS.criticalCount || 0,
  highIncidentsCount: MOCK_INCIDENTS.highCount || 0,
  selectedIncidentId: null,
  isLoadingIncidents: false,

  setIncidentsPayload: (payload) =>
    set({
      incidents: payload.incidents,
      recentAiRecommendations: payload.recentAiRecommendations,
      activeIncidentsCount: payload.activeCount,
      criticalIncidentsCount: payload.criticalCount,
      highIncidentsCount: payload.highCount,
    }),
  addIncident: (incident) =>
    set((state) => {
      const incidents = [incident, ...state.incidents]
      const openOnes = incidents.filter((i) => i.status !== 'RESOLVED' && i.status !== 'DISMISSED')
      return {
        incidents,
        activeIncidentsCount: openOnes.length,
        criticalIncidentsCount: openOnes.filter((i) => i.severity === 'critical').length,
        highIncidentsCount: openOnes.filter((i) => i.severity === 'high').length,
      }
    }),
  updateIncidentStatus: (incidentId, status) =>
    set((state) => {
      const updated = state.incidents.map((inc) => (inc.id === incidentId ? { ...inc, status } : inc))
      const openOnes = updated.filter((i) => i.status !== 'RESOLVED' && i.status !== 'DISMISSED')
      return {
        incidents: updated,
        activeIncidentsCount: openOnes.length,
        criticalIncidentsCount: openOnes.filter((i) => i.severity === 'critical').length,
        highIncidentsCount: openOnes.filter((i) => i.severity === 'high').length,
      }
    }),
  resolveIncident: (incidentId) =>
    set((state) => {
      const updated = state.incidents.map((inc) =>
        inc.id === incidentId ? { ...inc, status: 'RESOLVED' as const, resolvedAt: new Date().toISOString() } : inc
      )
      const openOnes = updated.filter((i) => i.status !== 'RESOLVED' && i.status !== 'DISMISSED')
      return {
        incidents: updated,
        activeIncidentsCount: openOnes.length,
        criticalIncidentsCount: openOnes.filter((i) => i.severity === 'critical').length,
        highIncidentsCount: openOnes.filter((i) => i.severity === 'high').length,
      }
    }),
  executeRecommendation: (recId) =>
    set((state) => ({
      recentAiRecommendations: state.recentAiRecommendations.map((r) =>
        r.id === recId ? { ...r, state: 'EXECUTING' as const } : r
      ),
      incidents: state.incidents.map((inc) =>
        inc.aiRecommendation?.id === recId
          ? {
              ...inc,
              aiRecommendation: { ...inc.aiRecommendation, state: 'EXECUTING' as const },
            }
          : inc
      ),
    })),
  setSelectedIncidentId: (selectedIncidentId) => set({ selectedIncidentId }),
  setLoadingIncidents: (isLoadingIncidents) => set({ isLoadingIncidents }),
})
