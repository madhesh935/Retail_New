import React from 'react'
import {
  Layers,
  Users,
  Flame,
  Box,
  ListOrdered,
  UserCheck,
  ShieldAlert,
  Camera,
  Compass,
  Check,
  X,
  ClipboardList,
  HandHelping,
} from 'lucide-react'
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
  tasks: boolean
  customerRequests: boolean
}

interface LayerControlPanelProps {
  layers: TwinLayerState
  onToggleLayer: (layerKey: keyof TwinLayerState) => void
  onEnableAll: () => void
  onDisableAll: () => void
  onClose: () => void
  /** Real counts from store — omit when unavailable */
  counts?: Partial<Record<keyof TwinLayerState, number | null>>
}

export const LayerControlPanel: React.FC<LayerControlPanelProps> = ({
  layers,
  onToggleLayer,
  onEnableAll,
  onDisableAll,
  onClose,
  counts = {},
}) => {
  const layerItems: {
    key: keyof TwinLayerState
    label: string
    icon: React.ComponentType<{ className?: string }>
    color: string
  }[] = [
    { key: 'shopperPositions', label: 'People', icon: Users, color: 'text-slate-600' },
    { key: 'heatmap', label: 'Heatmap', icon: Flame, color: 'text-amber-600' },
    { key: 'shelfHealth', label: 'Shelf Health', icon: Box, color: 'text-emerald-600' },
    { key: 'queueStatus', label: 'Queues', icon: ListOrdered, color: 'text-rose-600' },
    { key: 'staff', label: 'Staff', icon: UserCheck, color: 'text-teal-600' },
    { key: 'tasks', label: 'Tasks', icon: ClipboardList, color: 'text-sky-600' },
    { key: 'incidents', label: 'Incidents', icon: ShieldAlert, color: 'text-amber-700' },
    { key: 'customerRequests', label: 'Customer Requests', icon: HandHelping, color: 'text-indigo-600' },
    { key: 'cameraCoverage', label: 'Cameras', icon: Camera, color: 'text-slate-500' },
    { key: 'productZones', label: 'Zones', icon: Compass, color: 'text-slate-600' },
  ]

  const activeCount = Object.values(layers).filter(Boolean).length

  return (
    <div className="w-60 rounded-xl bg-white/98 backdrop-blur-md border border-slate-200 shadow-xl p-3 select-none flex flex-col gap-2.5 z-20 font-sans">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-1.5 font-semibold text-xs text-slate-900">
          <Layers className="h-3.5 w-3.5 text-slate-600" />
          <span>Layers</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded-md border border-slate-200">
            {activeCount} active
          </span>
          <button
            type="button"
            onClick={onClose}
            className="h-6 w-6 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            aria-label="Close layers"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="space-y-0.5 max-h-[50vh] overflow-y-auto">
        {layerItems.map((item) => {
          const Icon = item.icon
          const isActive = layers[item.key]
          const count = counts[item.key]

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onToggleLayer(item.key)}
              className={cn(
                'w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-left transition-all text-xs cursor-pointer',
                isActive
                  ? 'bg-slate-50 text-slate-900 font-medium border-l-2 border-teal-600'
                  : 'text-slate-600 hover:bg-slate-50 border-l-2 border-transparent'
              )}
            >
              <div className="flex items-center gap-2 truncate">
                <Icon className={cn('h-3.5 w-3.5 shrink-0', isActive ? item.color : 'text-slate-400')} />
                <span className="truncate text-[11px]">{item.label}</span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 ml-1">
                {typeof count === 'number' && (
                  <span className="text-[9px] text-slate-400">{count}</span>
                )}
                <div
                  className={cn(
                    'h-3.5 w-3.5 rounded flex items-center justify-center border transition-colors',
                    isActive
                      ? 'bg-teal-600 border-teal-600 text-white'
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

      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-medium">
        <button type="button" onClick={onEnableAll} className="hover:text-teal-700 transition-colors cursor-pointer">
          Enable All
        </button>
        <span>·</span>
        <button type="button" onClick={onDisableAll} className="hover:text-rose-700 transition-colors cursor-pointer">
          Clear All
        </button>
      </div>
    </div>
  )
}
