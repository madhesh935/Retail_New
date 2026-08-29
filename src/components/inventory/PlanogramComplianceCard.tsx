import React, { useMemo, useState } from 'react'
import {
  Sparkles,
  Camera,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Plus,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/store/useAppStore'
import { cn } from '@/lib/utils'

export interface PlanogramViolation {
  id: string
  shelfCode: string
  location: string
  issueType: string
  expected: string
  detected: string
  severity: 'HIGH' | 'MEDIUM' | 'LOW'
  cameraCode: string
}

interface PlanogramComplianceCardProps {
  onViewCamera?: (camCode: string) => void
}

export const PlanogramComplianceCard: React.FC<PlanogramComplianceCardProps> = ({
  onViewCamera,
}) => {
  const [isExpanded, setIsExpanded] = useState(true)
  const [createdTasks, setCreatedTasks] = useState<Record<string, boolean>>({})
  const shelfItems = useAppStore((s) => s.shelfItems)
  const overallPlanogramCompliance = useAppStore((s) => s.inventoryAnalytics.overallPlanogramCompliance)

  const violations: PlanogramViolation[] = useMemo(() => {
    return shelfItems
      .filter((item) => item.isMisplaced || item.status === 'MISPLACED' || item.planogramComplianceScore < 70)
      .map((item) => {
        const severity: PlanogramViolation['severity'] = item.isMisplaced || item.status === 'MISPLACED'
          ? 'HIGH'
          : item.planogramComplianceScore < 50
          ? 'MEDIUM'
          : 'LOW'
        return {
          id: item.id,
          shelfCode: item.shelfId,
          location: `${item.aisle || item.zoneName} · ${item.category}`,
          issueType: item.isMisplaced || item.status === 'MISPLACED'
            ? 'Misplaced item detected'
            : 'Low planogram compliance score',
          expected: item.productName,
          detected: item.isMisplaced || item.status === 'MISPLACED'
            ? 'Product out of planogram position'
            : `${Math.round(item.planogramComplianceScore)}% compliance score`,
          severity,
          cameraCode: item.cameraSourceId || 'CAM-01',
        }
      })
  }, [shelfItems])

  const handleCreateTask = (id: string) => {
    setCreatedTasks((prev) => ({ ...prev, [id]: true }))
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 flex flex-col justify-between shadow-2xs select-none font-sans">
      {/* Collapsible Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-200">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 tracking-wide flex items-center gap-2">
              <span>Planogram Compliance</span>
              <span
                className={cn(
                  'font-bold text-xs px-1.5 py-0.5 rounded-md border',
                  overallPlanogramCompliance >= 85
                    ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                    : 'text-amber-800 bg-amber-50 border-amber-200'
                )}
              >
                {Math.round(overallPlanogramCompliance)}%
              </span>
            </h3>
            <span className="text-[11px] text-slate-500">
              {violations.length > 0
                ? `${violations.length} active placement issue${violations.length === 1 ? '' : 's'} detected`
                : 'No active placement issues detected'}
            </span>
          </div>
        </div>

        <Button
          variant="outline"
          size="xs"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-[11px] h-7 px-2.5 gap-1 text-slate-700 border-slate-200 bg-white hover:bg-slate-50 shadow-2xs"
        >
          <span>{isExpanded ? 'Collapse' : 'View Issues'}</span>
          {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </Button>
      </div>

      {/* Expanded Violations List */}
      {isExpanded && violations.length === 0 && (
        <div className="mt-3 pt-3 border-t border-slate-100 text-center py-4">
          <span className="text-xs font-semibold text-slate-500">No active placement issues detected</span>
        </div>
      )}

      {isExpanded && violations.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-100 space-y-2.5">
          {violations.map((v) => {
            const isTaskCreated = createdTasks[v.id]

            return (
              <div
                key={v.id}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-2 text-xs shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 font-mono bg-white px-1.5 py-0.5 rounded-md text-[11px] border border-slate-200">
                      {v.shelfCode}
                    </span>
                    <span className="font-bold text-amber-800 text-xs">{v.issueType}</span>
                  </div>
                  <span className="text-[10px] text-slate-500">{v.location}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block font-sans">Expected</span>
                    <span className="text-slate-800 font-medium">{v.expected}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block font-sans">Detected</span>
                    <span className="text-rose-700 font-bold">{v.detected}</span>
                  </div>
                </div>

                {/* Action Buttons: View Camera | Create Task */}
                <div className="flex items-center justify-end gap-2 pt-1">
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => {
                      if (onViewCamera) onViewCamera(v.cameraCode)
                    }}
                    className="text-[11px] h-7 px-2.5 gap-1.5 text-slate-700 border-slate-200 bg-white hover:bg-slate-50 shadow-2xs"
                  >
                    <Camera className="h-3 w-3 text-sky-600" />
                    <span>View Camera</span>
                  </Button>

                  {isTaskCreated ? (
                    <span className="text-emerald-700 text-[11px] font-bold flex items-center gap-1 px-2 py-1 bg-emerald-50 rounded-md border border-emerald-200">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Task Created
                    </span>
                  ) : (
                    <Button
                      variant="action"
                      size="xs"
                      onClick={() => handleCreateTask(v.id)}
                      className="text-[11px] h-7 px-2.5 gap-1.5 bg-sky-600 hover:bg-sky-700 text-white"
                    >
                      <Plus className="h-3 w-3" /> Create Task
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
