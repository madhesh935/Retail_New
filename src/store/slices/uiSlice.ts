import { StateCreator } from 'zustand'
import { ConnectionState } from '@/types'

export type NotificationGroup = 'CRITICAL' | 'WARNING' | 'RESOLVED'

export interface AppNotification {
  id: string
  title: string
  message: string
  group: NotificationGroup
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical'
  timestamp: string
  read: boolean
  actionUrl?: string
  entityId?: string
  entityType?: 'shelf' | 'checkout' | 'camera' | 'incident' | 'zone' | 'staff'
}

export interface UiSlice {
  isSidebarCollapsed: boolean
  isMobileNavOpen: boolean
  isGlobalSearchOpen: boolean
  isNotificationsOpen: boolean
  isNotificationDrawerOpen: boolean
  connectionState: ConnectionState
  lastTelemetryTimestamp: string | null
  notifications: AppNotification[]
  unreadNotificationCount: number
  notificationFilter: 'ALL' | 'CRITICAL' | 'WARNING' | 'RESOLVED'

  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  setMobileNavOpen: (open: boolean) => void
  setGlobalSearchOpen: (open: boolean) => void
  setNotificationsOpen: (open: boolean) => void
  setNotificationDrawerOpen: (open: boolean) => void
  setNotificationFilter: (filter: 'ALL' | 'CRITICAL' | 'WARNING' | 'RESOLVED') => void
  setConnectionState: (state: ConnectionState) => void
  setLastTelemetryTimestamp: (timestamp: string) => void
  addNotification: (notification: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void
  markNotificationAsRead: (id: string) => void
  markAllNotificationsAsRead: () => void
  clearAllNotifications: () => void
}

export const createUiSlice: StateCreator<UiSlice, [], [], UiSlice> = (set, get) => ({
  isSidebarCollapsed: false,
  isMobileNavOpen: false,
  isGlobalSearchOpen: false,
  isNotificationsOpen: false,
  isNotificationDrawerOpen: false,
  connectionState: 'CONNECTED',
  lastTelemetryTimestamp: null,
  notificationFilter: 'ALL',
  notifications: [],
  unreadNotificationCount: 0,

  toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
  setSidebarCollapsed: (collapsed: boolean) => set({ isSidebarCollapsed: collapsed }),
  setMobileNavOpen: (open: boolean) => set({ isMobileNavOpen: open }),
  setGlobalSearchOpen: (open: boolean) => set({ isGlobalSearchOpen: open }),
  setNotificationsOpen: (open: boolean) => set({ isNotificationsOpen: open }),
  setNotificationDrawerOpen: (open: boolean) => set({ isNotificationDrawerOpen: open }),
  setNotificationFilter: (notificationFilter) => set({ notificationFilter }),
  setConnectionState: (connectionState: ConnectionState) => set({ connectionState }),
  setLastTelemetryTimestamp: (lastTelemetryTimestamp: string) => set({ lastTelemetryTimestamp }),
  addNotification: (notification) => {
    const newNotif: AppNotification = {
      ...notification,
      id: `notif-${Date.now()}`,
      timestamp: new Date().toISOString(),
      read: false,
    }
    set((state) => ({
      notifications: [newNotif, ...state.notifications],
      unreadNotificationCount: state.unreadNotificationCount + 1,
    }))
  },
  markNotificationAsRead: (id: string) => {
    set((state) => ({
      notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
      unreadNotificationCount: Math.max(
        0,
        state.notifications.filter((n) => (n.id === id ? false : !n.read)).length
      ),
    }))
  },
  markAllNotificationsAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadNotificationCount: 0,
    }))
  },
  clearAllNotifications: () => set({ notifications: [], unreadNotificationCount: 0 }),
})
