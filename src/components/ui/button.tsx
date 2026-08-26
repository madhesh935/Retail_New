import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-500 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-cyan-600 text-white shadow hover:bg-cyan-500 active:bg-cyan-700",
        primary:
          "bg-blue-600 text-white shadow hover:bg-blue-500 active:bg-blue-700",
        destructive:
          "bg-rose-600/90 text-white shadow-sm hover:bg-rose-600 active:bg-rose-700",
        outline:
          "border border-slate-700 bg-slate-900/60 text-slate-200 hover:bg-slate-800 hover:border-slate-600 active:bg-slate-700",
        secondary:
          "bg-slate-800 text-slate-200 hover:bg-slate-700 active:bg-slate-600 border border-slate-700/50",
        ghost:
          "text-slate-300 hover:bg-slate-800/80 hover:text-white active:bg-slate-800",
        link:
          "text-cyan-400 underline-offset-4 hover:underline p-0 h-auto",
        action:
          "bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-900/80 hover:border-cyan-400",
        amber:
          "bg-amber-950/80 text-amber-300 border border-amber-500/40 hover:bg-amber-900/80",
        emerald:
          "bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-900/80",
      },
      size: {
        default: "h-8 px-3 py-1.5",
        xs: "h-6 rounded px-2 text-[11px]",
        sm: "h-7 rounded-md px-2.5 text-xs",
        lg: "h-9 rounded-md px-4 text-sm",
        icon: "h-8 w-8",
        "icon-sm": "h-7 w-7",
        "icon-xs": "h-6 w-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
