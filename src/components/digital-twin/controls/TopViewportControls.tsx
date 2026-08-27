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
    <div className="flex flex-wrap items-center justify-between gap-2.5 p-2 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-2xl z-20 select-none font-sans">
      {/* 1. Mode Switcher: LIVE vs REPLAY */}
      <div className="flex items-center rounded-lg bg-slate-100 p-1 border border-slate-200 text-xs">
        <button
          onClick={() => onModeChange('LIVE')}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1 rounded-md transition-all font-bold cursor-pointer',
            mode === 'LIVE'
              ? 'bg-white text-sky-700 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          )}
        >
          <span className="relative flex h-2 w-2">
            {mode === 'LIVE' && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
            )}
            <span
              className={cn(
                'relative inline-flex rounded-full h-2 w-2',
                mode === 'LIVE' ? 'bg-emerald-500' : 'bg-slate-400'
              )}
            />
          </span>
          <span>LIVE</span>
        </button>

        <button
          onClick={() => onModeChange('REPLAY')}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1 rounded-md transition-all font-bold cursor-pointer',
            mode === 'REPLAY'
              ? 'bg-white text-amber-800 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          )}
        >
          <History className="h-3 w-3" />
          <span>REPLAY</span>
        </button>
      </div>

      {/* 2. View Preset: 3D vs Top View */}
      <div className="flex items-center rounded-lg bg-slate-100 p-1 border border-slate-200 text-xs font-semibold">
        <button
          onClick={() => onViewModeChange('3D')}
          className={cn(
            'flex items-center gap-1 px-2.5 py-1 rounded-md transition-all cursor-pointer',
            viewMode === '3D'
              ? 'bg-white text-slate-900 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          )}
        >
          <Box className="h-3 w-3 text-sky-600" />
          <span>3D Orbit</span>
        </button>

        <button
          onClick={() => onViewModeChange('TOP_VIEW')}
          className={cn(
            'flex items-center gap-1 px-2.5 py-1 rounded-md transition-all cursor-pointer',
            viewMode === 'TOP_VIEW'
              ? 'bg-white text-slate-900 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          )}
        >
          <LayoutGrid className="h-3 w-3 text-sky-600" />
          <span>Top View</span>
        </button>
      </div>

      {/* 3. Camera Position Controls: Fit Store & Reset */}
      <div className="flex items-center gap-1 text-xs">
        <Button
          variant="outline"
          size="xs"
          onClick={onFitStore}
          className="h-7 text-[11px] gap-1 border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-2xs font-semibold"
        >
          <Focus className="h-3 w-3 text-sky-600" />
          <span>Fit Store</span>
        </Button>

        <Button
          variant="outline"
          size="xs"
          onClick={onResetCamera}
          className="h-7 text-[11px] gap-1 border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-2xs font-semibold"
        >
          <RotateCcw className="h-3 w-3 text-slate-400" />
          <span>Reset</span>
        </Button>
      </div>
    </div>
  )
}
