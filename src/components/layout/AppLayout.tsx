import React, { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { MobileNavDrawer } from './MobileNavDrawer'
import { TopHeader } from './TopHeader'
import { NotificationDrawer } from './NotificationDrawer'
import { GlobalSearchModal } from './GlobalSearchModal'
import { StoreAiFloatingTrigger } from '@/components/copilot/StoreAiFloatingTrigger'
import { StoreAiCopilotDrawer } from '@/components/copilot/StoreAiCopilotDrawer'
import { useWebSocket } from '@/hooks/useWebSocket'
import { useStoreData } from '@/hooks/useStoreData'

export const AppLayout: React.FC = () => {
  // Initialize real-time edge telemetry hook and active store data sync
  useWebSocket()
  useStoreData()

  // Store AI Copilot drawer state
  const [isCopilotOpen, setIsCopilotOpen] = useState(false)

  // Keyboard shortcut (⌘J or Ctrl+J) to toggle Store AI Copilot
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'j') {
        e.preventDefault()
        setIsCopilotOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#090D14] text-slate-100 font-sans">
      {/* Left Collapsible Navigation Sidebar (Desktop) */}
      <Sidebar />

      {/* Responsive Slide-over Drawer (Mobile / Tablet) */}
      <MobileNavDrawer />

      {/* Main Viewport Container */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Operational Header */}
        <TopHeader />

        {/* Dynamic Route Content Outlet */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-5 bg-[#090D14] min-w-0">
          <div className="max-w-[1720px] mx-auto space-y-5">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Slide-over Grouped Notification Drawer */}
      <NotificationDrawer />

      {/* Global Multi-Entity Command Search Palette (⌘K) */}
      <GlobalSearchModal />

      {/* Global Floating "Ask Store AI" Button (Lower-Right) */}
      <StoreAiFloatingTrigger
        onClick={() => setIsCopilotOpen(true)}
        isOpen={isCopilotOpen}
      />

      {/* Global Slide-Over Store AI Copilot Drawer */}
      <StoreAiCopilotDrawer
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
      />
    </div>
  )
}
