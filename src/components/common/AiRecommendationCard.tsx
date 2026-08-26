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
        'relative rounded-lg border bg-[#0F172A] p-3.5 transition-all',
        isApplied
          ? 'border-emerald-500/40 bg-emerald-950/10'
          : 'border-cyan-500/30 hover:border-cyan-500/60 bg-[#0F172A]',
        className
      )}
    >
      {/* Header with AI Pill & Confidence */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5">
          <div className="flex items-center justify-center h-5 w-5 rounded bg-cyan-950 border border-cyan-500/50 text-cyan-300">
            <Sparkles className="h-3 w-3" />
          </div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-cyan-300 font-mono">
            Autonomous AI Action
          </span>
        </div>

        <div className="flex items-center gap-1.5 font-mono text-[10px]">
          <Badge variant="cyan" className="gap-1">
            <Zap className="h-2.5 w-2.5 text-cyan-400" />
            <span>{confidencePct}% Confidence</span>
          </Badge>
          {recommendation.priority === 'URGENT' && (
            <Badge variant="rose">URGENT</Badge>
          )}
        </div>
      </div>

      {/* Action Title */}
      <h4 className="text-xs font-semibold text-slate-100 mb-1">
        {recommendation.actionTitle}
      </h4>

      {/* Description */}
      <p className="text-xs text-slate-400 leading-relaxed mb-2.5">
        {recommendation.actionDescription}
      </p>

      {/* Estimated Impact Box */}
      <div className="rounded bg-[#090D14] border border-[#1E293B] px-2.5 py-1.5 mb-3 flex items-start gap-2 text-[11px] text-slate-300">
        <span className="text-cyan-400 font-semibold shrink-0 font-mono">Impact:</span>
        <span className="text-slate-300 leading-tight">{recommendation.impactEstimate}</span>
      </div>

      {/* Target & Action Row */}
      <div className="flex items-center justify-between pt-2 border-t border-[#1E293B]">
        <div className="text-[10px] text-slate-400 font-mono">
          Target:{' '}
          <span className="text-slate-200 font-semibold">
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
            >
              Dismiss
            </Button>
          )}

          {isApplied ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 font-medium">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Dispatched
            </span>
          ) : (
            <Button
              variant="action"
              size="xs"
              onClick={handleApply}
              disabled={isExecuting}
              className="gap-1"
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
