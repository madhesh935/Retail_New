import React from 'react'
import { RefreshCw, WifiOff, AlertTriangle } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { Button } from '@/components/ui/button'

export const WebSocketStatusBanner: React.FC = () => {
  const connectionState = useAppStore((s) => s.connectionState)
  const isDemoMode = useAppStore((s) => s.isDemoMode)
  const setDemoMode = useAppStore((s) => s.setDemoMode)

  if (isDemoMode || connectionState === 'CONNECTED') return null

  const isReconnecting = connectionState === 'RECONNECTING' || connectionState === 'CONNECTING'

  return (
    <div className="bg-rose-950/90 border-b border-rose-500/40 px-3.5 py-1.5 text-rose-200 text-xs flex items-center justify-between shadow-inner shrink-0 select-none">
      <div className="flex items-center gap-2 font-mono text-[11px]">
        {isReconnecting ? (
          <RefreshCw className="h-3.5 w-3.5 text-rose-400 animate-spin" />
        ) : (
          <WifiOff className="h-3.5 w-3.5 text-rose-400" />
        )}
        <span className="font-bold uppercase tracking-wider text-rose-300">
          {isReconnecting ? 'EDGE STREAM RECONNECTING...' : 'LIVE EDGE STREAM DISCONNECTED'}
        </span>
        <span className="text-rose-300/70 hidden sm:inline">
          {isReconnecting
            ? 'Attempting WebSocket handshake with local edge gateway'
            : 'Edge server is currently offline or unreachable'}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="xs"
          onClick={() => setDemoMode(true)}
          className="border-rose-500/40 text-rose-200 hover:bg-rose-900/60 text-[10px] font-mono h-5.5 px-2"
        >
          Scenario Sandbox Mode
        </Button>
      </div>
    </div>
  )
}
