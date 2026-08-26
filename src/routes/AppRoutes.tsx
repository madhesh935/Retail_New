import React, { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'

// Lazy load pages to drastically optimize load time on mobile devices
const CustomerPwaLayout = lazy(() =>
  import('@/customer-pwa/CustomerPwaLayout').then((m) => ({ default: m.CustomerPwaLayout }))
)
const CommandCenterPage = lazy(() =>
  import('./pages/CommandCenterPage').then((m) => ({ default: m.CommandCenterPage }))
)
const DigitalTwinPage = lazy(() =>
  import('./pages/DigitalTwinPage').then((m) => ({ default: m.DigitalTwinPage }))
)
const InventoryPage = lazy(() =>
  import('./pages/InventoryPage').then((m) => ({ default: m.InventoryPage }))
)
const ShopperAnalyticsPage = lazy(() =>
  import('./pages/ShopperAnalyticsPage').then((m) => ({ default: m.ShopperAnalyticsPage }))
)
const QueueIntelligencePage = lazy(() =>
  import('./pages/QueueIntelligencePage').then((m) => ({ default: m.QueueIntelligencePage }))
)
const StaffOperationsPage = lazy(() =>
  import('./pages/StaffOperationsPage').then((m) => ({ default: m.StaffOperationsPage }))
)
const IncidentsActionsPage = lazy(() =>
  import('./pages/IncidentsActionsPage').then((m) => ({ default: m.IncidentsActionsPage }))
)
const CopilotWorkspacePage = lazy(() =>
  import('./pages/CopilotWorkspacePage').then((m) => ({ default: m.CopilotWorkspacePage }))
)
const ReportsInsightsPage = lazy(() =>
  import('./pages/ReportsInsightsPage').then((m) => ({ default: m.ReportsInsightsPage }))
)
const SettingsPage = lazy(() =>
  import('./pages/SettingsPage').then((m) => ({ default: m.SettingsPage }))
)
const NotFoundPage = lazy(() =>
  import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage }))
)

const PageLoader: React.FC = () => (
  <div className="flex min-h-screen items-center justify-center bg-slate-50 text-cyan-600">
    <div className="flex flex-col items-center gap-3">
      <div className="h-8 w-8 animate-spin rounded-full border-3 border-cyan-600 border-t-transparent" />
      <span className="text-xs font-semibold text-slate-500">Loading Smart Shopping...</span>
    </div>
  </div>
)

export const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Standalone Mobile-First Customer Smart Shopping PWA Routes (No Manager Sidebar) */}
        <Route path="/shop" element={<CustomerPwaLayout />} />
        <Route path="/shop/copilot" element={<CustomerPwaLayout defaultTab="COPILOT" />} />
        <Route path="/shop/:storeId" element={<CustomerPwaLayout />} />
        <Route path="/shop/:storeId/copilot" element={<CustomerPwaLayout defaultTab="COPILOT" />} />

        {/* Internal Store Operations Command Center (Manager View) */}
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/command-center" replace />} />
          <Route path="/command-center" element={<CommandCenterPage />} />
          <Route path="/digital-twin" element={<DigitalTwinPage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/shopper-analytics" element={<ShopperAnalyticsPage />} />
          <Route path="/queue-intelligence" element={<QueueIntelligencePage />} />
          <Route path="/queues" element={<QueueIntelligencePage />} />
          <Route path="/staff-operations" element={<StaffOperationsPage />} />
          <Route path="/staff" element={<StaffOperationsPage />} />
          <Route path="/incidents-actions" element={<IncidentsActionsPage />} />
          <Route path="/incidents" element={<IncidentsActionsPage />} />
          <Route path="/copilot" element={<CopilotWorkspacePage />} />
          <Route path="/reports-insights" element={<ReportsInsightsPage />} />
          <Route path="/reports" element={<ReportsInsightsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
