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
  Radio,
  Sparkles,
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
            ? 'bg-[#131D31] text-cyan-300 font-semibold border-l-2 border-cyan-400 shadow-sm'
            : 'text-slate-300 hover:bg-[#1E293B] hover:text-white'
        )}
      >
        <Icon className={cn('h-4 w-4', isActive ? 'text-cyan-400' : 'text-slate-400')} />
        <span className="flex-1 font-sans">{item.label}</span>
        {item.badgeKey === 'activeIncidents' && activeIncidentsCount > 0 && (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950 text-rose-300 border border-rose-500/40">
            {activeIncidentsCount}
          </span>
        )}
        {item.badgeKey === 'stockoutAlerts' && activeStockoutsCount > 0 && (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950 text-rose-300 border border-rose-500/40">
            {activeStockoutsCount}
          </span>
        )}
        {item.badgeKey === 'queueBottlenecks' && congestedLanesCount > 0 && (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-500/40">
            {congestedLanesCount}
          </span>
        )}
        {item.badgeKey === 'aiCopilotActive' && (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/40">
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
        className="fixed inset-0 bg-black/80 backdrop-blur-xs transition-opacity animate-in fade-in-0"
        onClick={() => setMobileNavOpen(false)}
      />

      {/* Drawer Panel */}
      <div className="relative flex flex-col w-72 max-w-[80vw] h-full bg-[#0B0F17] border-r border-[#1E293B] z-10 p-3 shadow-2xl animate-in slide-in-from-left duration-200">
        {/* Brand Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#1E293B] mb-2">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-cyan-950 border border-cyan-500/50 flex items-center justify-center text-cyan-400">
              <Radio className="h-4 w-4 text-cyan-400" />
            </div>
            <div>
              <div className="text-xs font-bold text-white font-mono uppercase">
                Retail Edge OS
              </div>
              <div className="text-[9px] text-cyan-400 font-mono">
                Store Operations Hub
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => setMobileNavOpen(false)}
            className="text-slate-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Links */}
        <div className="flex-1 overflow-y-auto space-y-2 py-2">
          <div className="space-y-1">
            <div className="px-2 py-1 text-[10px] font-semibold text-slate-500 uppercase tracking-wider font-mono">
              Main Operations
            </div>
            {NAV_MAIN_ITEMS.map((item) => renderLink(item))}
          </div>
        </div>
      </div>
    </div>
  )
}
