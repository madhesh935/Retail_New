import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Box,
  PackageCheck,
  Users,
  ListOrdered,
  UserCheck,
  ShieldAlert,
  BarChart3,
  Cpu,
  X,
  Sparkles,
  Database,
  Settings,
} from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { NAV_MAIN_ITEMS } from '@/lib/constants'
import { Button } from '@/components/ui/button'
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
  Cpu,
  Database,
  Settings,
}

export const MobileNavDrawer: React.FC = () => {
  const isMobileNavOpen = useAppStore((s) => s.isMobileNavOpen)
  const setMobileNavOpen = useAppStore((s) => s.setMobileNavOpen)
  const activeIncidentsCount = useAppStore((s) => s.activeIncidentsCount)
  const activeStockoutsCount = useAppStore((s) => s.inventoryAnalytics.activeStockoutsCount)
  const congestedLanesCount = useAppStore((s) => s.congestedLanesCount)
  const location = useLocation()

  if (!isMobileNavOpen) return null

  const handleNavClick = () => {
    setMobileNavOpen(false)
  }

  const renderLink = (item: (typeof NAV_MAIN_ITEMS)[0]) => {
    const Icon = iconMap[item.iconName as keyof typeof iconMap] || LayoutDashboard
    const isActive =
      location.pathname === item.path ||
      (item.path === '/command-center' && location.pathname === '/')

    return (
      <NavLink
        key={item.id}
        to={item.path}
        onClick={handleNavClick}
        className={cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all select-none',
          isActive
            ? 'erp-nav-active font-semibold'
            : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 border border-transparent'
        )}
      >
        <Icon className={cn('h-4 w-4', isActive ? 'text-sky-700' : 'text-slate-400')} />
        <span className="flex-1 font-sans">{item.label}</span>
        {item.badgeKey === 'activeIncidents' && activeIncidentsCount > 0 && (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-50 text-rose-700 border border-rose-200">
            {activeIncidentsCount}
          </span>
        )}
        {item.badgeKey === 'stockoutAlerts' && activeStockoutsCount > 0 && (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-50 text-rose-700 border border-rose-200">
            {activeStockoutsCount}
          </span>
        )}
        {item.badgeKey === 'queueBottlenecks' && congestedLanesCount > 0 && (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-50 text-amber-700 border border-amber-200">
            {congestedLanesCount}
          </span>
        )}
        {item.badgeKey === 'aiCopilotActive' && (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-sky-50 text-sky-700 border border-sky-200">
            AI
          </span>
        )}
      </NavLink>
    )
  }

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in-0"
        onClick={() => setMobileNavOpen(false)}
      />

      {/* Drawer Panel */}
      <div className="relative flex flex-col w-72 max-w-[80vw] h-full erp-shell-sidebar z-10 p-3 shadow-2xl animate-in slide-in-from-left duration-200">
        {/* Brand Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-2">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl erp-brand-mark text-white flex items-center justify-center font-extrabold text-[11px]">
              RE
            </div>
            <div>
              <div className="text-[13px] font-extrabold text-slate-900 tracking-tight">
                Retail Edge
              </div>
              <div className="text-[10px] text-sky-700 font-semibold">
                Store Operations Hub
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => setMobileNavOpen(false)}
            className="text-slate-400 hover:text-slate-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Links */}
        <div className="flex-1 overflow-y-auto space-y-2 py-2">
          <div className="space-y-1">
            <div className="px-2 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider font-sans">
              Main Operations
            </div>
            {NAV_MAIN_ITEMS.map((item) => renderLink(item))}
          </div>
        </div>
      </div>
    </div>
  )
}
