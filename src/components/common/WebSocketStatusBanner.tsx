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
    <div className="bg-rose-50 border-b border-rose-200 px-3.5 py-1.5 text-rose-900 text-xs flex items-center justify-between shadow-2xs shrink-0 select-none font-sans">
      <div className="flex items-center gap-2 font-mono text-[11px]">
        {isReconnecting ? (
          <RefreshCw className="h-3.5 w-3.5 text-rose-600 animate-spin" />
        ) : (
          <WifiOff className="h-3.5 w-3.5 text-rose-600" />
        )}
        <span className="font-bold uppercase tracking-wider text-rose-700 font-sans">
          {isReconnecting ? 'EDGE STREAM RECONNECTING...' : 'LIVE EDGE STREAM DISCONNECTED'}
        </span>
        <span className="text-rose-600 font-sans hidden sm:inline">
          {isReconnecting
            ? '— Attempting WebSocket handshake with local edge gateway'
            : '— Edge server is currently offline or unreachable'}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="xs"
          onClick={() => setDemoMode(true)}
          className="border-rose-300 text-rose-700 bg-white hover:bg-rose-100/60 text-[10px] font-semibold h-5.5 px-2 shadow-2xs"
        >
          Scenario Sandbox Mode
        </Button>
      </div>
    </div>
  )
}
