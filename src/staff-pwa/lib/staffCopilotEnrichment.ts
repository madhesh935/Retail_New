import { stripMarkdown } from '@/lib/copilotText'
import type { CustomerHelpRequest } from '@/store/slices/customerRequestSlice'
import type { StaffTask, TaskPriority } from '@/types'
import type { InventoryBatch, MarkdownCandidate } from '@/types/expiry.types'

export type StaffCopilotTab = 'today' | 'assist' | 'scan' | 'work' | 'more'

export interface StaffCopilotTaskCard {
  id: string
  title: string
  zoneName: string
  shelfCode?: string
  priority: TaskPriority
  etaMinutes?: number
  category?: string
}

export interface StaffCopilotHelpCard {
  id: string
  typeLabel: string
  zoneName: string
  productName?: string
  shelfCode?: string
  status: string
}

export interface StaffCopilotEnrichment {
  taskCards?: StaffCopilotTaskCard[]
  helpCards?: StaffCopilotHelpCard[]
  actionLabel?: string
  actionTab?: StaffCopilotTab
  taskId?: string
}

export interface StaffCopilotContext {
  query: string
  staffId?: string
  pendingTasks: StaffTask[]
  customerRequests: CustomerHelpRequest[]
  markdownCandidates?: MarkdownCandidate[]
  inventoryBatches?: InventoryBatch[]
}

const PRIORITY_RANK: Record<TaskPriority, number> = {
  CRITICAL: 0,
  URGENT: 1,
  HIGH: 2,
  MEDIUM: 3,
  LOW: 4,
}

const OPEN_STATUSES = new Set(['PENDING', 'DISPATCHED', 'ASSIGNED', 'ACCEPTED', 'IN_PROGRESS', 'BLOCKED'])

function formatExpiry(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric' })
  } catch {
    return iso
  }
}

function openTasks(tasks: StaffTask[], staffId?: string): StaffTask[] {
  return tasks.filter(
    (t) =>
      OPEN_STATUSES.has(t.status) &&
      (!t.assignedStaffId || !staffId || t.assignedStaffId === staffId)
  )
}

function sortByPriority(tasks: StaffTask[]): StaffTask[] {
  return [...tasks].sort((a, b) => {
    const pa = PRIORITY_RANK[a.priority] ?? 9
    const pb = PRIORITY_RANK[b.priority] ?? 9
    if (pa !== pb) return pa - pb
    return (a.etaMinutes ?? 99) - (b.etaMinutes ?? 99)
  })
}

function toTaskCard(task: StaffTask): StaffCopilotTaskCard {
  return {
    id: task.id,
    title: task.title,
    zoneName: task.zoneName,
    shelfCode: task.shelfCode,
    priority: task.priority,
    etaMinutes: task.etaMinutes,
    category: task.category,
  }
}

function toHelpCard(req: CustomerHelpRequest): StaffCopilotHelpCard {
  return {
    id: req.id,
    typeLabel: req.typeLabel,
    zoneName: req.zoneName,
    productName: req.productName,
    shelfCode: req.shelfCode,
    status: req.status,
  }
}

function buildFefoReply(batches: InventoryBatch[]): string | null {
  const active = batches.filter((b) => b.status === 'ACTIVE' || b.status === 'EXPIRING_SOON')
  if (!active.length) return null

  const byProduct = new Map<string, InventoryBatch[]>()
  for (const batch of active) {
    const list = byProduct.get(batch.productId) || []
    list.push(batch)
    byProduct.set(batch.productId, list)
  }

  for (const list of byProduct.values()) {
    if (list.length < 2) continue
    const sorted = [...list].sort(
      (a, b) => new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime()
    )
    const front = sorted[0]
    const shelf = front.shelfCode ? `Shelf ${front.shelfCode}` : 'the facing'
    return `Pull batch ${front.batchNumber} (${front.productName}) to the front on ${shelf} — expires ${formatExpiry(front.expiresAt)}. Place newer batches behind it (FEFO).`
  }

  const earliest = [...active].sort(
    (a, b) => new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime()
  )[0]
  const shelf = earliest.shelfCode ? `Shelf ${earliest.shelfCode}` : 'see shelf label'
  return `Earliest expiry on floor: ${earliest.productName} batch ${earliest.batchNumber} on ${shelf}, expires ${formatExpiry(earliest.expiresAt)}. Keep this batch in front.`
}

function buildMarkdownReply(tasks: StaffTask[], candidates: MarkdownCandidate[]): string | null {
  const applyTasks = tasks.filter(
    (t) => t.category === 'MARKDOWN_APPLICATION' && OPEN_STATUSES.has(t.status)
  )
  if (applyTasks.length) {
    const task = applyTasks[0]
    const shelf = task.shelfCode ? `Shelf ${task.shelfCode}` : task.zoneName
    return `Markdown is approved for ${task.productName || task.title}. Apply ₹${task.markdownPrice ?? 'new'} price label on ${shelf}, then mark the task complete in Work.`
  }

  const approved = candidates.filter((c) => c.status === 'APPROVED')
  if (approved.length) {
    const c = approved[0]
    return `Markdown approved for ${c.productName}: ₹${c.currentPrice} → ₹${c.suggestedNewPrice} (${c.suggestedDiscountPercent}% off) on Shelf ${c.shelfCode}. Open Work when ready to apply the label.`
  }

  const pending = candidates.filter((c) => c.status === 'RECOMMENDED')
  if (pending.length) {
    return `${pending.length} markdown recommendation(s) are waiting for manager approval — none ready to apply yet.`
  }

  return 'No markdown labels are approved for application right now.'
}

function buildBackroomReply(tasks: StaffTask[], batches: InventoryBatch[]): string | null {
  const backroomTasks = tasks.filter(
    (t) =>
      OPEN_STATUSES.has(t.status) &&
      ((t.backroomUnits != null && t.backroomUnits > 0) || t.category === 'RESTOCK')
  )
  if (backroomTasks.length) {
    const task = backroomTasks[0]
    const shelf = task.shelfCode ? `Shelf ${task.shelfCode}` : task.zoneName
    const units = task.backroomUnits != null ? `${task.backroomUnits} units` : 'stock'
    return `${task.productName || task.title}: ${units} in backroom. Pull to ${shelf} and scan to confirm.`
  }

  const withBackroom = batches
    .filter((b) => b.backroomQuantity > 0)
    .sort((a, b) => b.backroomQuantity - a.backroomQuantity)
  if (withBackroom.length) {
    const batch = withBackroom[0]
    const shelf = batch.shelfCode ? `Shelf ${batch.shelfCode}` : 'floor shelf'
    return `${batch.productName}: ${batch.backroomQuantity} units in backroom. ${shelf} has ${batch.shelfQuantity} on shelf — refill when below target.`
  }

  return null
}

function buildExpiryTasksReply(tasks: StaffTask[]): string | null {
  const expiryTasks = sortByPriority(
    tasks.filter(
      (t) =>
        OPEN_STATUSES.has(t.status) &&
        (t.category === 'EXPIRY_CHECK' ||
          t.category === 'STOCK_ROTATION' ||
          t.category === 'REMOVE_EXPIRED')
    )
  )
  if (!expiryTasks.length) return null
  const task = expiryTasks[0]
  const shelf = task.shelfCode ? `Shelf ${task.shelfCode}` : task.zoneName
  return `You have ${expiryTasks.length} expiry task(s). Next: ${task.title} at ${shelf}. Open Work to start.`
}

export function buildStaffCopilotEnrichment(ctx: StaffCopilotContext): StaffCopilotEnrichment {
  const q = ctx.query.toLowerCase().trim()
  const tasks = openTasks(ctx.pendingTasks, ctx.staffId)
  const sortedTasks = sortByPriority(tasks)
  const helpOpen = ctx.customerRequests.filter((r) =>
    ['REQUESTED', 'ASSIGNED', 'ACCEPTED'].includes(r.status)
  )

  if (
    q.includes('customer') ||
    q.includes('help') ||
    q.includes('assist') ||
    (helpOpen.length > 0 && q.includes('request'))
  ) {
    return {
      helpCards: helpOpen.slice(0, 4).map(toHelpCard),
      actionLabel: 'View Customer Requests',
      actionTab: 'assist',
    }
  }

  if (q.includes('scan') || q.includes('barcode') || q.includes('markdown') || q.includes('price')) {
    const markdownTasks = sortedTasks.filter((t) => t.category === 'MARKDOWN_APPLICATION')
    return {
      taskCards: markdownTasks.slice(0, 3).map(toTaskCard),
      actionLabel: markdownTasks.length ? 'Open Markdown Task' : 'Open Scan Tab',
      actionTab: markdownTasks.length ? 'work' : 'scan',
      taskId: markdownTasks[0]?.id,
    }
  }

  if (q.includes('spill') || q.includes('safety') || q.includes('hazard')) {
    const safety = sortedTasks.find(
      (t) => t.category === 'SPILL_CLEANUP' || /spill|hazard|safety/i.test(t.title)
    )
    return {
      taskCards: safety ? [toTaskCard(safety)] : sortedTasks.slice(0, 2).map(toTaskCard),
      actionLabel: 'View Safety Task',
      actionTab: 'work',
      taskId: safety?.id,
    }
  }

  if (
    q.includes('fefo') ||
    q.includes('batch') ||
    q.includes('front') ||
    q.includes('rotate') ||
    q.includes('expir')
  ) {
    const expiryTasks = sortedTasks.filter(
      (t) =>
        t.category === 'EXPIRY_CHECK' ||
        t.category === 'STOCK_ROTATION' ||
        t.category === 'REMOVE_EXPIRED'
    )
    return {
      taskCards: expiryTasks.slice(0, 3).map(toTaskCard),
      actionLabel: expiryTasks.length ? 'Open Expiry Task' : 'Open Work Tasks',
      actionTab: 'work',
      taskId: expiryTasks[0]?.id,
    }
  }

  if (q.includes('backroom') || q.includes('stockroom') || q.includes('bay')) {
    const backroomTasks = sortedTasks.filter(
      (t) =>
        (t.backroomUnits != null && t.backroomUnits > 0) || t.category === 'RESTOCK'
    )
    return {
      taskCards: backroomTasks.slice(0, 3).map(toTaskCard),
      actionLabel: 'Open Work Tasks',
      actionTab: 'work',
      taskId: backroomTasks[0]?.id,
    }
  }

  if (
    q.includes('next') ||
    q.includes('urgent') ||
    q.includes('priority') ||
    q.includes('should i do') ||
    q.includes('what do i') ||
    q.includes('refill') ||
    q.includes('restock') ||
    q.includes('b4') ||
    q.includes('task')
  ) {
    return {
      taskCards: sortedTasks.slice(0, 4).map(toTaskCard),
      actionLabel: sortedTasks.length ? 'Open Work Tasks' : undefined,
      actionTab: sortedTasks.length ? 'work' : undefined,
      taskId: sortedTasks[0]?.id,
    }
  }

  if (sortedTasks.length > 0) {
    return {
      taskCards: sortedTasks.slice(0, 3).map(toTaskCard),
      actionLabel: 'Open Work Tasks',
      actionTab: 'work',
      taskId: sortedTasks[0]?.id,
    }
  }

  if (helpOpen.length > 0) {
    return {
      helpCards: helpOpen.slice(0, 3).map(toHelpCard),
      actionLabel: 'View Customer Requests',
      actionTab: 'assist',
    }
  }

  return {}
}

export function buildStaffCopilotReplyText(
  enrichment: StaffCopilotEnrichment,
  ctx: StaffCopilotContext,
  llmReply?: string
): string {
  const q = ctx.query.toLowerCase().trim()
  const tasks = openTasks(ctx.pendingTasks, ctx.staffId)
  const sortedTasks = sortByPriority(tasks)
  const helpOpen = ctx.customerRequests.filter((r) =>
    ['REQUESTED', 'ASSIGNED', 'ACCEPTED'].includes(r.status)
  )
  const batches = ctx.inventoryBatches || []
  const candidates = ctx.markdownCandidates || []

  if (enrichment.helpCards?.length) {
    const n = enrichment.helpCards.length
    const first = enrichment.helpCards[0]
    return n === 1
      ? `1 customer needs help: ${first.typeLabel} in ${first.zoneName}${first.productName ? ` (${first.productName})` : ''}. Tap below to respond.`
      : `${n} customer help requests are open. The latest is ${first.typeLabel} in ${first.zoneName}. Tap below to view all.`
  }

  if (
    q.includes('fefo') ||
    q.includes('batch') ||
    (q.includes('front') && !q.includes('checkout'))
  ) {
    return (
      buildFefoReply(batches) ||
      buildExpiryTasksReply(sortedTasks) ||
      'No FEFO rotation needed right now based on live batch data.'
    )
  }

  if (q.includes('markdown') || q.includes('approved')) {
    return buildMarkdownReply(sortedTasks, candidates) || stripMarkdown(llmReply || '')
  }

  if (q.includes('expir')) {
    return (
      buildExpiryTasksReply(sortedTasks) ||
      buildFefoReply(batches) ||
      'No expiry tasks assigned to you right now.'
    )
  }

  if (q.includes('backroom') || q.includes('stockroom') || q.includes('bay')) {
    return buildBackroomReply(sortedTasks, batches) || 'Backroom stock looks stable — no urgent pulls flagged.'
  }

  if (enrichment.taskCards?.length) {
    const n = enrichment.taskCards.length
    const top = enrichment.taskCards[0]
    const shelf = top.shelfCode ? `, Shelf ${top.shelfCode}` : ''
    return n === 1
      ? `Your top task: ${top.title} in ${top.zoneName}${shelf}. Tap Open Work below to start.`
      : `You have ${n} open tasks. Start with ${top.title} (${top.priority} priority) in ${top.zoneName}${shelf}. See the list below.`
  }

  if (helpOpen.length > 0) {
    return `${helpOpen.length} customer help request(s) are waiting. Check the Assist tab when you can.`
  }

  const cleaned = stripMarkdown(llmReply || '')
  return cleaned || 'Ask me about your next task, shelf locations, FEFO, markdowns, or customer help requests.'
}

export interface StaffCopilotMessage {
  id: string
  sender: 'AI' | 'USER'
  text: string
  timestamp: string
  actionLabel?: string
  actionTab?: StaffCopilotTab
  taskId?: string
  taskCards?: StaffCopilotTaskCard[]
  helpCards?: StaffCopilotHelpCard[]
}

export function formatStaffCopilotDisplayText(msg: StaffCopilotMessage): string {
  if (msg.sender === 'USER') return msg.text
  if (/[#*\\]|^\s*[-*]\s/m.test(msg.text) && (msg.taskCards?.length || msg.helpCards?.length)) {
    return buildStaffCopilotReplyText(
      { taskCards: msg.taskCards, helpCards: msg.helpCards },
      { query: '', pendingTasks: [], customerRequests: [] },
      msg.text
    )
  }
  if (/[#*\\]/.test(msg.text)) return stripMarkdown(msg.text)
  return msg.text
}
