import type {
  CustomerProduct,
  CopilotMessage,
  CopilotShoppingPlan,
  CopilotShoppingPlanItem,
} from '@/customer-pwa/context/CustomerShoppingContext'

type Enrichment = Pick<
  CopilotMessage,
  | 'shoppingPlan'
  | 'matchedProducts'
  | 'alternativeProducts'
  | 'showRoutePreview'
  | 'showCheckoutRecommendation'
  | 'showStaffAssistButton'
  | 'staffAssistPrefill'
  | 'isEmergencyAlert'
  | 'singleProductLocation'
>

function planFrom(
  title: string,
  subtitle: string,
  items: CopilotShoppingPlanItem[],
  budget?: number
): CopilotShoppingPlan {
  const totalEstimated = items.reduce((s, i) => s + i.product.priceNum * i.suggestedQty, 0)
  return {
    title,
    subtitle,
    items,
    totalEstimated,
    budget,
    remainingBudget: budget != null ? budget - totalEstimated : undefined,
  }
}

/**
 * Local catalog enrichers for rich shopping cards.
 * Reply text comes from the LLM; this only attaches UI cards when intents match.
 */
export function buildCustomerCopilotEnrichment(
  text: string,
  catalog: CustomerProduct[]
): Enrichment {
  const q = text.toLowerCase()
  const find = (id: string) => catalog.find((p) => p.id === id)

  if (q.includes('emergency') || q.includes('fire') || q.includes('injury') || q.includes('danger') || q.includes('hurt')) {
    return { isEmergencyAlert: true }
  }

  if (
    q.includes('need staff') ||
    q.includes('call staff') ||
    q.includes('need help') ||
    q.includes('someone help') ||
    q.includes('associate')
  ) {
    return {
      showStaffAssistButton: true,
      staffAssistPrefill: { requestType: 'GENERAL_ASSISTANCE', zoneName: 'Store Floor' },
    }
  }

  if (q.includes('backroom') || q.includes('stockroom') || (q.includes('bring') && q.includes('back'))) {
    const cola = find('prod-cola')
    return {
      showStaffAssistButton: true,
      staffAssistPrefill: {
        requestType: 'BACKROOM_REQUEST',
        product: cola,
        zoneName: 'Beverages',
        shelfCode: 'B4',
      },
    }
  }

  if (q.includes("can't find") || q.includes('cannot find') || q.includes('not on shelf') || q.includes('empty shelf')) {
    const milk = find('prod-milk')
    return {
      showStaffAssistButton: true,
      staffAssistPrefill: {
        requestType: 'SHELF_ASSISTANCE',
        product: milk,
        zoneName: 'Dairy & Chilled',
        shelfCode: 'C2',
      },
    }
  }

  if (q.includes('breakfast')) {
    const items: CopilotShoppingPlanItem[] = [
      { product: find('prod-milk')!, suggestedQty: 2 },
      { product: find('prod-bread')!, suggestedQty: 1 },
      { product: find('prod-amul-100')!, suggestedQty: 1 },
      { product: find('prod-tea')!, suggestedQty: 1 },
    ].filter((i) => i.product)
    return {
      shoppingPlan: planFrom(
        'Breakfast Planning Pack (4 People)',
        'Balanced breakfast essentials available in Dairy, Bakery & Beverages',
        items
      ),
    }
  }

  if (q.includes('tea') && (q.includes('milk') || q.includes('biscuit'))) {
    const items: CopilotShoppingPlanItem[] = [
      { product: find('prod-tea')!, suggestedQty: 1 },
      { product: find('prod-milk')!, suggestedQty: 2 },
      { product: find('prod-marie-gold')!, suggestedQty: 2 },
    ].filter((i) => i.product)
    return {
      shoppingPlan: planFrom(
        'Evening Tea Basket (6 People)',
        'Fresh tea leaves, whole milk, and crisp Marie Gold biscuits',
        items
      ),
    }
  }

  if (q.includes('snack') || q.includes('under 500') || q.includes('under ₹500')) {
    const items: CopilotShoppingPlanItem[] = [
      { product: find('prod-lays')!, suggestedQty: 3 },
      { product: find('prod-haldirams')!, suggestedQty: 1 },
      { product: find('prod-marie-gold')!, suggestedQty: 2 },
      { product: find('prod-juice')!, suggestedQty: 1 },
    ].filter((i) => i.product)
    return {
      shoppingPlan: planFrom(
        'Snack Party Basket',
        'Crowd-favorite snacks within your ₹500 budget',
        items,
        500
      ),
    }
  }

  if (q.includes('pasta')) {
    const items: CopilotShoppingPlanItem[] = [
      { product: find('prod-pasta')!, suggestedQty: 1 },
      { product: find('prod-pasta-sauce')!, suggestedQty: 1 },
      { product: find('prod-cheese')!, suggestedQty: 1 },
    ].filter((i) => i.product)
    return {
      shoppingPlan: planFrom(
        'Italian Pasta Night Kit',
        'Durum wheat penne, traditional tomato-herb sauce & cheese',
        items
      ),
    }
  }

  if (q.includes('similar to dove') || q.includes('dove alternative') || (q.includes('shampoo') && q.includes('alternative'))) {
    return {
      alternativeProducts: [find('prod-sunsilk'), find('prod-pantene')].filter(Boolean) as CustomerProduct[],
    }
  }

  if (q.includes('where is milk') || q === 'milk' || (q.includes('milk') && !q.includes('bread') && !q.includes('tea'))) {
    const milk = find('prod-milk')
    if (!milk) return {}
    return {
      matchedProducts: [milk, find('prod-aavin-milk'), find('prod-amul-taaza')].filter(Boolean) as CustomerProduct[],
      singleProductLocation: { product: milk, aisle: 'Aisle 2', shelf: 'Shelf C2' },
    }
  }

  if (q.includes('route') || q.includes('navigate') || q.includes('how to reach')) {
    return { showRoutePreview: true }
  }

  if (q.includes('checkout') || q.includes('fastest') || q.includes('pay') || q.includes('queue')) {
    return { showCheckoutRecommendation: true }
  }

  const matched = catalog.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.aisle.toLowerCase().includes(q)
  )
  if (matched.length > 0 && q.length >= 3) {
    return { matchedProducts: matched.slice(0, 3) }
  }

  return {}
}
