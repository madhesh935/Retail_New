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
      <DialogContent className="max-w-2xl p-0 overflow-hidden bg-[#0F172A] border-[#1E293B] shadow-2xl">
        {/* Search Header Bar */}
        <DialogHeader className="p-3.5 border-b border-[#1E293B] m-0 bg-[#090D14]">
          <div className="relative flex items-center">
            <Search className="h-4 w-4 text-cyan-400 absolute left-3" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products, shelves (e.g. B4), cameras, checkouts (e.g. C1), zones, staff, incidents..."
              className="pl-9 pr-14 h-10 bg-[#0F172A] border-[#1E293B] text-xs text-white placeholder:text-slate-500 focus-visible:border-cyan-500 focus-visible:ring-1 focus-visible:ring-cyan-500"
              autoFocus
            />
            <div className="absolute right-3 flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-slate-800 text-slate-400 rounded border border-slate-700 select-none">
                ESC
              </kbd>
            </div>
          </div>
        </DialogHeader>

        {/* Results Container */}
        <div className="max-h-[460px] overflow-y-auto p-3 space-y-4 font-mono text-xs">
          {totalResultsCount === 0 ? (
            <div className="py-12 text-center text-slate-500 space-y-2">
              <Package className="h-8 w-8 mx-auto text-slate-700" />
              <div>No retail entities found matching &quot;{searchQuery}&quot;</div>
              <div className="text-[11px] text-slate-600">
                Try searching for &quot;B4&quot;, &quot;C1&quot;, &quot;Milk&quot;, &quot;Produce&quot;, or &quot;Camera&quot;
              </div>
            </div>
          ) : (
            <>
              {/* 1. Shelves Section */}
              {results.shelves && results.shelves.length > 0 && (
                <div className="space-y-1">
                  <div className="px-2 py-1 text-[10px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Box className="h-3 w-3" /> Shelves & Gondolas ({results.shelves.length})
                  </div>
                  {results.shelves.map((shelf) => (
                    <button
                      key={shelf.id}
                      onClick={() => handleSelect(`/inventory?shelf=${shelf.id}`)}
                      className="w-full flex items-center justify-between p-2.5 rounded-lg text-left hover:bg-[#1E293B] text-slate-200 transition-colors cursor-pointer group border border-transparent hover:border-cyan-500/30"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="h-7 w-7 rounded bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-300 font-bold text-xs font-mono">
                          {shelf.code}
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-white font-sans group-hover:text-cyan-300">
                            {shelf.name}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {shelf.aisle} • Compliance: {shelf.complianceScore}%
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            'text-[10px] px-1.5 py-0.5 rounded border',
                            shelf.status === 'LOW'
                              ? 'bg-amber-950 text-amber-300 border-amber-500/40'
                              : shelf.status === 'CRITICAL'
                              ? 'bg-rose-950 text-rose-300 border-rose-500/40'
                              : 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                          )}
                        >
                          {shelf.status}
                        </span>
                        <ArrowRight className="h-3.5 w-3.5 text-slate-600 group-hover:text-cyan-400" />
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* 2. Checkouts Section */}
              {results.checkouts && results.checkouts.length > 0 && (
                <div className="space-y-1">
                  <div className="px-2 py-1 text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <ListOrdered className="h-3 w-3" /> Checkout Lanes ({results.checkouts.length})
                  </div>
                  {results.checkouts.map((lane) => (
                    <button
                      key={lane.id}
                      onClick={() => handleSelect(`/queue-intelligence?lane=${lane.id}`)}
                      className="w-full flex items-center justify-between p-2.5 rounded-lg text-left hover:bg-[#1E293B] text-slate-200 transition-colors cursor-pointer group border border-transparent hover:border-amber-500/30"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="h-7 w-7 rounded bg-amber-950/80 border border-amber-500/40 flex items-center justify-center text-amber-300 font-bold text-xs font-mono">
                          {lane.code}
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-white font-sans group-hover:text-amber-300">
                            {lane.name}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Queue: {lane.queueLength} shoppers • Est. Wait: {lane.waitTimeSeconds}s
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            'text-[10px] px-1.5 py-0.5 rounded border',
                            lane.status === 'CONGESTED'
                              ? 'bg-rose-950 text-rose-300 border-rose-500/40'
                              : 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                          )}
                        >
                          {lane.status}
                        </span>
                        <ArrowRight className="h-3.5 w-3.5 text-slate-600 group-hover:text-amber-400" />
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* 3. Products & SKUs Section */}
              {results.products && results.products.length > 0 && (
                <div className="space-y-1">
                  <div className="px-2 py-1 text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Package className="h-3 w-3" /> Products & SKUs ({results.products.length})
                  </div>
                  {results.products.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(`/inventory?sku=${item.sku}`)}
                      className="w-full flex items-center justify-between p-2.5 rounded-lg text-left hover:bg-[#1E293B] text-slate-200 transition-colors cursor-pointer group border border-transparent hover:border-emerald-500/30"
                    >
                      <div>
                        <div className="text-xs font-semibold text-white font-sans group-hover:text-emerald-300">
                          {item.productName}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {item.sku} • {item.shelfName} • Price: ${item.unitPrice}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-right">
                        <span className="text-[11px] text-cyan-400 font-bold">
                          {item.currentCount} in stock
                        </span>
                        <ArrowRight className="h-3.5 w-3.5 text-slate-600 group-hover:text-emerald-400" />
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* 4. Cameras Section */}
              {results.cameras && results.cameras.length > 0 && (
                <div className="space-y-1">
                  <div className="px-2 py-1 text-[10px] font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Camera className="h-3 w-3" /> Edge RTSP Feeds ({results.cameras.length})
                  </div>
                  {results.cameras.map((cam) => (
                    <button
                      key={cam.id}
                      onClick={() => handleSelect(`/digital-twin?cam=${cam.id}`)}
                      className="w-full flex items-center justify-between p-2 rounded-lg text-left hover:bg-[#1E293B] text-slate-200 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-2">
                        <Camera className="h-3.5 w-3.5 text-blue-400" />
                        <div>
                          <div className="text-xs font-sans text-white">{cam.name}</div>
                          <div className="text-[10px] text-slate-500">{cam.code} • {cam.zoneName}</div>
                        </div>
                      </div>
                      <span className="text-[10px] text-emerald-400 font-bold">{cam.fps} FPS</span>
                    </button>
                  ))}
                </div>
              )}

              {/* 5. Incidents Section */}
              {results.incidents && results.incidents.length > 0 && (
                <div className="space-y-1">
                  <div className="px-2 py-1 text-[10px] font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldAlert className="h-3 w-3" /> Active Alerts ({results.incidents.length})
                  </div>
                  {results.incidents.map((inc) => (
                    <button
                      key={inc.id}
                      onClick={() => handleSelect(`/incidents-actions?incident=${inc.id}`)}
                      className="w-full flex items-center justify-between p-2 rounded-lg text-left hover:bg-[#1E293B] text-slate-200 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <ShieldAlert className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                        <span className="text-xs truncate font-sans text-white">{inc.title}</span>
                      </div>
                      <span className="text-[10px] text-rose-400 uppercase font-mono shrink-0 ml-2">
                        {inc.severity}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* 6. Staff Section */}
              {results.staff && results.staff.length > 0 && (
                <div className="space-y-1">
                  <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="h-3 w-3" /> Staff Members ({results.staff.length})
                  </div>
                  {results.staff.map((st) => (
                    <button
                      key={st.id}
                      onClick={() => handleSelect(`/staff-operations?staff=${st.id}`)}
                      className="w-full flex items-center justify-between p-2 rounded-lg text-left hover:bg-[#1E293B] text-slate-200 transition-colors cursor-pointer group"
                    >
                      <div>
                        <div className="text-xs font-sans text-white">{st.name}</div>
                        <div className="text-[10px] text-slate-500">{st.employeeId} • {st.role.replace(/_/g, ' ')}</div>
                      </div>
                      <span className="text-[10px] text-cyan-400 font-mono">{st.status.replace(/ON_DUTY_/g, '')}</span>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer Key Guide */}
        <div className="p-2.5 border-t border-[#1E293B] bg-[#090D14] flex items-center justify-between text-[11px] text-slate-500 font-mono select-none">
          <span className="flex items-center gap-2">
            <span>Press <kbd className="px-1 py-0.5 text-[9px] bg-slate-800 rounded">↵</kbd> to select</span>
            <span>•</span>
            <span><kbd className="px-1 py-0.5 text-[9px] bg-slate-800 rounded">ESC</kbd> to close</span>
          </span>
          <span className="text-cyan-400 font-semibold">Multi-Entity Real-time Index</span>
        </div>
      </DialogContent>
    </Dialog>
  )
}
