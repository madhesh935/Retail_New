import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-xs font-semibold tracking-tight transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600/35 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer font-sans",
  {
    variants: {
      variant: {
        default:
          "bg-sky-600 text-white shadow-[0_1px_2px_rgb(15_118_110/0.2),0_6px_14px_-4px_rgb(15_118_110/0.4)] hover:bg-sky-800 hover:shadow-[0_2px_4px_rgb(15_118_110/0.25),0_10px_20px_-6px_rgb(15_118_110/0.45)] active:bg-sky-900 active:translate-y-px",
        primary:
          "bg-sky-600 text-white shadow-[0_1px_2px_rgb(15_118_110/0.2),0_6px_14px_-4px_rgb(15_118_110/0.4)] hover:bg-sky-800 hover:shadow-[0_2px_4px_rgb(15_118_110/0.25),0_10px_20px_-6px_rgb(15_118_110/0.45)] active:bg-sky-900 active:translate-y-px",
        destructive:
          "bg-rose-600 text-white shadow-[0_1px_2px_rgb(185_28_28/0.2),0_6px_14px_-4px_rgb(185_28_28/0.35)] hover:bg-rose-700 active:bg-rose-800",
        outline:
          "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 active:bg-slate-100 shadow-[0_1px_2px_rgb(15_23_42/0.04)]",
        secondary:
          "bg-slate-100 text-slate-800 hover:bg-slate-200 active:bg-slate-300 border border-slate-200/80",
        ghost:
          "text-slate-600 hover:bg-slate-100/90 hover:text-slate-900 active:bg-slate-200",
        link:
          "text-sky-700 underline-offset-4 hover:underline p-0 h-auto font-semibold",
        action:
          "bg-sky-600 text-white shadow-[0_1px_2px_rgb(15_118_110/0.2),0_6px_14px_-4px_rgb(15_118_110/0.4)] hover:bg-sky-800 active:bg-sky-900",
        amber:
          "bg-amber-600 text-white shadow-sm hover:bg-amber-700 active:bg-amber-800",
        emerald:
          "bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 active:bg-emerald-800",
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
