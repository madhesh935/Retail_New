import { useEffect } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { wsClient } from '@/services/websocket/wsClient'
import { mockDemoAdapter } from '@/services/mock/mockAdapter'

export function useWebSocket() {
  const activeStoreId = useAppStore((s) => s.activeStoreId)
  const isDemoMode = useAppStore((s) => s.isDemoMode)
  const handleWebSocketMessage = useAppStore((s) => s.handleWebSocketMessage)
  const setConnectionState = useAppStore((s) => s.setConnectionState)

  useEffect(() => {
    if (isDemoMode) {
      // In Demo Mode, start simulated telemetry ticker
      setConnectionState('CONNECTED')
      mockDemoAdapter.startSimulation(3000)
      const unsubscribe = mockDemoAdapter.onTelemetry((msg) => {
        handleWebSocketMessage(msg)
      })

      return () => {
        unsubscribe()
        mockDemoAdapter.stopSimulation()
      }
    } else {
      // In Production Mode, connect to real WebSocket
      wsClient.connect(activeStoreId)

      const unsubscribeMessage = wsClient.onMessage((msg) => {
        handleWebSocketMessage(msg)
      })

      const unsubscribeState = wsClient.onStateChange((state) => {
        setConnectionState(state)
      })

      return () => {
        unsubscribeMessage()
        unsubscribeState()
        wsClient.disconnect()
      }
    }
  }, [activeStoreId, isDemoMode, handleWebSocketMessage, setConnectionState])
}
