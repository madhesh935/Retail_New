import React from 'react'
import { Store, ChevronDown, Check, MapPin, Cpu } from 'lucide-react'
import { STORES_LIST, StoreOption } from '@/lib/constants'
import { useAppStore } from '@/store/useAppStore'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

export const StoreSelector: React.FC = () => {
  const activeStoreId = useAppStore((s) => s.activeStoreId)
  const setActiveStoreId = useAppStore((s) => s.setActiveStoreId)
  const storeInfo = useAppStore((s) => s.storeInfo)

  const activeStore = STORES_LIST.find((st) => st.id === activeStoreId) || STORES_LIST[0]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 border-[#1E293B] bg-[#090D14] hover:bg-[#0F172A] text-slate-200 flex items-center gap-2 px-2.5 max-w-[240px]"
        >
          <Store className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
          <div className="flex flex-col text-left truncate">
            <span className="text-xs font-semibold truncate leading-tight">
              {storeInfo?.name || activeStore.name}
            </span>
          </div>
          <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0 ml-auto" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-72 bg-[#0F172A] border-[#1E293B]">
        <DropdownMenuLabel className="text-[10px] text-slate-400">
          SELECT RETAIL STORE
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-[#1E293B]" />

        {STORES_LIST.map((store) => {
          const isSelected = store.id === activeStoreId
          return (
            <DropdownMenuItem
              key={store.id}
              onClick={() => setActiveStoreId(store.id)}
              className="flex items-start justify-between p-2.5 cursor-pointer focus:bg-[#1E293B]"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white">
                    {store.name}
                  </span>
                  <span className="text-[10px] font-mono px-1 py-0.5 rounded bg-slate-800 text-slate-400">
                    {store.code}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-slate-400">
                  <MapPin className="h-3 w-3 text-slate-500" />
                  <span>{store.location}</span>
                </div>
                <div className="flex items-center gap-3 text-[10px] font-mono text-cyan-400/80 pt-0.5">
                  <span>{store.camerasCount} Cameras</span>
                  <span>•</span>
                  <span>{store.zonesCount} Zones</span>
                  <span>•</span>
                  <span className="flex items-center gap-0.5 text-slate-400">
                    <Cpu className="h-2.5 w-2.5" />
                    {store.activeEdgeDevice}
                  </span>
                </div>
              </div>
              {isSelected && <Check className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
