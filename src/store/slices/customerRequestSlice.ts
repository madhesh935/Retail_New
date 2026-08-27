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
  receiveCustomerRequest: (req: CustomerHelpRequest) => void
  acceptCustomerRequest: (id: string, staffId: string, staffName: string) => void
  startAssistingCustomer: (id: string) => void
  markBackroomStockFound: (id: string, found: boolean) => void
  sendStaffCustomerMessage: (id: string, text: string) => void
  completeCustomerRequest: (id: string, note?: string) => void
}

const INITIAL_REQUESTS: CustomerHelpRequest[] = [
  {
    id: 'CR-104',
    requestType: 'PRODUCT_ASSISTANCE',
    typeLabel: 'Find a Product',
    productName: 'Lactose-Free Organic Milk 1L',
    productSku: 'SKU-MLK-9902',
    shelfCode: 'C2',
    zoneId: 'zone-dairy',
    zoneName: 'Dairy & Chilled',
    message: 'Looking for lactose-free milk, cannot find it in cooler',
    receivedAt: '1 min ago',
    status: 'REQUESTED',
    messages: [
      { id: 'm1', sender: 'CUSTOMER', text: 'Hi! Is there any lactose-free milk left in the cooler?', timestamp: '14:08' },
    ],
    timeline: [
      { status: 'REQUESTED', title: 'Customer requested assistance in Dairy', timestamp: '14:08' },
    ],
  },
  {
    id: 'CR-105',
    requestType: 'BACKROOM_REQUEST',
    typeLabel: 'Bring From Backroom',
    productName: 'Horizon Organic Whole Milk 1 Gal',
    productSku: 'SKU-MLK-8812',
    shelfCode: 'C2',
    zoneId: 'zone-dairy',
    zoneName: 'Dairy & Chilled',
    message: 'Shelf is empty. App shows stock available in backroom storage.',
    receivedAt: '3 mins ago',
    status: 'ACCEPTED',
    assignedStaffId: 'STAFF-03',
    assignedStaffName: 'Liam',
    isBackroomFlow: true,
    backroomBay: 'Bay D2 (Cold Room Rack 2)',
    messages: [
      { id: 'm2', sender: 'CUSTOMER', text: 'Could someone check the backroom for Horizon Whole Milk?', timestamp: '14:06' },
      { id: 'm3', sender: 'ASSOCIATE', text: 'Checking Backroom Bay D2 right now! Give me 2 minutes.', timestamp: '14:07' },
    ],
    timeline: [
      { status: 'REQUESTED', title: 'Backroom fetch requested', timestamp: '14:06' },
      { status: 'ACCEPTED', title: 'Liam accepted request & heading to Bay D2', timestamp: '14:07' },
    ],
  },
  {
    id: 'CR-102',
    requestType: 'PRICE_ASSISTANCE',
    typeLabel: 'Price Question',
    productName: 'Dove Daily Moisture 340ml',
    shelfCode: 'E3',
    zoneId: 'zone-care',
    zoneName: 'Personal Care',
    message: 'Shelf tag says ₹189 but barcode scan shows ₹210',
    receivedAt: '18 mins ago',
    status: 'COMPLETED',
    assignedStaffId: 'STAFF-03',
    assignedStaffName: 'Liam',
    messages: [],
    timeline: [
      { status: 'REQUESTED', title: 'Price check requested', timestamp: '13:50' },
      { status: 'COMPLETED', title: 'Price confirmed & updated shelf label', timestamp: '13:54' },
    ],
  },
]

export const createCustomerRequestSlice: StateCreator<CustomerRequestSlice, [], [], CustomerRequestSlice> = (set) => ({
  customerRequests: INITIAL_REQUESTS,

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
