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
      <DialogContent className="max-w-xl bg-[#0F172A] border-[#1E293B] p-5 shadow-2xl text-slate-100 font-mono select-none">
        {/* Header */}
        <DialogHeader className="pb-3 border-b border-[#1E293B] text-left">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-400">
              <Calculator className="h-4 w-4" />
            </div>
            <DialogTitle className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              AI Decision Explainability & Mathematical Signals
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-slate-400 font-sans">
            Transparent edge vision inference signals and rate equations for: <strong className="text-cyan-300">{data.title}</strong>
          </DialogDescription>
        </DialogHeader>

        {/* Signals & Rate Parameters Grid */}
        <div className="space-y-3 py-2 text-xs">
          <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
            <span>Measurable Real-time Signals</span>
            <span className="text-cyan-400 text-[10px] flex items-center gap-1 font-normal">
              <Cpu className="h-3 w-3" /> {data.edgeModel}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {data.signals.map((sig, idx) => (
              <div
                key={idx}
                className={`p-2.5 rounded border bg-[#090D14] ${
                  sig.highlight
                    ? 'border-cyan-500/50 text-cyan-300 bg-cyan-950/20'
                    : 'border-[#1E293B] text-slate-200'
                }`}
              >
                <div className="text-[10px] text-slate-400 truncate mb-1">{sig.label}</div>
                <div className="text-sm font-bold tracking-tight text-white">{sig.value}</div>
              </div>
            ))}
          </div>

          {/* Rate Equation Box if present */}
          {data.mathFormula && (
            <div className="p-3 rounded bg-[#090D14] border border-[#1E293B] space-y-1.5">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <Activity className="h-3 w-3 text-cyan-400" />
                <span>Deterministic Queue Rate Equation</span>
              </div>
              <div className="text-xs text-cyan-300 font-semibold p-2 bg-[#0F172A] rounded border border-[#1E293B]">
                <code>{data.mathFormula}</code>
              </div>
            </div>
          )}

          {/* Threshold & Confidence Meter */}
          <div className="p-3 rounded bg-[#090D14] border border-[#1E293B] flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] text-slate-400 block">SLA Threshold</span>
              <span className="text-amber-400 font-bold">{data.threshold}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block">Inference Confidence</span>
              <span className="text-emerald-400 font-bold">{data.confidence}</span>
            </div>
          </div>

          {/* Final Conclusion Box */}
          <div className="p-3 rounded bg-emerald-950/30 border border-emerald-500/40 space-y-1">
            <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Recommended Autonomous Action</span>
            </div>
            <div className="text-sm font-bold text-white font-sans">{data.conclusion}</div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-[#1E293B] flex items-center justify-between">
          <Button variant="ghost" size="xs" onClick={() => onOpenChange(false)}>
            Close
          </Button>

          <Button
            variant="action"
            size="xs"
            onClick={() => {
              onOpenChange(false)
              if (onProceedAction) onProceedAction()
            }}
            className="gap-1.5 font-mono"
          >
            <Zap className="h-3 w-3" /> Approve & Execute Action
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
