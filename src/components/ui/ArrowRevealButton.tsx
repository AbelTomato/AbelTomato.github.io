import * as React from "react"
import { ArrowRight } from "lucide-react"

import { Button } from "@components/ui/button"
import { cn } from "@components/lib/utils"

interface ArrowRevealButtonProps {
  href: string
  children: React.ReactNode
  className?: string
}

function ArrowRevealButton({
  href,
  children,
  className,
}: ArrowRevealButtonProps) {
  return (
    <Button
      asChild
      className={cn(
        "group/arrow-reveal relative h-12 w-48 overflow-hidden rounded-full border-0 bg-transparent p-0 text-primary transition-none hover:bg-transparent focus-visible:ring-ring/50 motion-reduce:transition-none",
        className,
      )}
    >
      <a href={href}>
        <span
          aria-hidden="true"
          className="absolute inset-y-0 left-0 w-12 rounded-full bg-primary transition-[width] duration-[450ms] ease-[cubic-bezier(0.65,0,0.076,1)] group-hover/arrow-reveal:w-full group-focus-visible/arrow-reveal:w-full motion-reduce:transition-none"
        >
          <ArrowRight className="absolute top-1/2 left-2.5 size-[18px] -translate-y-1/2 text-primary-foreground transition-transform duration-[450ms] ease-[cubic-bezier(0.65,0,0.076,1)] group-hover/arrow-reveal:translate-x-4 group-focus-visible/arrow-reveal:translate-x-4 motion-reduce:transition-none" />
        </span>
        <span className="relative z-10 ml-7 w-full px-3 text-center text-sm font-bold leading-none tracking-wide text-primary uppercase transition-colors duration-[450ms] ease-[cubic-bezier(0.65,0,0.076,1)] group-hover/arrow-reveal:text-primary-foreground group-focus-visible/arrow-reveal:text-primary-foreground motion-reduce:transition-none">
          {children}
        </span>
      </a>
    </Button>
  )
}

export { ArrowRevealButton }