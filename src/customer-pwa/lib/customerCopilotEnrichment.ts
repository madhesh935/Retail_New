import type {
  CustomerProduct,
  CopilotMessage,
  CopilotShoppingPlan,
  CopilotShoppingPlanItem,
} from '@/customer-pwa/context/CustomerShoppingContext'
import type { NavigationPlan } from '@/customer-pwa/types/navigation'

export type CopilotProductRoutePreview = {
  product: CustomerProduct
  availabilityLabel: string
  stockLabel: string
  aisle: string
  shelf: string
  steps: Array<{ title: string; location: string }>
  distanceMeters?: number
  estimatedMinutes?: number
  plan?: NavigationPlan | null
}

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
  | 'productRoute'
>

const STOP_WORDS = new Set([
  'i', 'me', 'my', 'we', 'you', 'the', 'a', 'an', 'and', 'or', 'to', 'for', 'of', 'in', 'on', 'at',
  'is', 'are', 'was', 'be', 'can', 'could', 'would', 'should', 'please', 'want', 'need', 'buy',
  'get', 'find', 'where', 'how', 'what', 'which', 'show', 'tell', 'looking', 'look', 'some',
  'any', 'this', 'that', 'with', 'from', 'into', 'about', 'store', 'shop', 'product', 'item',
  'items', 'grocery', 'groceries', 'today', 'now', 'here', 'there', 'help', 'route', 'navigate',
  'navigation', 'take', 'bring', 'available', 'availability', 'stock', 'shelf', 'aisle', 'near',
])

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

function bareShelf(shelf: string): string {
  return shelf.replace(/^shelf\s+/i, '').trim() || shelf
}

function availabilityFor(product: CustomerProduct): Pick<CopilotProductRoutePreview, 'availabilityLabel' | 'stockLabel'> {
  if (!product.isAvailable || product.stockCount <= 0) {
    return { availabilityLabel: 'OUT OF STOCK', stockLabel: '0 on shelf' }
  }
  if (product.isLowStock || product.stockCount <= 5) {
    return {
      availabilityLabel: 'LOW STOCK',
      stockLabel: `${product.stockCount} on shelf`,
    }
  }
  return {
    availabilityLabel: 'IN STOCK',
    stockLabel: `${product.stockCount} on shelf`,
  }
}

function extractTokens(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s+]/g, ' ')
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 2 && !STOP_WORDS.has(t))
}

function scoreProduct(product: CustomerProduct, tokens: string[], raw: string): number {
  const name = product.name.toLowerCase()
  const brand = product.brand.toLowerCase()
  const category = product.category.toLowerCase()
  const hay = `${name} ${brand} ${category}`
  let score = 0

  if (raw.includes(name) || name.includes(raw.trim())) score += 120
  for (const token of tokens) {
    if (name === token) score += 50
    else if (name.includes(token)) score += 28
    if (brand.includes(token)) score += 18
    if (category.includes(token)) score += 10
    if (hay.includes(token)) score += 4
  }
  // Prefer available items when scores are close
  if (product.isAvailable) score += 3
  return score
}

function findCatalogMatchesSingle(text: string, catalog: CustomerProduct[], limit = 4): CustomerProduct[] {
  const raw = text.toLowerCase().trim()
  const tokens = extractTokens(raw)
  if (!raw || (tokens.length === 0 && raw.length < 2)) return []

  const scored = catalog
    .map((product) => ({ product, score: scoreProduct(product, tokens, raw) }))
    .filter((row) => row.score >= 18)
    .sort((a, b) => b.score - a.score || a.product.name.localeCompare(b.product.name))

  const seen = new Set<string>()
  const out: CustomerProduct[] = []
  for (const row of scored) {
    if (seen.has(row.product.id)) continue
    seen.add(row.product.id)
    out.push(row.product)
    if (out.length >= limit) break
  }
  return out
}

/** Split list-style queries into phrases (comma/and lists, bigrams, tokens). */
function extractSearchPhrases(text: string): string[] {
  const punctSplit = text
    .split(/\band\b|,|;|\n|\+/i)
    .map((s) => s.trim())
    .filter((s) => s.length >= 2)
  if (punctSplit.length > 1) return punctSplit

  const trimmed = text.trim()
  const tokens = extractTokens(trimmed)
  if (tokens.length <= 1) return [trimmed]

  const phrases: string[] = [trimmed]
  for (let i = 0; i < tokens.length - 1; i++) {
    phrases.push(`${tokens[i]} ${tokens[i + 1]}`)
  }
  for (const token of tokens) {
    if (token.length >= 3) phrases.push(token)
  }
  return [...new Set(phrases)]
}

export function findCatalogMatches(text: string, catalog: CustomerProduct[], limit = 6): CustomerProduct[] {
  const phrases = extractSearchPhrases(text)
  const seen = new Set<string>()
  const out: CustomerProduct[] = []

  for (const phrase of phrases) {
    for (const product of findCatalogMatchesSingle(phrase, catalog, 1)) {
      if (seen.has(product.id)) continue
      seen.add(product.id)
      out.push(product)
      if (out.length >= limit) return out
    }
  }
  return out
}

function isProductSeekIntent(q: string): boolean {
  return (
    /\b(where|find|locate|looking for|look for|buy|want|need|get me|show me|take me|navigate|route|aisle|shelf|available|in stock|do you have|have you got)\b/.test(
      q
    ) ||
    // Short direct product asks: "milk", "dove shampoo", "bread"
    (extractTokens(q).length > 0 && q.length <= 48 && !/\b(breakfast|dinner|party|checkout|queue|help|staff|emergency)\b/.test(q))
  )
}

export function buildProductRoutePreview(
  product: CustomerProduct,
  plan?: NavigationPlan | null
): CopilotProductRoutePreview {
  const availability = availabilityFor(product)
  const shelf = bareShelf(product.shelf)
  const aisle = product.aisle || 'In store'

  const stepsFromPlan =
    plan?.stops?.map((stop) => ({
      title: stop.label,
      location:
        stop.kind === 'ENTRANCE'
          ? 'Main Entrance'
          : stop.kind === 'CHECKOUT'
            ? `Checkout ${stop.laneCode || ''}`.trim()
            : `${aisle} • Shelf ${stop.shelfCode || shelf}`,
    })) || []

  const fallbackSteps = [
    { title: 'Entrance', location: 'Main Entrance' },
    { title: product.name, location: `${aisle} • Shelf ${shelf}` },
    { title: 'Checkout', location: 'Checkout lanes' },
  ]

  return {
    product,
    ...availability,
    aisle,
    shelf: shelf ? `Shelf ${shelf}` : product.shelf,
    steps: stepsFromPlan.length ? stepsFromPlan : fallbackSteps,
    distanceMeters: plan?.totalDistanceMeters,
    estimatedMinutes: plan?.estimatedMinutes,
    plan: plan || null,
  }
}

/**
 * Local catalog enrichers for rich shopping cards.
 * Reply text comes from the LLM; this attaches availability + product-specific route cards.
 */
export function buildCustomerCopilotEnrichment(
  text: string,
  catalog: CustomerProduct[]
): Enrichment {
  const q = text.toLowerCase().trim()
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
    const matches = findCatalogMatches(text, catalog, 1)
    const product = matches[0] || find('prod-coke') || catalog.find((p) => p.name.toLowerCase().includes('cola'))
    return {
      showStaffAssistButton: true,
      staffAssistPrefill: {
        requestType: 'BACKROOM_REQUEST',
        product,
        zoneName: product?.aisle || 'Beverages',
        shelfCode: product ? bareShelf(product.shelf) : 'B4',
      },
    }
  }

  if (q.includes("can't find") || q.includes('cannot find') || q.includes('not on shelf') || q.includes('empty shelf')) {
    const matches = findCatalogMatches(text, catalog, 1)
    const product = matches[0] || find('prod-milk')
    return {
      showStaffAssistButton: true,
      staffAssistPrefill: {
        requestType: 'SHELF_ASSISTANCE',
        product,
        zoneName: product?.aisle || 'Store Floor',
        shelfCode: product ? bareShelf(product.shelf) : undefined,
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
      showRoutePreview: true,
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
      showRoutePreview: true,
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
      showRoutePreview: true,
    }
  }

  if (q.includes('pasta') && (q.includes('dinner') || q.includes('ingredient') || q.includes('kit') || q.includes('night'))) {
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
      showRoutePreview: true,
    }
  }

  if (q.includes('similar to dove') || q.includes('dove alternative') || (q.includes('shampoo') && q.includes('alternative'))) {
    return {
      alternativeProducts: [find('prod-sunsilk'), find('prod-pantene')].filter(Boolean) as CustomerProduct[],
    }
  }

  if (q.includes('checkout') || q.includes('fastest') || q.includes('pay') || q.includes('queue')) {
    return { showCheckoutRecommendation: true }
  }

  // Product seek: availability + location from live catalog (not hardcoded aisle)
  if (isProductSeekIntent(q)) {
    const matches = findCatalogMatches(text, catalog, 6)
    if (matches.length > 0) {
      const primary = matches[0]
      const shelf = bareShelf(primary.shelf)
      return {
        matchedProducts: matches,
        singleProductLocation: {
          product: primary,
          aisle: primary.aisle,
          shelf: shelf ? `Shelf ${shelf}` : primary.shelf,
        },
        // Placeholder route; live navigation plan is attached asynchronously in sendCopilotMessage
        productRoute: buildProductRoutePreview(primary),
      }
    }
  }

  // Fallback fuzzy catalog cards for longer free-text queries
  const matched = findCatalogMatches(text, catalog, 3)
  if (matched.length > 0) {
    const primary = matched[0]
    return {
      matchedProducts: matched,
      singleProductLocation: {
        product: primary,
        aisle: primary.aisle,
        shelf: bareShelf(primary.shelf) ? `Shelf ${bareShelf(primary.shelf)}` : primary.shelf,
      },
      productRoute: buildProductRoutePreview(primary),
    }
  }

  if (q.includes('route') || q.includes('navigate') || q.includes('how to reach')) {
    return { showRoutePreview: true }
  }

  return {}
}

import { stripMarkdown } from '@/lib/copilotText'

export { stripMarkdown } from '@/lib/copilotText'

type CopilotReplyEnrichment = Pick<
  CopilotMessage,
  | 'matchedProducts'
  | 'shoppingPlan'
  | 'showCheckoutRecommendation'
  | 'showStaffAssistButton'
  | 'isEmergencyAlert'
  | 'alternativeProducts'
>

/** Short plain-text bubble when structured cards carry the details. */
export function buildCopilotReplyText(
  enrichment: CopilotReplyEnrichment,
  llmReply?: string
): string {
  if (enrichment.isEmergencyAlert) {
    return (
      stripMarkdown(llmReply || '') ||
      'This sounds urgent. Please use emergency assistance or alert store staff immediately.'
    )
  }
  if (enrichment.showStaffAssistButton) {
    return (
      stripMarkdown(llmReply || '') ||
      'I can connect you with a store associate. Tap Request staff help below.'
    )
  }
  if (enrichment.shoppingPlan) {
    const n = enrichment.shoppingPlan.items.length
    return `I put together a ${n}-item plan for you. Adjust quantities below, then open the route when you are ready.`
  }
  if (enrichment.showCheckoutRecommendation) {
    return 'Here are the live checkout lanes — pick the shortest queue below.'
  }
  if (enrichment.alternativeProducts?.length) {
    return 'Here are similar options from our catalog. Compare availability and tap Navigate on any item.'
  }

  const products = enrichment.matchedProducts || []
  if (products.length === 1) {
    const p = products[0]
    const stock =
      !p.isAvailable || p.stockCount <= 0
        ? 'Out of stock right now'
        : p.isLowStock
          ? `Low stock (${p.stockCount} left)`
          : `In stock (${p.stockCount} on shelf)`
    const shelf = bareShelf(p.shelf)
    return `${p.name} is ${stock.toLowerCase()} at ${p.aisle}${shelf ? `, Shelf ${shelf}` : ''}. Tap Navigate below for a walking route.`
  }
  if (products.length > 1) {
    return `Found ${products.length} items from your request with live shelf availability. Tap any product to navigate or add it to your list.`
  }

  const cleaned = stripMarkdown(llmReply || '')
  return cleaned || 'I can help you find products, check stock, and open a walking route.'
}

export function formatCopilotDisplayText(msg: CopilotMessage): string {
  if (msg.sender === 'USER') return msg.text
  if (/[#*\\]|^\s*[-*]\s/m.test(msg.text) && (msg.matchedProducts?.length || msg.shoppingPlan)) {
    return buildCopilotReplyText(msg, msg.text)
  }
  if (/[#*\\]/.test(msg.text)) return stripMarkdown(msg.text)
  return msg.text
}
