import { StateCreator } from 'zustand'

export type CustomerAssistStatus =
  | 'REQUESTED'
  | 'ASSIGNED'
  | 'ACCEPTED'
  | 'ASSISTING'
  | 'ON_THE_WAY'
  | 'ARRIVED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'UNAVAILABLE'

export type CustomerAssistType =
  | 'PRODUCT_ASSISTANCE'
  | 'SHELF_ASSISTANCE'
  | 'BACKROOM_REQUEST'
  | 'PRICE_ASSISTANCE'
  | 'PRODUCT_GUIDANCE'
  | 'ACCESSIBILITY_ASSISTANCE'
  | 'CHECKOUT_ASSISTANCE'
  | 'GENERAL_ASSISTANCE'

export interface CustomerHelpRequest {
  id: string
  requestType: CustomerAssistType
  typeLabel: string
  productName?: string
  productSku?: string
  shelfCode?: string
  zoneId: string
  zoneName: string
  message: string
  receivedAt: string
  status: CustomerAssistStatus
  assignedStaffId?: string
  assignedStaffName?: string
  isBackroomFlow?: boolean
  backroomBay?: string
  backroomItemFound?: boolean
  messages: {
    id: string
    sender: 'CUSTOMER' | 'ASSOCIATE'
    text: string
    timestamp: string
  }[]
  timeline: {
    status: CustomerAssistStatus
    title: string
    timestamp: string
    note?: string
  }[]
}

export interface CustomerRequestSlice {
  customerRequests: CustomerHelpRequest[]

  // Actions
  setCustomerRequests: (reqs: CustomerHelpRequest[]) => void
  receiveCustomerRequest: (req: CustomerHelpRequest) => void
  acceptCustomerRequest: (id: string, staffId: string, staffName: string) => void
  startAssistingCustomer: (id: string) => void
  markBackroomStockFound: (id: string, found: boolean) => void
  sendStaffCustomerMessage: (id: string, text: string) => void
  completeCustomerRequest: (id: string, note?: string) => void
}

export const createCustomerRequestSlice: StateCreator<CustomerRequestSlice, [], [], CustomerRequestSlice> = (set) => ({
  customerRequests: [],

  setCustomerRequests: (customerRequests) => set({ customerRequests }),

  receiveCustomerRequest: (req) =>
    set((state) => ({
      customerRequests: [req, ...state.customerRequests.filter((r) => r.id !== req.id)],
    })),

  acceptCustomerRequest: (id, staffId, staffName) =>
    set((state) => ({
      customerRequests: state.customerRequests.map((r) =>
        r.id === id
          ? {
              ...r,
              status: 'ACCEPTED',
              assignedStaffId: staffId,
              assignedStaffName: staffName,
              timeline: [
                ...r.timeline,
                {
                  status: 'ACCEPTED',
                  title: `${staffName} accepted assistance request`,
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                },
              ],
            }
          : r
      ),
    })),

  startAssistingCustomer: (id) =>
    set((state) => ({
      customerRequests: state.customerRequests.map((r) =>
        r.id === id
          ? {
              ...r,
              status: 'ASSISTING',
              timeline: [
                ...r.timeline,
                {
                  status: 'ASSISTING',
                  title: 'Associate arrived at customer location',
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                },
              ],
            }
          : r
      ),
    })),

  markBackroomStockFound: (id, found) =>
    set((state) => ({
      customerRequests: state.customerRequests.map((r) =>
        r.id === id
          ? {
              ...r,
              backroomItemFound: found,
              messages: [
                ...r.messages,
                {
                  id: `m-${Date.now()}`,
                  sender: 'ASSOCIATE',
                  text: found
                    ? '✓ Item found in Backroom Bay D2! Bringing it to the shelf now.'
                    : 'Sorry, the backroom stock is temporarily depleted.',
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                },
              ],
              timeline: [
                ...r.timeline,
                {
                  status: found ? 'ASSISTING' : 'UNAVAILABLE',
                  title: found ? 'Item located in backroom storage' : 'Item marked unavailable in backroom',
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                },
              ],
            }
          : r
      ),
    })),

  sendStaffCustomerMessage: (id, text) =>
    set((state) => ({
      customerRequests: state.customerRequests.map((r) =>
        r.id === id
          ? {
              ...r,
              messages: [
                ...r.messages,
                {
                  id: `m-${Date.now()}`,
                  sender: 'ASSOCIATE',
                  text,
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                },
              ],
            }
          : r
      ),
    })),

  completeCustomerRequest: (id, note) =>
    set((state) => ({
      customerRequests: state.customerRequests.map((r) =>
        r.id === id
          ? {
              ...r,
              status: 'COMPLETED',
              timeline: [
                ...r.timeline,
                {
                  status: 'COMPLETED',
                  title: 'Customer assistance completed',
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  note,
                },
              ],
            }
          : r
      ),
    })),
})
