import { useEffect, useId } from 'react'
import type { DialogTone, IconName } from '@/types/ui'
import { cn } from '@/utils/cn'
import { Button } from './Button'
import { Icon } from './Icon'
import { Text } from './Text'

export interface DialogProps {
  open: boolean
  title: string
  description?: string
  tone?: DialogTone
  icon?: IconName
  confirmLabel: string
  cancelLabel?: string
  onConfirm: () => void
  /** Se llama al cancelar, al pulsar Escape o al hacer clic fuera. */
  onCancel: () => void
}

/** Diálogo de confirmación (440 px en web). */
export function Dialog({
  open,
  title,
  description,
  tone = 'default',
  icon = tone === 'danger' ? 'warning' : 'flag',
  confirmLabel,
  cancelLabel = 'Cancelar',
  onConfirm,
  onCancel,
}: DialogProps) {
  const titleId = useId()
  const descriptionId = useId()
  const isDanger = tone === 'danger'

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onCancel])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-surface-inverse/40 p-xl"
      onClick={onCancel}
    >
      <div
        role={isDanger ? 'alertdialog' : 'dialog'}
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        onClick={(event) => event.stopPropagation()}
        className="flex w-full max-w-[440px] flex-col items-start gap-xl rounded-lg bg-surface-card p-2xl shadow-floating"
      >
        <span
          className={cn(
            'flex size-11 items-center justify-center rounded-md',
            isDanger ? 'bg-error-container' : 'bg-primary-container',
          )}
        >
          <Icon name={icon} size={24} className={isDanger ? 'text-error' : 'text-primary'} />
        </span>
        <Text id={titleId} variant="title">
          {title}
        </Text>
        {description && (
          <Text id={descriptionId} variant="body-l" tone="secondary">
            {description}
          </Text>
        )}
        <div className="flex w-full gap-md">
          <Button label={cancelLabel} variant="secondary" size="md" className="flex-1" onClick={onCancel} />
          <Button
            label={confirmLabel}
            variant={isDanger ? 'danger' : 'primary'}
            size="md"
            className="flex-1"
            onClick={onConfirm}
          />
        </div>
      </div>
    </div>
  )
}
