import { StateCreator } from 'zustand'
import { StoreStatus, StoreState, StoreZone } from '@/types'

export interface StoreSlice {
  activeStoreId: string
  storeInfo: StoreStatus | null
  storeState: StoreState | null
  zones: StoreZone[]
  isLoadingStore: boolean
  storeError: string | null

  setActiveStoreId: (storeId: string) => void
  setStoreInfo: (info: StoreStatus) => void
  setStoreState: (state: StoreState) => void
  setZones: (zones: StoreZone[]) => void
  setLoadingStore: (loading: boolean) => void
  setStoreError: (error: string | null) => void
}

export const createStoreSlice: StateCreator<StoreSlice, [], [], StoreSlice> = (set) => ({
  activeStoreId: 'store-01',
  storeInfo: null,
  storeState: null,
  zones: [],
  isLoadingStore: false,
  storeError: null,

  setActiveStoreId: (activeStoreId) => set({ activeStoreId }),
  setStoreInfo: (storeInfo) => set({ storeInfo }),
  setStoreState: (storeState) => set({ storeState, zones: storeState.zones }),
  setZones: (zones) => set({ zones }),
  setLoadingStore: (isLoadingStore) => set({ isLoadingStore }),
  setStoreError: (storeError) => set({ storeError }),
})
