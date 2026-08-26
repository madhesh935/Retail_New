import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import {
  CustomerAssistRequest,
  CustomerAssistStatus,
  CustomerAssistPrefill,
  CreateAssistRequestInput,
  CustomerAssistMessage,
  ASSIST_TYPE_CONFIGS,
} from '../types/customerAssist.types'
import { useCustomerShopping } from './CustomerShoppingContext'

const LOCAL_STORAGE_KEY = 're_customer_assist_active_req'
const ANONYMOUS_SESSION_KEY = 're_anonymous_shopper_id'

interface CustomerAssistContextType {
  activeRequest: CustomerAssistRequest | null
  isHelpSheetOpen: boolean
  activePrefill: CustomerAssistPrefill | null
  isCreating: boolean
  openHelpSheet: (prefill?: CustomerAssistPrefill) => void
  closeHelpSheet: () => void
  createRequest: (input: CreateAssistRequestInput) => Promise<CustomerAssistRequest>
  cancelRequest: () => Promise<void>
  sendAssistMessage: (text: string) => void
  confirmMetStaff: () => void
  reportStaffNotFound: () => void
  completeRequest: (wasResolved: boolean) => void
  reopenRequest: () => void
  clearCompletedRequest: () => void
  viewActiveRequest: () => void
}

const CustomerAssistContext = createContext<CustomerAssistContextType | undefined>(undefined)

export const CustomerAssistProvider: React.FC<{ children: React.ReactNode; storeId?: string }> = ({
  children,
  storeId = 'store-01',
}) => {
  const { setActiveTab, showToast } = useCustomerShopping()
  const [activeRequest, setActiveRequest] = useState<CustomerAssistRequest | null>(null)
  const [isHelpSheetOpen, setIsHelpSheetOpen] = useState(false)
  const [activePrefill, setActivePrefill] = useState<CustomerAssistPrefill | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  // Simulation timers refs to clear on unmount or cancel
  const simulationTimers = useRef<number[]>([])

  const clearTimers = () => {
    simulationTimers.current.forEach((id) => clearTimeout(id))
    simulationTimers.current = []
  }

  // Hydrate active request from localStorage on initial mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved) as CustomerAssistRequest
        // If request is older than 4 hours, ignore it
        const ageHours = (Date.now() - new Date(parsed.createdAt).getTime()) / (1000 * 60 * 60)
        if (ageHours < 4) {
          setActiveRequest(parsed)
        } else {
          localStorage.removeItem(LOCAL_STORAGE_KEY)
        }
      }
    } catch {
      localStorage.removeItem(LOCAL_STORAGE_KEY)
    }
  }, [])

  // Sync active request changes to localStorage
  const saveRequestState = useCallback((req: CustomerAssistRequest | null) => {
    setActiveRequest(req)
    if (req) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(req))
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEY)
    }
  }, [])

  const getAnonymousSessionId = (): string => {
    let id = localStorage.getItem(ANONYMOUS_SESSION_KEY)
    if (!id) {
      id = 'shpr-' + Math.random().toString(36).substring(2, 9)
      localStorage.setItem(ANONYMOUS_SESSION_KEY, id)
    }
    return id
  }

  const openHelpSheet = useCallback((prefill?: CustomerAssistPrefill) => {
    setActivePrefill(prefill || null)
    setIsHelpSheetOpen(true)
  }, [])

  const closeHelpSheet = useCallback(() => {
    setIsHelpSheetOpen(false)
    setActivePrefill(null)
  }, [])

  const viewActiveRequest = useCallback(() => {
    setActiveTab('HELP')
  }, [setActiveTab])

  // Create a new assistance request with realistic lifecycle orchestration
  const createRequest = async (input: CreateAssistRequestInput): Promise<CustomerAssistRequest> => {
    setIsCreating(true)
    clearTimers()

    const now = new Date()
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const typeCfg = ASSIST_TYPE_CONFIGS[input.requestType]
    const isBackroom = input.requestType === 'BACKROOM_REQUEST'

    const newRequest: CustomerAssistRequest = {
      id: `ast-${Date.now()}`,
      storeId,
      requestType: input.requestType,
      typeLabel: typeCfg.label,
      product: input.product,
      zoneId: input.zoneId,
      zoneName: input.zoneName,
      shelfCode: input.shelfCode,
      message: input.message,
      accessibilityNeed: input.accessibilityNeed,
      anonymousSessionId: getAnonymousSessionId(),
      status: 'REQUESTED',
      createdAt: now.toISOString(),
      isBackroomFlow: isBackroom,
      timeline: [
        {
          status: 'REQUESTED',
          title: 'Request Created',
          timestamp: timeStr,
          note: `Help requested in ${input.zoneName}`,
        },
      ],
      messages: [],
    }

    saveRequestState(newRequest)
    setIsCreating(false)
    closeHelpSheet()
    setActiveTab('HELP')
    showToast('✓ Staff help requested. Finding an available associate...')

    // Step 2: Associate Assigned (after 2.5s)
    const timer1 = window.setTimeout(() => {
      setActiveRequest((prev) => {
        if (!prev || prev.status === 'CANCELLED' || prev.status === 'COMPLETED') return prev
        const assignTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        const isStaffPriya = input.zoneName.includes('Dairy') || input.zoneName.includes('Produce')
        const associateName = isStaffPriya ? 'Priya' : 'Marcus'

        const updated: CustomerAssistRequest = {
          ...prev,
          status: 'ASSIGNED',
          assignedAssociate: {
            name: `${associateName} (Store Associate)`,
            role: input.requestType === 'BACKROOM_REQUEST' ? 'Inventory & Restock' : 'Floor Assistance',
            estimatedArrival: '~2 min',
            avatarColor: isStaffPriya ? '#06B6D4' : '#3B82F6',
          },
          timeline: [
            ...prev.timeline,
            {
              status: 'ASSIGNED',
              title: 'Associate Assigned',
              timestamp: assignTime,
              note: `${associateName} assigned to your request`,
            },
          ],
        }
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated))
        return updated
      })
    }, 2500)

    // Step 3: Associate Accepted & On The Way (after 5.5s)
    const timer2 = window.setTimeout(() => {
      setActiveRequest((prev) => {
        if (!prev || prev.status === 'CANCELLED' || prev.status === 'COMPLETED') return prev
        const enRouteTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        const associateFirstName = prev.assignedAssociate?.name.split(' ')[0] || 'Associate'

        const initialStaffMsg: CustomerAssistMessage = {
          id: `msg-${Date.now()}`,
          sender: 'ASSOCIATE',
          text: isBackroom
            ? `Hello! I've located the item in our stockroom and I'm bringing it out now.`
            : `Hello! I'm on my way to the ${prev.zoneName} ${prev.shelfCode ? `near Shelf ${prev.shelfCode}` : ''}.`,
          timestamp: enRouteTime,
        }

        const updated: CustomerAssistRequest = {
          ...prev,
          status: 'ON_THE_WAY',
          timeline: [
            ...prev.timeline,
            {
              status: 'ON_THE_WAY',
              title: isBackroom ? 'Retrieving Product & On The Way' : 'Store Associate On The Way',
              timestamp: enRouteTime,
              note: 'Estimated arrival ~1-2 min',
            },
          ],
          messages: [...prev.messages, initialStaffMsg],
        }
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated))
        showToast(`${associateFirstName} is on the way to help you`)
        return updated
      })
    }, 5500)

    // Step 4: Associate Arrived (after 16s)
    const timer3 = window.setTimeout(() => {
      setActiveRequest((prev) => {
        if (!prev || prev.status !== 'ON_THE_WAY') return prev
        const arriveTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        const associateFirstName = prev.assignedAssociate?.name.split(' ')[0] || 'Associate'

        const arriveMsg: CustomerAssistMessage = {
          id: `msg-${Date.now()}`,
          sender: 'ASSOCIATE',
          text: `I've arrived in the ${prev.zoneName}. Look out for my name tag!`,
          timestamp: arriveTime,
        }

        const updated: CustomerAssistRequest = {
          ...prev,
          status: 'ARRIVED',
          timeline: [
            ...prev.timeline,
            {
              status: 'ARRIVED',
              title: 'Store Associate Arrived',
              timestamp: arriveTime,
              note: `${associateFirstName} is at ${prev.zoneName}`,
            },
          ],
          messages: [...prev.messages, arriveMsg],
        }
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated))
        showToast(`🔔 ${associateFirstName} has arrived at ${prev.zoneName}`)
        return updated
      })
    }, 16000)

    simulationTimers.current = [timer1, timer2, timer3]
    return newRequest
  }

  // Cancel assistance request
  const cancelRequest = async () => {
    clearTimers()
    if (!activeRequest) return

    const cancelTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const updated: CustomerAssistRequest = {
      ...activeRequest,
      status: 'CANCELLED',
      timeline: [
        ...activeRequest.timeline,
        {
          status: 'CANCELLED',
          title: 'Request Cancelled',
          timestamp: cancelTime,
          note: 'Assistance cancelled by customer',
        },
      ],
    }
    saveRequestState(updated)
    showToast('Staff assistance request cancelled')
  }

  // Send messaging text or quick reply to associate
  const sendAssistMessage = (text: string) => {
    if (!activeRequest || !text.trim()) return

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const userMsg: CustomerAssistMessage = {
      id: `msg-${Date.now()}`,
      sender: 'CUSTOMER',
      text: text.trim(),
      timestamp: now,
    }

    const updatedMessages = [...activeRequest.messages, userMsg]
    const updated: CustomerAssistRequest = {
      ...activeRequest,
      messages: updatedMessages,
    }
    saveRequestState(updated)

    // Optional quick reply response from associate after 2.5s
    const timer = window.setTimeout(() => {
      setActiveRequest((cur) => {
        if (!cur || cur.status === 'COMPLETED' || cur.status === 'CANCELLED') return cur
        const replyTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        let replyText = "Got it, thanks for letting me know! I'm right here."

        const q = text.toLowerCase()
        if (q.includes('shelf')) {
          replyText = "Understood! I'll come straight to the shelf facing."
        } else if (q.includes('checkout')) {
          replyText = "Heading over to the checkout area now."
        } else if (q.includes('backroom')) {
          replyText = "Checking the stock cart right now, bringing one unit out."
        }

        const replyMsg: CustomerAssistMessage = {
          id: `msg-${Date.now()}`,
          sender: 'ASSOCIATE',
          text: replyText,
          timestamp: replyTime,
        }

        const next = { ...cur, messages: [...cur.messages, replyMsg] }
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(next))
        return next
      })
    }, 2500)

    simulationTimers.current.push(timer)
  }

  const confirmMetStaff = () => {
    if (!activeRequest) return
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const updated: CustomerAssistRequest = {
      ...activeRequest,
      status: 'COMPLETED',
      resolvedInMinutes: 3,
      timeline: [
        ...activeRequest.timeline,
        {
          status: 'COMPLETED',
          title: 'Assistance Completed',
          timestamp: now,
          note: 'Customer confirmed meeting associate',
        },
      ],
    }
    saveRequestState(updated)
    showToast('✓ Great! Glad we could help you.')
  }

  const reportStaffNotFound = () => {
    if (!activeRequest) return
    sendAssistMessage("I'm looking for the associate but can't spot you yet. I'm waiting here.")
    showToast('Alerted associate of your location')
  }

  const completeRequest = (wasResolved: boolean) => {
    if (!activeRequest) return
    if (wasResolved) {
      confirmMetStaff()
    } else {
      reopenRequest()
    }
  }

  const reopenRequest = () => {
    if (!activeRequest) return
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const updated: CustomerAssistRequest = {
      ...activeRequest,
      status: 'ON_THE_WAY',
      timeline: [
        ...activeRequest.timeline,
        {
          status: 'ON_THE_WAY',
          title: 'Request Reopened',
          timestamp: now,
          note: 'Customer requested continued assistance',
        },
      ],
    }
    saveRequestState(updated)
    showToast('Request escalated to supervisor')
  }

  const clearCompletedRequest = () => {
    clearTimers()
    saveRequestState(null)
    setActiveTab('HOME')
  }

  return (
    <CustomerAssistContext.Provider
      value={{
        activeRequest,
        isHelpSheetOpen,
        activePrefill,
        isCreating,
        openHelpSheet,
        closeHelpSheet,
        createRequest,
        cancelRequest,
        sendAssistMessage,
        confirmMetStaff,
        reportStaffNotFound,
        completeRequest,
        reopenRequest,
        clearCompletedRequest,
        viewActiveRequest,
      }}
    >
      {children}
    </CustomerAssistContext.Provider>
  )
}

export const useCustomerAssist = (): CustomerAssistContextType => {
  const ctx = useContext(CustomerAssistContext)
  if (!ctx) {
    throw new Error('useCustomerAssist must be used within CustomerAssistProvider')
  }
  return ctx
}
