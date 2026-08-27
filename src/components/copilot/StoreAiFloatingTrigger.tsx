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
    <div className="fixed bottom-6 right-6 z-50 select-none font-sans">
      <div className="relative group">
        <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 text-white text-[11px] shadow-xl whitespace-nowrap pointer-events-none">
          <span className="font-semibold">Store AI Copilot</span>
          <span className="text-[9px] text-slate-300 font-mono bg-white/10 px-1.5 py-0.5 rounded border border-white/10">
            Ctrl+J
          </span>
        </div>

        <button
          onClick={onClick}
          type="button"
          aria-label="Store AI Copilot"
          className="flex items-center justify-center w-[56px] h-[56px] rounded-2xl erp-brand-mark border border-white/20 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
        >
          <svg
            viewBox="0 0 48 48"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-7 h-7 drop-shadow-sm"
          >
            <path d="M 18 13.5 H 23.5 V 19" />
            <rect x="13" y="19" width="22" height="16" rx="4.5" />
            <line x1="8" y1="27" x2="13" y2="27" />
            <line x1="35" y1="27" x2="40" y2="27" />
            <line x1="20" y1="25" x2="20" y2="29" strokeWidth="3.6" />
            <line x1="28" y1="25" x2="28" y2="29" strokeWidth="3.6" />
          </svg>
        </button>
      </div>
    </div>
  )
}
