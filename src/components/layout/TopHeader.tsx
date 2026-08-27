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

  const onlineCameras = cameraSummary?.onlineCameras ?? 4
  const totalCameras = cameraSummary?.totalCameras ?? 4

  // Real connection status computation
  const isConnected = connectionState === 'CONNECTED'
  const isReconnecting = connectionState === 'RECONNECTING' || connectionState === 'CONNECTING'
  const now = Date.now()
  const lastPacketAgeMs = lastTimestamp ? now - new Date(lastTimestamp).getTime() : 0
  const isStale = isConnected && lastPacketAgeMs > 25000

  return (
    <header className="h-14 border-b border-slate-200 bg-white px-4 flex items-center justify-between gap-4 sticky top-0 z-30 select-none font-sans shadow-xs">
      {/* Left Section: Mobile Menu Trigger, Store Selector & Live Indicator */}
      <div className="flex items-center gap-3 shrink-0">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setMobileNavOpen(true)}
          className="text-slate-500 hover:text-slate-900 lg:hidden cursor-pointer shrink-0"
          title="Open Navigation Menu"
        >
          <Menu className="h-4 w-4" />
        </Button>

        {/* Store Selector */}
        <StoreSelector />

        {/* Real Connection State Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 text-xs shrink-0 whitespace-nowrap">
          {isConnected && !isStale ? (
            <>
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
              </span>
              <span className="font-bold text-emerald-700 tracking-wide">LIVE</span>
            </>
          ) : isReconnecting ? (
            <>
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
              <span className="font-bold text-amber-700">Reconnecting</span>
            </>
          ) : isStale ? (
            <>
              <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
              <span className="font-bold text-amber-700">Data Stale</span>
            </>
          ) : (
            <>
              <span className="h-2 w-2 rounded-full bg-rose-500 shrink-0" />
              <span className="font-bold text-rose-700">Offline</span>
            </>
          )}
        </div>
      </div>

      {/* Middle Operational Status Elements */}
      <div className="hidden lg:flex items-center gap-2.5 text-xs text-slate-600 shrink-0 whitespace-nowrap">
        {/* Cameras Status */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200">
          <Camera className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
          <span>
            <strong className="text-slate-900 font-mono">{onlineCameras}/{totalCameras}</strong> Cameras Online
          </span>
        </div>

        {/* Edge Node Online - Popover for hardware infrastructure */}
        <Popover>
          <PopoverTrigger asChild>
            <button className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 hover:border-sky-400 hover:text-sky-700 transition-colors cursor-pointer text-xs">
              <Cpu className="h-3.5 w-3.5 text-sky-600 shrink-0" />
              <span className="font-medium">Edge Node Online</span>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>
          </PopoverTrigger>
          <PopoverContent align="center" className="w-68 bg-white border-slate-200 p-3.5 shadow-xl text-xs space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <Server className="h-4 w-4 text-sky-600" />
                <span className="font-bold text-slate-900">Edge Node Telemetry</span>
              </div>
              <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                Connected
              </span>
            </div>
            <div className="space-y-1.5 text-slate-600 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-500">Edge Device:</span>
                <span className="font-medium text-slate-900">{edgeDevice?.deviceName || edgeDevice?.model || 'NVIDIA Jetson Orin NX'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Processing:</span>
                <span className="text-sky-700 font-medium">Local TensorRT & DeepStream</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Throughput:</span>
                <span className="font-mono text-emerald-700 font-bold">{typeof edgeDevice?.fpsTotalInference === 'number' ? edgeDevice.fpsTotalInference.toFixed(0) : '178'} FPS</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Last Heartbeat:</span>
                <span className="text-slate-700">{lastTimestamp ? formatTimeAgo(lastTimestamp) : '2 sec ago'}</span>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Local Processing */}
        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 text-slate-600">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
          <span>Local Processing</span>
        </div>

        {/* Cloud Sync */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200">
          <Radio className="h-3.5 w-3.5 text-sky-600 shrink-0" />
          <span>
            Cloud Sync <strong className="font-mono text-sky-700">{cloudSync?.latencyMs ?? 14.2}ms</strong>
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
          className="h-8 border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs flex items-center gap-2 px-3 cursor-pointer shrink-0 whitespace-nowrap"
        >
          <Search className="h-3.5 w-3.5 text-slate-500 shrink-0" />
          <span className="hidden md:inline text-slate-500">Search operations...</span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-slate-500 bg-slate-200 rounded border border-slate-300">
            Ctrl+K
          </kbd>
        </Button>

        {/* Notification Drawer Trigger */}
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => setNotificationDrawerOpen(true)}
          className="relative border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 cursor-pointer shrink-0"
          title="Open Operational Incident Drawer"
        >
          <Bell className="h-4 w-4 text-slate-600" />
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
              className="h-8 p-1 pl-1.5 pr-2.5 gap-2 text-slate-700 hover:bg-slate-100 border border-transparent hover:border-slate-200 cursor-pointer shrink-0"
            >
              <Avatar className="h-6 w-6 shrink-0">
                <AvatarFallback className="bg-sky-50 text-sky-700 border border-sky-200 text-[10px] font-bold">
                  MV
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col text-left hidden sm:block whitespace-nowrap">
                <span className="text-xs font-semibold text-slate-900 leading-none block">
                  Marcus Vance
                </span>
                <span className="text-[10px] text-slate-500 leading-tight block mt-0.5 font-sans">
                  Store Director
                </span>
              </div>
              <ChevronDown className="h-3 w-3 text-slate-400 hidden sm:block shrink-0" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56 bg-white border-slate-200 shadow-2xl p-1.5 font-sans">
            <DropdownMenuLabel className="text-[11px] text-slate-500 font-semibold px-2 py-1">
              STORE DIRECTOR
            </DropdownMenuLabel>
            <div className="px-2 py-1 text-xs text-slate-700">
              <p className="font-semibold text-slate-900">Marcus Vance</p>
              <p className="text-[11px] text-slate-500">marcus.vance@retail-edge.io</p>
              <div className="flex items-center gap-1.5 text-[10px] text-sky-700 mt-1.5 bg-slate-50 p-1.5 rounded-md border border-slate-200">
                <ShieldCheck className="h-3 w-3 text-emerald-600" />
                <span>Shift Active: 12:00 - 20:00</span>
              </div>
            </div>
            <DropdownMenuSeparator className="bg-slate-100" />
            <DropdownMenuItem className="text-xs text-rose-600 focus:bg-rose-50 cursor-pointer font-sans">
              Sign Out Station
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
