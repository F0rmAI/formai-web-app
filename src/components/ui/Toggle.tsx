/**
 * Toggle primitive of the design system.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

import { cn } from '@/utils/cn'

/**
 * Props accepted by {@link Toggle}.
 */
export interface ToggleProps {
  /** Whether the switch is on. */
  checked: boolean
  /** Called with the new state. */
  onChange: (checked: boolean) => void
  /** Accessible label of the switch. */
  label: string
  /**
   * Blocks interaction.
   *
   * @defaultValue `false`
   */
  disabled?: boolean
  /** Extra classes for layout adjustments from the parent. */
  className?: string
}

/**
 * Renders an on/off switch.
 *
 * @example
 * ```tsx
 * <Toggle label="Notifications" checked={enabled} onChange={setEnabled} />
 * ```
 */
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
