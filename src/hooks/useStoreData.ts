import { useEffect } from 'react'
import { useAppStore } from '@/store/useAppStore'

/** Load store data from the live API and optionally keep polling for staff/customer PWAs. */
export function useStoreData(options?: { pollMs?: number }) {
  const activeStoreId = useAppStore((s) => s.activeStoreId)
  const fetchStoreData = useAppStore((s) => s.fetchStoreData)
  const isLoadingStore = useAppStore((s) => s.isLoadingStore)
  const storeError = useAppStore((s) => s.storeError)
  const pollMs = options?.pollMs

  useEffect(() => {
    fetchStoreData(activeStoreId)
    if (!pollMs || pollMs < 3000) return
    const timer = window.setInterval(() => {
      fetchStoreData(activeStoreId)
    }, pollMs)
    return () => window.clearInterval(timer)
  }, [activeStoreId, fetchStoreData, pollMs])

  return {
    activeStoreId,
    isLoadingStore,
    storeError,
    refetch: () => fetchStoreData(activeStoreId),
  }
}
