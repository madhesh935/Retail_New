import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-sm px-1.5 py-0.5 text-[11px] font-medium font-mono-numbers transition-colors focus:outline-none focus:ring-1 focus:ring-slate-400 select-none",
  {
    variants: {
      variant: {
        default:
          "border border-slate-700 bg-slate-800 text-slate-200",
        secondary:
          "border border-slate-700/60 bg-slate-900 text-slate-400",
        cyan:
          "border border-cyan-500/30 bg-cyan-950/60 text-cyan-300",
        blue:
          "border border-blue-500/30 bg-blue-950/60 text-blue-300",
        emerald:
          "border border-emerald-500/30 bg-emerald-950/60 text-emerald-300",
        amber:
          "border border-amber-500/30 bg-amber-950/60 text-amber-300",
        rose:
          "border border-rose-500/30 bg-rose-950/60 text-rose-300",
        outline:
          "border border-slate-700 text-slate-300",
        live:
          "border border-cyan-500/50 bg-cyan-950 text-cyan-300 font-semibold tracking-wide",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
