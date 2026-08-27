import type { StoreLayout } from '@/customer-pwa/types/navigation'

/** Corridor nodes used before walking to a shelf pin (matches seed shelf_connections). */
const SHELF_CORRIDOR_NODES: Record<string, string> = {
  A1: 'nav-central-1',
  A2: 'nav-central-1',
  A3: 'nav-central-1',
  A4: 'nav-central-1',
  C1: 'nav-south-1',
  C2: 'nav-south-1',
  C3: 'nav-south-1',
  C4: 'nav-south-1',
  C5: 'nav-south-1',
  D1: 'nav-central-2',
  D2: 'nav-central-2',
  B1: 'nav-south-2',
  B2: 'nav-south-2',
  B3: 'nav-south-2',
  B4: 'nav-south-2',
  B5: 'nav-south-2',
  B6: 'nav-south-2',
  D3: 'nav-south-2',
  D4: 'nav-south-2',
  D5: 'nav-south-3',
  D6: 'nav-south-3',
  E1: 'nav-central-3',
  E3: 'nav-central-3',
  F2: 'nav-south-3',
  G1: 'nav-south-3',
  G2: 'nav-south-3',
}

export function normalizeShelfCode(value?: string | null): string | undefined {
  if (!value) return undefined
  const cleaned = value.trim().toUpperCase().replace(/^SHELF\s+/i, '')
  const matches = cleaned.match(/\b([A-Z]\d+)\b/g)
  if (!matches?.length) return undefined
  return matches[matches.length - 1]
}

export function resolveStaffStartNodeId(
  staff: { currentZoneName?: string; currentTaskDescription?: string; name?: string; [key: string]: any } | null | undefined,
  layout: StoreLayout | null
): string | undefined {
  if (!layout) return undefined

  const haystack = [
    staff?.currentZoneName,
    staff?.currentTaskDescription,
    staff?.name,
  ]
    .filter(Boolean)
    .join(' ')

  const shelfMatch = haystack.match(/\b([A-Z]\d+)\b/i)
  if (shelfMatch) {
    const shelf = shelfMatch[1].toUpperCase()
    const corridorId = SHELF_CORRIDOR_NODES[shelf]
    if (corridorId && layout.nodes.some((node) => node.id === corridorId)) {
      return corridorId
    }
    const shelfNode = layout.nodes.find((node) => node.shelfCode?.toUpperCase() === shelf)
    if (shelfNode) return shelfNode.id
  }

  if (haystack.toLowerCase().includes('stockroom') || haystack.toLowerCase().includes('backroom')) {
    return layout.nodes.find((node) => node.id === 'nav-south-3')?.id || layout.entranceNodeId
  }

  return layout.nodes.find((node) => node.id === 'nav-central-2')?.id || layout.entranceNodeId
}

export function formatWalkTime(seconds: number): string {
  if (seconds < 60) return `~${Math.max(15, seconds)} sec`
  const mins = Math.ceil(seconds / 60)
  return mins === 1 ? '~1 min' : `~${mins} min`
}
