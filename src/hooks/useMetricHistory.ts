import { useEffect, useState } from 'react'
import { realStoreApi } from '@/services/api/realStoreApi'

export interface MetricPoint {
  label: string
  value: number
  recordedAt: string
}

/** Polls real recorded history for a metric type (see backend metrics_snapshot service). */
export function useMetricHistory(metricType: string, pollMs = 60000): { points: MetricPoint[]; isLoading: boolean } {
  const [points, setPoints] = useState<MetricPoint[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        const rows = await realStoreApi.getMetricHistory(metricType)
        if (cancelled) return
        setPoints(
          rows.map((r) => ({
            label: r.label,
            value: r.value,
            recordedAt: r.recordedAt,
          }))
        )
      } catch (err) {
        console.warn(`Metric history fetch failed for ${metricType}`, err)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void load()
    const timer = window.setInterval(load, pollMs)
    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [metricType, pollMs])

  return { points, isLoading }
}
