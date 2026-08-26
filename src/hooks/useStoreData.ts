import { useEffect } from 'react'
import { useAppStore } from '@/store/useAppStore'

export function useStoreData() {
  const activeStoreId = useAppStore((s) => s.activeStoreId)
  const isDemoMode = useAppStore((s) => s.isDemoMode)
  const fetchStoreData = useAppStore((s) => s.fetchStoreData)
  const isLoadingStore = useAppStore((s) => s.isLoadingStore)
  const storeError = useAppStore((s) => s.storeError)

  useEffect(() => {
    fetchStoreData(activeStoreId)
  }, [activeStoreId, isDemoMode, fetchStoreData])

  return {
    activeStoreId,
    isLoadingStore,
    storeError,
    refetch: () => fetchStoreData(activeStoreId),
  }
}
