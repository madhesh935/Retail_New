import React, { useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  Braces,
  Database,
  Download,
  RefreshCw,
  Rows3,
  Search,
  Table2,
} from 'lucide-react'
import { realStoreApi } from '@/services/api/realStoreApi'
import type { DatabaseDump, DatabaseRecord } from '@/types/database'

const PAGE_SIZE = 25

const readableName = (value: string) =>
  value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')

const searchableValue = (value: unknown): string => {
  if (value === null || value === undefined) return ''
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

const displayValue = (value: unknown) => {
  if (value === null || value === undefined) {
    return <span className="text-slate-400 italic">null</span>
  }
  if (typeof value === 'boolean') {
    return (
      <span className={`inline-flex rounded-md px-1.5 py-0.5 text-[10px] font-bold ${value ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
        {String(value)}
      </span>
    )
  }
  if (typeof value === 'object') {
    const json = JSON.stringify(value)
    return <span className="font-mono text-[11px] text-violet-700" title={json}>{json}</span>
  }
  return <span title={String(value)}>{String(value)}</span>
}

export const DatabaseExplorerPage: React.FC = () => {
  const [dump, setDump] = useState<DatabaseDump | null>(null)
  const [selectedTable, setSelectedTable] = useState('')
  const [selectedRow, setSelectedRow] = useState<DatabaseRecord | null>(null)
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadDatabase = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await realStoreApi.getAllDatabaseData()
      setDump(response)
      setSelectedTable((current) => {
        if (current && response.data[current]) return current
        return response.data.store_info ? 'store_info' : Object.keys(response.data)[0] || ''
      })
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load database data.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadDatabase()
  }, [])

  const tableNames = useMemo(
    () => Object.keys(dump?.data || {}).sort((a, b) => a.localeCompare(b)),
    [dump]
  )
  const rows = dump?.data[selectedTable] || []
  const columns = useMemo(() => {
    const names = new Set<string>()
    rows.forEach((row) => Object.keys(row).forEach((column) => names.add(column)))
    return Array.from(names)
  }, [rows])
  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    if (!normalizedQuery) return rows
    return rows.filter((row) =>
      Object.values(row).some((value) => searchableValue(value).toLowerCase().includes(normalizedQuery))
    )
  }, [query, rows])
  const pageCount = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE))
  const visibleRows = filteredRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  useEffect(() => {
    setPage(1)
    setSelectedRow(null)
  }, [query, selectedTable])

  useEffect(() => {
    if (page > pageCount) setPage(pageCount)
  }, [page, pageCount])

  const downloadSnapshot = () => {
    if (!dump) return
    const blob = new Blob([JSON.stringify(dump, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `retail-database-${new Date().toISOString().slice(0, 10)}.json`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  if (isLoading && !dump) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex items-center gap-3 text-sm font-semibold text-slate-600">
          <RefreshCw className="h-5 w-5 animate-spin text-sky-600" />
          Loading database snapshot…
        </div>
      </div>
    )
  }

  if (error && !dump) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center">
        <AlertCircle className="mx-auto h-8 w-8 text-rose-600" />
        <h1 className="mt-3 text-base font-bold text-rose-900">Database unavailable</h1>
        <p className="mt-1 text-xs text-rose-700">{error}</p>
        <button onClick={loadDatabase} className="mt-4 rounded-lg bg-rose-700 px-4 py-2 text-xs font-bold text-white hover:bg-rose-800">
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4 font-sans">
      <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-sky-600" />
            <h1 className="text-base font-extrabold tracking-tight text-slate-900">Database Explorer</h1>
            <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-700">
              Read only
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">Browse every table and record in the live {dump?.database || 'SQLite'} database.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={downloadSnapshot} className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 hover:bg-slate-50">
            <Download className="h-3.5 w-3.5" /> Export JSON
          </button>
          <button onClick={loadDatabase} disabled={isLoading} className="inline-flex h-9 items-center gap-2 rounded-lg bg-sky-600 px-3 text-xs font-bold text-white hover:bg-sky-700 disabled:opacity-60">
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          <AlertCircle className="h-4 w-4 shrink-0" /> Refresh failed; showing the previous snapshot. {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500"><span>Database</span><Database className="h-4 w-4 text-sky-600" /></div>
          <div className="mt-2 text-xl font-extrabold uppercase text-slate-900">{dump?.database}</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500"><span>Tables</span><Table2 className="h-4 w-4 text-violet-600" /></div>
          <div className="mt-2 text-xl font-extrabold text-slate-900">{dump?.summary.tableCount.toLocaleString()}</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500"><span>Total records</span><Rows3 className="h-4 w-4 text-emerald-600" /></div>
          <div className="mt-2 text-xl font-extrabold text-slate-900">{dump?.summary.totalRowCount.toLocaleString()}</div>
        </div>
      </div>

      <div className="grid min-h-[560px] grid-cols-1 gap-4 lg:grid-cols-[250px_minmax(0,1fr)]">
        <aside className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs">
          <div className="border-b border-slate-200 px-3 py-3">
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Database tables</div>
          </div>
          <div className="max-h-[620px] overflow-y-auto p-2">
            {tableNames.map((tableName) => (
              <button
                key={tableName}
                onClick={() => setSelectedTable(tableName)}
                className={`mb-1 flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs transition-colors ${selectedTable === tableName ? 'bg-sky-50 text-sky-800 ring-1 ring-sky-200' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
              >
                <Table2 className={`h-3.5 w-3.5 shrink-0 ${selectedTable === tableName ? 'text-sky-600' : 'text-slate-400'}`} />
                <span className="min-w-0 flex-1 truncate font-semibold">{readableName(tableName)}</span>
                <span className="rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-500">{dump?.summary.rowCountByTable[tableName] || 0}</span>
              </button>
            ))}
          </div>
        </aside>

        <section className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">{readableName(selectedTable)}</h2>
              <p className="mt-0.5 font-mono text-[10px] text-slate-400">{selectedTable} · {filteredRows.length} record{filteredRows.length === 1 ? '' : 's'}</p>
            </div>
            <label className="relative block w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search this table…"
                className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs text-slate-800 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              />
            </label>
          </div>

          {columns.length === 0 ? (
            <div className="flex min-h-80 flex-col items-center justify-center text-center">
              <Table2 className="h-8 w-8 text-slate-300" />
              <p className="mt-3 text-sm font-bold text-slate-600">This table is empty</p>
              <p className="mt-1 text-xs text-slate-400">There are currently no records to display.</p>
            </div>
          ) : filteredRows.length === 0 ? (
            <div className="flex min-h-80 flex-col items-center justify-center text-center">
              <Search className="h-8 w-8 text-slate-300" />
              <p className="mt-3 text-sm font-bold text-slate-600">No matching records</p>
              <button onClick={() => setQuery('')} className="mt-2 text-xs font-bold text-sky-700 hover:underline">Clear search</button>
            </div>
          ) : (
            <>
              <div className="max-h-[500px] overflow-auto">
                <table className="min-w-full border-collapse text-left text-xs">
                  <thead className="sticky top-0 z-10 bg-slate-50 shadow-[0_1px_0_0_rgb(226,232,240)]">
                    <tr>
                      <th className="w-12 whitespace-nowrap px-3 py-2.5 font-mono text-[10px] font-bold uppercase text-slate-400">#</th>
                      {columns.map((column) => (
                        <th key={column} className="max-w-64 whitespace-nowrap px-3 py-2.5 font-mono text-[10px] font-bold uppercase tracking-wide text-slate-500">{column}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {visibleRows.map((row, rowIndex) => (
                      <tr key={`${selectedTable}-${(page - 1) * PAGE_SIZE + rowIndex}`} onClick={() => setSelectedRow(row)} className="cursor-pointer hover:bg-sky-50/60">
                        <td className="whitespace-nowrap px-3 py-2.5 font-mono text-[10px] text-slate-400">{(page - 1) * PAGE_SIZE + rowIndex + 1}</td>
                        {columns.map((column) => (
                          <td key={column} className="max-w-64 truncate whitespace-nowrap px-3 py-2.5 text-slate-700">{displayValue(row[column])}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between border-t border-slate-200 px-3 py-2.5 text-[11px] text-slate-500">
                <span>Page {page} of {pageCount}</span>
                <div className="flex gap-1.5">
                  <button disabled={page === 1} onClick={() => setPage((current) => current - 1)} className="rounded-md border border-slate-200 px-2.5 py-1 font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40">Previous</button>
                  <button disabled={page === pageCount} onClick={() => setPage((current) => current + 1)} className="rounded-md border border-slate-200 px-2.5 py-1 font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40">Next</button>
                </div>
              </div>
            </>
          )}
        </section>
      </div>

      {selectedRow && (
        <section className="rounded-xl border border-violet-200 bg-white shadow-2xs">
          <div className="flex items-center justify-between border-b border-violet-100 px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900"><Braces className="h-4 w-4 text-violet-600" /> Selected record</div>
            <button onClick={() => setSelectedRow(null)} className="text-xs font-bold text-slate-500 hover:text-slate-900">Close</button>
          </div>
          <pre className="max-h-96 overflow-auto p-4 font-mono text-[11px] leading-relaxed text-slate-700">{JSON.stringify(selectedRow, null, 2)}</pre>
        </section>
      )}

      <div className="text-right font-mono text-[10px] text-slate-400">
        Snapshot: {dump?.generatedAt ? new Date(dump.generatedAt).toLocaleString() : '—'} · /api/v1/database/all
      </div>
    </div>
  )
}
