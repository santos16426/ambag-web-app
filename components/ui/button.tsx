import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-base font-medium transition-all duration-200 ease-in-out disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6B46C1] focus-visible:ring-offset-2 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-[#1A1A1A] text-white hover:bg-[#2A2A2A] hover:shadow-[0px_6px_16px_rgba(0,0,0,0.12)] hover:-translate-y-[1px] active:translate-y-0 active:shadow-[0px_2px_8px_rgba(0,0,0,0.08)]",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border border-[#6B46C1] bg-transparent text-[#6B46C1] hover:bg-[#6B46C1] hover:text-white transition-colors",
        secondary:
          "bg-transparent border border-[#6B46C1] text-[#6B46C1] hover:bg-[#6B46C1] hover:text-white",
        ghost:
          "hover:bg-[rgba(107,70,193,0.05)] hover:text-[#1A1A1A]",
        link: "text-[#6B46C1] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2.5 has-[>svg]:px-3 text-base",
        sm: "h-9 rounded-lg gap-1.5 px-3 has-[>svg]:px-2.5 text-sm",
        lg: "h-12 rounded-lg px-8 py-4 has-[>svg]:px-4 text-base",
        icon: "size-10 rounded-full p-0",
        "icon-sm": "size-8 rounded-full p-0",
        "icon-lg": "size-12 rounded-full p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
