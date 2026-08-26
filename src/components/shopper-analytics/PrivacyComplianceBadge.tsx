import React, { useState } from 'react'
import { ShieldCheck, EyeOff, Lock, Cpu, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const PrivacyComplianceBadge: React.FC = () => {
  const [showDetails, setShowDetails] = useState(false)

  return (
    <div className="rounded-lg bg-[#0F172A] border border-[#1E293B] p-3 shadow-sm select-none text-xs text-slate-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded bg-[#1E293B] text-emerald-400">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div>
            <div className="font-semibold text-white text-xs flex items-center gap-2">
              <span>Privacy-First Shopper Analytics</span>
              <span className="text-[10px] text-emerald-400 font-medium bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                Anonymous Tracking
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Designed for privacy-preserving analytics · No facial recognition · No biometric profiles · Video processed locally
            </div>
          </div>
        </div>

        <Button
          variant="outline"
          size="xs"
          onClick={() => setShowDetails(!showDetails)}
          className="text-[11px] h-7 px-2.5 gap-1 text-slate-300 border-[#1E293B] shrink-0"
        >
          <span>{showDetails ? 'Hide Details' : 'Learn More'}</span>
          {showDetails ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </Button>
      </div>

      {showDetails && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3 pt-3 border-t border-[#1E293B] text-[11px]">
          <div className="bg-[#090D14] p-2 rounded border border-[#1E293B] flex items-center gap-2">
            <EyeOff className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
            <div>
              <strong className="text-white block text-[11px]">No Facial Recognition</strong>
              <span className="text-slate-400 text-[10px]">Only anonymous bounding boxes and spatial coordinates</span>
            </div>
          </div>

          <div className="bg-[#090D14] p-2 rounded border border-[#1E293B] flex items-center gap-2">
            <Lock className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            <div>
              <strong className="text-white block text-[11px]">Temporary Track IDs</strong>
              <span className="text-slate-400 text-[10px]">Short-lived trajectory tokens that expire upon zone exit</span>
            </div>
          </div>

          <div className="bg-[#090D14] p-2 rounded border border-[#1E293B] flex items-center gap-2">
            <Cpu className="h-3.5 w-3.5 text-blue-400 shrink-0" />
            <div>
              <strong className="text-white block text-[11px]">Local Video Processing</strong>
              <span className="text-slate-400 text-[10px]">Edge processing prevents raw video from leaving the store</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
