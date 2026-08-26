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

  async updateTaskStatus(taskId: string, status: string) {
    return fetchJson<any>(`/api/v1/staff/tasks/${taskId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
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

  // Queues & Entrance
  async getQueueStatus() {
    return fetchJson<any>('/api/v1/queue/status');
  },

  async getEntranceStatus() {
    return fetchJson<any>('/api/v1/entrance/status');
  },

  // Customer Catalog & Assist
  async getCustomerCatalog() {
    return fetchJson<any[]>('/api/v1/customer/catalog');
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
    return fetchJson<any>('/api/v1/customer/assist', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }
};
