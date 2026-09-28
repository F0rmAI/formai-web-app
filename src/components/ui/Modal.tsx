import { useEffect, useId, type ReactNode } from 'react'
import type { IconName } from '@/types/ui'
import { cn } from '@/utils/cn'
import { Icon } from './Icon'
import { Text } from './Text'

export interface ModalProps {
  open: boolean
  title: string
  description?: string
  icon: IconName
  children: ReactNode
  onClose: () => void
  className?: string
}

/** Contenedor de modal para formularios y resultados complejos. */
export function Modal({ open, title, description, icon, children, onClose, className }: ModalProps) {
  const titleId = useId()
  const descriptionId = useId()

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-inverse/40 p-md sm:p-xl" onMouseDown={onClose}>
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        onMouseDown={(event) => event.stopPropagation()}
        className={cn(
          'max-h-[calc(100dvh-16px)] w-full max-w-[480px] overflow-y-auto rounded-lg bg-surface-card p-xl shadow-floating sm:max-h-[calc(100dvh-32px)] sm:p-2xl',
          className,
        )}
      >
        <div className="flex items-start gap-xl">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-md bg-primary-container">
            <Icon name={icon} size={24} className="text-primary" />
          </span>
          <div className="min-w-0 flex-1">
            <Text id={titleId} as="h2" variant="headline">
              {title}
            </Text>
            {description && (
              <Text id={descriptionId} variant="body-l" tone="secondary" className="mt-xs">
                {description}
              </Text>
            )}
          </div>
        </div>
        {children}
      </section>
    </div>
  )
}
