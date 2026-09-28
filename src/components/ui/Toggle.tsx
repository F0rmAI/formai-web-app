import { cn } from '@/utils/cn'

export interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  /** Texto accesible del interruptor. */
  label: string
  disabled?: boolean
  className?: string
}

/** Interruptor on/off de 46×26. */
export function Toggle({ checked, onChange, label, disabled = false, className }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative h-[26px] w-[46px] shrink-0 cursor-pointer rounded-full transition-colors',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50',
        checked ? 'bg-primary-bright' : 'bg-surface-container-high',
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          'absolute top-[3px] left-[3px] size-5 rounded-full bg-white transition-transform',
          checked && 'translate-x-5',
        )}
      />
    </button>
  )
}
