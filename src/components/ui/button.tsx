import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Renewably button system — five variants, two sizes. Single source of truth.
 *
 *   primary    — black pill, ONE per view (default save / submit)
 *   brand      — brand-blue pill, ONLY for the signature CTA of a destination
 *                (Issue IBG, Save changes, Apply override). At most one per page.
 *   secondary  — bordered pill (Cancel, Filter, Export)
 *   ghost      — inline / table-row text action
 *   icon       — square icon-only action; tooltip required
 *
 * Sizes: sm (h-8) and md (h-9). No lg.
 *
 * Legacy variant aliases (default, outline, destructive, link) are kept so
 * shadcn-generated usages don't break the build, but new code should use the
 * five variants above.
 */
const buttonVariants = cva(
  "press inline-flex items-center justify-center gap-1.5 whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "rounded-full bg-brand-blue text-brand-blue-foreground hover:bg-brand-blue/90",
        brand:
          "rounded-full bg-brand-blue text-brand-blue-foreground hover:bg-brand-blue/90",
        secondary:
          "rounded-full border bg-card text-foreground hover:bg-surface",
        ghost:
          "rounded-md text-ink-muted hover:bg-surface hover:text-foreground",
        icon:
          "rounded-md text-ink-muted hover:bg-surface hover:text-foreground",
        // legacy aliases
        default: "rounded-full bg-brand-blue text-brand-blue-foreground hover:bg-brand-blue/90",
        outline: "rounded-full border bg-card text-foreground hover:bg-surface",
        destructive:
          "rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90",
        link: "text-foreground underline-offset-4 hover:underline rounded-md",
      },
      size: {
        sm: "h-8 px-3.5 text-[13px]",
        md: "h-10 px-5",
        icon: "h-9 w-9 p-0",
        // legacy
        default: "h-10 px-5",
        lg: "h-10 px-5",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    const resolvedSize = variant === "icon" && !size ? "icon" : size;
    return (
      <Comp
        className={cn(buttonVariants({ variant, size: resolvedSize, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
