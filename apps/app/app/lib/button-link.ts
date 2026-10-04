import { buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

// cva doesn't merge classes, so without cn the base border-transparent beats the outline border
export const buttonLink = (...args: Parameters<typeof buttonVariants>) =>
  cn(buttonVariants(...args))
