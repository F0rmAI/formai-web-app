import type { ProgressTone } from '@/types/ui'
import { cn } from '@/utils/cn'

export interface ProgressBarProps {
  /** Progreso de 0 a 100. */
  value: number
  tone?: ProgressTone
  /** Texto accesible. */
  label?: string
  className?: string
}

/** Track primary/container + relleno. `gradient` = primary → secondary. */
export function ProgressBar({ value, tone = 'primary', label, className }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value))

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={clamped}
      className={cn('h-2 w-full overflow-hidden rounded-full bg-primary-container', className)}
    >
      <div
        className={cn(
          'h-full rounded-full transition-[width]',
          tone === 'gradient' ? 'bg-linear-to-r from-primary to-secondary' : 'bg-primary',
        )}
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
}
