import React, { createContext, useContext, useState, useMemo } from 'react'

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
    mapCoord: { x: 142, y: 220 },
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
    shelf: 'Shelf A2',
    stockCount: 12,
    isAvailable: true,
    mapCoord: { x: 252, y: 90 },
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
    mapCoord: { x: 252, y: 220 },
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
    shelf: 'Shelf D4',
    stockCount: 7,
    isAvailable: true,
    mapCoord: { x: 362, y: 220 },
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

  // Copilot Conversation Messages
  const initialCopilotMessages: CopilotMessage[] = [
    {
      id: 'c-welcome',
      sender: 'COPILOT',
      text: `Hello! I'm your in-store Shopping Copilot. I can build multi-item meal plans, find shelf locations, recommend optimal pack quantities, or calculate your fastest route!`,
      timestamp: 'Just now',
    },
  ]
  const [copilotMessages, setCopilotMessages] = useState<CopilotMessage[]>(initialCopilotMessages)
  const [copilotIsTyping, setCopilotIsTyping] = useState(false)

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

  // Grounded natural language query processor for Copilot
  const sendCopilotMessage = (text: string) => {
    if (!text.trim()) return

    const userMsg: CopilotMessage = {
      id: `user-${Date.now()}`,
      sender: 'USER',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setCopilotMessages((prev) => [...prev, userMsg])
    setCopilotIsTyping(true)

    setTimeout(() => {
      const q = text.toLowerCase()
      let replyText = ''
      let plan: CopilotShoppingPlan | undefined
      let matchedProds: CustomerProduct[] | undefined
      let altProds: CustomerProduct[] | undefined
      let showRoute = false
      let showCheckout = false
      let singleLoc: { product: CustomerProduct; aisle: string; shelf: string } | undefined

      let showStaffAssist = false
      let staffPrefill: any = undefined
      let isEmergency = false

      // 0. Safety / Emergency Check
      if (q.includes('emergency') || q.includes('fire') || q.includes('injury') || q.includes('danger') || q.includes('hurt')) {
        isEmergency = true
        replyText = "⚠️ For immediate danger, medical emergencies, or safety incidents, please alert store staff in person or contact emergency services immediately."
      }
      // 0.1 Direct Staff Help Request
      else if (q.includes('need staff') || q.includes('call staff') || q.includes('need help') || q.includes('someone help') || q.includes('can someone help') || q.includes('associate')) {
        showStaffAssist = true
        staffPrefill = {
          requestType: 'GENERAL_ASSISTANCE',
          zoneName: 'Store Floor',
        }
        replyText = "I can dispatch an on-shift store associate directly to your location. Tap below to choose your assistance request:"
      }
      // 0.2 Cannot find product / Shelf empty / Backroom request
      else if (q.includes('backroom') || q.includes('stockroom') || (q.includes('bring') && q.includes('back'))) {
        const cola = STORE_CATALOG.find((p) => p.id === 'prod-cola')!
        showStaffAssist = true
        staffPrefill = {
          requestType: 'BACKROOM_REQUEST',
          product: cola,
          zoneName: 'Beverages',
          shelfCode: 'B4',
        }
        replyText = "We have 14 units of Sparkling Cola Zero available in the backroom. Would you like a store associate to bring one out for you?"
      }
      else if (q.includes("can't find") || q.includes("cannot find") || q.includes("not on shelf") || q.includes("empty shelf")) {
        const milk = STORE_CATALOG.find((p) => p.id === 'prod-milk')!
        showStaffAssist = true
        staffPrefill = {
          requestType: 'SHELF_ASSISTANCE',
          product: milk,
          zoneName: 'Dairy & Chilled',
          shelfCode: 'C2',
        }
        replyText = "If you're at the shelf and the item is missing or out of reach, tap below to request immediate staff assistance:"
      }
      // 1. Breakfast for N people
      if (q.includes('breakfast')) {
        const milk = STORE_CATALOG.find((p) => p.id === 'prod-milk')!
        const bread = STORE_CATALOG.find((p) => p.id === 'prod-bread')!
        const butter = STORE_CATALOG.find((p) => p.id === 'prod-amul-100')!
        const tea = STORE_CATALOG.find((p) => p.id === 'prod-tea')!

        const items: CopilotShoppingPlanItem[] = [
          { product: milk, suggestedQty: 2 },
          { product: bread, suggestedQty: 1 },
          { product: butter, suggestedQty: 1 },
          { product: tea, suggestedQty: 1 },
        ]

        const total = items.reduce((s, i) => s + i.product.priceNum * i.suggestedQty, 0)

        plan = {
          title: 'Breakfast Planning Pack (4 People)',
          subtitle: 'Balanced breakfast essentials available in Dairy, Bakery & Beverages',
          items,
          totalEstimated: total,
        }
        replyText = `Here is a curated breakfast plan for 4 people with currently in-stock items:`
      }
      // 2. Tea, Milk, Biscuits for N people
      else if (q.includes('tea') && (q.includes('milk') || q.includes('biscuit'))) {
        const tea = STORE_CATALOG.find((p) => p.id === 'prod-tea')!
        const milk = STORE_CATALOG.find((p) => p.id === 'prod-milk')!
        const biscuits = STORE_CATALOG.find((p) => p.id === 'prod-marie-gold')!

        const items: CopilotShoppingPlanItem[] = [
          { product: tea, suggestedQty: 1 },
          { product: milk, suggestedQty: 2 },
          { product: biscuits, suggestedQty: 2 },
        ]
        const total = items.reduce((s, i) => s + i.product.priceNum * i.suggestedQty, 0)

        plan = {
          title: 'Evening Tea Basket (6 People)',
          subtitle: 'Fresh tea leaves, whole milk, and crisp Marie Gold biscuits',
          items,
          totalEstimated: total,
        }
        replyText = `I built a 3-item tea plan for 6 people using in-stock products:`
      }
      // 3. Snacks under budget (e.g. under ₹500)
      else if (q.includes('snack') || q.includes('under 500') || q.includes('under ₹500')) {
        const chips = STORE_CATALOG.find((p) => p.id === 'prod-lays')!
        const bhujia = STORE_CATALOG.find((p) => p.id === 'prod-haldirams')!
        const biscuits = STORE_CATALOG.find((p) => p.id === 'prod-marie-gold')!
        const juice = STORE_CATALOG.find((p) => p.id === 'prod-juice')!

        const items: CopilotShoppingPlanItem[] = [
          { product: chips, suggestedQty: 3 }, // 3 x 20 = 60
          { product: bhujia, suggestedQty: 1 }, // 1 x 95 = 95
          { product: biscuits, suggestedQty: 2 }, // 2 x 55 = 110
          { product: juice, suggestedQty: 1 }, // 1 x 110 = 110
        ]
        const total = items.reduce((s, i) => s + i.product.priceNum * i.suggestedQty, 0) // 375
        const budget = 500

        plan = {
          title: 'Snack Party Basket',
          subtitle: 'Crowd-favorite snacks within your ₹500 budget',
          budget,
          items,
          totalEstimated: total,
          remainingBudget: budget - total,
        }
        replyText = `Here is an optimized snack basket for 5 people within your ₹500 budget (₹${total} total, ₹${budget - total} remaining):`
      }
      // 4. Pasta ingredients
      else if (q.includes('pasta')) {
        const pasta = STORE_CATALOG.find((p) => p.id === 'prod-pasta')!
        const sauce = STORE_CATALOG.find((p) => p.id === 'prod-pasta-sauce')!
        const cheese = STORE_CATALOG.find((p) => p.id === 'prod-cheese')!

        const items: CopilotShoppingPlanItem[] = [
          { product: pasta, suggestedQty: 1 },
          { product: sauce, suggestedQty: 1 },
          { product: cheese, suggestedQty: 1 },
        ]
        const total = items.reduce((s, i) => s + i.product.priceNum * i.suggestedQty, 0)

        plan = {
          title: 'Italian Pasta Night Kit',
          subtitle: 'Durum wheat penne, traditional tomato-herb sauce & cheese',
          items,
          totalEstimated: total,
        }
        replyText = `Here are the essential ingredients for making pasta tonight:`
      }
      // 5. Dove / Shampoo alternatives
      else if (q.includes('similar to dove') || q.includes('dove alternative') || (q.includes('shampoo') && q.includes('alternative'))) {
        const sunsilk = STORE_CATALOG.find((p) => p.id === 'prod-sunsilk')!
        const pantene = STORE_CATALOG.find((p) => p.id === 'prod-pantene')!
        altProds = [sunsilk, pantene]
        replyText = `Here are nearby in-stock shampoo alternatives on Aisle 6:`
      }
      // 6. Milk lookup with location & mini map preview
      else if (q.includes('where is milk') || q === 'milk' || (q.includes('milk') && !q.includes('bread'))) {
        const milk = STORE_CATALOG.find((p) => p.id === 'prod-milk')!
        const aavin = STORE_CATALOG.find((p) => p.id === 'prod-aavin-milk')!
        const amul = STORE_CATALOG.find((p) => p.id === 'prod-amul-taaza')!
        matchedProds = [milk, aavin, amul]
        singleLoc = {
          product: milk,
          aisle: 'Aisle 2',
          shelf: 'Shelf C2',
        }
        replyText = `Heritage Fresh Whole Milk (1L) is available in Dairy & Chilled (Aisle 2, Shelf C2) with 18 units on shelf.`
      }
      // 7. Route / Navigation check
      else if (q.includes('route') || q.includes('navigate') || q.includes('how to reach')) {
        showRoute = true
        replyText = `Your Smart Route is calculated with 4 items over 182 meters:`
      }
      // 8. Fastest Checkout
      else if (q.includes('checkout') || q.includes('fastest') || q.includes('pay') || q.includes('queue')) {
        showCheckout = true
        replyText = `Counter C2 is currently the fastest checkout lane (~1.8 min wait with 2 customers waiting).`
      }
      // 9. Generic Catalog Search
      else {
        const prods = searchCatalog(text)
        if (prods.length > 0) {
          matchedProds = prods.slice(0, 3)
          replyText = `I found ${prods.length} matching products available in the store:`
        } else {
          replyText = `I searched our live floor catalog for "${text}". Would you like to check similar categories or ask for assistance?`
        }
      }

      const botMsg: CopilotMessage = {
        id: `copilot-${Date.now()}`,
        sender: 'COPILOT',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        shoppingPlan: plan,
        matchedProducts: matchedProds,
        alternativeProducts: altProds,
        showRoutePreview: showRoute,
        showCheckoutRecommendation: showCheckout,
        singleProductLocation: singleLoc,
        showStaffAssistButton: showStaffAssist,
        staffAssistPrefill: staffPrefill,
        isEmergencyAlert: isEmergency,
      }

      setCopilotMessages((prev) => [...prev, botMsg])
      setCopilotIsTyping(false)
    }, 280)
  }

  const searchCatalog = (query: string): CustomerProduct[] => {
    if (!query.trim()) return STORE_CATALOG
    const q = query.toLowerCase()
    return STORE_CATALOG.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.aisle.toLowerCase().includes(q)
    )
  }

  // Sequence: Entrance -> Milk (Aisle 2) -> Bread (Aisle 3) -> Biscuits (Aisle 4) -> Shampoo (Aisle 6) -> Checkout
  const optimizedRoute = useMemo<WaypointRouteStep[]>(() => {
    const steps: WaypointRouteStep[] = [
      {
        stepIndex: 1,
        title: 'Entrance',
        location: 'Starting Point',
        isCompleted: true,
        mapCoord: { x: 55, y: 310 },
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
  }, [shoppingList, targetCheckoutCounter])

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
