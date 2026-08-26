import React from 'react'
import {
  Radio,
  History,
  Box,
  LayoutGrid,
  Focus,
  RotateCcw,
  Sparkles,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type TwinMode = 'LIVE' | 'REPLAY'
export type TwinViewMode = '3D' | 'TOP_VIEW'

interface TopViewportControlsProps {
  mode: TwinMode
  onModeChange: (mode: TwinMode) => void
  viewMode: TwinViewMode
  onViewModeChange: (viewMode: TwinViewMode) => void
  onFitStore: () => void
  onResetCamera: () => void
}

export const TopViewportControls: React.FC<TopViewportControlsProps> = ({
  mode,
  onModeChange,
  viewMode,
  onViewModeChange,
  onFitStore,
  onResetCamera,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2.5 p-2 rounded-lg bg-[#0F172A]/90 backdrop-blur-md border border-[#1E293B] shadow-2xl z-20 select-none">
      {/* 1. Mode Switcher: LIVE vs REPLAY */}
      <div className="flex items-center rounded-md bg-[#090D14] p-1 border border-[#1E293B] font-mono text-xs">
        <button
          onClick={() => onModeChange('LIVE')}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1 rounded transition-all font-bold cursor-pointer',
            mode === 'LIVE'
              ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          )}
        >
          <span className="relative flex h-2 w-2">
            {mode === 'LIVE' && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
            )}
            <span
              className={cn(
                'relative inline-flex rounded-full h-2 w-2',
                mode === 'LIVE' ? 'bg-cyan-400' : 'bg-slate-500'
              )}
            />
          </span>
          <span>LIVE</span>
        </button>

        <button
          onClick={() => onModeChange('REPLAY')}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1 rounded transition-all font-bold cursor-pointer',
            mode === 'REPLAY'
              ? 'bg-amber-950 text-amber-300 border border-amber-500/50 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          )}
        >
          <History className="h-3 w-3" />
          <span>REPLAY</span>
        </button>
      </div>

      {/* 2. View Preset: 3D vs Top View */}
      <div className="flex items-center rounded-md bg-[#090D14] p-1 border border-[#1E293B] font-mono text-xs">
        <button
          onClick={() => onViewModeChange('3D')}
          className={cn(
            'flex items-center gap-1 px-2.5 py-1 rounded transition-all cursor-pointer',
            viewMode === '3D'
              ? 'bg-[#1E293B] text-white font-bold'
              : 'text-slate-400 hover:text-slate-200'
          )}
        >
          <Box className="h-3 w-3 text-cyan-400" />
          <span>3D Orbit</span>
        </button>

        <button
          onClick={() => onViewModeChange('TOP_VIEW')}
          className={cn(
            'flex items-center gap-1 px-2.5 py-1 rounded transition-all cursor-pointer',
            viewMode === 'TOP_VIEW'
              ? 'bg-[#1E293B] text-white font-bold'
              : 'text-slate-400 hover:text-slate-200'
          )}
        >
          <LayoutGrid className="h-3 w-3 text-cyan-400" />
          <span>Top View</span>
        </button>
      </div>

      {/* 3. Camera Position Controls: Fit Store & Reset */}
      <div className="flex items-center gap-1 font-mono text-xs">
        <Button
          variant="outline"
          size="xs"
          onClick={onFitStore}
          className="h-7 text-[11px] gap-1 border-[#1E293B] text-slate-300 hover:text-white"
        >
          <Focus className="h-3 w-3 text-cyan-400" />
          <span>Fit Store</span>
        </Button>

        <Button
          variant="outline"
          size="xs"
          onClick={onResetCamera}
          className="h-7 text-[11px] gap-1 border-[#1E293B] text-slate-300 hover:text-white"
        >
          <RotateCcw className="h-3 w-3 text-slate-400" />
          <span>Reset</span>
        </Button>
      </div>
    </div>
  )
}
