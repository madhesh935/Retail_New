import { StateCreator } from 'zustand'
import { StoreStatus, StoreState, StoreZone } from '@/types'
import { MOCK_STORE_STATUS, MOCK_STORE_STATE } from '@/services/mock/mockData'

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
  storeInfo: MOCK_STORE_STATUS,
  storeState: MOCK_STORE_STATE,
  zones: MOCK_STORE_STATE.zones,
  isLoadingStore: false,
  storeError: null,

  setActiveStoreId: (activeStoreId) => set({ activeStoreId }),
  setStoreInfo: (storeInfo) => set({ storeInfo }),
  setStoreState: (storeState) => set({ storeState, zones: storeState.zones }),
  setZones: (zones) => set({ zones }),
  setLoadingStore: (isLoadingStore) => set({ isLoadingStore }),
  setStoreError: (storeError) => set({ storeError }),
})
