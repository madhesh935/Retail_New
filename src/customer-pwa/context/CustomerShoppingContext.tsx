import React, { createContext, useContext, useState, useMemo, useRef } from 'react'
import { realStoreApi } from '@/services/api/realStoreApi'
import type { NavigationPlan } from '../types/navigation'
import { sendCopilotChat } from '@/services/api/chat.service'
import { buildCustomerCopilotEnrichment } from '@/customer-pwa/lib/customerCopilotEnrichment'

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
}

export const STORE_CATALOG: CustomerProduct[] = [
  {
    id: 'prod-milk',
    name: 'Heritage Fresh Whole Milk (1L)',
    brand: 'Heritage',
    category: 'Dairy & Chilled',
    price: '₹68',
    priceNum: 68,
    aisle: 'Aisle 2',
    shelf: 'Shelf C2',
    stockCount: 18,
    isAvailable: true,
    backroomStock: 24,
    mapCoord: { x: 165, y: 235 },
    alternatives: [
      { id: 'prod-aavin-milk', name: 'Aavin Full Cream Milk (500ml)', shelf: 'Shelf C3', price: '₹34', isAvailable: true },
      { id: 'prod-amul-taaza', name: 'Amul Taaza Homogenised Toned Milk (1L)', shelf: 'Shelf C4', price: '₹72', isAvailable: true },
    ],
  },
  {
    id: 'prod-aavin-milk',
    name: 'Aavin Full Cream Milk (500ml)',
    brand: 'Aavin',
    category: 'Dairy & Chilled',
    price: '₹34',
    priceNum: 34,
    aisle: 'Aisle 2',
    shelf: 'Shelf C3',
    stockCount: 14,
    isAvailable: true,
    mapCoord: { x: 142, y: 220 },
  },
  {
    id: 'prod-amul-taaza',
    name: 'Amul Taaza Toned Milk (1L)',
    brand: 'Amul',
    category: 'Dairy & Chilled',
    price: '₹72',
    priceNum: 72,
    aisle: 'Aisle 2',
    shelf: 'Shelf C4',
    stockCount: 3,
    isAvailable: true,
    isLowStock: true,
    mapCoord: { x: 142, y: 220 },
  },
  {
    id: 'prod-bread',
    name: 'Modern 100% Whole Wheat Brown Bread (400g)',
    brand: 'Modern',
    category: 'Bakery & Breakfast',
    price: '₹45',
    priceNum: 45,
    aisle: 'Aisle 3',
    shelf: 'Shelf D1',
    stockCount: 12,
    isAvailable: true,
    mapCoord: { x: 250, y: 105 },
    alternatives: [
      { id: 'prod-britannia-bread', name: 'Britannia 100% Whole Wheat Bread (400g)', shelf: 'Shelf A3', price: '₹48', isAvailable: true },
    ],
  },
  {
    id: 'prod-amul-butter',
    name: 'Amul Pasteurised Salted Butter (500g)',
    brand: 'Amul',
    category: 'Dairy & Chilled',
    price: '₹275',
    priceNum: 275,
    aisle: 'Aisle 2',
    shelf: 'Shelf C1',
    stockCount: 18,
    isAvailable: true,
    mapCoord: { x: 142, y: 200 },
    alternatives: [
      { id: 'prod-amul-100', name: 'Amul Butter 100g Pack', shelf: 'Shelf C1', price: '₹58', isAvailable: true },
    ],
  },
  {
    id: 'prod-amul-100',
    name: 'Amul Butter 100g Mini Pack',
    brand: 'Amul',
    category: 'Dairy & Chilled',
    price: '₹58',
    priceNum: 58,
    aisle: 'Aisle 2',
    shelf: 'Shelf C1',
    stockCount: 22,
    isAvailable: true,
    mapCoord: { x: 142, y: 200 },
  },
  {
    id: 'prod-tea',
    name: 'Tata Tea Gold Premium Black Tea (500g)',
    brand: 'Tata Tea',
    category: 'Beverages',
    price: '₹310',
    priceNum: 310,
    aisle: 'Aisle 5',
    shelf: 'Shelf A2',
    stockCount: 16,
    isAvailable: true,
    mapCoord: { x: 362, y: 90 },
  },
  {
    id: 'prod-biscuits',
    name: 'Britannia NutriChoice Digestive Biscuits (250g)',
    brand: 'Britannia',
    category: 'Snacks & Pantry',
    price: '₹65',
    priceNum: 65,
    aisle: 'Aisle 4',
    shelf: 'Shelf B2',
    stockCount: 2,
    isAvailable: true,
    isLowStock: true,
    mapCoord: { x: 250, y: 235 },
    alternatives: [
      { id: 'prod-marie-gold', name: 'Britannia Marie Gold Biscuits (300g)', shelf: 'Shelf C3', price: '₹55', isAvailable: true },
      { id: 'prod-parle-g', name: 'Parle-G Glucose Biscuits (250g)', shelf: 'Shelf C4', price: '₹40', isAvailable: true },
    ],
  },
  {
    id: 'prod-marie-gold',
    name: 'Britannia Marie Gold Biscuits (300g)',
    brand: 'Britannia',
    category: 'Snacks & Pantry',
    price: '₹55',
    priceNum: 55,
    aisle: 'Aisle 4',
    shelf: 'Shelf C3',
    stockCount: 25,
    isAvailable: true,
    mapCoord: { x: 252, y: 220 },
  },
  {
    id: 'prod-parle-g',
    name: 'Parle-G Glucose Biscuits (250g)',
    brand: 'Parle',
    category: 'Snacks & Pantry',
    price: '₹40',
    priceNum: 40,
    aisle: 'Aisle 4',
    shelf: 'Shelf C4',
    stockCount: 30,
    isAvailable: true,
    mapCoord: { x: 252, y: 220 },
  },
  {
    id: 'prod-lays',
    name: "Lay's Classic Salted Potato Chips (50g)",
    brand: "Lay's",
    category: 'Snacks & Pantry',
    price: '₹20',
    priceNum: 20,
    aisle: 'Aisle 4',
    shelf: 'Shelf A1',
    stockCount: 40,
    isAvailable: true,
    mapCoord: { x: 252, y: 190 },
  },
  {
    id: 'prod-haldirams',
    name: "Haldiram's Nagpur Aloo Bhujia (200g)",
    brand: "Haldiram's",
    category: 'Snacks & Pantry',
    price: '₹95',
    priceNum: 95,
    aisle: 'Aisle 4',
    shelf: 'Shelf A3',
    stockCount: 15,
    isAvailable: true,
    mapCoord: { x: 252, y: 200 },
  },
  {
    id: 'prod-juice',
    name: 'Real Fruit Power Mixed Fruit Juice (1L)',
    brand: 'Real',
    category: 'Beverages',
    price: '₹110',
    priceNum: 110,
    aisle: 'Aisle 5',
    shelf: 'Shelf B1',
    stockCount: 18,
    isAvailable: true,
    mapCoord: { x: 362, y: 80 },
  },
  {
    id: 'prod-dove',
    name: 'Dove Daily Moisture Shampoo (340ml)',
    brand: 'Dove',
    category: 'Personal Care & Hair',
    price: '₹245',
    priceNum: 245,
    aisle: 'Aisle 6',
    shelf: 'Shelf F2',
    stockCount: 7,
    isAvailable: true,
    mapCoord: { x: 385, y: 235 },
    alternatives: [
      { id: 'prod-sunsilk', name: 'Sunsilk Soft & Smooth Shampoo (350ml)', shelf: 'Shelf D5', price: '₹215', isAvailable: true },
      { id: 'prod-pantene', name: 'Pantene Silky Smooth Shampoo (340ml)', shelf: 'Shelf D6', price: '₹260', isAvailable: true },
    ],
  },
  {
    id: 'prod-sunsilk',
    name: 'Sunsilk Soft & Smooth Shampoo (350ml)',
    brand: 'Sunsilk',
    category: 'Personal Care & Hair',
    price: '₹215',
    priceNum: 215,
    aisle: 'Aisle 6',
    shelf: 'Shelf D5',
    stockCount: 12,
    isAvailable: true,
    mapCoord: { x: 362, y: 220 },
  },
  {
    id: 'prod-pantene',
    name: 'Pantene Silky Smooth Care (340ml)',
    brand: 'Pantene',
    category: 'Personal Care & Hair',
    price: '₹260',
    priceNum: 260,
    aisle: 'Aisle 6',
    shelf: 'Shelf D6',
    stockCount: 9,
    isAvailable: true,
    mapCoord: { x: 362, y: 220 },
  },
  {
    id: 'prod-pasta',
    name: 'Barilla Penne Rigate Durum Wheat Pasta (500g)',
    brand: 'Barilla',
    category: 'Grains & Staples',
    price: '₹195',
    priceNum: 195,
    aisle: 'Aisle 1',
    shelf: 'Shelf B2',
    stockCount: 14,
    isAvailable: true,
    mapCoord: { x: 105, y: 80 },
  },
  {
    id: 'prod-pasta-sauce',
    name: 'Del Monte Traditional Pasta Sauce (500g)',
    brand: 'Del Monte',
    category: 'Grains & Staples',
    price: '₹145',
    priceNum: 145,
    aisle: 'Aisle 1',
    shelf: 'Shelf B3',
    stockCount: 11,
    isAvailable: true,
    mapCoord: { x: 105, y: 80 },
  },
  {
    id: 'prod-cheese',
    name: 'Amul Processed Cheese Slices (200g)',
    brand: 'Amul',
    category: 'Dairy & Chilled',
    price: '₹140',
    priceNum: 140,
    aisle: 'Aisle 2',
    shelf: 'Shelf C5',
    stockCount: 16,
    isAvailable: true,
    mapCoord: { x: 142, y: 210 },
  },
]

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
  targetCheckoutCounter: 'C1' | 'C2' | 'C3'
  setTargetCheckoutCounter: (counter: 'C1' | 'C2' | 'C3') => void
  isNavigatingToCheckout: boolean
  setIsNavigatingToCheckout: (val: boolean) => void
  toastMessage: string | null
  showToast: (msg: string) => void
  searchCatalog: (query: string) => CustomerProduct[]
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
  const storeName = storeId === 'store-002' ? 'Velachery Mall' : 'Chennai Central'
  const [activeTab, setActiveTab] = useState<CustomerPwaTab>(defaultTab || 'HOME')
  const [isNavigating, setIsNavigating] = useState(false)
  const [targetCheckoutCounter, setTargetCheckoutCounter] = useState<'C1' | 'C2' | 'C3'>('C2')
  const [isNavigatingToCheckout, setIsNavigatingToCheckout] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [isCopilotDrawerOpen, setIsCopilotDrawerOpen] = useState(false)

  // Initial shopping list
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([
    { ...STORE_CATALOG[0], quantity: 1, isCollected: false, isSkipped: false }, // Milk
    { ...STORE_CATALOG[3], quantity: 1, isCollected: false, isSkipped: false }, // Bread
    { ...STORE_CATALOG[7], quantity: 1, isCollected: false, isSkipped: false }, // Biscuits
    { ...STORE_CATALOG[13], quantity: 1, isCollected: false, isSkipped: false }, // Shampoo
  ])

  const [isAisle4Congested, setIsAisle4Congested] = useState(true)
  const [useCrowdAlternativeRoute, setUseCrowdAlternativeRoute] = useState(false)
  const [outOfStockProduct, setOutOfStockProduct] = useState<CustomerProduct | null>(null)
  const [activeStepIndex, setActiveStepIndex] = useState(1)

  const [catalog, setCatalog] = useState<CustomerProduct[]>(STORE_CATALOG)
  const [navigationPlan, setNavigationPlan] = useState<NavigationPlan | null>(null)
  const [isNavigationPlanLoading, setIsNavigationPlanLoading] = useState(false)

  React.useEffect(() => {
    realStoreApi.getCustomerCatalog().then((prods) => {
      if (prods && prods.length > 0) {
        setCatalog(prods)
      }
    }).catch(console.warn)
  }, [])

  React.useEffect(() => {
    let cancelled = false
    setIsNavigationPlanLoading(true)
    realStoreApi.optimizeNavigationRoute({
      store_id: storeId || 'store-01',
      destinations: shoppingList.map((item) => ({
        product_id: item.id,
        shelf_code: item.shelf,
        label: item.name,
      })),
      include_checkout: true,
      checkout_lane_code: targetCheckoutCounter,
      avoid_congestion: useCrowdAlternativeRoute,
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
  }, [shoppingList, storeId, targetCheckoutCounter, useCrowdAlternativeRoute])

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

  // Live Shopping Copilot — one request at a time (never fire async inside setState)
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

    const enrichment = buildCustomerCopilotEnrichment(
      trimmed,
      catalog.length ? catalog : STORE_CATALOG
    )

    const history = [...copilotMessages, userMsg]
      .filter((m) => m.id !== 'c-welcome')
      .slice(-12)
      .map((m) => ({
        role: (m.sender === 'USER' ? 'user' : 'assistant') as 'user' | 'assistant',
        content: m.text,
      }))

    void (async () => {
      try {
        const { reply } = await sendCopilotChat({
          persona: 'customer',
          messages: history,
          context: {
            surface: 'customer_pwa',
            storeName,
            listItemCount: shoppingList.length,
            listPreview: shoppingList.slice(0, 8).map((i) => `${i.name} x${i.quantity}`),
            sampleCatalog: (catalog.length ? catalog : STORE_CATALOG).slice(0, 20).map((p) => ({
              name: p.name,
              aisle: p.aisle,
              shelf: p.shelf,
              price: p.price,
              available: p.isAvailable,
            })),
          },
        })

        if (requestId !== copilotRequestIdRef.current) return

        setCopilotMessages((cur) => [
          ...cur,
          {
            id: `copilot-${Date.now()}`,
            sender: 'COPILOT',
            text: reply,
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
            text: `Sorry — ${detail}. Please try again in a moment.`,
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
    const source = catalog.length ? catalog : STORE_CATALOG
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
    if (navigationPlan?.stops.length) {
      return navigationPlan.stops.map((stop, index) => {
        const item = stop.kind === 'PRODUCT'
          ? shoppingList.find((candidate) => candidate.id === stop.productId)
          : undefined
        const location = item
          ? `${item.aisle} • ${stop.shelfCode ? `Shelf ${stop.shelfCode}` : item.shelf}`
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
        }
      })
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

    // Sort items by aisle sequence
    const sorted = [...shoppingList].sort((a, b) => a.aisle.localeCompare(b.aisle))

    sorted.forEach((item, idx) => {
      steps.push({
        stepIndex: idx + 2,
        title: item.name,
        location: `${item.aisle} • ${item.shelf}`,
        item,
        isCompleted: item.isCollected,
        isSkipped: item.isSkipped,
        mapCoord: item.mapCoord,
      })
    })

    // Final checkout counter
    const checkoutWait = targetCheckoutCounter === 'C1' ? '5.4 min' : targetCheckoutCounter === 'C3' ? '3.1 min' : '1.8 min'
    steps.push({
      stepIndex: steps.length + 1,
      title: `Checkout ${targetCheckoutCounter}`,
      location: `Checkout Lane • ~${checkoutWait} wait`,
      isCompleted: false,
      mapCoord: { x: 465, y: 295 },
    })

    return steps
  }, [navigationPlan, shoppingList, targetCheckoutCounter])

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
        toastMessage,
        showToast,
        searchCatalog,
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
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 text-white text-xs font-semibold px-4 py-2 rounded-2xl shadow-xl border border-slate-700 animate-in fade-in slide-in-from-bottom-2 duration-200">
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
