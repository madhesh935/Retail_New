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
import { realStoreApi } from '@/services/api/realStoreApi'

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

function mapBackendStatusToUi(
  status: string,
  assignedName: string | null | undefined
): CustomerAssistStatus {
  const raw = String(status || '').toUpperCase()
  if (raw === 'COMPLETED') return 'COMPLETED'
  if (raw === 'CANCELLED') return 'CANCELLED'
  if (raw === 'BLOCKED') return 'UNAVAILABLE'
  if (raw === 'ASSISTING') return 'ARRIVED'
  if (raw === 'IN_PROGRESS' || raw === 'ASSIGNED') {
    return assignedName ? 'ON_THE_WAY' : 'ASSIGNED'
  }
  return 'REQUESTED'
}

export const CustomerAssistProvider: React.FC<{ children: React.ReactNode; storeId?: string }> = ({
  children,
  storeId = 'store-01',
}) => {
  const { setActiveTab, showToast } = useCustomerShopping()
  const [activeRequest, setActiveRequest] = useState<CustomerAssistRequest | null>(null)
  const [isHelpSheetOpen, setIsHelpSheetOpen] = useState(false)
  const [activePrefill, setActivePrefill] = useState<CustomerAssistPrefill | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const pollTimerRef = useRef<number | null>(null)

  const clearPoll = () => {
    if (pollTimerRef.current) {
      window.clearInterval(pollTimerRef.current)
      pollTimerRef.current = null
    }
  }

  const saveRequestState = useCallback((req: CustomerAssistRequest | null) => {
    setActiveRequest(req)
    if (req) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(req))
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEY)
    }
  }, [])

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved) as CustomerAssistRequest
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

  // Poll live assist task status from DB while request is open
  useEffect(() => {
    clearPoll()
    const requestId = activeRequest?.id
    if (
      !requestId ||
      !requestId.startsWith('assist-') ||
      activeRequest?.status === 'COMPLETED' ||
      activeRequest?.status === 'CANCELLED'
    ) {
      return
    }

    const poll = async () => {
      try {
        const live = await realStoreApi.getCustomerAssistStatus(requestId)
        setActiveRequest((prev) => {
          if (!prev || prev.id !== requestId) return prev
          const nextStatus = mapBackendStatusToUi(live.status, live.assigned_staff_name)
          const liveMessages = (Array.isArray(live.customer_request_data?.messages)
            ? live.customer_request_data.messages
            : []
          ).map((message: any, index: number) => ({
            id: String(message.id || `message-${requestId}-${index}`),
            sender:
              String(message.sender || '').toUpperCase() === 'ASSOCIATE'
                ? ('ASSOCIATE' as const)
                : ('CUSTOMER' as const),
            text: String(message.text || ''),
            timestamp: message.timestamp
              ? new Date(message.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'Just now',
          }))
          const messagesChanged =
            liveMessages.length !== prev.messages.length ||
            liveMessages.some((message, index) => message.id !== prev.messages[index]?.id)
          if (
            nextStatus === prev.status &&
            (live.assigned_staff_name || null) === (prev.assignedAssociate?.name || null) &&
            !messagesChanged
          ) {
            return prev
          }

          const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          const timeline = [...prev.timeline]
          if (nextStatus !== prev.status) {
            timeline.push({
              status: nextStatus,
              title:
                nextStatus === 'ON_THE_WAY'
                  ? 'Associate On The Way'
                  : nextStatus === 'COMPLETED'
                    ? 'Assistance Completed'
                    : nextStatus === 'ASSIGNED'
                      ? 'Associate Assigned'
                      : `Status: ${nextStatus}`,
              timestamp: now,
              note: live.assigned_staff_name || undefined,
            })
          }

          const updated: CustomerAssistRequest = {
            ...prev,
            status: nextStatus,
            assignedAssociate: live.assigned_staff_name
              ? {
                  name: live.assigned_staff_name,
                  role: 'Floor Assistance',
                  estimatedArrival: '~2 min',
                  avatarColor: '#06B6D4',
                }
              : prev.assignedAssociate,
            messages: liveMessages,
            timeline,
          }
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated))
          if (nextStatus === 'ON_THE_WAY' && prev.status !== 'ON_THE_WAY') {
            showToast(`${live.assigned_staff_name || 'Associate'} is on the way`)
          }
          if (nextStatus === 'COMPLETED' && prev.status !== 'COMPLETED') {
            showToast('✓ Assistance completed')
          }
          return updated
        })
      } catch (err) {
        console.warn('Assist status poll failed', err)
      }
    }

    void poll()
    pollTimerRef.current = window.setInterval(poll, 4000)
    return clearPoll
  }, [activeRequest?.id, activeRequest?.status, showToast])

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

  const createRequest = async (input: CreateAssistRequestInput): Promise<CustomerAssistRequest> => {
    setIsCreating(true)

    const now = new Date()
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const typeCfg = ASSIST_TYPE_CONFIGS[input.requestType]

    let requestId = `ast-local-${Date.now()}`
    let assignedName: string | null = null

    try {
      const created = await realStoreApi.submitCustomerAssist({
        request_type: input.requestType,
        urgency: input.accessibilityNeed ? 'URGENT' : 'NORMAL',
        customer_name: 'Customer',
        location_zone: input.zoneName,
        shelf_code: input.shelfCode,
        product_id: input.product?.id,
        product_name: input.product?.name,
        customer_notes: input.message,
      })
      requestId = created.request_id
      assignedName = created.assigned_staff_name
    } catch (e) {
      setIsCreating(false)
      showToast('Could not reach store staff system. Try again.')
      throw e
    }

    const newRequest: CustomerAssistRequest = {
      id: requestId,
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
      status: assignedName ? 'ASSIGNED' : 'REQUESTED',
      createdAt: now.toISOString(),
      isBackroomFlow: input.requestType === 'BACKROOM_REQUEST',
      assignedAssociate: assignedName
        ? {
            name: assignedName,
            role: 'Floor Assistance',
            estimatedArrival: '~3 min',
            avatarColor: '#06B6D4',
          }
        : undefined,
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
    showToast('✓ Staff help requested. Waiting for an associate...')
    return newRequest
  }

  const cancelRequest = async () => {
    if (!activeRequest) return
    if (activeRequest.id.startsWith('assist-')) {
      try {
        await realStoreApi.updateTaskStatus(activeRequest.id, 'CANCELLED')
      } catch (e) {
        console.warn('Cancel assist sync failed', e)
      }
    }

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

  const sendAssistMessage = (text: string) => {
    if (!activeRequest || !text.trim()) return
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const userMsg: CustomerAssistMessage = {
      id: `msg-${Date.now()}`,
      sender: 'CUSTOMER',
      text: text.trim(),
      timestamp: now,
    }
    saveRequestState({
      ...activeRequest,
      messages: [...activeRequest.messages, userMsg],
    })
    if (activeRequest.id.startsWith('assist-')) {
      void realStoreApi
        .sendCustomerAssistMessage(activeRequest.id, 'CUSTOMER', userMsg.text)
        .catch((error) => console.warn('Could not sync shopper message', error))
    }
  }

  const confirmMetStaff = () => {
    if (!activeRequest) return
    if (activeRequest.id.startsWith('assist-')) {
      void realStoreApi.updateTaskStatus(activeRequest.id, 'COMPLETED')
    }
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    saveRequestState({
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
    })
    showToast('✓ Great! Glad we could help you.')
  }

  const reportStaffNotFound = () => {
    sendAssistMessage("I'm looking for the associate but can't spot you yet. I'm waiting here.")
    showToast('Alerted associate of your location')
  }

  const completeRequest = (wasResolved: boolean) => {
    if (!activeRequest) return
    if (wasResolved) confirmMetStaff()
    else reopenRequest()
  }

  const reopenRequest = () => {
    if (!activeRequest) return
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    saveRequestState({
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
    })
    if (activeRequest.id.startsWith('assist-')) {
      void realStoreApi
        .updateTaskStatus(activeRequest.id, 'IN_PROGRESS', activeRequest.assignedAssociate ? undefined : undefined)
        .catch((error) => console.warn('Could not reopen assist request', error))
    }
    showToast('Request escalated to floor team')
  }

  const clearCompletedRequest = () => {
    clearPoll()
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
