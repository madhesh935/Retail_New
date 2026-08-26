import React from 'react'
import { useLocation } from 'react-router-dom'

interface StoreAiFloatingTriggerProps {
  onClick: () => void
  isOpen: boolean
}

export const StoreAiFloatingTrigger: React.FC<StoreAiFloatingTriggerProps> = ({
  onClick,
  isOpen,
}) => {
  const location = useLocation()

  // Do not show floating button on the dedicated Copilot workspace page
  if (isOpen || location.pathname === '/copilot') return null

  return (
    <div className="fixed bottom-6 right-6 z-50 select-none font-mono">
      <div className="relative group">
        {/* Floating Tooltip on Hover */}
        <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#041523] border border-[#008B9E] text-white text-[11px] font-sans shadow-xl whitespace-nowrap pointer-events-none animate-in fade-in-0 zoom-in-95 duration-150">
          <span className="font-semibold text-[#00E5FF]">Store AI Copilot</span>
          <span className="text-[9px] text-slate-400 font-mono bg-[#00101C] px-1.5 py-0.5 rounded border border-[#003848]">
            Ctrl+J
          </span>
        </div>

        {/* Squircle Robot Floating Button matching exact reference screenshot */}
        <button
          onClick={onClick}
          type="button"
          aria-label="Store AI Copilot"
          className="flex items-center justify-center w-[58px] h-[58px] rounded-[22px] bg-[#041523] border-[3px] border-[#008B9E] hover:border-[#00E5FF] shadow-2xl hover:shadow-[#00E5FF]/30 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
        >
          <svg
            viewBox="0 0 48 48"
            fill="none"
            stroke="#00E5FF"
            strokeWidth="3.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-8 h-8"
          >
            {/* Top Periscope Antenna: goes up from top-center, then bends left */}
            <path d="M 18 13.5 H 23.5 V 19" />

            {/* Rounded Head Frame */}
            <rect x="13" y="19" width="22" height="16" rx="4.5" />

            {/* Left Ear */}
            <line x1="8" y1="27" x2="13" y2="27" />

            {/* Right Ear */}
            <line x1="35" y1="27" x2="40" y2="27" />

            {/* Two Vertical Capsule Eyes */}
            <line x1="20" y1="25" x2="20" y2="29" strokeWidth="3.6" />
            <line x1="28" y1="25" x2="28" y2="29" strokeWidth="3.6" />
          </svg>
        </button>
      </div>
    </div>
  )
}
