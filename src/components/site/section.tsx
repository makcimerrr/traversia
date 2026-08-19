import { cn } from "@/lib/utils"

export function Container({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn("mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-8", className)}>
      {children}
    </div>
  )
}

export function Eyebrow({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <p className={cn("flex items-center gap-3 label text-muted-foreground", className)}>
      <span aria-hidden className="h-px w-8 bg-foreground" />
      {children}
    </p>
  )
}

export function Section({
  className,
  children,
  bordered = true,
}: {
  className?: string
  children: React.ReactNode
  bordered?: boolean
}) {
  return (
    <section className={cn(bordered && "border-t border-border", className)}>
      {children}
    </section>
  )
}
