import React from "react"
import { Input } from "@/components/ui/input"
import { SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

// --- Semantic Minimal Input ---
// Uses bg-muted/30 or bg-background to adapt to Light/Dark modes while maintaining distinction.
export const MinimalInput = React.forwardRef<HTMLInputElement, React.ComponentProps<typeof Input>>(
    ({ className, ...props }, ref) => {
        return (
            <Input
                ref={ref}
                className={cn(
                    "bg-muted/30 border-border/40 text-foreground placeholder:text-muted-foreground/60 focus:bg-background",
                    "rounded-lg px-3 py-5 shadow-sm transition-all duration-200",
                    "hover:bg-muted/50 hover:border-border/60",
                    "focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/60 shadow-sm",
                    // Filled state: Light Mode (Blue BG) | Dark Mode (Green Border)
                    "[&:not(:placeholder-shown)]:bg-blue-50 dark:[&:not(:placeholder-shown)]:bg-transparent dark:[&:not(:placeholder-shown)]:border-emerald-500/50",
                    "text-sm font-normal",
                    className
                )}
                {...props}
            />
        )
    }
)
MinimalInput.displayName = "MinimalInput"

// --- Semantic Minimal Select Trigger ---
export const MinimalSelectTrigger = React.forwardRef<HTMLButtonElement, React.ComponentProps<typeof SelectTrigger>>(
    ({ className, children, ...props }, ref) => (
        <SelectTrigger
            ref={ref}
            className={cn(
                "bg-muted/30 border-border/40 text-foreground",
                "rounded-lg px-3 py-5 shadow-sm transition-all duration-200",
                "hover:bg-muted/50 hover:border-border/60",
                "focus:ring-2 focus:ring-primary/20 focus:border-primary/60 shadow-sm",
                "text-sm font-normal data-[placeholder]:text-muted-foreground/60",
                // Filled state: Light Mode (Blue BG) | Dark Mode (Green Border)
                "[&:not(:has([data-placeholder]))]:bg-blue-50 dark:[&:not(:has([data-placeholder]))]:bg-transparent dark:[&:not(:has([data-placeholder]))]:border-emerald-500/50",
                className
            )}
            {...props}
        >
            {children}
        </SelectTrigger>
    )
)
MinimalSelectTrigger.displayName = "MinimalSelectTrigger"

// --- Section Header ---
interface SectionHeaderProps {
    icon: LucideIcon
    title: string
    description?: string
    className?: string
    iconClassName?: string
}

export function SectionHeader({ icon: Icon, title, description, className, iconClassName }: SectionHeaderProps) {
    return (
        <div className={cn("flex items-start gap-3 mb-6", className)}>
            <div className={cn("mt-0.5 p-1.5 rounded-md border bg-primary/10 text-primary border-primary/10", iconClassName)}>
                <Icon size={18} strokeWidth={2.5} />
            </div>
            <div className="space-y-0.5">
                <h3 className="text-base font-semibold tracking-tight text-foreground leading-none">
                    {title}
                </h3>
                {description && (
                    <p className="text-xs text-muted-foreground font-medium">
                        {description}
                    </p>
                )}
            </div>
        </div>
    )
}
