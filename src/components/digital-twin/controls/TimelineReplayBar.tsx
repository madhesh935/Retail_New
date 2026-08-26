import React, { useState, useEffect } from 'react'
import {
  Play,
  Pause,
  RotateCcw,
  FastForward,
  Clock,
  Sparkles,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface TimelineReplayBarProps {
  isPlaying: boolean
  onTogglePlay: () => void
  replaySpeed: number
  onChangeSpeed: (speed: number) => void
  currentProgress: number // 0 to 100
  onSeek: (progress: number) => void
}

export const TimelineReplayBar: React.FC<TimelineReplayBarProps> = ({
  isPlaying,
  onTogglePlay,
  replaySpeed,
  onChangeSpeed,
  currentProgress,
  onSeek,
}) => {
  // Convert 0-100 progress to a timestamp between 17:00 and 20:00 (3 hours = 180 mins)
  const totalMinutes = Math.round((currentProgress / 100) * 180)
  const currentHour = 17 + Math.floor(totalMinutes / 60)
  const currentMin = totalMinutes % 60
  const formattedTime = `${currentHour.toString().padStart(2, '0')}:${currentMin
    .toString()
    .padStart(2, '0')}:00`

  return (
    <div className="rounded-lg bg-gradient-to-r from-amber-950/95 via-[#1C1608]/95 to-amber-950/95 backdrop-blur-md border border-amber-500/60 shadow-2xl p-3 select-none flex flex-col gap-2 z-20 font-mono">
      {/* Top Banner Alert */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-amber-500/20 text-amber-400 border border-amber-500/50">
            <Clock className="h-3.5 w-3.5" />
          </div>
          <div>
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
              HISTORICAL REPLAY MODE
            </span>
            <span className="text-[10px] text-amber-200/80 ml-2 hidden sm:inline">
              Replaying customer paths, queue surges, and shelf depletion telemetry
            </span>
          </div>
        </div>

        {/* Current Replay Timestamp */}
        <div className="px-2.5 py-1 rounded bg-[#090D14] border border-amber-500/40 text-amber-300 font-bold text-xs tracking-wider">
          {formattedTime}
        </div>
      </div>

      {/* Scrubber Range Slider Bar */}
      <div className="flex items-center gap-3">
        <span className="text-[10px] text-slate-400">17:00</span>
        <div className="flex-1 relative flex items-center">
          <input
            type="range"
            min="0"
            max="100"
            step="0.5"
            value={currentProgress}
            onChange={(e) => onSeek(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
          />
        </div>
        <span className="text-[10px] text-slate-400">20:00</span>
      </div>

      {/* Control Buttons & Playback Speed */}
      <div className="flex items-center justify-between pt-1 text-xs">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="xs"
            onClick={onTogglePlay}
            className="border-amber-500/50 bg-amber-950/60 text-amber-200 hover:bg-amber-900 gap-1.5 h-7 px-3 font-bold"
          >
            {isPlaying ? (
              <>
                <Pause className="h-3.5 w-3.5" /> Pause
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5" /> Play Replay
              </>
            )}
          </Button>

          <Button
            variant="ghost"
            size="xs"
            onClick={() => onSeek(0)}
            className="text-slate-400 hover:text-white h-7 text-[11px]"
            title="Restart Replay"
          >
            <RotateCcw className="h-3 w-3 mr-1" /> Restart
          </Button>
        </div>

        {/* Speed Controls */}
        <div className="flex items-center gap-1 text-[10px]">
          <span className="text-slate-400 mr-1 hidden sm:inline">Speed:</span>
          {[1, 2, 4].map((speed) => (
            <button
              key={speed}
              onClick={() => onChangeSpeed(speed)}
              className={`px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                replaySpeed === speed
                  ? 'bg-amber-500 text-black font-bold border-amber-400'
                  : 'bg-[#090D14] text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              {speed}x
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
