import type { HTMLAttributes } from 'react'
import type { IconName, SectionLabelTone, TextTone } from '@/types/ui'
import { cn } from '@/utils/cn'
import { Icon } from './Icon'
import { Text } from './Text'

const toneClass: Record<SectionLabelTone, { dot: string; icon: string; text: TextTone }> = {
  primary: { dot: 'bg-primary', icon: 'text-primary', text: 'primary' },
  secondary: { dot: 'bg-secondary-text', icon: 'text-secondary-text', text: 'accent' },
  neutral: { dot: 'bg-content-secondary', icon: 'text-content-secondary', text: 'secondary' },
}

export interface SectionLabelProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  label: string
  tone?: SectionLabelTone
  /** Si se indica, reemplaza el punto inicial por este ícono. */
  icon?: IconName
}

/** Overline de sección con punto o ícono inicial. */
export function SectionLabel({ label, tone = 'primary', icon, className, ...props }: SectionLabelProps) {
  const styles = toneClass[tone]

  return (
    <div className={cn('flex items-center gap-sm', className)} {...props}>
      {icon ? (
        <Icon name={icon} size={16} className={styles.icon} />
      ) : (
        <span aria-hidden className={cn('size-1.5 shrink-0 rounded-full', styles.dot)} />
      )}
      <Text as="span" variant="overline" tone={styles.text} className="whitespace-nowrap">
        {label}
      </Text>
    </div>
  )
}
