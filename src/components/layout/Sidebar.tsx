import React from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Box,
  PackageCheck,
  Users,
  ListOrdered,
  UserCheck,
  ShieldAlert,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Radio,
  Sparkles,
  Settings,
} from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { NAV_MAIN_ITEMS } from '@/lib/constants'
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

const iconMap = {
  LayoutDashboard,
  Box,
  PackageCheck,
  Users,
  ListOrdered,
  UserCheck,
  ShieldAlert,
  Sparkles,
  BarChart3,
  Settings,
}

export const Sidebar: React.FC = () => {
  const isSidebarCollapsed = useAppStore((s) => s.isSidebarCollapsed)
  const toggleSidebar = useAppStore((s) => s.toggleSidebar)
  const activeIncidentsCount = useAppStore((s) => s.activeIncidentsCount)
  const congestedLanesCount = useAppStore((s) => s.congestedLanesCount)
  const activeStockoutsCount = useAppStore((s) => s.inventoryAnalytics.activeStockoutsCount)
  const pendingTasksCount = useAppStore((s) => s.pendingTasks.length)
  const overallHealth = useAppStore((s) => s.overallHealth)
  const location = useLocation()
  const navigate = useNavigate()

  // Hotkey handlers (Alt + 1..9)
  NAV_MAIN_ITEMS.forEach((item) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useKeyboardShortcut({
      key: item.shortcut,
      alt: true,
      handler: () => navigate(item.path),
    })
  })

  const getBadge = (key: string | null) => {
    if (!key) return null
    if (key === 'isLiveTwin') {
      return (
        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-sky-50 text-sky-700 border border-sky-200">
          3D
        </span>
      )
    }
    if (key === 'aiCopilotActive') {
      return (
        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-purple-50 text-purple-700 border border-purple-200">
          AI
        </span>
      )
    }
    if (key === 'stockoutAlerts' && activeStockoutsCount > 0) {
      return (
        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-rose-50 text-rose-700 border border-rose-200">
          {activeStockoutsCount}
        </span>
      )
    }
    if (key === 'queueBottlenecks' && congestedLanesCount > 0) {
      return (
        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-50 text-amber-700 border border-amber-200">
          {congestedLanesCount}
        </span>
      )
    }
    if (key === 'pendingStaffTasks' && pendingTasksCount > 0) {
      return (
        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
          {pendingTasksCount}
        </span>
      )
    }
    if (key === 'activeIncidents' && activeIncidentsCount > 0) {
      return (
        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-rose-50 text-rose-700 border border-rose-200 animate-pulse">
          {activeIncidentsCount}
        </span>
      )
    }
    return null
  }

  const renderNavLink = (item: (typeof NAV_MAIN_ITEMS)[0]) => {
    const Icon = iconMap[item.iconName as keyof typeof iconMap] || LayoutDashboard
    const isActive =
      location.pathname === item.path ||
      (item.path === '/command-center' && location.pathname === '/')
    const badge = getBadge(item.badgeKey)

    const linkContent = (
      <NavLink
        to={item.path}
        className={cn(
          'flex items-center rounded-lg text-xs transition-all duration-150 relative group cursor-pointer font-sans select-none',
          isSidebarCollapsed
            ? 'h-10 w-10 mx-auto justify-center'
            : 'gap-3 px-3 py-2',
          isActive
            ? 'bg-sky-50 text-sky-700 font-semibold border border-sky-200 shadow-xs'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
        )}
      >
        {/* Left active sky indicator */}
        {isActive && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-sky-600 rounded-r-full shadow-xs" />
        )}

        <Icon
          className={cn(
            'h-4 w-4 shrink-0 transition-colors',
            isActive ? 'text-sky-600' : 'text-slate-500 group-hover:text-slate-800'
          )}
        />

        {!isSidebarCollapsed && (
          <div className="flex-1 flex items-center justify-between min-w-0">
            <span className="truncate font-medium">{item.label}</span>
            <div className="flex items-center gap-1.5 shrink-0 ml-2">
              {badge}
              <span className="text-[10px] text-slate-400 font-mono hidden group-hover:inline opacity-80">
                Alt+{item.shortcut}
              </span>
            </div>
          </div>
        )}
      </NavLink>
    )

    if (isSidebarCollapsed) {
      return (
        <TooltipProvider key={item.id} delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
            <TooltipContent side="right" className="bg-white border-slate-200 text-slate-900 text-xs font-mono shadow-md">
              <div className="flex items-center gap-2">
                <span>{item.label}</span>
                <span className="text-[10px] text-slate-400">Alt+{item.shortcut}</span>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    }

    return <div key={item.id}>{linkContent}</div>
  }

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col bg-white border-r border-slate-200 h-full transition-all duration-200 ease-in-out shrink-0 select-none z-20 shadow-xs',
        isSidebarCollapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Brand Header */}
      <div
        className={cn(
          'border-b border-slate-200 flex items-center transition-all duration-200',
          isSidebarCollapsed ? 'h-14 justify-center' : 'p-4 justify-between'
        )}
      >
        {!isSidebarCollapsed ? (
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-7 w-7 min-w-7 min-h-7 aspect-square rounded-lg bg-gradient-to-tr from-sky-600 to-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0 font-mono">
              RE
            </div>
            <div className="min-w-0">
              <h1 className="text-xs font-bold text-slate-900 tracking-wide uppercase truncate">
                Retail Edge OS
              </h1>
              <div className="text-[10px] text-sky-600 font-mono flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span>v2.4.0 · Enterprise</span>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={toggleSidebar}
            className="h-8 w-8 min-w-8 min-h-8 rounded-lg bg-gradient-to-tr from-sky-600 to-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs font-mono hover:scale-105 transition-transform cursor-pointer"
            title="Expand Sidebar (Click to expand)"
            aria-label="Expand sidebar"
          >
            RE
          </button>
        )}

        {!isSidebarCollapsed && (
          <button
            onClick={toggleSidebar}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer hidden lg:block shrink-0"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-2 py-2.5 space-y-1 font-sans">
        {!isSidebarCollapsed && (
          <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Operations
          </div>
        )}
        {NAV_MAIN_ITEMS.map((item) => renderNavLink(item))}
      </div>

      {/* Footer Edge Telemetry Status */}
      <div className="p-3 border-t border-slate-200 bg-slate-50/70">
        {!isSidebarCollapsed ? (
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
            <span className="flex items-center gap-1.5">
              <Radio className="h-3 w-3 text-sky-600" />
              <span>Edge AI Node</span>
            </span>
            <span className="text-emerald-700 font-bold">178 FPS Total</span>
          </div>
        ) : (
          <div className="flex justify-center">
            <Radio className="h-3.5 w-3.5 text-sky-600" />
          </div>
        )}
      </div>
    </aside>
  )
}
