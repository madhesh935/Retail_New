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
          className="h-8 border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 flex items-center gap-2 px-2.5 max-w-[240px]"
        >
          <Store className="h-3.5 w-3.5 text-sky-600 shrink-0" />
          <div className="flex flex-col text-left truncate">
            <span className="text-xs font-semibold truncate leading-tight text-slate-900">
              {storeInfo?.name || activeStore.name}
            </span>
          </div>
          <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0 ml-auto" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-72 bg-white border-slate-200 shadow-xl">
        <DropdownMenuLabel className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase">
          SELECT RETAIL STORE
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-slate-100" />

        {STORES_LIST.map((store) => {
          const isSelected = store.id === activeStoreId
          return (
            <DropdownMenuItem
              key={store.id}
              onClick={() => setActiveStoreId(store.id)}
              className="flex items-start justify-between p-2.5 cursor-pointer hover:bg-slate-50 focus:bg-slate-50"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-900">
                    {store.name}
                  </span>
                  <span className="text-[10px] font-mono px-1 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                    {store.code}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-slate-400" />
                    <span>{store.location}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Cpu className="h-3 w-3 text-sky-600" />
                    <span>{store.activeEdgeDevice}</span>
                  </span>
                </div>
              </div>

              {isSelected && (
                <Check className="h-4 w-4 text-sky-600 shrink-0 mt-0.5" />
              )}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
