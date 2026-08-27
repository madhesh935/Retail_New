export type DatabaseRecord = Record<string, unknown>

export interface DatabaseDump {
  database: string
  generatedAt: string
  summary: {
    tableCount: number
    totalRowCount: number
    rowCountByTable: Record<string, number>
  }
  data: Record<string, DatabaseRecord[]>
}
