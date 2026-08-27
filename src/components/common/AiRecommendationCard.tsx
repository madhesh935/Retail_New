import React, { useState } from 'react'
import { Sparkles, Check, ArrowRight, Zap, CheckCircle2 } from 'lucide-react'
import { AiRecommendation } from '@/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface AiRecommendationCardProps {
  recommendation: AiRecommendation
  onAccept?: (recId: string) => void
  onDismiss?: (recId: string) => void
  className?: string
}

export const AiRecommendationCard: React.FC<AiRecommendationCardProps> = ({
  recommendation,
  onAccept,
  onDismiss,
  className,
}) => {
  const [isExecuting, setIsExecuting] = useState(false)
  const [isApplied, setIsApplied] = useState(recommendation.state === 'APPLIED')

  const handleApply = async () => {
    setIsExecuting(true)
    setTimeout(() => {
      setIsExecuting(false)
      setIsApplied(true)
      if (onAccept) onAccept(recommendation.id)
    }, 600)
  }

  const confidencePct = Math.round(recommendation.confidenceScore * 100)

  return (
    <div
      className={cn(
        'relative rounded-xl border p-3.5 transition-all shadow-2xs font-sans select-none',
        isApplied
          ? 'border-emerald-200 bg-emerald-50/40'
          : 'border-slate-200 hover:border-sky-300 bg-white',
        className
      )}
    >
      {/* Header with AI Pill & Confidence */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5">
          <div className="flex items-center justify-center h-5 w-5 rounded-md bg-sky-50 border border-sky-200 text-sky-600 shadow-2xs">
            <Sparkles className="h-3 w-3" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-sky-700">
            Autonomous AI Action
          </span>
        </div>

        <div className="flex items-center gap-1.5 font-mono text-[10px]">
          <Badge variant="cyan" className="gap-1 bg-sky-50 text-sky-700 border-sky-200 font-bold">
            <Zap className="h-2.5 w-2.5 text-sky-600" />
            <span>{confidencePct}% Confidence</span>
          </Badge>
          {recommendation.priority === 'URGENT' && (
            <Badge variant="rose" className="bg-rose-50 text-rose-700 border-rose-200 font-bold">URGENT</Badge>
          )}
        </div>
      </div>

      {/* Action Title */}
      <h4 className="text-xs font-bold text-slate-900 mb-1">
        {recommendation.actionTitle}
      </h4>

      {/* Description */}
      <p className="text-xs text-slate-600 leading-relaxed mb-2.5">
        {recommendation.actionDescription}
      </p>

      {/* Estimated Impact Box */}
      <div className="rounded-lg bg-slate-50 border border-slate-200 px-2.5 py-1.5 mb-3 flex items-start gap-2 text-[11px] text-slate-700 shadow-2xs">
        <span className="text-sky-700 font-bold shrink-0 font-sans">Impact:</span>
        <span className="text-slate-700 leading-tight">{recommendation.impactEstimate}</span>
      </div>

      {/* Target & Action Row */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <div className="text-[10px] text-slate-500 font-mono">
          Target:{' '}
          <span className="text-slate-900 font-semibold">
            {recommendation.recommendedTarget}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {onDismiss && !isApplied && (
            <Button
              variant="ghost"
              size="xs"
              onClick={() => onDismiss(recommendation.id)}
              disabled={isExecuting}
              className="text-slate-500 hover:text-slate-900"
            >
              Dismiss
            </Button>
          )}

          {isApplied ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-700 font-bold">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Dispatched
            </span>
          ) : (
            <Button
              variant="action"
              size="xs"
              onClick={handleApply}
              disabled={isExecuting}
              className="gap-1 bg-sky-600 hover:bg-sky-700 text-white font-semibold"
            >
              {isExecuting ? (
                <>Dispatching...</>
              ) : (
                <>
                  <span>Dispatch Action</span>
                  <ArrowRight className="h-3 w-3" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
