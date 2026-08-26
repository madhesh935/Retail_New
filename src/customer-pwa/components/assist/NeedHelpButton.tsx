import React from 'react'
import { HandHelping, HelpCircle } from 'lucide-react'
import { CustomerAssistPrefill } from '../../types/customerAssist.types'
import { useCustomerAssist } from '../../context/CustomerAssistContext'

interface NeedHelpButtonProps {
  variant?: 'compact' | 'floating' | 'card' | 'inline' | 'pill'
  label?: string
  prefill?: CustomerAssistPrefill
  className?: string
}

export const NeedHelpButton: React.FC<NeedHelpButtonProps> = ({
  variant = 'compact',
  label = 'Need Help?',
  prefill,
  className = '',
}) => {
  const { openHelpSheet, activeRequest, viewActiveRequest } = useCustomerAssist()

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (activeRequest && activeRequest.status !== 'COMPLETED' && activeRequest.status !== 'CANCELLED') {
      viewActiveRequest()
    } else {
      openHelpSheet(prefill)
    }
  }

  if (variant === 'floating') {
    return (
      <button
        onClick={handleClick}
        className={`flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-cyan-700 text-white font-bold text-xs shadow-lg hover:bg-cyan-800 active:scale-95 transition-all cursor-pointer border border-cyan-500/30 ${className}`}
        aria-label="Request store staff assistance"
      >
        <HandHelping className="h-4 w-4 shrink-0 text-cyan-200" />
        <span>{label}</span>
      </button>
    )
  }

  if (variant === 'card') {
    return (
      <button
        onClick={handleClick}
        className={`w-full text-left p-3.5 rounded-2xl bg-gradient-to-br from-cyan-50/80 to-blue-50/60 border border-cyan-200/80 shadow-2xs hover:shadow-xs transition-all active:scale-[0.99] cursor-pointer ${className}`}
      >
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-cyan-600 text-white flex items-center justify-center shadow-xs shrink-0">
            <HandHelping className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 leading-none">Need Help?</span>
              <span className="text-[9px] font-bold text-cyan-800 bg-cyan-100/70 px-1.5 py-0.5 rounded">Store Staff</span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-1 truncate">
              Can't find a product or need in-store assistance?
            </p>
          </div>
        </div>
      </button>
    )
  }

  if (variant === 'pill') {
    return (
      <button
        onClick={handleClick}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-50 text-cyan-800 border border-cyan-200 hover:bg-cyan-100 text-xs font-semibold active:scale-95 transition-all cursor-pointer ${className}`}
      >
        <HandHelping className="h-3.5 w-3.5 text-cyan-700" />
        <span>{label}</span>
      </button>
    )
  }

  // Default compact button
  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 text-xs font-bold transition-all active:scale-95 cursor-pointer border border-slate-200 ${className}`}
    >
      <HelpCircle className="h-3.5 w-3.5 text-cyan-700 shrink-0" />
      <span>{label}</span>
    </button>
  )
}
