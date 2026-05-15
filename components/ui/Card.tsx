import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Re-exported for backward compatibility; canonical source is @/lib/utils.
export { cn };

/*
 * Brand-aware Card. Filename stays PascalCase (`Card.tsx`) so the existing
 * 57 `@/components/ui/Card` importers keep resolving on case-sensitive
 * (Linux/Netlify) builds. Variant styles are theme-token based so the card
 * adapts to light/dark; `glass` remains the default to keep current screens
 * visually unchanged.
 */
export const cardVariants = cva(
    "rounded-xl overflow-hidden transition-all duration-300",
    {
        variants: {
            variant: {
                glass: "glass-panel text-card-foreground",
                solid: "bg-card border border-border text-card-foreground shadow-xl",
                ghost: "bg-transparent border border-transparent text-muted-foreground hover:text-foreground",
            },
        },
        defaultVariants: {
            variant: "glass",
        },
    }
);

export const Card = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof cardVariants>
>(({ className, variant, ...props }, ref) => (
    <div
        ref={ref}
        data-slot="card"
        className={cn(cardVariants({ variant }), className)}
        {...props}
    />
));
Card.displayName = "Card";

export const CardHeader = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        data-slot="card-header"
        className={cn("flex flex-col space-y-1.5 p-6", className)}
        {...props}
    />
));
CardHeader.displayName = "CardHeader";

export const CardTitle = React.forwardRef<
    HTMLHeadingElement,
    React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
    <h3
        ref={ref}
        data-slot="card-title"
        className={cn(
            "text-lg font-semibold leading-none tracking-tight text-card-foreground",
            className
        )}
        {...props}
    />
));
CardTitle.displayName = "CardTitle";

export const CardDescription = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
    <p
        ref={ref}
        data-slot="card-description"
        className={cn("text-sm text-muted-foreground", className)}
        {...props}
    />
));
CardDescription.displayName = "CardDescription";

export const CardAction = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        data-slot="card-action"
        className={cn("ml-auto", className)}
        {...props}
    />
));
CardAction.displayName = "CardAction";

export const CardContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        data-slot="card-content"
        className={cn("p-6 pt-0", className)}
        {...props}
    />
));
CardContent.displayName = "CardContent";

export const CardFooter = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        data-slot="card-footer"
        className={cn("flex items-center p-6 pt-0", className)}
        {...props}
    />
));
CardFooter.displayName = "CardFooter";
