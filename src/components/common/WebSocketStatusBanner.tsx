import React from 'react'
import { RefreshCw, WifiOff } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'

export const WebSocketStatusBanner: React.FC = () => {
  const connectionState = useAppStore((s) => s.connectionState)

  if (connectionState === 'CONNECTED') return null

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
    </div>
  )
}
