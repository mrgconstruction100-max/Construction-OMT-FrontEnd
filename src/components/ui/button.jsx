import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Plus } from "lucide-react"
import { createPortal } from "react-dom"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-gradient-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)



const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, mobileFloating = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    const desktopButton = (
      <Comp
        className={cn(
          buttonVariants({ variant, size, className }),
          mobileFloating && "hidden md:inline-flex"
        )}
        ref={ref}
        {...props}
      />
    )

     // Mobile floating button (only if mobileFloating is true)
    const mobileButton = mobileFloating
      ? createPortal(
          <button
            type="button"
            className="fixed bottom-20 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-primary  text-primary-foreground shadow-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 md:hidden"
            onClick={props.onClick}
          >
            <Plus className="h-6 w-6" />
          </button>,
          document.body
        )
      : null
    return (
      <>
        {desktopButton}
        {mobileButton}
      </>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
