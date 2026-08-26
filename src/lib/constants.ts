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
  STORE_STATUS: '/api/v1/store/status',
  STORE_OCCUPANCY: '/api/v1/store/occupancy',
  CAMERAS: '/api/v1/queue/status',
  INVENTORY: '/api/v1/inventory/shelves',
  SHELVES: '/api/v1/inventory/shelves',
  SHOPPER_ANALYTICS: '/api/v1/store/status',
  QUEUES: '/api/v1/queue/status',
  STAFF: '/api/v1/staff/members',
  STAFF_MEMBERS: '/api/v1/staff/members',
  STAFF_TASKS: '/api/v1/staff/tasks',
  INCIDENTS: '/api/v1/incidents',
  COPILOT_QUERY: '/api/v1/customer/assist',
  REPORTS: '/api/v1/store/status',
  SYSTEM_HEALTH: '/api/v1/system/health',
  PREDICTIONS: '/api/v1/queue/status',
  CUSTOMER_CATALOG: '/api/v1/customer/catalog',
  CUSTOMER_ASSIST: '/api/v1/customer/assist',
  WS_ENTRANCE: 'ws://127.0.0.1:8000/api/v1/entrance/stream',
  WS_QUEUE: 'ws://127.0.0.1:8000/api/v1/queue/stream',
}

export const APP_CONFIG = {
  APP_NAME: 'Retail Edge OS',
  VERSION: '2.4.0-enterprise',
  DEFAULT_STORE_ID: 'store-blr-01',
  DEFAULT_TELEMETRY_INTERVAL_MS: 3000,
  RECONNECT_INTERVAL_MS: 4000,
  MAX_RECONNECT_ATTEMPTS: 10,
}
