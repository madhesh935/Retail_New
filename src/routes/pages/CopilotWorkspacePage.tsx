import React, { useState } from 'react'
import { CopilotPageHeader } from '@/components/copilot/workspace/CopilotPageHeader'
import {
  CopilotHistoryDrawer,
  RecentSessionItem,
} from '@/components/copilot/workspace/CopilotHistoryDrawer'
import { CopilotChatWorkspace } from '@/components/copilot/workspace/CopilotChatWorkspace'
import { CopilotRightContextPanel } from '@/components/copilot/workspace/CopilotRightContextPanel'
import { CopilotStoreBriefModal } from '@/components/copilot/workspace/CopilotStoreBriefModal'
import { useLocation } from 'react-router-dom'

export const CopilotWorkspacePage: React.FC = () => {
  const location = useLocation()
  const incomingPrompt = (location.state as any)?.initialPrompt || ''
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [selectedPrompt, setSelectedPrompt] = useState<string>(incomingPrompt)
  const [isBriefModalOpen, setIsBriefModalOpen] = useState(false)
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false)

  const handleSelectSession = (session: RecentSessionItem) => {
    setActiveSessionId(session.id)
    setSelectedPrompt(session.prompt)
    setIsHistoryDrawerOpen(false)
  }

  const handleNewAnalysis = () => {
    setActiveSessionId(null)
    setSelectedPrompt('')
    setIsHistoryDrawerOpen(false)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-130px)] space-y-3.5 select-none font-sans">
      {/* 1. Header with Compact Status and History / Brief Actions */}
      <CopilotPageHeader
        onGenerateBrief={() => setIsBriefModalOpen(true)}
        onToggleHistory={() => setIsHistoryDrawerOpen(true)}
      />

      {/* 2. Two-Column Workspace Layout (Main 75% + Right Context 25%) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3.5 min-h-0">
        {/* Main AI Conversation Workspace (75% -> lg:col-span-8 xl:col-span-9) */}
        <div className="col-span-1 lg:col-span-8 xl:col-span-9 h-full min-h-0">
          <CopilotChatWorkspace initialPrompt={selectedPrompt} />
        </div>

        {/* Right Column: Live Store Context (25% -> lg:col-span-4 xl:col-span-3) */}
        <div className="hidden lg:block lg:col-span-4 xl:col-span-3 h-full min-h-0">
          <CopilotRightContextPanel />
        </div>
      </div>

      {/* History Slide-Over Drawer */}
      <CopilotHistoryDrawer
        isOpen={isHistoryDrawerOpen}
        activeSessionId={activeSessionId}
        onClose={() => setIsHistoryDrawerOpen(false)}
        onSelectSession={handleSelectSession}
        onNewAnalysis={handleNewAnalysis}
      />

      {/* Store Brief Generator Modal */}
      <CopilotStoreBriefModal
        isOpen={isBriefModalOpen}
        onClose={() => setIsBriefModalOpen(false)}
      />
    </div>
  )
}
