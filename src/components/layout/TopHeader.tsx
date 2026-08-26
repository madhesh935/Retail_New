import React from 'react'
import {
  Search,
  Camera,
  Radio,
  Cpu,
  ShieldCheck,
  Menu,
  Bell,
  ChevronDown,
  Server,
  CheckCircle2,
} from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { StoreSelector } from './StoreSelector'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { formatTimeAgo } from '@/lib/utils'

export const TopHeader: React.FC = () => {
  const cameraSummary = useAppStore((s) => s.cameraSummary)
  const cloudSync = useAppStore((s) => s.cloudSync)
  const edgeDevice = useAppStore((s) => s.edgeDevice)
  const connectionState = useAppStore((s) => s.connectionState)
  const lastTimestamp = useAppStore((s) => s.lastTelemetryTimestamp)
  const unreadCount = useAppStore((s) => s.unreadNotificationCount)
  const setMobileNavOpen = useAppStore((s) => s.setMobileNavOpen)
  const setGlobalSearchOpen = useAppStore((s) => s.setGlobalSearchOpen)
  const setNotificationDrawerOpen = useAppStore((s) => s.setNotificationDrawerOpen)

  const onlineCameras = cameraSummary.onlineCameras
  const totalCameras = cameraSummary.totalCameras

  // Real connection status computation
  const isConnected = connectionState === 'CONNECTED'
  const isReconnecting = connectionState === 'RECONNECTING' || connectionState === 'CONNECTING'
  const now = Date.now()
  const lastPacketAgeMs = lastTimestamp ? now - new Date(lastTimestamp).getTime() : 0
  const isStale = isConnected && lastPacketAgeMs > 25000

  return (
    <header className="h-14 border-b border-[#1E293B] bg-[#0F172A] px-4 flex items-center justify-between gap-4 sticky top-0 z-30 select-none font-sans">
      {/* Left Section: Mobile Menu Trigger, Store Selector & Live Indicator */}
      <div className="flex items-center gap-3 shrink-0">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setMobileNavOpen(true)}
          className="text-slate-400 hover:text-white lg:hidden cursor-pointer shrink-0"
          title="Open Navigation Menu"
        >
          <Menu className="h-4 w-4" />
        </Button>

        {/* Store Selector */}
        <StoreSelector />

        {/* Real Connection State Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#090D14] border border-[#1E293B] text-xs shrink-0 whitespace-nowrap">
          {isConnected && !isStale ? (
            <>
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
              </span>
              <span className="font-bold text-cyan-300 tracking-wide">LIVE</span>
            </>
          ) : isReconnecting ? (
            <>
              <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
              <span className="font-bold text-amber-300">Reconnecting</span>
            </>
          ) : isStale ? (
            <>
              <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
              <span className="font-bold text-amber-300">Data Stale</span>
            </>
          ) : (
            <>
              <span className="h-2 w-2 rounded-full bg-rose-500 shrink-0" />
              <span className="font-bold text-rose-300">Offline</span>
            </>
          )}
        </div>
      </div>

      {/* Middle Operational Status Elements */}
      <div className="hidden lg:flex items-center gap-3 text-xs text-slate-300 shrink-0 whitespace-nowrap">
        {/* Cameras Status */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#090D14] border border-[#1E293B]">
          <Camera className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
          <span>
            <strong className="text-white font-mono">{onlineCameras}/{totalCameras}</strong> Cameras Online
          </span>
        </div>

        {/* Edge Node Online - Popover for hardware infrastructure */}
        <Popover>
          <PopoverTrigger asChild>
            <button className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#090D14] border border-[#1E293B] hover:border-cyan-500/40 hover:text-cyan-300 transition-colors cursor-pointer text-xs">
              <Cpu className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
              <span>Edge Node Online</span>
              <ChevronDown className="h-3 w-3 text-slate-500" />
            </button>
          </PopoverTrigger>
          <PopoverContent align="center" className="w-68 bg-[#0F172A] border-[#1E293B] p-3.5 shadow-2xl text-xs space-y-2.5">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-2">
              <div className="flex items-center gap-2">
                <Server className="h-4 w-4 text-cyan-400" />
                <span className="font-bold text-white">Edge Node Telemetry</span>
              </div>
              <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold">
                Connected
              </span>
            </div>
            <div className="space-y-1.5 text-slate-300 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-400">Edge Device:</span>
                <span className="font-medium text-white">{edgeDevice?.deviceName || edgeDevice?.model || 'NVIDIA Jetson Orin NX'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Processing:</span>
                <span className="text-cyan-300">Local TensorRT & DeepStream</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Throughput:</span>
                <span className="font-mono text-emerald-400">{edgeDevice?.fpsTotalInference.toFixed(0) || 178} FPS</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Last Heartbeat:</span>
                <span className="text-slate-200">{lastTimestamp ? formatTimeAgo(lastTimestamp) : '2 sec ago'}</span>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Local Processing */}
        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#090D14] border border-[#1E293B] text-slate-300">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
          <span>Local Processing</span>
        </div>

        {/* Cloud Sync */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#090D14] border border-[#1E293B]">
          <Radio className="h-3.5 w-3.5 text-blue-400 shrink-0" />
          <span>
            Cloud Sync <strong className="font-mono text-blue-300">{cloudSync.latencyMs}ms</strong>
          </span>
        </div>
      </div>

      {/* Right Section: Global Search, Notifications, Manager Profile */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Global Search Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setGlobalSearchOpen(true)}
          className="h-8 border-[#1E293B] bg-[#090D14] hover:bg-[#131D31] text-slate-300 text-xs flex items-center gap-2 px-3 cursor-pointer shrink-0 whitespace-nowrap"
        >
          <Search className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <span className="hidden md:inline text-slate-400">Search operations...</span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-800 rounded border border-slate-700">
            Ctrl+K
          </kbd>
        </Button>

        {/* Notification Drawer Trigger */}
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => setNotificationDrawerOpen(true)}
          className="relative border-[#1E293B] bg-[#090D14] hover:bg-[#131D31] text-slate-300 cursor-pointer shrink-0"
          title="Open Operational Incident Drawer"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white font-mono shadow-sm animate-pulse">
              {unreadCount}
            </span>
          )}
        </Button>

        {/* Manager Profile & Avatar Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 p-1 pl-1.5 pr-2.5 gap-2 text-slate-200 hover:bg-[#1E293B] border border-transparent hover:border-[#1E293B] cursor-pointer shrink-0"
            >
              <Avatar className="h-6 w-6 shrink-0">
                <AvatarFallback className="bg-cyan-950 text-cyan-300 border border-cyan-500/40 text-[10px] font-bold">
                  MV
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col text-left hidden sm:block whitespace-nowrap">
                <span className="text-xs font-semibold text-white leading-none block">
                  Marcus Vance
                </span>
                <span className="text-[10px] text-slate-400 leading-tight block mt-0.5">
                  Store Director
                </span>
              </div>
              <ChevronDown className="h-3 w-3 text-slate-500 hidden sm:block shrink-0" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56 bg-[#0F172A] border-[#1E293B] shadow-2xl p-1.5">
            <DropdownMenuLabel className="text-[11px] text-slate-400 font-semibold px-2 py-1">
              STORE DIRECTOR
            </DropdownMenuLabel>
            <div className="px-2 py-1 text-xs text-slate-200">
              <p className="font-semibold text-white">Marcus Vance</p>
              <p className="text-[11px] text-slate-400">marcus.vance@retail-edge.io</p>
              <div className="flex items-center gap-1.5 text-[10px] text-cyan-400 mt-1.5 bg-[#090D14] p-1.5 rounded border border-[#1E293B]">
                <ShieldCheck className="h-3 w-3 text-emerald-400" />
                <span>Shift Active: 12:00 - 20:00</span>
              </div>
            </div>
            <DropdownMenuSeparator className="bg-[#1E293B]" />
            <DropdownMenuItem className="text-xs text-rose-400 focus:bg-rose-950/40 cursor-pointer">
              Sign Out Station
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
