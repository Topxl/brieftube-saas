import type * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground/60 selection:bg-primary selection:text-primary-foreground dark:bg-white/[0.05] border-white/[0.1] h-9 w-full min-w-0 rounded-xl border bg-transparent px-3 py-1 text-base shadow-xs backdrop-blur-sm transition-all duration-300 outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-white/[0.25] focus-visible:ring-white/[0.1] focus-visible:ring-[3px] focus-visible:shadow-[0_0_12px_rgba(255,255,255,0.06)]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  );
}

export { Input };
