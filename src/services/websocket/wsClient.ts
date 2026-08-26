import { ConnectionState, WebSocketMessage } from '@/types'
import { APP_CONFIG } from '@/lib/constants'

type MessageListener = (msg: WebSocketMessage) => void
type StateListener = (state: ConnectionState) => void

export class StoreWebSocketClient {
  private ws: WebSocket | null = null
  private storeId: string = ''
  private state: ConnectionState = 'DISCONNECTED'
  private reconnectAttempts = 0
  private reconnectTimer: number | null = null
  private heartbeatTimer: number | null = null
  private messageListeners: Set<MessageListener> = new Set()
  private stateListeners: Set<StateListener> = new Set()
  private isManuallyClosed = false

  constructor() {}

  public connect(storeId: string) {
    this.storeId = storeId
    this.isManuallyClosed = false
    this.cleanup()
    this.updateState('CONNECTING')

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const host = import.meta.env.VITE_WS_HOST || '127.0.0.1:8000'
    const wsUrl = `${protocol}//${host}/api/v1/entrance/stream`

    try {
      this.ws = new WebSocket(wsUrl)

      this.ws.onopen = () => {
        this.reconnectAttempts = 0
        this.updateState('CONNECTED')
        this.startHeartbeat()
      }

      this.ws.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data) as WebSocketMessage
          this.notifyMessage(parsed)
        } catch {
          // ignore non-json frames or binary frames
        }
      }

      this.ws.onclose = () => {
        this.stopHeartbeat()
        if (!this.isManuallyClosed) {
          this.scheduleReconnect()
        } else {
          this.updateState('DISCONNECTED')
        }
      }

      this.ws.onerror = () => {
        this.updateState('ERROR')
      }
    } catch {
      this.scheduleReconnect()
    }
  }

  public disconnect() {
    this.isManuallyClosed = true
    this.cleanup()
    this.updateState('DISCONNECTED')
  }

  public send(event: string, payload: unknown) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        event,
        storeId: this.storeId,
        timestamp: new Date().toISOString(),
        payload,
      }))
    }
  }

  public onMessage(listener: MessageListener): () => void {
    this.messageListeners.add(listener)
    return () => this.messageListeners.delete(listener)
  }

  public onStateChange(listener: StateListener): () => void {
    this.stateListeners.add(listener)
    listener(this.state)
    return () => this.stateListeners.delete(listener)
  }

  public getState(): ConnectionState {
    return this.state
  }

  private updateState(newState: ConnectionState) {
    this.state = newState
    this.stateListeners.forEach((listener) => listener(newState))
  }

  private notifyMessage(message: WebSocketMessage) {
    this.messageListeners.forEach((listener) => listener(message))
  }

  private startHeartbeat() {
    this.stopHeartbeat()
    this.heartbeatTimer = window.setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ event: 'PING', timestamp: new Date().toISOString() }))
      }
    }, 25000)
  }

  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts >= APP_CONFIG.MAX_RECONNECT_ATTEMPTS) {
      this.updateState('DISCONNECTED')
      return
    }

    this.reconnectAttempts++
    this.updateState('RECONNECTING')

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
    }

    const backoffMs = Math.min(1000 * Math.pow(1.5, this.reconnectAttempts), 15000)
    this.reconnectTimer = window.setTimeout(() => {
      if (!this.isManuallyClosed && this.storeId) {
        this.connect(this.storeId)
      }
    }, backoffMs)
  }

  private cleanup() {
    this.stopHeartbeat()
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    if (this.ws) {
      this.ws.onopen = null
      this.ws.onclose = null
      this.ws.onmessage = null
      this.ws.onerror = null
      this.ws.close()
      this.ws = null
    }
  }
}

export const wsClient = new StoreWebSocketClient()
