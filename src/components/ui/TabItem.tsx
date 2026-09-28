import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'
import { Text } from './Text'

export interface TabItemProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  label: string
  active?: boolean
}

/** Pestaña de navegación interna (ficha, entrenamientos, progreso…). */
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
