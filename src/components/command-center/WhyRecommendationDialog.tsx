import React from 'react'
import {
  Sparkles,
  Calculator,
  Activity,
  CheckCircle2,
  TrendingUp,
  Cpu,
  ShieldCheck,
  Zap,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export interface WhyDialogData {
  title: string
  actionType: 'QUEUE' | 'STOCKOUT' | 'SPILL' | 'PLANOGRAM'
  targetEntity: string
  signals: { label: string; value: string; highlight?: boolean; isMath?: boolean }[]
  mathFormula?: string
  threshold: string
  confidence: string
  conclusion: string
  edgeModel: string
}

interface WhyRecommendationDialogProps {
  data: WhyDialogData | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onProceedAction?: () => void
}

export const WhyRecommendationDialog: React.FC<WhyRecommendationDialogProps> = ({
  data,
  open,
  onOpenChange,
  onProceedAction,
}) => {
  if (!data) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl bg-white border-slate-200 p-5 shadow-2xl text-slate-900 font-mono select-none">
        {/* Header */}
        <DialogHeader className="pb-3 border-b border-slate-100 text-left">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg bg-sky-50 border border-sky-200 text-sky-600">
              <Calculator className="h-4 w-4" />
            </div>
            <DialogTitle className="text-sm font-bold text-slate-900 uppercase tracking-wider font-sans">
              AI Decision Explainability &amp; Mathematical Signals
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-slate-500 font-sans">
            Transparent edge vision inference signals and rate equations for: <strong className="text-sky-700">{data.title}</strong>
          </DialogDescription>
        </DialogHeader>

        {/* Signals & Rate Parameters Grid */}
        <div className="space-y-3 py-2 text-xs">
          <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between font-sans">
            <span>Measurable Real-time Signals</span>
            <span className="text-sky-700 text-[10px] flex items-center gap-1 font-normal font-mono">
              <Cpu className="h-3 w-3" /> {data.edgeModel}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {data.signals.map((sig, idx) => (
              <div
                key={idx}
                className={`p-2.5 rounded-lg border shadow-2xs ${
                  sig.highlight
                    ? 'border-sky-300 text-sky-800 bg-sky-50/60'
                    : 'border-slate-200 bg-slate-50 text-slate-800'
                }`}
              >
                <div className="text-[10px] text-slate-500 truncate mb-1 font-sans">{sig.label}</div>
                <div className="text-sm font-bold tracking-tight text-slate-900">{sig.value}</div>
              </div>
            ))}
          </div>

          {/* Rate Equation Box if present */}
          {data.mathFormula && (
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5 shadow-2xs">
              <div className="text-[10px] text-slate-600 font-bold uppercase tracking-wider flex items-center gap-1 font-sans">
                <Activity className="h-3 w-3 text-sky-600" />
                <span>Deterministic Queue Rate Equation</span>
              </div>
              <div className="text-xs text-sky-800 font-semibold p-2 bg-white rounded-md border border-slate-200">
                <code>{data.mathFormula}</code>
              </div>
            </div>
          )}

          {/* SLA Threshold & Confidence */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 shadow-2xs">
              <span className="text-[10px] text-slate-500 block font-sans">Decision Threshold</span>
              <div className="font-bold text-slate-900 mt-0.5">{data.threshold}</div>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 shadow-2xs">
              <span className="text-[10px] text-slate-500 block font-sans">Model Confidence</span>
              <div className="font-bold text-emerald-700 mt-0.5">{data.confidence} Verified</div>
            </div>
          </div>

          {/* Conclusion */}
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1 shadow-2xs">
            <div className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 text-emerald-800 font-sans">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Recommended Action &amp; Rationale</span>
            </div>
            <p className="text-xs leading-relaxed font-sans text-slate-700">
              {data.conclusion}
            </p>
          </div>
        </div>

        {/* Action Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs text-slate-700 border-slate-200 bg-white hover:bg-slate-50"
          >
            Dismiss
          </Button>

          <Button
            variant="action"
            size="sm"
            onClick={() => {
              if (onProceedAction) onProceedAction()
              onOpenChange(false)
            }}
            className="text-xs gap-1.5 bg-sky-600 hover:bg-sky-700 text-white"
          >
            <Zap className="h-3.5 w-3.5" /> Proceed with Recommendation
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
