import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  Camera,
  Layers,
  Package,
  Users,
  ShieldAlert,
  ListOrdered,
  Store,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Box,
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useAppStore } from '@/store/useAppStore'
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut'
import { MOCK_SHELVES_LIST, MOCK_CHECKOUTS_LIST } from '@/services/mock/mockData'
import { NAV_MAIN_ITEMS } from '@/lib/constants'
import { cn } from '@/lib/utils'

export const GlobalSearchModal: React.FC = () => {
  const isGlobalSearchOpen = useAppStore((s) => s.isGlobalSearchOpen)
  const setGlobalSearchOpen = useAppStore((s) => s.setGlobalSearchOpen)
  const cameras = useAppStore((s) => s.cameras)
  const zones = useAppStore((s) => s.zones)
  const shelfItems = useAppStore((s) => s.shelfItems)
  const staffMembers = useAppStore((s) => s.staffMembers)
  const incidents = useAppStore((s) => s.incidents)

  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()

  // Cmd+K / Ctrl+K keyboard shortcut
  useKeyboardShortcut({
    key: 'k',
    ctrlOrCmd: true,
    handler: () => setGlobalSearchOpen(!isGlobalSearchOpen),
  })

  // Multi-entity search indexing
  const results = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()

    if (!q) {
      return {
        shelves: MOCK_SHELVES_LIST.slice(0, 3),
        checkouts: MOCK_CHECKOUTS_LIST.slice(0, 2),
        products: shelfItems.slice(0, 2),
        cameras: cameras.slice(0, 2),
        incidents: incidents.slice(0, 2),
      }
    }

    // 1. Shelves (Searching "B4" specifically finds Shelf B4 — Beverage Zone)
    const matchedShelves = MOCK_SHELVES_LIST.filter(
      (s) =>
        s.code.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q) ||
        s.zoneName.toLowerCase().includes(q) ||
        s.aisle.toLowerCase().includes(q)
    )

    // 2. Products / SKUs
    const matchedProducts = shelfItems.filter(
      (p) =>
        p.productName.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.shelfName.toLowerCase().includes(q)
    )

    // 3. Checkouts / Lanes (e.g. C1, C2, Express)
    const matchedCheckouts = MOCK_CHECKOUTS_LIST.filter(
      (c) =>
        c.code.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.type.toLowerCase().includes(q) ||
        `lane ${c.laneNumber}`.includes(q)
    )

    // 4. Cameras
    const matchedCameras = cameras.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.zoneName.toLowerCase().includes(q) ||
        c.modelLoaded.toLowerCase().includes(q)
    )

    // 5. Zones
    const matchedZones = zones.filter(
      (z) =>
        z.name.toLowerCase().includes(q) ||
        z.category.toLowerCase().includes(q) ||
        z.code.toLowerCase().includes(q)
    )

    // 6. Staff
    const matchedStaff = staffMembers.filter(
      (st) =>
        st.name.toLowerCase().includes(q) ||
        st.role.toLowerCase().includes(q) ||
        st.employeeId.toLowerCase().includes(q) ||
        (st.currentTaskDescription && st.currentTaskDescription.toLowerCase().includes(q))
    )

    // 7. Incidents
    const matchedIncidents = incidents.filter(
      (inc) =>
        inc.title.toLowerCase().includes(q) ||
        inc.description.toLowerCase().includes(q) ||
        inc.category.toLowerCase().includes(q) ||
        inc.zoneName.toLowerCase().includes(q)
    )

    // 8. Navigation Pages
    const matchedPages = NAV_MAIN_ITEMS.filter(
      (p) => p.label.toLowerCase().includes(q) || p.path.toLowerCase().includes(q)
    )

    return {
      shelves: matchedShelves,
      products: matchedProducts,
      checkouts: matchedCheckouts,
      cameras: matchedCameras,
      zones: matchedZones,
      staff: matchedStaff,
      incidents: matchedIncidents,
      pages: matchedPages,
    }
  }, [searchQuery, cameras, zones, shelfItems, staffMembers, incidents])

  const handleSelect = (path: string) => {
    setGlobalSearchOpen(false)
    setSearchQuery('')
    navigate(path)
  }

  const totalResultsCount =
    (results.shelves?.length || 0) +
    (results.products?.length || 0) +
    (results.checkouts?.length || 0) +
    (results.cameras?.length || 0) +
    (results.zones?.length || 0) +
    (results.staff?.length || 0) +
    (results.incidents?.length || 0) +
    (results.pages?.length || 0)

  return (
    <Dialog open={isGlobalSearchOpen} onOpenChange={setGlobalSearchOpen}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden bg-white border-slate-200 shadow-2xl">
        {/* Search Header Bar */}
        <DialogHeader className="p-3.5 border-b border-slate-100 m-0 bg-slate-50">
          <div className="relative flex items-center">
            <Search className="h-4 w-4 text-sky-600 absolute left-3" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products, shelves (e.g. B4), cameras, checkouts (e.g. C1), zones, staff, incidents..."
              className="pl-9 pr-14 h-10 bg-white border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus-visible:border-sky-500 focus-visible:ring-1 focus-visible:ring-sky-500"
              autoFocus
            />
            <div className="absolute right-3 flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-slate-100 text-slate-500 rounded border border-slate-200 select-none">
                ESC
              </kbd>
            </div>
          </div>
        </DialogHeader>

        {/* Results Container */}
        <div className="max-h-[460px] overflow-y-auto p-3 space-y-4 font-mono text-xs">
          {totalResultsCount === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <Package className="h-8 w-8 mx-auto text-slate-300" />
              <div>No retail entities found matching &quot;{searchQuery}&quot;</div>
              <div className="text-[11px] text-slate-500 font-sans">
                Try searching for &quot;B4&quot;, &quot;C1&quot;, &quot;Milk&quot;, &quot;Produce&quot;, or &quot;Camera&quot;
              </div>
            </div>
          ) : (
            <>
              {/* 1. Shelves Section */}
              {results.shelves && results.shelves.length > 0 && (
                <div className="space-y-1">
                  <div className="px-2 py-1 text-[10px] font-bold text-sky-700 uppercase tracking-wider flex items-center gap-1.5 font-sans">
                    <Box className="h-3 w-3" /> Shelves &amp; Gondolas ({results.shelves.length})
                  </div>
                  {results.shelves.map((shelf) => (
                    <button
                      key={shelf.id}
                      onClick={() => handleSelect(`/inventory?shelf=${shelf.id}`)}
                      className="w-full flex items-center justify-between p-2.5 rounded-lg text-left hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer group border border-transparent hover:border-slate-200"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="h-7 w-7 rounded-md bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-700 font-bold text-xs font-mono">
                          {shelf.code}
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-slate-900 font-sans group-hover:text-sky-700">
                            {shelf.name}
                          </div>
                          <div className="text-[10px] text-slate-500 font-sans">
                            {shelf.aisle} • Compliance: {shelf.complianceScore}%
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            'text-[10px] px-1.5 py-0.5 rounded border',
                            shelf.status === 'LOW'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : shelf.status === 'CRITICAL'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          )}
                        >
                          {shelf.status}
                        </span>
                        <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-sky-600" />
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* 2. Checkouts Section */}
              {results.checkouts && results.checkouts.length > 0 && (
                <div className="space-y-1">
                  <div className="px-2 py-1 text-[10px] font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5 font-sans">
                    <ListOrdered className="h-3 w-3" /> Checkout Lanes ({results.checkouts.length})
                  </div>
                  {results.checkouts.map((lane) => (
                    <button
                      key={lane.id}
                      onClick={() => handleSelect(`/queue-intelligence?lane=${lane.id}`)}
                      className="w-full flex items-center justify-between p-2.5 rounded-lg text-left hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer group border border-transparent hover:border-slate-200"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="h-7 w-7 rounded-md bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-800 font-bold text-xs font-mono">
                          {lane.code}
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-slate-900 font-sans group-hover:text-amber-800">
                            {lane.name}
                          </div>
                          <div className="text-[10px] text-slate-500 font-sans">
                            Queue: {lane.queueLength} shoppers • Est. Wait: {lane.waitTimeSeconds}s
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            'text-[10px] px-1.5 py-0.5 rounded border',
                            lane.status === 'CONGESTED'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          )}
                        >
                          {lane.status}
                        </span>
                        <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-amber-700" />
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* 3. Products & SKUs Section */}
              {results.products && results.products.length > 0 && (
                <div className="space-y-1">
                  <div className="px-2 py-1 text-[10px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5 font-sans">
                    <Package className="h-3 w-3" /> Products &amp; SKUs ({results.products.length})
                  </div>
                  {results.products.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(`/inventory?sku=${item.sku}`)}
                      className="w-full flex items-center justify-between p-2.5 rounded-lg text-left hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer group border border-transparent hover:border-slate-200"
                    >
                      <div>
                        <div className="text-xs font-semibold text-slate-900 font-sans group-hover:text-emerald-700">
                          {item.productName}
                        </div>
                        <div className="text-[10px] text-slate-500 font-sans">
                          {item.sku} • {item.shelfName} • Price: ${item.unitPrice}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-right">
                        <span className="text-[11px] text-emerald-700 font-bold">
                          {item.currentCount} in stock
                        </span>
                        <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-emerald-600" />
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* 4. Cameras Section */}
              {results.cameras && results.cameras.length > 0 && (
                <div className="space-y-1">
                  <div className="px-2 py-1 text-[10px] font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1.5 font-sans">
                    <Camera className="h-3 w-3" /> Edge RTSP Feeds ({results.cameras.length})
                  </div>
                  {results.cameras.map((cam) => (
                    <button
                      key={cam.id}
                      onClick={() => handleSelect(`/digital-twin?cam=${cam.id}`)}
                      className="w-full flex items-center justify-between p-2 rounded-lg text-left hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-2">
                        <Camera className="h-3.5 w-3.5 text-sky-600" />
                        <div>
                          <div className="text-xs font-sans text-slate-900 font-semibold">{cam.name}</div>
                          <div className="text-[10px] text-slate-500 font-sans">{cam.code} • {cam.zoneName}</div>
                        </div>
                      </div>
                      <span className="text-[10px] text-emerald-700 font-bold">{cam.fps} FPS</span>
                    </button>
                  ))}
                </div>
              )}

              {/* 5. Incidents Section */}
              {results.incidents && results.incidents.length > 0 && (
                <div className="space-y-1">
                  <div className="px-2 py-1 text-[10px] font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1.5 font-sans">
                    <ShieldAlert className="h-3 w-3" /> Active Alerts ({results.incidents.length})
                  </div>
                  {results.incidents.map((inc) => (
                    <button
                      key={inc.id}
                      onClick={() => handleSelect(`/incidents-actions?incident=${inc.id}`)}
                      className="w-full flex items-center justify-between p-2 rounded-lg text-left hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <ShieldAlert className="h-3.5 w-3.5 text-rose-600 shrink-0" />
                        <span className="text-xs truncate font-sans text-slate-900">{inc.title}</span>
                      </div>
                      <span className="text-[10px] text-rose-700 uppercase font-mono shrink-0 ml-2 font-bold">
                        {inc.severity}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* 6. Staff Section */}
              {results.staff && results.staff.length > 0 && (
                <div className="space-y-1">
                  <div className="px-2 py-1 text-[10px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 font-sans">
                    <Users className="h-3 w-3" /> Staff Members ({results.staff.length})
                  </div>
                  {results.staff.map((st) => (
                    <button
                      key={st.id}
                      onClick={() => handleSelect(`/staff-operations?staff=${st.id}`)}
                      className="w-full flex items-center justify-between p-2 rounded-lg text-left hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer group"
                    >
                      <div>
                        <div className="text-xs font-sans text-slate-900 font-semibold">{st.name}</div>
                        <div className="text-[10px] text-slate-500 font-sans">{st.employeeId} • {st.role.replace(/_/g, ' ')}</div>
                      </div>
                      <span className="text-[10px] text-sky-700 font-mono font-bold">{st.status.replace(/ON_DUTY_/g, '')}</span>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer Key Guide */}
        <div className="p-2.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-[11px] text-slate-500 font-sans select-none">
          <span className="flex items-center gap-2">
            <span>Press <kbd className="px-1 py-0.5 text-[9px] bg-white border border-slate-200 rounded text-slate-700 font-mono">↵</kbd> to select</span>
            <span>•</span>
            <span><kbd className="px-1 py-0.5 text-[9px] bg-white border border-slate-200 rounded text-slate-700 font-mono">ESC</kbd> to close</span>
          </span>
          <span className="text-sky-700 font-semibold font-mono">Multi-Entity Real-time Index</span>
        </div>
      </DialogContent>
    </Dialog>
  )
}
