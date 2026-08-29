import { useEffect } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { wsClient } from '@/services/websocket/wsClient'

export function useWebSocket() {
  const activeStoreId = useAppStore((s) => s.activeStoreId)
  const handleWebSocketMessage = useAppStore((s) => s.handleWebSocketMessage)
  const setConnectionState = useAppStore((s) => s.setConnectionState)

  useEffect(() => {
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
  }, [activeStoreId, handleWebSocketMessage, setConnectionState])
}
