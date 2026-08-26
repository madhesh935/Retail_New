import React from 'react'
import { AlertCircle, ToggleRight, ToggleLeft, Activity, Info } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { Button } from '@/components/ui/button'

export const DemoModeBanner: React.FC = () => {
  const isDemoMode = useAppStore((s) => s.isDemoMode)
  const setDemoMode = useAppStore((s) => s.setDemoMode)

  if (!isDemoMode) return null

  return (
    <div className="bg-amber-950/90 border-b border-amber-500/40 px-3.5 py-1.5 text-amber-200 text-xs flex items-center justify-between shadow-inner shrink-0 select-none">
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center h-4 w-4 rounded bg-amber-500/20 text-amber-400">
          <Info className="h-3 w-3" />
        </div>
        <span className="font-mono font-bold tracking-wider uppercase text-[11px] text-amber-300">
          DEMO MODE ACTIVE
        </span>
        <span className="text-amber-200/80 text-[11px] hidden md:inline">
          — Real-time simulated Edge AI telemetry is running. Mock data adapter engaged.
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="xs"
          onClick={() => setDemoMode(false)}
          className="border-amber-500/40 text-amber-200 hover:bg-amber-900/60 text-[10px] font-mono h-5.5 px-2"
        >
          Switch to Live Backend
        </Button>
      </div>
    </div>
  )
}
