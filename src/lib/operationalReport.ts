import type { AppState } from '@/store/useAppStore'
import type { ReportPeriod } from '@/components/reports-insights/ReportsTimeFilterBar'
import { REPORT_ACTION_HISTORY, REPORT_OPPORTUNITY_ZONES } from '@/lib/reportStaticData'

export type OperationalReportType = 'PERIOD' | 'WEEKLY'
export type OperationalReportFormat = 'PDF' | 'EXCEL'

interface DownloadOperationalReportOptions {
  state: AppState
  reportType: OperationalReportType
  period: ReportPeriod
  format: OperationalReportFormat
  generatedAt?: Date
}

type CellValue = string | number | Date
type CellFormat = 'text' | 'integer' | 'decimal' | 'percent' | 'currency' | 'date'

interface ReportColumn {
  header: string
  width: number
  format?: CellFormat
}

interface ReportSection {
  sheetName: string
  title: string
  description: string
  columns: ReportColumn[]
  rows: CellValue[][]
  emptyMessage: string
}

interface ReportModel {
  title: string
  storeName: string
  storeCode: string
  periodLabel: string
  periodDates: string
  generatedAt: Date
  sourceUpdatedAt: string
  coverageNote: string
  summary: CellValue[][]
  highlights: string[]
  sections: ReportSection[]
}

const PERIOD_LABELS: Record<ReportPeriod, string> = {
  TODAY: 'Today',
  YESTERDAY: 'Yesterday',
  '7_DAYS': 'Last 7 days',
  '30_DAYS': 'Last 30 days',
  CUSTOM: 'Custom dashboard period',
}

const normalizeText = (value: unknown): string =>
  Array.from(String(value ?? ''))
    .filter((character) => {
      const code = character.charCodeAt(0)
      return code === 9 || code === 10 || code === 13 || code >= 32
    })
    .join('')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\u2192/g, '->')
    .replace(/\u2022/g, '-')

const titleCase = (value: unknown): string =>
  normalizeText(value)
    .toLowerCase()
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())

const localIsoDate = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const formatDateTime = (value: string | Date | undefined): string => {
  if (!value) return 'Not available'
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return normalizeText(value)
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

const toDateCell = (value: string | undefined): CellValue => {
  if (!value) return 'Not available'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? normalizeText(value) : date
}

const getReportWindow = (period: ReportPeriod, generatedAt: Date) => {
  const end = new Date(generatedAt)
  const start = new Date(generatedAt)

  if (period === 'YESTERDAY') {
    start.setDate(start.getDate() - 1)
    end.setDate(end.getDate() - 1)
  } else if (period === '7_DAYS') {
    start.setDate(start.getDate() - 6)
  } else if (period === '30_DAYS') {
    start.setDate(start.getDate() - 29)
  }

  if (period === 'CUSTOM') {
    return {
      label: PERIOD_LABELS[period],
      dates: 'Uses the custom period currently selected on the dashboard',
    }
  }

  return {
    label: PERIOD_LABELS[period],
    dates:
      localIsoDate(start) === localIsoDate(end)
        ? localIsoDate(start)
        : `${localIsoDate(start)} to ${localIsoDate(end)}`,
  }
}

const buildReportModel = ({
  state,
  reportType,
  period,
  generatedAt = new Date(),
}: Omit<DownloadOperationalReportOptions, 'format'>): ReportModel => {
  const effectivePeriod: ReportPeriod = reportType === 'WEEKLY' ? '7_DAYS' : period
  const reportWindow = getReportWindow(effectivePeriod, generatedAt)
  const storeName = state.storeInfo?.name || 'RetailEdge Store 01 - Chennai Central'
  const storeCode = state.storeInfo?.code || state.activeStoreId || 'STORE-01'
  const waitSeconds =
    state.systemAverageWaitTimeSeconds || state.storeInfo?.avgCheckoutWaitTimeSeconds || 162
  const waitMinutes = waitSeconds / 60
  const targetWaitMinutes = (state.systemTargetWaitTimeSeconds || 180) / 60
  const capacity = state.storeInfo?.maxCapacity || 0
  const occupancyRate =
    state.storeInfo?.occupancyRate ??
    (capacity > 0 ? ((state.storeInfo?.currentOccupancy || 0) / capacity) * 100 : 0)
  const totalShelfCapacity = state.shelfItems.reduce((sum, item) => sum + item.capacityCount, 0)
  const totalShelfCount = state.shelfItems.reduce((sum, item) => sum + item.currentCount, 0)
  const shelfAvailability =
    totalShelfCapacity > 0 ? Math.min(1, totalShelfCount / totalShelfCapacity) : 0.91
  const resolvedIncidents = state.incidents.filter((item) => item.status === 'RESOLVED').length
  const openIncidents = state.incidents.filter(
    (item) => item.status !== 'RESOLVED' && item.status !== 'DISMISSED'
  ).length
  const onDutyStaff = state.staffMembers.filter((item) => item.status !== 'OFF_DUTY').length
  const availableStaff = state.staffMembers.filter(
    (item) => item.status === 'ON_DUTY_AVAILABLE'
  ).length
  const completedTasks = state.pendingTasks.filter(
    (item) => item.status === 'COMPLETED' || item.status === 'VERIFIED'
  ).length
  const allActions = [...state.queueActionLog, ...REPORT_ACTION_HISTORY]
  const coverageNote =
    reportType === 'WEEKLY'
      ? 'The reporting window is seven days. KPI summaries use the dashboard reporting view; detail tables show the latest synchronized operational snapshot.'
      : 'KPI summaries use the selected dashboard reporting view; detail tables show the latest synchronized operational snapshot.'

  const summary: CellValue[][] = [
    ['Total footfall', state.storeInfo?.todaysTotalFootfall ?? 1_284, 'people', 'Traffic recorded for the dashboard view'],
    ['Current occupancy', state.storeInfo?.currentOccupancy || 0, 'people', `${occupancyRate.toFixed(1)}% of configured capacity`],
    ['Shelf availability', shelfAvailability, 'percent', `${state.inventoryAnalytics.activeStockoutsCount} stock-outs; ${state.inventoryAnalytics.criticalLowStockCount} critical-low items`],
    ['Average queue wait', waitMinutes, 'minutes', `Target ${targetWaitMinutes.toFixed(1)} minutes`],
    ['Open incidents', openIncidents, 'incidents', `${state.criticalIncidentsCount} critical; ${resolvedIncidents} resolved`],
    ['On-duty staff', onDutyStaff, 'people', `${availableStaff} available now`],
    ['Active task records', state.pendingTasks.length, 'tasks', `${completedTasks} completed or verified`],
    ['Recorded AI actions', allActions.length, 'actions', `${state.queueActionLog.length} live actions plus audited history`],
  ]

  const highlights = [
    shelfAvailability < 0.9
      ? `Shelf availability is ${(shelfAvailability * 100).toFixed(1)}%, below the 90% operating threshold; prioritize critical and out-of-stock items.`
      : `Shelf availability is ${(shelfAvailability * 100).toFixed(1)}%, meeting the 90% operating threshold.`,
    waitMinutes > targetWaitMinutes
      ? `Average checkout wait is ${waitMinutes.toFixed(1)} minutes, above the ${targetWaitMinutes.toFixed(1)} minute target.`
      : `Average checkout wait is ${waitMinutes.toFixed(1)} minutes, within the ${targetWaitMinutes.toFixed(1)} minute target.`,
    openIncidents > 0
      ? `${openIncidents} incident${openIncidents === 1 ? '' : 's'} require follow-up; ${state.criticalIncidentsCount} are critical.`
      : 'There are no unresolved incidents in the current operational snapshot.',
    `${availableStaff} of ${onDutyStaff} on-duty staff are currently available; ${state.pendingTasks.length} tasks are recorded in the active task view.`,
  ]

  const sections: ReportSection[] = [
    {
      sheetName: 'Zones',
      title: 'Store and zone status',
      description: 'Operating state, capacity, dwell, and alert exposure by monitored zone.',
      columns: [
        { header: 'Zone code', width: 14 }, { header: 'Zone', width: 24 },
        { header: 'Category', width: 18 }, { header: 'Occupancy', width: 13, format: 'integer' },
        { header: 'Capacity', width: 12, format: 'integer' }, { header: 'Occupancy rate', width: 17, format: 'percent' },
        { header: 'Average dwell (min)', width: 20, format: 'decimal' }, { header: 'Alerts', width: 10, format: 'integer' },
      ],
      rows: state.zones.map((zone) => [
        zone.code, zone.name, zone.category, zone.currentOccupancy, zone.capacity,
        zone.capacity > 0 ? zone.currentOccupancy / zone.capacity : 0,
        zone.avgDwellTimeSeconds / 60, zone.alertCount,
      ]),
      emptyMessage: 'No zone-level records were available when this report was generated.',
    },
    {
      sheetName: 'Inventory',
      title: 'Inventory and shelf health',
      description: 'Shelf-level stock, availability, planogram compliance, and AI confidence.',
      columns: [
        { header: 'SKU', width: 18 }, { header: 'Product', width: 32 }, { header: 'Zone', width: 22 },
        { header: 'Shelf', width: 18 }, { header: 'Current units', width: 14, format: 'integer' },
        { header: 'Capacity', width: 12, format: 'integer' }, { header: 'Availability', width: 15, format: 'percent' },
        { header: 'Status', width: 16 }, { header: 'Planogram', width: 14, format: 'percent' },
        { header: 'AI confidence', width: 16, format: 'percent' }, { header: 'Last restocked', width: 22, format: 'date' },
      ],
      rows: [...state.shelfItems]
        .sort((a, b) => {
          const rank = { OUT_OF_STOCK: 0, CRITICAL: 1, LOW: 2, MISPLACED: 3, OPTIMAL: 4 }
          return rank[a.status] - rank[b.status]
        })
        .map((item) => [
          item.sku, item.productName, item.zoneName, item.shelfName || item.shelfId,
          item.currentCount, item.capacityCount,
          item.capacityCount > 0 ? item.currentCount / item.capacityCount : 0,
          titleCase(item.status), item.planogramComplianceScore / 100,
          item.confidenceScore <= 1 ? item.confidenceScore : item.confidenceScore / 100,
          toDateCell(item.lastRestocked),
        ]),
      emptyMessage: 'No shelf-level inventory records were available when this report was generated.',
    },
    {
      sheetName: 'Queues',
      title: 'Checkout queue performance',
      description: 'Current lane status, queue length, wait time, throughput, and ten-minute forecast.',
      columns: [
        { header: 'Lane', width: 12 }, { header: 'Type', width: 22 }, { header: 'Status', width: 14 },
        { header: 'Queue length', width: 15, format: 'integer' }, { header: 'Current wait (min)', width: 18, format: 'decimal' },
        { header: 'Items / min', width: 14, format: 'decimal' }, { header: 'Forecast queue', width: 16, format: 'integer' },
        { header: 'Forecast wait (min)', width: 19, format: 'decimal' }, { header: 'Assigned staff', width: 24 },
      ],
      rows: [...state.queues].sort((a, b) => a.laneNumber - b.laneNumber).map((lane) => [
        `Lane ${lane.laneNumber}`, titleCase(lane.laneType), titleCase(lane.status),
        lane.currentQueueLength, lane.currentWaitTimeSeconds / 60,
        lane.processingRateItemsPerMinute, lane.predictedQueueIn10Min,
        lane.predictedWaitTimeIn10MinSeconds / 60, lane.assignedStaffName || 'Unassigned',
      ]),
      emptyMessage: 'No checkout lane records were available when this report was generated.',
    },
    {
      sheetName: 'Incidents',
      title: 'Incidents and resolutions',
      description: 'Every incident in the synchronized snapshot, including ownership and recommended action.',
      columns: [
        { header: 'Detected', width: 22, format: 'date' }, { header: 'Severity', width: 13 },
        { header: 'Status', width: 16 }, { header: 'Incident', width: 34 }, { header: 'Zone', width: 22 },
        { header: 'Assigned to', width: 22 }, { header: 'AI recommendation', width: 38 }, { header: 'Resolved at', width: 22, format: 'date' },
      ],
      rows: [...state.incidents]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .map((item) => [
          toDateCell(item.timestamp), titleCase(item.severity), titleCase(item.status), item.title,
          item.zoneName, item.assignedToStaffName || 'Unassigned',
          item.aiRecommendation?.actionTitle || 'No AI recommendation recorded',
          item.resolvedAt ? toDateCell(item.resolvedAt) : 'Open',
        ]),
      emptyMessage: 'No incidents were recorded in the synchronized report snapshot.',
    },
    {
      sheetName: 'Staff',
      title: 'Staff deployment',
      description: 'Current availability, assignment, shift, efficiency, and completed work.',
      columns: [
        { header: 'Staff member', width: 24 }, { header: 'Employee ID', width: 16 }, { header: 'Role', width: 22 },
        { header: 'Status', width: 22 }, { header: 'Zone', width: 22 }, { header: 'Shift start', width: 14 },
        { header: 'Shift end', width: 14 }, { header: 'Efficiency', width: 14, format: 'percent' },
        { header: 'Tasks done', width: 13, format: 'integer' }, { header: 'Current task', width: 36 },
      ],
      rows: [...state.staffMembers].sort((a, b) => a.name.localeCompare(b.name)).map((item) => [
        item.name, item.employeeId, titleCase(item.role), titleCase(item.status),
        item.currentZoneName || 'Not assigned', item.shiftStartTime, item.shiftEndTime,
        item.efficiencyScore / 100, item.tasksCompletedToday,
        item.currentTaskDescription || 'No active task recorded',
      ]),
      emptyMessage: 'No staff records were available when this report was generated.',
    },
    {
      sheetName: 'Tasks',
      title: 'Task register',
      description: 'Task priority, ownership, ETA, product context, and verification.',
      columns: [
        { header: 'Task', width: 34 }, { header: 'Priority', width: 14 }, { header: 'Status', width: 18 },
        { header: 'Zone', width: 22 }, { header: 'Assigned to', width: 22 },
        { header: 'ETA (min)', width: 12, format: 'integer' }, { header: 'Product', width: 30 },
        { header: 'Verification', width: 22 }, { header: 'Created', width: 22, format: 'date' },
      ],
      rows: [...state.pendingTasks]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .map((item) => [
          item.title, titleCase(item.priority), titleCase(item.status), item.zoneName,
          item.assignedStaffName || 'Unassigned', item.etaMinutes,
          item.productName || item.productSku || 'Not applicable',
          item.verificationType ? titleCase(item.verificationType) : 'Not yet verified',
          toDateCell(item.createdAt),
        ]),
      emptyMessage: 'No task records were available when this report was generated.',
    },
    {
      sheetName: 'AI Actions',
      title: 'AI action history and measurable effect',
      description: 'Before-and-after evidence for live and audited operational interventions.',
      columns: [
        { header: 'Time', width: 10 }, { header: 'Category', width: 15 }, { header: 'Action', width: 38 },
        { header: 'Target', width: 28 }, { header: 'Assigned staff', width: 24 },
        { header: 'Before', width: 34 }, { header: 'After', width: 34 },
        { header: 'Operational gain', width: 40 }, { header: 'Verification', width: 38 },
      ],
      rows: allActions.map((item) => [
        item.time, titleCase(item.category), item.actionTitle, item.targetEntity, item.assignedStaff,
        `${item.beforeMetricLabel}: ${item.beforeValue}`,
        `${item.afterMetricLabel}: ${item.afterValue}`,
        item.operationalGain, item.verificationMethod,
      ]),
      emptyMessage: 'No AI action history was available when this report was generated.',
    },
    {
      sheetName: 'Opportunity Risks',
      title: 'Lost-opportunity risk ranking',
      description: 'Priority zones ranked by preventable lost-sale exposure and contributing causes.',
      columns: [
        { header: 'Rank', width: 9, format: 'integer' }, { header: 'Zone', width: 26 }, { header: 'Risk', width: 12 },
        { header: 'Availability', width: 15, format: 'percent' }, { header: 'Key SKU', width: 42 },
        { header: 'Contributing causes', width: 58 }, { header: 'Estimated loss prevented', width: 24 },
      ],
      rows: REPORT_OPPORTUNITY_ZONES.map((item) => [
        item.rank, item.zoneName, titleCase(item.riskLevel), item.availability / 100,
        item.keySku, item.causes.join('; '), item.estimatedLossPrevented,
      ]),
      emptyMessage: 'No lost-opportunity analysis was available when this report was generated.',
    },
    {
      sheetName: 'Footfall Trend',
      title: 'Hourly footfall trend',
      description: 'Observed and predicted traffic by hour.',
      columns: [
        { header: 'Hour', width: 14 }, { header: 'Observed', width: 14, format: 'integer' },
        { header: 'Predicted', width: 14, format: 'integer' }, { header: 'Variance', width: 14, format: 'percent' },
      ],
      rows: (state.storeState?.hourlyFootfall || []).map((item) => [
        item.hour, item.count, item.predicted,
        item.predicted > 0 ? (item.count - item.predicted) / item.predicted : 0,
      ]),
      emptyMessage: 'No hourly footfall series was available when this report was generated.',
    },
    {
      sheetName: 'Queue Forecast',
      title: 'Queue wait forecast',
      description: 'Regular and express wait forecasts from the current data model.',
      columns: [
        { header: 'Time / lane', width: 20 }, { header: 'Regular average (min)', width: 22, format: 'decimal' },
        { header: 'Express average (min)', width: 22, format: 'decimal' },
      ],
      rows: state.predictedWaitTimeCurve.map((item) => [
        item.time, item.regularAvgSec / 60, item.expressAvgSec / 60,
      ]),
      emptyMessage: 'No queue wait forecast series was available when this report was generated.',
    },
  ]

  return {
    title: reportType === 'WEEKLY' ? 'Weekly Executive Operational Report' : `${reportWindow.label} Operational Report`,
    storeName,
    storeCode,
    periodLabel: reportWindow.label,
    periodDates: reportWindow.dates,
    generatedAt,
    sourceUpdatedAt: formatDateTime(state.storeInfo?.lastUpdated),
    coverageNote,
    summary,
    highlights,
    sections,
  }
}

const getRowsOrEmpty = (section: ReportSection): CellValue[][] => {
  if (section.rows.length > 0) return section.rows
  return [[section.emptyMessage, ...Array(Math.max(0, section.columns.length - 1)).fill('')]]
}

const formatCellForPdf = (value: CellValue, format: CellFormat = 'text'): string => {
  if (value instanceof Date) return formatDateTime(value)
  if (typeof value !== 'number') return normalizeText(value)
  if (format === 'percent') return `${(value * 100).toFixed(1)}%`
  if (format === 'currency') return `$${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
  if (format === 'integer') return Math.round(value).toLocaleString('en-US')
  return value.toLocaleString('en-US', { maximumFractionDigits: 1 })
}

const triggerBlobDownload = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  anchor.style.display = 'none'
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000)
}

const getFileName = (
  model: ReportModel,
  reportType: OperationalReportType,
  period: ReportPeriod,
  format: OperationalReportFormat
) => {
  const reportLabel = reportType === 'WEEKLY' ? 'weekly' : period.toLowerCase().replaceAll('_', '-')
  const safeStoreCode = normalizeText(model.storeCode).replace(/[^a-z0-9-]+/gi, '-').replace(/^-|-$/g, '')
  const extension = format === 'PDF' ? 'pdf' : 'xlsx'
  return `RetailEdge-${safeStoreCode}-${reportLabel}-report-${localIsoDate(model.generatedAt)}.${extension}`
}

const exportPdf = async (model: ReportModel, fileName: string) => {
  const [{ jsPDF }, autoTableModule] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ])
  const autoTable = autoTableModule.default
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4', compress: true })
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 34

  const drawPageHeader = () => {
    doc.setFillColor(15, 23, 42)
    doc.rect(0, 0, pageWidth, 46, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.text('RetailEdge Management Intelligence', margin, 20)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.text(`${normalizeText(model.storeName)} | ${normalizeText(model.periodDates)}`, margin, 34)
  }

  drawPageHeader()
  doc.setTextColor(15, 23, 42)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.text(normalizeText(model.title), margin, 80)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(71, 85, 105)
  doc.text(`Store: ${normalizeText(model.storeName)} (${normalizeText(model.storeCode)})`, margin, 98)
  doc.text(`Generated: ${formatDateTime(model.generatedAt)} | Source updated: ${normalizeText(model.sourceUpdatedAt)}`, margin, 112)
  doc.text(normalizeText(model.coverageNote), margin, 128, { maxWidth: pageWidth - margin * 2 })

  autoTable(doc, {
    startY: 150,
    head: [['Executive metric', 'Value', 'Unit', 'Meaning']],
    body: model.summary.map((row) => row.map((cell) => formatCellForPdf(cell))),
    margin: { left: margin, right: margin, top: 58, bottom: 28 },
    theme: 'grid',
    styles: { font: 'helvetica', fontSize: 7.5, cellPadding: 4, overflow: 'linebreak' },
    headStyles: { fillColor: [3, 105, 161], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    didDrawPage: drawPageHeader,
  })

  let cursorY = (doc as typeof doc & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY || 250
  cursorY += 18
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(15, 23, 42)
  doc.text('Management highlights', margin, cursorY)
  cursorY += 14
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  model.highlights.forEach((highlight) => {
    const lines = doc.splitTextToSize(`- ${normalizeText(highlight)}`, pageWidth - margin * 2)
    doc.text(lines, margin, cursorY)
    cursorY += lines.length * 10 + 3
  })

  model.sections.forEach((section, index) => {
    if (cursorY > pageHeight - 110) {
      doc.addPage()
      drawPageHeader()
      cursorY = 70
    } else {
      cursorY += 18
    }

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.setTextColor(15, 23, 42)
    doc.text(`${index + 2}. ${normalizeText(section.title)}`, margin, cursorY)
    cursorY += 12
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(71, 85, 105)
    doc.text(normalizeText(section.description), margin, cursorY, { maxWidth: pageWidth - margin * 2 })

    autoTable(doc, {
      startY: cursorY + 8,
      head: [section.columns.map((column) => column.header)],
      body: getRowsOrEmpty(section).map((row) =>
        row.map((cell, columnIndex) =>
          formatCellForPdf(cell, section.columns[columnIndex]?.format)
        )
      ),
      margin: { left: margin, right: margin, top: 58, bottom: 28 },
      theme: 'grid',
      styles: { font: 'helvetica', fontSize: 6.3, cellPadding: 3, overflow: 'linebreak', valign: 'top' },
      headStyles: { fillColor: [30, 41, 59], textColor: 255, fontStyle: 'bold', fontSize: 6.5 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      didDrawPage: drawPageHeader,
    })
    cursorY = (doc as typeof doc & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY || cursorY + 80
  })

  const totalPages = doc.getNumberOfPages()
  for (let page = 1; page <= totalPages; page += 1) {
    doc.setPage(page)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(100, 116, 139)
    doc.text(`Internal operational use | Page ${page} of ${totalPages}`, pageWidth - margin, pageHeight - 12, { align: 'right' })
  }

  const blob = doc.output('blob')
  triggerBlobDownload(blob, fileName)
}

const exportExcel = async (model: ReportModel, fileName: string) => {
  const excelModule = await import('exceljs')
  const ExcelJS = excelModule.default
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'RetailEdge Reports & Insights'
  workbook.created = model.generatedAt
  workbook.modified = model.generatedAt
  workbook.company = 'RetailEdge'
  workbook.subject = model.title

  const addTitleBlock = (sheet: import('exceljs').Worksheet, title: string, description: string, columnCount: number) => {
    sheet.mergeCells(1, 1, 1, columnCount)
    const titleCell = sheet.getCell(1, 1)
    titleCell.value = title
    titleCell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 18 }
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } }
    titleCell.alignment = { vertical: 'middle' }
    sheet.getRow(1).height = 30

    sheet.mergeCells(2, 1, 2, columnCount)
    const descriptionCell = sheet.getCell(2, 1)
    descriptionCell.value = description
    descriptionCell.font = { color: { argb: 'FF475569' }, italic: true, size: 10 }
    descriptionCell.alignment = { wrapText: true, vertical: 'middle' }
    sheet.getRow(2).height = 28

    const metadata = [
      ['Store', model.storeName, 'Store code', model.storeCode],
      ['Reporting window', model.periodDates, 'Generated', model.generatedAt],
      ['Source updated', model.sourceUpdatedAt, 'Report type', model.periodLabel],
    ]
    metadata.forEach((row, rowOffset) => {
      const excelRow = sheet.getRow(3 + rowOffset)
      excelRow.values = row
      excelRow.getCell(1).font = { bold: true, color: { argb: 'FF334155' } }
      excelRow.getCell(3).font = { bold: true, color: { argb: 'FF334155' } }
      excelRow.getCell(4).numFmt = rowOffset === 1 ? 'yyyy-mm-dd hh:mm' : '@'
    })
  }

  const summarySheet = workbook.addWorksheet('Summary', {
    views: [{ showGridLines: false, state: 'frozen', ySplit: 7 }],
    pageSetup: { orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
  })
  summarySheet.columns = [
    { width: 26 }, { width: 18 }, { width: 16 }, { width: 68 },
  ]
  addTitleBlock(summarySheet, model.title, model.coverageNote, 4)
  const summaryHeaderRow = summarySheet.getRow(7)
  summaryHeaderRow.values = ['Executive metric', 'Value', 'Unit', 'Meaning']
  model.summary.forEach((row) => summarySheet.addRow(row))
  const shelfSummaryRow = summarySheet.getRow(10)
  shelfSummaryRow.getCell(2).numFmt = '0.0%'
  const highlightsStart = summarySheet.rowCount + 2
  summarySheet.mergeCells(highlightsStart, 1, highlightsStart, 4)
  summarySheet.getCell(highlightsStart, 1).value = 'Management highlights'
  summarySheet.getCell(highlightsStart, 1).font = { bold: true, color: { argb: 'FFFFFFFF' } }
  summarySheet.getCell(highlightsStart, 1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0369A1' } }
  model.highlights.forEach((highlight) => {
    const row = summarySheet.addRow([`- ${normalizeText(highlight)}`])
    summarySheet.mergeCells(row.number, 1, row.number, 4)
    row.getCell(1).alignment = { wrapText: true, vertical: 'top' }
    row.height = 28
  })
  summarySheet.autoFilter = { from: { row: 7, column: 1 }, to: { row: 7 + model.summary.length, column: 4 } }

  const styleHeader = (row: import('exceljs').Row) => {
    row.height = 24
    row.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10 }
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0369A1' } }
      cell.alignment = { wrapText: true, vertical: 'middle' }
      cell.border = { bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } } }
    })
  }
  styleHeader(summaryHeaderRow)

  model.sections.forEach((section) => {
    const sheet = workbook.addWorksheet(section.sheetName, {
      views: [{ showGridLines: false, state: 'frozen', ySplit: 7 }],
      pageSetup: { orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
    })
    section.columns.forEach((column, index) => {
      sheet.getColumn(index + 1).width = Math.min(60, Math.max(10, column.width))
    })
    addTitleBlock(sheet, section.title, section.description, section.columns.length)
    const headerRow = sheet.getRow(7)
    headerRow.values = section.columns.map((column) => column.header)
    styleHeader(headerRow)

    getRowsOrEmpty(section).forEach((values, rowIndex) => {
      const row = sheet.addRow(values.map((value) => value instanceof Date ? value : normalizeText(value)))
      row.alignment = { vertical: 'top', wrapText: true }
      if (rowIndex % 2 === 1) {
        row.eachCell((cell) => {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } }
        })
      }
      section.columns.forEach((column, columnIndex) => {
        const cell = row.getCell(columnIndex + 1)
        if (typeof values[columnIndex] === 'number') cell.value = values[columnIndex] as number
        if (values[columnIndex] instanceof Date) cell.value = values[columnIndex] as Date
        if (column.format === 'integer') cell.numFmt = '#,##0'
        if (column.format === 'decimal') cell.numFmt = '#,##0.0'
        if (column.format === 'percent') cell.numFmt = '0.0%'
        if (column.format === 'currency') cell.numFmt = '$#,##0'
        if (column.format === 'date') cell.numFmt = 'yyyy-mm-dd hh:mm'
      })
    })
    sheet.autoFilter = {
      from: { row: 7, column: 1 },
      to: { row: Math.max(7, sheet.rowCount), column: section.columns.length },
    }
  })

  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer as ArrayBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  triggerBlobDownload(blob, fileName)
}

export async function downloadOperationalReport(
  options: DownloadOperationalReportOptions
): Promise<string> {
  const generatedAt = options.generatedAt || new Date()
  const model = buildReportModel({ ...options, generatedAt })
  const fileName = getFileName(model, options.reportType, options.period, options.format)

  if (options.format === 'PDF') {
    await exportPdf(model, fileName)
  } else {
    await exportExcel(model, fileName)
  }

  return fileName
}
