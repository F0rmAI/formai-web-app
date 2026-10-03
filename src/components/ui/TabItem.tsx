/**
 * Tab item primitive of the design system.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'
import { Text } from './Text'

/**
 * Props accepted by {@link TabItem}.
 */
export interface TabItemProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** Text of the tab. */
  label: string
  /**
   * Whether the tab is the current one.
   *
   * @defaultValue `false`
   */
  active?: boolean
}

/**
 * Renders one tab of an in-page tab bar.
 *
 * @example
 * ```tsx
 * <TabItem label="Profile" active={tab === 'profile'} onClick={() => setTab('profile')} />
 * ```
 */
export function TabItem({ label, active = false, type = 'button', className, ...props }: TabItemProps) {
  return (
    <button
      type={type}
      role="tab"
      aria-selected={active}
      className={cn(
        'flex cursor-pointer items-center border-b-2 px-xs py-lg focus-visible:outline-2 focus-visible:outline-primary',
        active ? 'border-primary' : 'border-transparent',
        className,
      )}
      {...props}
    >
      <Text as="span" variant={active ? 'label-l' : 'body-l-strong'} tone={active ? 'primary' : 'secondary'}>
        {label}
      </Text>
    </button>
  )
}
