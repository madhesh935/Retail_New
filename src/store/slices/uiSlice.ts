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
  isDemoMode: boolean
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

  setDemoMode: (enabled: boolean) => void
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
  isDemoMode: false, // Default to live operational mode
  isSidebarCollapsed: false,
  isMobileNavOpen: false,
  isGlobalSearchOpen: false,
  isNotificationsOpen: false,
  isNotificationDrawerOpen: false,
  connectionState: 'CONNECTED',
  lastTelemetryTimestamp: new Date().toISOString(),
  notificationFilter: 'ALL',
  notifications: [
    {
      id: 'notif-01',
      title: 'Checkout C1 congestion predicted',
      message: 'Queue depth predicted to reach 9 shoppers in 8 mins. Wait time 3.5m.',
      group: 'CRITICAL',
      severity: 'critical',
      timestamp: new Date(Date.now() - 2 * 60000).toISOString(),
      read: false,
      actionUrl: '/queue-intelligence',
      entityId: 'lane-1',
      entityType: 'checkout',
    },
    {
      id: 'notif-02',
      title: 'Shelf B4 stock-out risk',
      message: 'Zero Sugar Cola facing depleted (8 units remaining). Restock recommended.',
      group: 'WARNING',
      severity: 'high',
      timestamp: new Date(Date.now() - 6 * 60000).toISOString(),
      read: false,
      actionUrl: '/inventory',
      entityId: 'shelf-b4',
      entityType: 'shelf',
    },
    {
      id: 'notif-03',
      title: 'Shelf C2 replenishment completed',
      message: 'Restocker completed shelf audit: 36 units added to Dairy Cooler Wall.',
      group: 'RESOLVED',
      severity: 'info',
      timestamp: new Date(Date.now() - 14 * 60000).toISOString(),
      read: true,
      actionUrl: '/inventory',
      entityId: 'shelf-c2',
      entityType: 'shelf',
    },
    {
      id: 'notif-04',
      title: 'Critical Out-Of-Stock: Organic Whole Milk',
      message: 'Zero stock detected on Dairy Chiller C2 for 14 mins.',
      group: 'CRITICAL',
      severity: 'critical',
      timestamp: new Date(Date.now() - 18 * 60000).toISOString(),
      read: false,
      actionUrl: '/incidents-actions',
      entityId: 'inc-01',
      entityType: 'incident',
    },
    {
      id: 'notif-05',
      title: 'Wet Floor Hazard Detected near Shelf B4',
      message: 'Visual anomaly resembling clear liquid spill near Cooler Bay 2.',
      group: 'WARNING',
      severity: 'high',
      timestamp: new Date(Date.now() - 25 * 60000).toISOString(),
      read: true,
      actionUrl: '/incidents-actions',
      entityId: 'inc-03',
      entityType: 'incident',
    },
    {
      id: 'notif-06',
      title: 'Produce Tier A1 restock verified',
      message: 'Royal Gala Organic Apples restocked to 40 units capacity.',
      group: 'RESOLVED',
      severity: 'info',
      timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
      read: true,
      actionUrl: '/inventory',
      entityId: 'shelf-a1',
      entityType: 'shelf',
    },
  ],
  unreadNotificationCount: 3,

  setDemoMode: (enabled: boolean) => set({ isDemoMode: enabled }),
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
