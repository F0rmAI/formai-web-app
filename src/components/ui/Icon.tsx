import type { HTMLAttributes } from 'react'
import type { IconName, IconSize } from '@/types/ui'
import { cn } from '@/utils/cn'

export interface IconProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** Ligadura de Material Symbols Rounded (p. ej. "bolt"). */
  name: IconName
  size?: IconSize
  /** Texto accesible; si se omite, el ícono es decorativo. */
  label?: string
}

/** Ícono Material Symbols Rounded. Color por defecto: primary. */
export function Icon({ name, size = 20, label, className, style, ...props }: IconProps) {
  return (
    <span
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={cn('material-symbols-rounded shrink-0 select-none text-primary', className)}
      style={{
        fontSize: size,
        width: size,
        height: size,
        lineHeight: `${size}px`,
        ...style,
      }}
      {...props}
    >
      {name}
    </span>
  )
}
