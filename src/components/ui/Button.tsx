import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none",
    {
        variants: {
            variant: {
                default: "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-indigo shadow-sm hover:shadow-glow-sm",
                gradient: "bg-gradient-to-r from-blue-600 via-blue-600 to-indigo text-white hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-glow",
                success: "bg-success text-white hover:bg-success/90 shadow-sm",
                warning: "bg-warning text-white hover:bg-warning/90 shadow-sm",
                destructive: "bg-alert text-white hover:bg-alert/90 shadow-sm",
                outline: "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-sm",
                secondary: "bg-blue-50 text-blue-700 hover:bg-blue-100",
                ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                "sidebar-ghost": "text-slate-400 hover:bg-white/5 hover:text-slate-200",
                link: "text-primary underline-offset-4 hover:underline p-0 h-auto",
            },
            size: {
                default: "h-10 px-5 py-2",
                sm: "h-9 rounded-lg px-4 text-xs",
                lg: "h-12 rounded-xl px-8 text-base",
                xl: "h-14 rounded-2xl px-10 text-lg",
                icon: "h-10 w-10",
                "icon-sm": "h-8 w-8 rounded-lg",
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
