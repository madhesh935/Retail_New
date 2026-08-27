import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium font-mono-numbers transition-colors focus:outline-none focus:ring-1 focus:ring-slate-400 select-none",
  {
    variants: {
      variant: {
        default:
          "border border-slate-200 bg-slate-100 text-slate-700",
        secondary:
          "border border-slate-200 bg-slate-50 text-slate-600",
        cyan:
          "border border-sky-200 bg-sky-50 text-sky-700",
        blue:
          "border border-blue-200 bg-blue-50 text-blue-700",
        emerald:
          "border border-emerald-200 bg-emerald-50 text-emerald-700",
        amber:
          "border border-amber-200 bg-amber-50 text-amber-800",
        rose:
          "border border-rose-200 bg-rose-50 text-rose-700",
        outline:
          "border border-slate-200 text-slate-700 bg-white",
        live:
          "border border-emerald-200 bg-emerald-50 text-emerald-700 font-semibold tracking-wide",
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
