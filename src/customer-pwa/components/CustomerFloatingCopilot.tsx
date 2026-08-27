import React from 'react'
import { useCustomerShopping } from '../context/CustomerShoppingContext'
import { CopilotRobotIcon } from './CopilotRobotIcon'

export const CustomerFloatingCopilot: React.FC = () => {
  const { activeTab, setIsCopilotDrawerOpen } = useCustomerShopping()

  // Do not render if customer is currently on the dedicated full Copilot page
  if (activeTab === 'COPILOT') {
    return null
  }

  return (
    <div className="absolute bottom-20 right-3 z-40 select-none">
      {/* Floating Copilot Robot Logo Trigger (Light Clean Theme) */}
      <button
        onClick={() => setIsCopilotDrawerOpen(true)}
        className="group relative flex items-center justify-center w-12.5 h-12.5 rounded-2xl bg-white border-2 border-cyan-500 hover:border-cyan-600 shadow-lg shadow-cyan-900/10 hover:shadow-cyan-500/20 active:scale-95 transition-all duration-200 cursor-pointer"
        title="Open Shopping Copilot"
        aria-label="Shopping Copilot"
      >
        {/* Subtle idle pulsing background glow */}
        <span className="absolute -inset-1 rounded-2xl bg-cyan-400/20 animate-pulse pointer-events-none" />

        <CopilotRobotIcon
          className="w-7 h-7 text-cyan-600 group-hover:scale-105 transition-transform"
          stroke="#0F766E"
        />
      </button>
    </div>
  )
}
