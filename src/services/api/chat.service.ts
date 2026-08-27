/**
 * Shared Store AI Copilot chat client — used by manager, staff, and customer surfaces.
 * Talks to FastAPI POST /api/v1/chat/ (OpenRouter).
 */

const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000').replace(
  /\/+$/,
  ''
)

export type CopilotPersona = 'manager' | 'staff' | 'customer'

export interface ChatTurn {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface CopilotChatRequest {
  messages: ChatTurn[]
  persona?: CopilotPersona
  /** Extra live context injected into the system prompt */
  context?: Record<string, unknown> | string
  /** Override persona default */
  systemPrompt?: string
}

export interface CopilotChatResponse {
  reply: string
}

const PERSONA_PROMPTS: Record<CopilotPersona, string> = {
  manager: `You are "Store AI Copilot" on the Retail Edge OS MANAGER DASHBOARD (desktop command center).
Audience: store managers and supervisors only.
Help with: live occupancy, queues, shelf health, incidents, staff dispatch, cameras, digital twin, KPIs, and operational decisions.
Tone: crisp, operational, executive. Prefer bullets and concrete next actions (assign, open lane, refill, inspect camera).
Do NOT speak like a shopper assistant or floor associate. Never give customer shopping-list advice.
When greeting, identify as the manager Store AI Copilot.`,

  staff: `You are "Staff Companion AI" inside the Retail Edge STAFF mobile app.
Audience: on-floor store associates only (restock, scan, assist customers, safety).
Help with: assigned tasks, aisle/shelf locations, backroom bays, FEFO/expiry rotation, markdown tags, spill SOPs, and customer help requests.
Tone: short, mobile-friendly, step-by-step ("Go to…", "Scan…", "Place…").
Do NOT give manager KPI briefings or shopper meal-planning. Never invent tasks not in context.
When greeting, identify as the Staff Companion for associates.`,

  customer: `You are "Shopping Copilot" inside the Retail Edge CUSTOMER shopper app.
Audience: shoppers inside the store only.
Help with: finding products, meal/snack plans, aisle/shelf locations, pack sizes, budgets in INR, route tips, and fastest checkout.
Tone: friendly, clear, concise. Prefer aisle + shelf guidance.
Do NOT give staff SOPs, manager ops KPIs, dispatch instructions, or internal incident details.
When greeting, identify as the Shopping Copilot for shoppers at this store.`,
}

function buildSystemPrompt(
  persona: CopilotPersona,
  context?: Record<string, unknown> | string,
  override?: string
): string {
  if (override) {
    return context
      ? `${override}\n\nLive store context:\n${typeof context === 'string' ? context : JSON.stringify(context)}`
      : override
  }

  const base = PERSONA_PROMPTS[persona]
  if (!context) return base
  const ctx =
    typeof context === 'string' ? context : JSON.stringify(context, null, 0)
  return `${base}\n\nLive store context (use when relevant, do not invent conflicting facts):\n${ctx}`
}

/**
 * Send a multi-turn conversation to the backend chat endpoint.
 */
export async function sendCopilotChat(
  request: CopilotChatRequest
): Promise<CopilotChatResponse> {
  const persona = request.persona || 'manager'
  const system_prompt = buildSystemPrompt(
    persona,
    request.context,
    request.systemPrompt
  )

  const messages = request.messages
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .map((m) => ({
      role: m.role,
      content: m.content,
    }))

  if (!messages.length) {
    throw new Error('No messages to send')
  }

  const response = await fetch(`${API_BASE}/api/v1/chat/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ messages, system_prompt }),
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    const detail =
      typeof data?.detail === 'string'
        ? data.detail
        : `Chat request failed (${response.status})`
    throw new Error(detail)
  }

  const reply = typeof data?.reply === 'string' ? data.reply.trim() : ''
  if (!reply) {
    throw new Error('Empty reply from Store AI')
  }

  return { reply }
}

/** @deprecated Use sendCopilotChat — kept for older imports */
export const copilotService = {
  async query(params: {
    storeId: string
    message: string
    currentPage?: string
  }): Promise<{ replyText: string; conversationId: string; timestamp: string }> {
    const { reply } = await sendCopilotChat({
      persona: 'manager',
      messages: [{ role: 'user', content: params.message }],
      context: {
        storeId: params.storeId,
        currentPage: params.currentPage,
      },
    })
    return {
      replyText: reply,
      conversationId: `conv-${Date.now()}`,
      timestamp: new Date().toISOString(),
    }
  },
}
