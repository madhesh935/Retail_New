import React from 'react'
import {
  Layers,
  Users,
  Route,
  Flame,
  Box,
  ListOrdered,
  UserCheck,
  ShieldAlert,
  Camera,
  Compass,
  Check,
  Eye,
  EyeOff,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface TwinLayerState {
  shopperPositions: boolean
  shopperTrails: boolean
  heatmap: boolean
  shelfHealth: boolean
  queueStatus: boolean
  staff: boolean
  incidents: boolean
  cameraCoverage: boolean
  productZones: boolean
}

interface LayerControlPanelProps {
  layers: TwinLayerState
  onToggleLayer: (layerKey: keyof TwinLayerState) => void
  onEnableAll: () => void
  onDisableAll: () => void
}

export const LayerControlPanel: React.FC<LayerControlPanelProps> = ({
  layers,
  onToggleLayer,
  onEnableAll,
  onDisableAll,
}) => {
  const layerItems: {
    key: keyof TwinLayerState
    label: string
    icon: React.ComponentType<{ className?: string }>
    color: string
    countBadge?: string
  }[] = [
    {
      key: 'shopperPositions',
      label: 'Shopper Positions',
      icon: Users,
      color: 'text-cyan-400',
      countBadge: '18 Active',
    },
    {
      key: 'shopperTrails',
      label: 'Shopper Trails',
      icon: Route,
      color: 'text-blue-400',
    },
    {
      key: 'heatmap',
      label: 'Heatmap',
      icon: Flame,
      color: 'text-amber-400',
      countBadge: 'Density',
    },
    {
      key: 'shelfHealth',
      label: 'Shelf Health',
      icon: Box,
      color: 'text-emerald-400',
      countBadge: '9 Shelves',
    },
    {
      key: 'queueStatus',
      label: 'Queue Status',
      icon: ListOrdered,
      color: 'text-rose-400',
      countBadge: '4 Lanes',
    },
    {
      key: 'staff',
      label: 'Staff',
      icon: UserCheck,
      color: 'text-purple-400',
      countBadge: '4 On-Duty',
    },
    {
      key: 'incidents',
      label: 'Incidents',
      icon: ShieldAlert,
      color: 'text-rose-500',
      countBadge: '3 Alerts',
    },
    {
      key: 'cameraCoverage',
      label: 'Camera Coverage',
      icon: Camera,
      color: 'text-cyan-300',
      countBadge: '6 Feeds',
    },
    {
      key: 'productZones',
      label: 'Product Zones',
      icon: Compass,
      color: 'text-indigo-400',
      countBadge: '7 Zones',
    },
  ]

  const activeCount = Object.values(layers).filter(Boolean).length

  return (
    <div className="w-56 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-2xl p-3 select-none flex flex-col gap-2.5 z-20 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900 uppercase">
          <Layers className="h-3.5 w-3.5 text-sky-600" />
          <span>Twin Layers</span>
        </div>
        <span className="text-[10px] font-mono text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded-md border border-sky-200 font-bold">
          {activeCount}/{layerItems.length}
        </span>
      </div>

      {/* Layer Toggle Items List */}
      <div className="space-y-1">
        {layerItems.map((item) => {
          const Icon = item.icon
          const isActive = layers[item.key]

          return (
            <button
              key={item.key}
              onClick={() => onToggleLayer(item.key)}
              className={cn(
                'w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-left transition-all text-xs cursor-pointer group',
                isActive
                  ? 'bg-sky-50 text-slate-900 font-semibold border-l-2 border-sky-600'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-l-2 border-transparent'
              )}
            >
              <div className="flex items-center gap-2 truncate">
                <Icon className={cn('h-3.5 w-3.5 shrink-0', isActive ? item.color : 'text-slate-400')} />
                <span className="truncate text-[11px] font-medium">{item.label}</span>
              </div>

              <div className="flex items-center gap-1 shrink-0 ml-1">
                {item.countBadge && (
                  <span className="text-[9px] text-slate-400 group-hover:text-slate-600 font-mono hidden sm:inline">
                    {item.countBadge}
                  </span>
                )}
                <div
                  className={cn(
                    'h-3.5 w-3.5 rounded flex items-center justify-center border transition-colors',
                    isActive
                      ? 'bg-sky-600 border-sky-600 text-white'
                      : 'border-slate-300 text-transparent'
                  )}
                >
                  <Check className="h-2.5 w-2.5" />
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Quick Select Preset Buttons */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono text-slate-500 font-medium">
        <button
          onClick={onEnableAll}
          className="hover:text-sky-700 transition-colors cursor-pointer"
        >
          Enable All
        </button>
        <span>•</span>
        <button
          onClick={onDisableAll}
          className="hover:text-rose-700 transition-colors cursor-pointer"
        >
          Clear All
        </button>
      </div>
    </div>
  )
}
