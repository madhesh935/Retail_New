import type { NavigationPlan, StoreLayout } from '@/customer-pwa/types/navigation';
import type { DatabaseDump } from '@/types/database';

// 100% Real Live Store API Client connecting to FastAPI backend
const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000').replace(/\/+$/, '');

async function fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(options?.headers || {})
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP error ${response.status} fetching ${url}`);
  }

  return response.json();
}

export const realStoreApi = {
  // Store Info & Status
  async getStoreStatus() {
    return fetchJson<any>('/api/v1/store/status');
  },

  async updateOccupancy(currentOccupancy: number, entryDelta = 0, exitDelta = 0) {
    return fetchJson<any>('/api/v1/store/occupancy', {
      method: 'POST',
      body: JSON.stringify({ current_occupancy: currentOccupancy, entry_delta: entryDelta, exit_delta: exitDelta })
    });
  },

  // Shelves & Inventory
  async getShelves() {
    return fetchJson<any[]>('/api/v1/inventory/shelves');
  },

  async getCameras() {
    return fetchJson<any[]>('/api/v1/cameras/');
  },

  async updateShelf(shelfCode: string, updates: { availability?: number; visible_units?: number; status?: string }) {
    return fetchJson<any>(`/api/v1/inventory/shelves/${shelfCode}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
  },

  // Staff & Tasks
  async getStaffMembers() {
    return fetchJson<any[]>('/api/v1/staff/members');
  },

  async getStaffTasks() {
    return fetchJson<any[]>('/api/v1/staff/tasks');
  },

  async createStaffTask(task: {
    title: string;
    type: string;
    priority?: string;
    target_location: string;
    description?: string;
    assigned_staff_id?: string;
    customer_request_data?: any;
  }) {
    return fetchJson<any>('/api/v1/staff/tasks', {
      method: 'POST',
      body: JSON.stringify(task)
    });
  },

  async updateTaskStatus(
    taskId: string,
    status: string,
    assignedStaffId?: string,
    blocker?: { reason?: string; note?: string; photo?: string }
  ) {
    return fetchJson<any>(`/api/v1/staff/tasks/${taskId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({
        status,
        ...(assignedStaffId ? { assigned_staff_id: assignedStaffId } : {}),
        ...(blocker?.reason ? { blocker_reason: blocker.reason } : {}),
        ...(blocker?.note ? { blocker_note: blocker.note } : {}),
        ...(blocker?.photo ? { blocker_photo: blocker.photo } : {}),
      }),
    });
  },

  async updateTaskDetails(taskId: string, details: Record<string, unknown>) {
    return fetchJson<{ status: string; task_id: string; details: Record<string, unknown> }>(
      `/api/v1/staff/tasks/${encodeURIComponent(taskId)}/details`,
      {
        method: 'PATCH',
        body: JSON.stringify({ details }),
      }
    );
  },

  async getStaffTask(taskId: string) {
    return fetchJson<any>(`/api/v1/staff/tasks/${taskId}`);
  },

  // Incidents
  async getIncidents() {
    return fetchJson<any[]>('/api/v1/incidents');
  },

  async resolveIncident(incidentId: string) {
    return fetchJson<any>(`/api/v1/incidents/${incidentId}/resolve`, { method: 'POST' });
  },

  async executeIncidentAction(incidentId: string) {
    return fetchJson<any>(`/api/v1/incidents/${incidentId}/execute`, { method: 'POST' });
  },

  // System Health
  async getSystemHealth() {
    return fetchJson<any>('/api/v1/system/health');
  },

  async getAllDatabaseData() {
    return fetchJson<DatabaseDump>('/api/v1/database/all');
  },

  // Queues & Entrance
  async getQueueStatus() {
    return fetchJson<any>('/api/v1/queue/status');
  },

  async getQueueLanes() {
    return fetchJson<any[]>('/api/v1/queue/lanes');
  },

  async getEntranceStatus() {
    return fetchJson<any>('/api/v1/entrance/status');
  },

  async getInventoryBatches() {
    return fetchJson<any[]>('/api/v1/inventory/batches');
  },

  async getMarkdownCandidates() {
    return fetchJson<any[]>('/api/v1/inventory/markdown-candidates');
  },

  async getWasteRecords() {
    return fetchJson<any[]>('/api/v1/inventory/waste');
  },

  async recordWaste(payload: {
    store_id: string;
    product_id: string;
    product_sku: string;
    product_name: string;
    batch_id?: string;
    batch_number?: string;
    quantity: number;
    reason: string;
    recorded_by_staff_id: string;
    recorded_by_staff_name: string;
    location_id: string;
    location_name: string;
    unit_cost?: number;
    notes?: string;
    evidence_photo?: string;
  }) {
    return fetchJson<{
      status: string;
      waste_id: string;
      batch_id: string;
      remaining_quantity: number;
    }>('/api/v1/inventory/waste', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateBatchExpiry(batchId: string, expiresAt: string, reason: string, staffId: string) {
    return fetchJson<{ status: string; batch_id: string; expires_at: string }>(
      `/api/v1/inventory/batches/${encodeURIComponent(batchId)}/expiry`,
      {
        method: 'PATCH',
        body: JSON.stringify({ expires_at: expiresAt, reason, staff_id: staffId }),
      }
    );
  },

  async getProducts() {
    return fetchJson<any[]>('/api/v1/inventory/products');
  },

  // Customer Catalog & Assist
  async getCustomerCatalog() {
    return fetchJson<any[]>('/api/v1/customer/catalog');
  },

  async getStoreLayout(storeId = 'store-01') {
    return fetchJson<StoreLayout>(`/api/v1/navigation/layout?store_id=${encodeURIComponent(storeId)}`);
  },

  async getNavigationRoute(params: {
    productId?: string;
    shelfCode?: string;
    storeId?: string;
    startNodeId?: string;
    includeCheckout?: boolean;
    checkoutLaneCode?: string;
    avoidCongestion?: boolean;
    accessibleOnly?: boolean;
  }) {
    const query = new URLSearchParams();
    if (params.productId) query.set('product_id', params.productId);
    if (params.shelfCode) query.set('shelf_code', params.shelfCode);
    if (params.storeId) query.set('store_id', params.storeId);
    if (params.startNodeId) query.set('start_node_id', params.startNodeId);
    if (params.checkoutLaneCode) query.set('checkout_lane_code', params.checkoutLaneCode);
    query.set('include_checkout', String(params.includeCheckout ?? false));
    query.set('avoid_congestion', String(params.avoidCongestion ?? true));
    query.set('accessible_only', String(params.accessibleOnly ?? false));
    return fetchJson<NavigationPlan>(`/api/v1/navigation/route?${query.toString()}`);
  },

  async optimizeNavigationRoute(payload: {
    store_id?: string;
    start_node_id?: string;
    destinations: Array<{ product_id?: string; shelf_code?: string; label?: string }>;
    include_checkout?: boolean;
    checkout_lane_code?: string;
    avoid_congestion?: boolean;
    accessible_only?: boolean;
  }) {
    return fetchJson<NavigationPlan>('/api/v1/navigation/route/optimize', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async submitCustomerAssist(payload: {
    request_type: string;
    urgency?: string;
    customer_name?: string;
    location_zone: string;
    shelf_code?: string;
    product_id?: string;
    product_name?: string;
    customer_notes?: string;
  }) {
    return fetchJson<{
      status: string;
      request_id: string;
      assigned_staff_name: string | null;
      estimated_arrival_minutes: number;
    }>('/api/v1/customer/assist', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async getCustomerAssistStatus(requestId: string) {
    return fetchJson<{
      request_id: string;
      status: string;
      assigned_staff_id: string | null;
      assigned_staff_name: string | null;
      target_location: string;
      title: string;
      customer_request_data: Record<string, unknown>;
      created_at: string | null;
      completed_at: string | null;
    }>(`/api/v1/customer/assist/${encodeURIComponent(requestId)}`);
  },

  async sendCustomerAssistMessage(requestId: string, sender: 'CUSTOMER' | 'ASSOCIATE', text: string) {
    return fetchJson<{
      id: string;
      sender: 'CUSTOMER' | 'ASSOCIATE';
      text: string;
      timestamp: string;
    }>(`/api/v1/customer/assist/${encodeURIComponent(requestId)}/messages`, {
      method: 'POST',
      body: JSON.stringify({ sender, text }),
    });
  },

  async updateCustomerAssistDetails(
    requestId: string,
    details: { backroom_item_found?: boolean }
  ) {
    return fetchJson<{ status: string; request_id: string }>(
      `/api/v1/customer/assist/${encodeURIComponent(requestId)}/details`,
      {
        method: 'PATCH',
        body: JSON.stringify(details),
      }
    );
  }
};
