import React, { createContext, useContext, useState, useMemo, useRef } from 'react'
import { realStoreApi } from '@/services/api/realStoreApi'
import type { NavigationPlan } from '../types/navigation'
import { sendCopilotChat } from '@/services/api/chat.service'
import { mapCustomerProduct } from '@/services/api/mappers'
import {
  buildCopilotReplyText,
  buildCustomerCopilotEnrichment,
  buildProductRoutePreview,
} from '@/customer-pwa/lib/customerCopilotEnrichment'

export interface CustomerProduct {
  id: string
  name: string
  brand: string
  category: string
  price: string
  priceNum: number
  aisle: string
  shelf: string
  stockCount: number
  isAvailable: boolean
  isLowStock?: boolean
  backroomStock?: number
  mapCoord: { x: number; y: number }
  alternatives?: { id: string; name: string; shelf: string; price: string; isAvailable?: boolean }[]
}

export interface ShoppingListItem extends CustomerProduct {
  quantity: number
  isCollected: boolean
  isSkipped?: boolean
}

export interface WaypointRouteStep {
  stepIndex: number
  title: string
  location: string
  item?: ShoppingListItem
  isCompleted: boolean
  isSkipped?: boolean
  mapCoord: { x: number; y: number }
}

/** Bare shelf codes for the navigation API (e.g. "Shelf B2" → "B2"). */
function bareShelfCode(shelf: string | undefined): string | undefined {
  if (!shelf) return undefined
  const cleaned = shelf.replace(/^shelf\s+/i, '').trim().toUpperCase()
  return cleaned || undefined
}

const CHECKOUT_MAP_COORDS: Record<string, { x: number; y: number }> = {
  C1: { x: 505, y: 110 },
  C2: { x: 505, y: 165 },
  C3: { x: 505, y: 220 },
  C4: { x: 505, y: 250 },
  C5: { x: 545, y: 265 },
}

export interface CopilotShoppingPlanItem {
  product: CustomerProduct
  suggestedQty: number
}

export interface CopilotShoppingPlan {
  title: string
  subtitle?: string
  budget?: number
  items: CopilotShoppingPlanItem[]
  totalEstimated: number
  remainingBudget?: number
}

export interface CopilotMessage {
  id: string
  sender: 'USER' | 'COPILOT'
  text: string
  timestamp: string
  matchedProducts?: CustomerProduct[]
  shoppingPlan?: CopilotShoppingPlan
  alternativeProducts?: CustomerProduct[]
  showRoutePreview?: boolean
  showCheckoutRecommendation?: boolean
  showStaffAssistButton?: boolean
  staffAssistPrefill?: {
    requestType?: 'PRODUCT_ASSISTANCE' | 'SHELF_ASSISTANCE' | 'BACKROOM_REQUEST' | 'PRICE_ASSISTANCE' | 'PRODUCT_GUIDANCE' | 'ACCESSIBILITY_ASSISTANCE' | 'CHECKOUT_ASSISTANCE' | 'GENERAL_ASSISTANCE'
    product?: CustomerProduct
    zoneName?: string
    shelfCode?: string
  }
  isEmergencyAlert?: boolean
  singleProductLocation?: {
    product: CustomerProduct
    aisle: string
    shelf: string
  }
  /** Product-specific walking route (Entrance → this shelf → Checkout) */
  productRoute?: import('../lib/customerCopilotEnrichment').CopilotProductRoutePreview
}

export interface CheckoutLaneLive {
  code: string
  name: string
  status: string
  queueLength: number
  waitSeconds: number
}

export type CustomerPwaTab = 'HOME' | 'SEARCH' | 'COPILOT' | 'ROUTE' | 'MAP' | 'LIST' | 'ASSISTANT' | 'HELP'

interface CustomerShoppingContextType {
  storeName: string
  activeTab: CustomerPwaTab
  setActiveTab: (tab: CustomerPwaTab) => void
  shoppingList: ShoppingListItem[]
  addToShoppingList: (product: CustomerProduct, qty?: number) => void
  addMultipleToShoppingList: (items: { product: CustomerProduct; qty: number }[]) => void
  removeFromShoppingList: (productId: string) => void
  updateQuantity: (productId: string, delta: number) => void
  toggleItemCollected: (productId: string) => void
  skipItem: (productId: string) => void
  clearShoppingList: () => void
  // Routing & Crowd Management
  isAisle4Congested: boolean
  setIsAisle4Congested: (val: boolean) => void
  useCrowdAlternativeRoute: boolean
  setUseCrowdAlternativeRoute: (val: boolean) => void
  outOfStockProduct: CustomerProduct | null
  setOutOfStockProduct: (prod: CustomerProduct | null) => void
  replaceProductInList: (oldId: string, newProduct: CustomerProduct) => void
  // Active Waypoints
  optimizedRoute: WaypointRouteStep[]
  navigationPlan: NavigationPlan | null
  isNavigationPlanLoading: boolean
  activeStepIndex: number
  setActiveStepIndex: (idx: number) => void
  isNavigating: boolean
  setIsNavigating: (val: boolean) => void
  targetCheckoutCounter: 'C1' | 'C2' | 'C3' | 'C4' | 'C5'
  setTargetCheckoutCounter: (counter: 'C1' | 'C2' | 'C3' | 'C4' | 'C5') => void
  isNavigatingToCheckout: boolean
  setIsNavigatingToCheckout: (val: boolean) => void
  checkoutLanes: CheckoutLaneLive[]
  recommendedCheckout: CheckoutLaneLive | null
  toastMessage: string | null
  showToast: (msg: string) => void
  catalog: CustomerProduct[]
  catalogLoading: boolean
  searchCatalog: (query: string) => CustomerProduct[]
  /** When set, Smart Map routes only these products (copilot product navigate). */
  routeFocusProductIds: string[] | null
  setRouteFocusProductIds: (ids: string[] | null) => void
  navigateToProduct: (product: CustomerProduct) => void
  // Copilot Chat State
  isCopilotDrawerOpen: boolean
  setIsCopilotDrawerOpen: (val: boolean) => void
  copilotMessages: CopilotMessage[]
  sendCopilotMessage: (text: string) => void
  clearCopilotMessages: () => void
  copilotIsTyping: boolean
}

const CustomerShoppingContext = createContext<CustomerShoppingContextType | undefined>(undefined)

export const CustomerShoppingProvider: React.FC<{
  children: React.ReactNode
  storeId?: string
  defaultTab?: CustomerPwaTab
}> = ({ children, storeId, defaultTab }) => {
  const storeName = storeId === 'store-02' || storeId === 'store-002' ? 'Velachery Mall' : 'Chennai Central'
  // Indoor graph is seeded for store-01; other demo store URLs share that layout.
  const navigationStoreId = 'store-01'
  const shoppingListStorageKey = `retail-edge-shopping-list-${storeId || 'store-01'}`
  const [activeTab, setActiveTab] = useState<CustomerPwaTab>(defaultTab || 'HOME')
  const [isNavigating, setIsNavigating] = useState(false)
  const [targetCheckoutCounter, setTargetCheckoutCounter] = useState<'C1' | 'C2' | 'C3' | 'C4' | 'C5'>('C4')
  const [isNavigatingToCheckout, setIsNavigatingToCheckout] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [isCopilotDrawerOpen, setIsCopilotDrawerOpen] = useState(false)

  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>(() => {
    try {
      const saved = window.localStorage.getItem(shoppingListStorageKey)
      const parsed = saved ? JSON.parse(saved) : []
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  })

  React.useEffect(() => {
    window.localStorage.setItem(shoppingListStorageKey, JSON.stringify(shoppingList))
  }, [shoppingList, shoppingListStorageKey])

  const [isAisle4Congested, setIsAisle4Congested] = useState(false)
  const [useCrowdAlternativeRoute, setUseCrowdAlternativeRoute] = useState(false)
  const [outOfStockProduct, setOutOfStockProduct] = useState<CustomerProduct | null>(null)
  const [activeStepIndex, setActiveStepIndex] = useState(1)

  const [catalog, setCatalog] = useState<CustomerProduct[]>([])
  const [catalogLoading, setCatalogLoading] = useState(true)
  const [navigationPlan, setNavigationPlan] = useState<NavigationPlan | null>(null)
  const [isNavigationPlanLoading, setIsNavigationPlanLoading] = useState(false)
  const [checkoutLanes, setCheckoutLanes] = useState<CheckoutLaneLive[]>([])
  const [routeFocusProductIds, setRouteFocusProductIds] = useState<string[] | null>(null)

  React.useEffect(() => {
    let cancelled = false
    setCatalogLoading(true)
    realStoreApi
      .getCustomerCatalog()
      .then((prods) => {
        if (cancelled || !prods) return
        const mapped = prods.map(mapCustomerProduct)
        setCatalog(mapped)
        // Congestion from live shelf / stock pressure in aisle 4 category snacks
        const snacksLow = mapped.some(
          (p) => p.aisle.toLowerCase().includes('aisle 4') && (p.isLowStock || !p.isAvailable)
        )
        setIsAisle4Congested(snacksLow)
      })
      .catch(console.warn)
      .finally(() => {
        if (!cancelled) setCatalogLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  React.useEffect(() => {
    let cancelled = false
    const loadQueues = () => {
      realStoreApi
        .getQueueLanes()
        .then((lanes) => {
          if (cancelled || !Array.isArray(lanes)) return
          const mapped: CheckoutLaneLive[] = lanes.map((lane: any) => {
            const code = String(
              lane.laneCode || lane.lane_code || lane.id || lane.code || ''
            ).toUpperCase()
            return {
              code: code || `C${lane.laneNumber || lane.lane_number || '?'}`,
              name: String(lane.name || `Checkout ${code}`),
              status: String(lane.status || 'ACTIVE').toUpperCase(),
              queueLength: Number(lane.queueLength ?? lane.queue_length ?? lane.currentQueueLength ?? 0),
              waitSeconds: Number(lane.waitTimeSeconds ?? lane.wait_time_seconds ?? lane.currentWaitTimeSeconds ?? 0),
            }
          })
          setCheckoutLanes(mapped)
          const open = mapped
            .filter((lane) => lane.status !== 'CLOSED' && lane.status !== 'STANDBY')
            .sort((a, b) => a.waitSeconds - b.waitSeconds)
          const best =
            open.find((lane) => ['C1', 'C2', 'C3', 'C4', 'C5'].includes(lane.code)) || open[0]
          if (best && ['C1', 'C2', 'C3', 'C4', 'C5'].includes(best.code)) {
            const code = best.code as 'C1' | 'C2' | 'C3' | 'C4' | 'C5'
            setTargetCheckoutCounter((prev) => (prev === code ? prev : code))
          }
        })
        .catch(console.warn)
    }
    loadQueues()
    const timer = window.setInterval(loadQueues, 12000)
    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [])

  const recommendedCheckout = useMemo(() => {
    const open = checkoutLanes
      .filter((lane) => lane.status !== 'CLOSED')
      .sort((a, b) => {
        // Prefer active/self-checkout over standby empty lanes for shopper UX
        const rank = (s: string) => (s === 'STANDBY' ? 1 : s === 'CONGESTED' ? 2 : 0)
        const d = rank(a.status) - rank(b.status)
        return d !== 0 ? d : a.waitSeconds - b.waitSeconds
      })
    return open[0] || null
  }, [checkoutLanes])

  React.useEffect(() => {
    let cancelled = false
    const focusProducts =
      routeFocusProductIds && routeFocusProductIds.length > 0
        ? routeFocusProductIds
            .map((id) => catalog.find((p) => p.id === id) || shoppingList.find((p) => p.id === id))
            .filter(Boolean)
        : null

    const activeItems =
      focusProducts && focusProducts.length > 0
        ? (focusProducts as CustomerProduct[])
        : shoppingList.filter((item) => !item.isSkipped)

    setIsNavigationPlanLoading(true)
    realStoreApi.optimizeNavigationRoute({
      store_id: navigationStoreId,
      destinations: activeItems.map((item) => ({
        product_id: item.id,
        shelf_code: bareShelfCode(item.shelf),
        label: item.name,
      })),
      include_checkout: true,
      checkout_lane_code: targetCheckoutCounter,
      avoid_congestion: useCrowdAlternativeRoute || isAisle4Congested,
      accessible_only: false,
    }).then((plan) => {
      if (!cancelled) setNavigationPlan(plan)
    }).catch((error) => {
      console.warn('Store navigation API unavailable; using local route fallback.', error)
      if (!cancelled) setNavigationPlan(null)
    }).finally(() => {
      if (!cancelled) setIsNavigationPlanLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [
    shoppingList,
    catalog,
    routeFocusProductIds,
    navigationStoreId,
    targetCheckoutCounter,
    useCrowdAlternativeRoute,
    isAisle4Congested,
  ])

  const routeSignature = useMemo(
    () =>
      [
        targetCheckoutCounter,
        useCrowdAlternativeRoute || isAisle4Congested ? 'avoid' : 'direct',
        routeFocusProductIds?.join(',') || '',
        shoppingList
          .filter((item) => !item.isSkipped)
          .map((item) => item.id)
          .sort()
          .join(','),
      ].join('|'),
    [shoppingList, targetCheckoutCounter, useCrowdAlternativeRoute, isAisle4Congested, routeFocusProductIds]
  )

  React.useEffect(() => {
    // Start at the first product stop (index 1); entrance is 0.
    setActiveStepIndex(1)
  }, [routeSignature])

  // Copilot Conversation Messages
  const initialCopilotMessages: CopilotMessage[] = [
    {
      id: 'c-welcome',
      sender: 'COPILOT',
      text: `Hello! I'm your Shopping Copilot for ${storeName === 'Velachery Mall' ? 'Velachery Mall' : 'Chennai Central'}. Ask for products, meal plans, aisle locations, or the fastest checkout — I'll guide you as a shopper.`,
      timestamp: 'Just now',
    },
  ]
  const [copilotMessages, setCopilotMessages] = useState<CopilotMessage[]>(initialCopilotMessages)
  const [copilotIsTyping, setCopilotIsTyping] = useState(false)
  const copilotRequestIdRef = useRef(0)
  const copilotBusyRef = useRef(false)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage((cur) => (cur === msg ? null : cur))
    }, 2800)
  }

  const addToShoppingList = (product: CustomerProduct, qty = 1) => {
    setRouteFocusProductIds(null)
    setShoppingList((prev) => {
      const exists = prev.find((item) => item.id === product.id)
      if (exists) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + qty } : item
        )
      }
      return [...prev, { ...product, quantity: qty, isCollected: false, isSkipped: false }]
    })
    showToast(`Added ${qty > 1 ? `${qty}× ` : ''}${product.name.split(' (')[0]} to list`)
  }

  const navigateToProduct = (product: CustomerProduct) => {
    setShoppingList((prev) => {
      if (prev.some((item) => item.id === product.id)) return prev
      return [...prev, { ...product, quantity: 1, isCollected: false, isSkipped: false }]
    })
    setRouteFocusProductIds([product.id])
    setActiveStepIndex(1)
    setIsNavigating(true)
    setIsNavigatingToCheckout(false)
    setActiveTab('ROUTE')
    showToast(`Routing to ${product.name.split(' (')[0]} • ${product.aisle}`)
  }

  const addMultipleToShoppingList = (items: { product: CustomerProduct; qty: number }[]) => {
    setShoppingList((prev) => {
      let nextList = [...prev]
      items.forEach(({ product, qty }) => {
        const idx = nextList.findIndex((i) => i.id === product.id)
        if (idx >= 0) {
          nextList[idx] = { ...nextList[idx], quantity: nextList[idx].quantity + qty }
        } else {
          nextList.push({ ...product, quantity: qty, isCollected: false, isSkipped: false })
        }
      })
      return nextList
    })
    showToast(`✓ ${items.length} items added to My List`)
  }

  const removeFromShoppingList = (productId: string) => {
    setShoppingList((prev) => prev.filter((item) => item.id !== productId))
    showToast('Item removed from shopping list')
  }

  const updateQuantity = (productId: string, delta: number) => {
    setShoppingList((prev) =>
      prev
        .map((item) => {
          if (item.id === productId) {
            const newQ = item.quantity + delta
            return newQ > 0 ? { ...item, quantity: newQ } : null
          }
          return item
        })
        .filter(Boolean) as ShoppingListItem[]
    )
  }

  const toggleItemCollected = (productId: string) => {
    setShoppingList((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, isCollected: !item.isCollected, isSkipped: false } : item
      )
    )
  }

  const skipItem = (productId: string) => {
    setShoppingList((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, isSkipped: true } : item
      )
    )
  }

  const clearShoppingList = () => {
    setRouteFocusProductIds(null)
    setShoppingList([])
    showToast('Shopping list cleared')
  }

  const replaceProductInList = (oldId: string, newProduct: CustomerProduct) => {
    setShoppingList((prev) =>
      prev.map((item) =>
        item.id === oldId
          ? { ...newProduct, quantity: item.quantity, isCollected: false, isSkipped: false }
          : item
      )
    )
    setOutOfStockProduct(null)
    showToast('Shopping list updated with alternative')
  }

  const clearCopilotMessages = () => {
    setCopilotMessages(initialCopilotMessages)
  }

  // Live Shopping Copilot — availability + product-specific route from catalog/nav API
  const sendCopilotMessage = (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || copilotBusyRef.current) return

    copilotBusyRef.current = true
    const requestId = ++copilotRequestIdRef.current

    const userMsg: CopilotMessage = {
      id: `user-${Date.now()}`,
      sender: 'USER',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setCopilotMessages((prev) => [...prev, userMsg])
    setCopilotIsTyping(true)

    let enrichment = buildCustomerCopilotEnrichment(trimmed, catalog)

    const history = [...copilotMessages, userMsg]
      .filter((m) => m.id !== 'c-welcome')
      .slice(-12)
      .map((m) => ({
        role: (m.sender === 'USER' ? 'user' : 'assistant') as 'user' | 'assistant',
        content: m.text,
      }))

    void (async () => {
      try {
        // Attach live navigation plan for the primary matched product (unique per product location)
        const focusProduct =
          enrichment.productRoute?.product ||
          enrichment.singleProductLocation?.product ||
          enrichment.matchedProducts?.[0]

        if (focusProduct) {
          try {
            const plan = await realStoreApi.optimizeNavigationRoute({
              store_id: navigationStoreId,
              destinations: [
                {
                  product_id: focusProduct.id,
                  shelf_code: bareShelfCode(focusProduct.shelf),
                  label: focusProduct.name,
                },
              ],
              include_checkout: true,
              checkout_lane_code: targetCheckoutCounter,
              avoid_congestion: useCrowdAlternativeRoute || isAisle4Congested,
              accessible_only: false,
            })
            enrichment = {
              ...enrichment,
              productRoute: buildProductRoutePreview(focusProduct, plan),
              matchedProducts: enrichment.matchedProducts || [focusProduct],
              singleProductLocation: {
                product: focusProduct,
                aisle: focusProduct.aisle,
                shelf: bareShelfCode(focusProduct.shelf)
                  ? `Shelf ${bareShelfCode(focusProduct.shelf)}`
                  : focusProduct.shelf,
              },
            }
          } catch (routeErr) {
            console.warn('Product route optimize failed; using shelf coordinates.', routeErr)
            enrichment = {
              ...enrichment,
              productRoute: buildProductRoutePreview(focusProduct, null),
            }
          }
        }

        let reply = ''
        try {
          const chat = await sendCopilotChat({
            persona: 'customer',
            messages: history,
            context: {
              surface: 'customer_pwa',
              storeName,
              listItemCount: shoppingList.length,
              listPreview: shoppingList.slice(0, 8).map((i) => `${i.name} x${i.quantity}`),
              matchedProducts: (enrichment.matchedProducts || []).slice(0, 5).map((p) => ({
                name: p.name,
                aisle: p.aisle,
                shelf: p.shelf,
                price: p.price,
                available: p.isAvailable,
                stockCount: p.stockCount,
              })),
              sampleCatalog: catalog.slice(0, 24).map((p) => ({
                name: p.name,
                aisle: p.aisle,
                shelf: p.shelf,
                price: p.price,
                available: p.isAvailable,
              })),
            },
          })
          reply = chat.reply
        } catch (chatErr) {
          console.warn('Copilot chat unavailable; using availability reply.', chatErr)
        }

        if (requestId !== copilotRequestIdRef.current) return

        const finalText = buildCopilotReplyText(enrichment, reply)

        setCopilotMessages((cur) => [
          ...cur,
          {
            id: `copilot-${Date.now()}`,
            sender: 'COPILOT',
            text: finalText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            ...enrichment,
          },
        ])
      } catch (err) {
        if (requestId !== copilotRequestIdRef.current) return
        const detail = err instanceof Error ? err.message : 'Could not reach Store AI'
        setCopilotMessages((cur) => [
          ...cur,
          {
            id: `copilot-${Date.now()}`,
            sender: 'COPILOT',
            text: buildCopilotReplyText(enrichment) || `Sorry — ${detail}. Please try again in a moment.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            ...enrichment,
          },
        ])
      } finally {
        if (requestId === copilotRequestIdRef.current) {
          copilotBusyRef.current = false
          setCopilotIsTyping(false)
        }
      }
    })()
  }

  const searchCatalog = (query: string): CustomerProduct[] => {
    const source = catalog
    if (!query.trim()) return source
    const q = query.toLowerCase()
    return source.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.aisle.toLowerCase().includes(q)
    )
  }

  const optimizedRoute = useMemo<WaypointRouteStep[]>(() => {
    const checkoutCoord =
      CHECKOUT_MAP_COORDS[targetCheckoutCounter] || CHECKOUT_MAP_COORDS.C2

    const formatShelfLabel = (shelfCode?: string | null, fallback?: string) => {
      const code = bareShelfCode(shelfCode || undefined) || bareShelfCode(fallback)
      return code ? `Shelf ${code}` : fallback || 'Shelf'
    }

    if (navigationPlan?.stops.length) {
      const mapped = navigationPlan.stops.map((stop, index) => {
        const item = stop.kind === 'PRODUCT'
          ? shoppingList.find((candidate) => candidate.id === stop.productId)
          : undefined
        const location = item
          ? `${item.aisle} • ${formatShelfLabel(stop.shelfCode, item.shelf)}`
          : stop.kind === 'ENTRANCE'
            ? 'Starting Point'
            : `Checkout Lane • ${stop.laneCode || targetCheckoutCounter}`
        return {
          stepIndex: index + 1,
          title: stop.label,
          location,
          item,
          isCompleted: stop.kind === 'ENTRANCE' || Boolean(item?.isCollected),
          isSkipped: item?.isSkipped,
          mapCoord: { x: stop.node.x, y: stop.node.y },
        } satisfies WaypointRouteStep
      })

      const resolvedIds = new Set(
        navigationPlan.stops
          .filter((stop) => stop.kind === 'PRODUCT' && stop.productId)
          .map((stop) => stop.productId as string)
      )
      const unresolvedItems = shoppingList.filter(
        (item) =>
          !item.isSkipped &&
          !resolvedIds.has(item.id) &&
          Number.isFinite(item.mapCoord?.x) &&
          Number.isFinite(item.mapCoord?.y)
      )

      if (unresolvedItems.length === 0) return mapped

      const checkoutIndex = navigationPlan.stops.findIndex((stop) => stop.kind === 'CHECKOUT')
      const beforeCheckout = checkoutIndex >= 0 ? mapped.slice(0, checkoutIndex) : mapped
      const checkoutSteps = checkoutIndex >= 0 ? mapped.slice(checkoutIndex) : []
      const extraStops = unresolvedItems.map((item) => ({
        stepIndex: 0,
        title: item.name,
        location: `${item.aisle} • ${formatShelfLabel(item.shelf)}`,
        item,
        isCompleted: item.isCollected,
        isSkipped: item.isSkipped,
        mapCoord: item.mapCoord,
      }))

      return [...beforeCheckout, ...extraStops, ...checkoutSteps].map((step, index) => ({
        ...step,
        stepIndex: index + 1,
      }))
    }

    const steps: WaypointRouteStep[] = [
      {
        stepIndex: 1,
        title: 'Entrance',
        location: 'Starting Point',
        isCompleted: true,
        mapCoord: { x: 75, y: 345 },
      },
    ]

    // Sort items by aisle sequence (or focus product only)
    const sorted = (
      routeFocusProductIds?.length
        ? shoppingList.filter((item) => routeFocusProductIds.includes(item.id) && !item.isSkipped)
        : shoppingList.filter((item) => !item.isSkipped)
    ).sort((a, b) => a.aisle.localeCompare(b.aisle))

    sorted.forEach((item, idx) => {
      steps.push({
        stepIndex: idx + 2,
        title: item.name,
        location: `${item.aisle} • ${formatShelfLabel(item.shelf)}`,
        item,
        isCompleted: item.isCollected,
        isSkipped: item.isSkipped,
        mapCoord: item.mapCoord,
      })
    })

    // Final checkout counter — coords must match seed nav-checkout-* nodes
    const waitSeconds =
      checkoutLanes.find((lane) => lane.code === targetCheckoutCounter)?.waitSeconds ??
      (targetCheckoutCounter === 'C1' ? 324 : targetCheckoutCounter === 'C3' ? 0 : 70)
    const checkoutWait =
      waitSeconds <= 0 ? 'Now' : `${(waitSeconds / 60).toFixed(1)} min`
    steps.push({
      stepIndex: steps.length + 1,
      title: `Checkout ${targetCheckoutCounter}`,
      location: `Checkout Lane • ~${checkoutWait} wait`,
      isCompleted: false,
      mapCoord: checkoutCoord,
    })

    return steps
  }, [navigationPlan, shoppingList, targetCheckoutCounter, checkoutLanes, routeFocusProductIds])

  return (
    <CustomerShoppingContext.Provider
      value={{
        storeName,
        activeTab,
        setActiveTab,
        shoppingList,
        addToShoppingList,
        addMultipleToShoppingList,
        removeFromShoppingList,
        updateQuantity,
        toggleItemCollected,
        skipItem,
        clearShoppingList,
        isAisle4Congested,
        setIsAisle4Congested,
        useCrowdAlternativeRoute,
        setUseCrowdAlternativeRoute,
        outOfStockProduct,
        setOutOfStockProduct,
        replaceProductInList,
        optimizedRoute,
        navigationPlan,
        isNavigationPlanLoading,
        activeStepIndex,
        setActiveStepIndex,
        isNavigating,
        setIsNavigating,
        targetCheckoutCounter,
        setTargetCheckoutCounter,
        isNavigatingToCheckout,
        setIsNavigatingToCheckout,
        checkoutLanes,
        recommendedCheckout,
        toastMessage,
        showToast,
        catalog,
        catalogLoading,
        searchCatalog,
        routeFocusProductIds,
        setRouteFocusProductIds,
        navigateToProduct,
        isCopilotDrawerOpen,
        setIsCopilotDrawerOpen,
        copilotMessages,
        sendCopilotMessage,
        clearCopilotMessages,
        copilotIsTyping,
      }}
    >
      {children}
      {/* Global Customer Toast Notification */}
      {toastMessage && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 text-white text-xs font-semibold px-4 py-2 rounded-2xl shadow-xl border border-slate-700 animate-in fade-in slide-in-from-bottom-2 duration-200 max-w-[90%]">
          {toastMessage}
        </div>
      )}
    </CustomerShoppingContext.Provider>
  )
}

export const useCustomerShopping = () => {
  const context = useContext(CustomerShoppingContext)
  if (!context) {
    throw new Error('useCustomerShopping must be used within a CustomerShoppingProvider')
  }
  return context
}
