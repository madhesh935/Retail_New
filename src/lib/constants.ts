export interface StoreOption {
  id: string
  name: string
  code: string
  location: string
  camerasCount: number
  zonesCount: number
  activeEdgeDevice: string
}

export const STORES_LIST: StoreOption[] = [
  {
    id: 'store-01',
    name: 'Store 01 — Chennai Central',
    code: 'STORE-01-CHN',
    location: 'Puratchi Thalaivar Dr. MGR Central Hub, Chennai',
    camerasCount: 6,
    zonesCount: 8,
    activeEdgeDevice: 'Jetson-Orin-NX-01',
  },
  {
    id: 'store-02',
    name: 'Store 02 — Bangalore Tech Park',
    code: 'STORE-02-BLR',
    location: 'Outer Ring Rd, Bellandur, Bangalore',
    camerasCount: 8,
    zonesCount: 10,
    activeEdgeDevice: 'Jetson-AGX-Orin-02',
  },
  {
    id: 'store-03',
    name: 'Store 03 — Mumbai Flagship',
    code: 'STORE-03-BOM',
    location: 'Bandra Kurla Complex, Mumbai',
    camerasCount: 6,
    zonesCount: 7,
    activeEdgeDevice: 'Jetson-Orin-NX-02',
  },
]

export const NAV_MAIN_ITEMS = [
  {
    id: 'command-center',
    label: 'Command Center',
    path: '/command-center',
    iconName: 'LayoutDashboard',
    badgeKey: null,
    shortcut: '1',
  },
  {
    id: 'digital-twin',
    label: 'Digital Twin',
    path: '/digital-twin',
    iconName: 'Box',
    badgeKey: 'isLiveTwin',
    shortcut: '2',
  },
  {
    id: 'inventory',
    label: 'Inventory Intelligence',
    path: '/inventory',
    iconName: 'PackageCheck',
    badgeKey: 'stockoutAlerts',
    shortcut: '3',
  },
  {
    id: 'shopper-analytics',
    label: 'Shopper Analytics',
    path: '/shopper-analytics',
    iconName: 'Users',
    badgeKey: null,
    shortcut: '4',
  },
  {
    id: 'queue-intelligence',
    label: 'Queue Intelligence',
    path: '/queue-intelligence',
    iconName: 'ListOrdered',
    badgeKey: 'queueBottlenecks',
    shortcut: '5',
  },
  {
    id: 'staff-operations',
    label: 'Staff Operations',
    path: '/staff-operations',
    iconName: 'UserCheck',
    badgeKey: 'pendingStaffTasks',
    shortcut: '6',
  },
  {
    id: 'incidents-actions',
    label: 'Incidents & AI Actions',
    path: '/incidents-actions',
    iconName: 'ShieldAlert',
    badgeKey: 'activeIncidents',
    shortcut: '7',
  },
  {
    id: 'copilot',
    label: 'Store AI Copilot',
    path: '/copilot',
    iconName: 'Sparkles',
    badgeKey: 'aiCopilotActive',
    shortcut: '8',
  },
  {
    id: 'reports-insights',
    label: 'Reports & Insights',
    path: '/reports-insights',
    iconName: 'BarChart3',
    badgeKey: null,
    shortcut: '9',
  },
  {
    id: 'settings',
    label: 'Settings',
    path: '/settings',
    iconName: 'Settings',
    badgeKey: null,
    shortcut: '0',
  },
]

export const NAV_SYSTEM_ITEMS: {
  id: string
  label: string
  path: string
  iconName: string
  badgeKey: string | null
  shortcut: string
}[] = []

export const API_ENDPOINTS = {
  STORE_STATUS: '/api/store/status',
  STORE_STATE: '/api/store/state',
  CAMERAS: '/api/cameras',
  INVENTORY: '/api/inventory',
  SHELVES: '/api/shelves',
  SHOPPER_ANALYTICS: '/api/shopper/analytics',
  QUEUES: '/api/queues',
  STAFF: '/api/staff',
  INCIDENTS: '/api/incidents',
  COPILOT_QUERY: '/api/copilot/query',
  REPORTS: '/api/reports',
  SYSTEM_HEALTH: '/api/system/health',
  PREDICTIONS: '/api/predictions',
  WS_STORE: (storeId: string) => `/ws/store/${storeId}`,
}

export const APP_CONFIG = {
  APP_NAME: 'Retail Edge OS',
  VERSION: '2.4.0-enterprise',
  DEFAULT_STORE_ID: 'store-01',
  DEFAULT_TELEMETRY_INTERVAL_MS: 3000,
  RECONNECT_INTERVAL_MS: 4000,
  MAX_RECONNECT_ATTEMPTS: 10,
}
