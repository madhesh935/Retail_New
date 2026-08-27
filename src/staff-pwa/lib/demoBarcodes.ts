import catalog from '../data/demoBarcodeCatalog.json'
import type { InventoryBatch } from '@/types/expiry.types'
import type { ShelfItem } from '@/types/inventory.types'

export type DemoBarcodeProduct = (typeof catalog.products)[number]
export type DemoBarcodeBatch = (typeof catalog.batches)[number]
export type DemoBarcodeShelf = (typeof catalog.shelves)[number]

export type ScannedProductResult = {
  kind: 'PRODUCT'
  barcode: string
  sku: string
  productId: string
  name: string
  brand: string
  category: string
  shelfCode: string
  aisle: string
  unitPrice: number
  shelfStock: number
  backroomStock: number
  availabilityPct: number
  status: string
  needsReplenishment: boolean
}

export type ScannedBatchResult = {
  kind: 'BATCH'
  barcode: string
  batchId: string
  batch: InventoryBatch
}

export type ScannedShelfResult = {
  kind: 'SHELF'
  barcode: string
  shelfCode: string
  zoneName: string
  sku: string
  name: string
  shelfItem?: ShelfItem
}

export type BarcodeScanResult = ScannedProductResult | ScannedBatchResult | ScannedShelfResult

function normalizeCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, '')
}

function findShelfForSku(shelfItems: ShelfItem[], sku: string, shelfCode?: string): ShelfItem | undefined {
  const bySku = shelfItems.filter((item) => item.sku.toUpperCase() === sku.toUpperCase())
  if (shelfCode) {
    return bySku.find((item) => item.shelfId.toUpperCase() === shelfCode.toUpperCase()) || bySku[0]
  }
  return bySku[0]
}

export function resolveBarcodeScan(
  rawCode: string,
  shelfItems: ShelfItem[],
  inventoryBatches: InventoryBatch[]
): BarcodeScanResult | null {
  const code = normalizeCode(rawCode)
  if (!code) return null

  const productHit = catalog.products.find(
    (entry) => entry.barcode === code || entry.sku.toUpperCase() === code || entry.productId.toUpperCase() === code
  )
  if (productHit) {
    const shelf = findShelfForSku(shelfItems, productHit.sku, productHit.shelfCode)
    const availabilityPct = shelf
      ? Math.round((shelf.currentCount / Math.max(shelf.capacityCount, 1)) * 100)
      : 100
    const status = shelf?.status || 'OPTIMAL'
    return {
      kind: 'PRODUCT',
      barcode: productHit.barcode,
      sku: productHit.sku,
      productId: productHit.productId,
      name: productHit.name,
      brand: shelf?.brand || productHit.brand,
      category: shelf?.category || productHit.category,
      shelfCode: productHit.shelfCode,
      aisle: productHit.aisle,
      unitPrice: shelf?.unitPrice ?? 0,
      shelfStock: shelf?.currentCount ?? 0,
      backroomStock: shelf?.backroomUnits ?? 0,
      availabilityPct,
      status,
      needsReplenishment: status === 'CRITICAL' || status === 'LOW' || status === 'OUT_OF_STOCK',
    }
  }

  const batchHit = catalog.batches.find(
    (entry) =>
      entry.barcode.toUpperCase() === code ||
      entry.batchNumber.toUpperCase() === code ||
      entry.batchId.toUpperCase() === code
  )
  if (batchHit) {
    const batch =
      inventoryBatches.find((item) => item.id === batchHit.batchId) ||
      inventoryBatches.find((item) => item.batchNumber.toUpperCase() === batchHit.batchNumber.toUpperCase())
    if (batch) {
      return { kind: 'BATCH', barcode: batchHit.barcode, batchId: batch.id, batch }
    }
  }

  const shelfHit = catalog.shelves.find(
    (entry) => entry.barcode.toUpperCase() === code || entry.shelfCode.toUpperCase() === code.replace(/^SHELF-?/, '')
  )
  if (shelfHit) {
    const shelfItem = shelfItems.find((item) => item.shelfId.toUpperCase() === shelfHit.shelfCode.toUpperCase())
    return {
      kind: 'SHELF',
      barcode: shelfHit.barcode,
      shelfCode: shelfHit.shelfCode,
      zoneName: shelfHit.zoneName,
      sku: shelfHit.sku,
      name: shelfItem?.productName || shelfHit.name,
      shelfItem,
    }
  }

  // Fallback: live batch / shelf / SKU lookup without catalog entry
  const liveBatch = inventoryBatches.find(
    (item) =>
      item.batchNumber.toUpperCase() === code ||
      item.productSku.toUpperCase() === code ||
      item.id.toUpperCase() === code
  )
  if (liveBatch) {
    return { kind: 'BATCH', barcode: code, batchId: liveBatch.id, batch: liveBatch }
  }

  const liveShelf = shelfItems.find(
    (item) => item.shelfId.toUpperCase() === code || item.sku.toUpperCase() === code
  )
  if (liveShelf) {
    return {
      kind: 'SHELF',
      barcode: code,
      shelfCode: liveShelf.shelfId,
      zoneName: liveShelf.zoneName,
      sku: liveShelf.sku,
      name: liveShelf.productName,
      shelfItem: liveShelf,
    }
  }

  return null
}

export const demoBarcodeProducts = catalog.products
export const demoBarcodeBatches = catalog.batches

export function getDemoBarcodeAssetPath(filename: string): string {
  return `/barcodes/${filename}`
}
