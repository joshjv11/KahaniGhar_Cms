import { cn } from "@/lib/utils/cn"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-gradient-to-r from-blue-primary/10 via-gold-500/5 to-blue-primary/10 dark:from-blue-primary/5 dark:via-gold-500/3 dark:to-blue-primary/5 bg-[length:200%_100%] animate-[shimmer_2s_ease-in-out_infinite] motion-reduce:animate-none", className)}
      {...props}
    />
  )
}

export { Skeleton }
