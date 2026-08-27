import React, { useState } from 'react'
import { ShieldCheck, EyeOff, Lock, Cpu, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const PrivacyComplianceBadge: React.FC = () => {
  const [showDetails, setShowDetails] = useState(false)

  return (
    <div className="rounded-xl bg-white border border-slate-200 p-3.5 shadow-2xs select-none text-xs text-slate-700 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div>
            <div className="font-bold text-slate-900 text-xs flex items-center gap-2">
              <span>Privacy-First Shopper Analytics</span>
              <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                Anonymous Tracking
              </span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Designed for privacy-preserving analytics · No facial recognition · No biometric profiles · Video processed locally
            </div>
          </div>
        </div>

        <Button
          variant="outline"
          size="xs"
          onClick={() => setShowDetails(!showDetails)}
          className="text-[11px] h-7 px-2.5 gap-1 text-slate-700 border-slate-200 bg-white hover:bg-slate-50 shadow-2xs shrink-0"
        >
          <span>{showDetails ? 'Hide Details' : 'Learn More'}</span>
          {showDetails ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </Button>
      </div>

      {showDetails && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-100 text-[11px]">
          <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 flex items-center gap-2 shadow-2xs">
            <EyeOff className="h-3.5 w-3.5 text-sky-600 shrink-0" />
            <div>
              <strong className="text-slate-900 block text-[11px]">No Facial Recognition</strong>
              <span className="text-slate-500 text-[10px]">Only anonymous bounding boxes and spatial coordinates</span>
            </div>
          </div>

          <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 flex items-center gap-2 shadow-2xs">
            <Lock className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            <div>
              <strong className="text-slate-900 block text-[11px]">Temporary Track IDs</strong>
              <span className="text-slate-500 text-[10px]">Short-lived trajectory tokens that expire upon zone exit</span>
            </div>
          </div>

          <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 flex items-center gap-2 shadow-2xs">
            <Cpu className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
            <div>
              <strong className="text-slate-900 block text-[11px]">Local Video Processing</strong>
              <span className="text-slate-500 text-[10px]">Edge processing prevents raw video from leaving the store</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
