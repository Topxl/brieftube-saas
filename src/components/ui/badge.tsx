import type * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-all duration-300 overflow-hidden backdrop-blur-sm",
  {
    variants: {
      variant: {
        default: "bg-white/[0.1] text-foreground border-white/[0.1] [a&]:hover:bg-white/[0.15]",
        secondary:
          "bg-white/[0.06] text-muted-foreground border-white/[0.08] [a&]:hover:bg-white/[0.1]",
        destructive:
          "bg-destructive text-white border-transparent [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border-white/[0.1] text-foreground [a&]:hover:bg-white/[0.06]",
        ghost: "[a&]:hover:bg-white/[0.06] [a&]:hover:text-foreground",
        link: "text-primary underline-offset-4 [a&]:hover:underline border-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
