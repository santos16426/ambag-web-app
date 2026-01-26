import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-[#1A1A1A] placeholder:text-[#6B7280] selection:bg-[#6B46C1] selection:text-white",
        "h-10 w-full min-w-0 rounded-lg border border-[#E5E7EB] bg-white px-4 py-2.5",
        "text-base font-normal transition-all duration-100 ease-in-out",
        "outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:border-[#6B46C1] focus-visible:ring-0 focus-visible:shadow-[0px_0px_0px_3px_rgba(107,70,193,0.1)]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Input }
