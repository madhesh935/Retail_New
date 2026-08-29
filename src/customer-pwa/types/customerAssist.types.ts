import { CustomerProduct } from '../context/CustomerShoppingContext'

export type CustomerAssistRequestType =
  | 'PRODUCT_ASSISTANCE' // Find a Product
  | 'SHELF_ASSISTANCE' // Product Not on Shelf
  | 'BACKROOM_REQUEST' // Bring From Backroom
  | 'PRICE_ASSISTANCE' // Price or Offer Question
  | 'PRODUCT_GUIDANCE' // Product Advice
  | 'ACCESSIBILITY_ASSISTANCE' // Accessibility Assistance
  | 'CHECKOUT_ASSISTANCE' // Checkout Help
  | 'GENERAL_ASSISTANCE' // Something Else

export type CustomerAssistStatus =
  | 'REQUESTED'
  | 'ASSIGNED'
  | 'ACCEPTED'
  | 'ON_THE_WAY'
  | 'ARRIVED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'UNAVAILABLE'

export interface CustomerAssistTypeConfig {
  type: CustomerAssistRequestType
  label: string
  shortLabel: string
  iconName: string
  description?: string
  color: string
}

export interface CustomerAssistMessage {
  id: string
  sender: 'CUSTOMER' | 'ASSOCIATE'
  text: string
  timestamp: string
}

export interface CustomerAssistTimelineEvent {
  status: CustomerAssistStatus
  title: string
  timestamp: string
  note?: string
}

export interface AssignedAssociate {
  name: string
  role: string
  estimatedArrival?: string
  avatarColor?: string
}

export interface CustomerAssistRequest {
  id: string
  storeId: string
  requestType: CustomerAssistRequestType
  typeLabel: string
  product?: CustomerProduct
  zoneId: string
  zoneName: string
  shelfCode?: string
  message?: string
  accessibilityNeed?: string
  anonymousSessionId: string
  status: CustomerAssistStatus
  createdAt: string
  assignedAssociate?: AssignedAssociate
  timeline: CustomerAssistTimelineEvent[]
  messages: CustomerAssistMessage[]
  isBackroomFlow?: boolean
  resolvedInMinutes?: number
}

export interface CustomerAssistPrefill {
  requestType?: CustomerAssistRequestType
  product?: CustomerProduct
  zoneId?: string
  zoneName?: string
  shelfCode?: string
  accessibilityNeed?: string
  message?: string
}

export interface CreateAssistRequestInput {
  requestType: CustomerAssistRequestType
  product?: CustomerProduct
  zoneId: string
  zoneName: string
  shelfCode?: string
  message?: string
  accessibilityNeed?: string
}

export const ASSIST_TYPE_CONFIGS: Record<CustomerAssistRequestType, CustomerAssistTypeConfig> = {
  PRODUCT_ASSISTANCE: {
    type: 'PRODUCT_ASSISTANCE',
    label: 'Find a Product',
    shortLabel: 'Find Product',
    iconName: 'Package',
    color: 'cyan',
  },
  SHELF_ASSISTANCE: {
    type: 'SHELF_ASSISTANCE',
    label: 'Product Not on Shelf',
    shortLabel: 'Empty Shelf',
    iconName: 'ShoppingCart',
    color: 'amber',
  },
  BACKROOM_REQUEST: {
    type: 'BACKROOM_REQUEST',
    label: 'Bring From Backroom',
    shortLabel: 'Backroom Fetch',
    iconName: 'Inbox',
    color: 'blue',
  },
  PRICE_ASSISTANCE: {
    type: 'PRICE_ASSISTANCE',
    label: 'Price or Offer Question',
    shortLabel: 'Price Check',
    iconName: 'Tag',
    color: 'emerald',
  },
  PRODUCT_GUIDANCE: {
    type: 'PRODUCT_GUIDANCE',
    label: 'Product Advice',
    shortLabel: 'Advice',
    iconName: 'MessageSquare',
    color: 'purple',
  },
  ACCESSIBILITY_ASSISTANCE: {
    type: 'ACCESSIBILITY_ASSISTANCE',
    label: 'Accessibility Assistance',
    shortLabel: 'Accessibility',
    iconName: 'Accessibility',
    color: 'indigo',
  },
  CHECKOUT_ASSISTANCE: {
    type: 'CHECKOUT_ASSISTANCE',
    label: 'Checkout Help',
    shortLabel: 'Checkout',
    iconName: 'Receipt',
    color: 'rose',
  },
  GENERAL_ASSISTANCE: {
    type: 'GENERAL_ASSISTANCE',
    label: 'Something Else',
    shortLabel: 'Other Help',
    iconName: 'HelpCircle',
    color: 'slate',
  },
}
