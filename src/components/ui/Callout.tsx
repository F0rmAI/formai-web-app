import type { CalloutTone, IconName, TextTone } from '@/types/ui'
import { cn } from '@/utils/cn'
import { Icon } from './Icon'
import { Text } from './Text'

const toneStyles: Record<CalloutTone, { container: string; title: TextTone; description: string }> = {
  info: { container: 'bg-surface-container-high', title: 'default', description: 'text-content-secondary' },
  warning: {
    container: 'bg-secondary-container',
    title: 'accent',
    description: 'text-secondary-on-container-variant',
  },
}

export interface CalloutProps {
  title: string
  description?: string
  tone?: CalloutTone
  icon?: IconName
  className?: string
}

/** Aviso destacado (p. ej. técnica de un ejercicio). */
export function Callout({ title, description, tone = 'info', icon = 'warning', className }: CalloutProps) {
  const styles = toneStyles[tone]

  return (
    <div className={cn('flex w-full flex-col gap-xs rounded-lg p-xl', styles.container, className)}>
      <div className="flex items-center gap-md">
        <Icon name={icon} size={20} className="text-secondary-text" />
        <Text variant="body-l-strong" tone={styles.title} className="flex-1">
          {title}
        </Text>
      </div>
      {description && (
        <Text variant="body-l" className={styles.description}>
          {description}
        </Text>
      )}
    </div>
  )
}
