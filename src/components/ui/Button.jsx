import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "@/utils/cn"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-dark-base disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-accent-cyan text-white hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(37,99,235,0.35)]",
        secondary:
          "border-2 border-accent-cyan/50 text-accent-cyan bg-transparent hover:bg-accent-cyan/10 hover:-translate-y-0.5",
        ghost:
          "text-text-secondary hover:text-text-primary hover:bg-dark-base",
        outline:
          "border border-dark-border bg-transparent text-text-primary hover:bg-dark-base hover:-translate-y-0.5",
        link:
          "text-accent-cyan underline-offset-4 hover:underline",
      },
      size: {
        default: "px-6 py-3",
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-8 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, ...props }, ref) => {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  )
})
Button.displayName = "Button"

export { Button, buttonVariants }
