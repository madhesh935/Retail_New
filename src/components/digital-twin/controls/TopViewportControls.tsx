import React from 'react'
import {
  Box,
  LayoutGrid,
  Focus,
  RotateCcw,
  Maximize2,
  Minimize2,
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
  showReplay?: boolean
  isFullscreen?: boolean
  onToggleFullscreen?: () => void
}

export const TopViewportControls: React.FC<TopViewportControlsProps> = ({
  mode,
  onModeChange,
  viewMode,
  onViewModeChange,
  onFitStore,
  onResetCamera,
  showReplay = false,
  isFullscreen = false,
  onToggleFullscreen,
}) => {
  return (
    <div className="flex flex-wrap items-center gap-2 select-none font-sans">
      {/* Live indicator / optional replay */}
      <div className="flex items-center rounded-lg bg-white/95 border border-slate-200 p-1 text-xs shadow-sm">
        <button
          type="button"
          onClick={() => onModeChange('LIVE')}
          className={cn(
            'flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all font-semibold cursor-pointer',
            mode === 'LIVE' ? 'bg-emerald-50 text-emerald-800' : 'text-slate-600 hover:text-slate-900'
          )}
        >
          <span className="relative flex h-1.5 w-1.5">
            {mode === 'LIVE' && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-60" />
            )}
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
          </span>
          Live
        </button>

        {showReplay && (
          <button
            type="button"
            onClick={() => onModeChange('REPLAY')}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all font-semibold cursor-pointer',
              mode === 'REPLAY' ? 'bg-amber-50 text-amber-800' : 'text-slate-600 hover:text-slate-900'
            )}
          >
            Replay
          </button>
        )}
      </div>

      <div className="flex items-center rounded-lg bg-white/95 border border-slate-200 p-1 text-xs font-semibold shadow-sm">
        <button
          type="button"
          onClick={() => onViewModeChange('3D')}
          className={cn(
            'flex items-center gap-1 px-2.5 py-1 rounded-md transition-all cursor-pointer',
            viewMode === '3D' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
          )}
        >
          <Box className="h-3 w-3" />
          3D
        </button>
        <button
          type="button"
          onClick={() => onViewModeChange('TOP_VIEW')}
          className={cn(
            'flex items-center gap-1 px-2.5 py-1 rounded-md transition-all cursor-pointer',
            viewMode === 'TOP_VIEW' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
          )}
        >
          <LayoutGrid className="h-3 w-3" />
          Top
        </button>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="xs"
          onClick={onFitStore}
          className="h-7 text-[11px] gap-1 border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-sm font-semibold"
        >
          <Focus className="h-3 w-3" />
          Fit
        </Button>
        <Button
          variant="outline"
          size="xs"
          onClick={onResetCamera}
          className="h-7 text-[11px] gap-1 border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-sm font-semibold"
        >
          <RotateCcw className="h-3 w-3 text-slate-400" />
          Reset
        </Button>
        {onToggleFullscreen && (
          <Button
            variant="outline"
            size="xs"
            onClick={onToggleFullscreen}
            className="h-7 text-[11px] gap-1 border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-sm font-semibold"
          >
            {isFullscreen ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
            {isFullscreen ? 'Exit' : 'Fullscreen'}
          </Button>
        )}
      </div>
    </div>
  )
}
