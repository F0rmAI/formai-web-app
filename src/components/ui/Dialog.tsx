/**
 * Dialog primitive of the design system.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

import { useEffect, useId } from 'react'
import type { DialogTone, IconName } from '@/types/ui'
import { cn } from '@/utils/cn'
import { Button } from './Button'
import { Icon } from './Icon'
import { Text } from './Text'

/**
 * Props accepted by {@link Dialog}.
 */
export interface DialogProps {
  /** Whether the dialog is visible. */
  open: boolean
  /** Question or statement the user must confirm. */
  title: string
  /** Supporting text shown below the title. */
  description?: string
  /**
   * Kind of confirmation.
   *
   * @defaultValue `'default'`
   */
  tone?: DialogTone
  /** Icon shown in the tile; defaults to `flag`, or to `warning` for the `danger` tone. */
  icon?: IconName
  /** Label of the confirm button. */
  confirmLabel: string
  /**
   * Label of the cancel button.
   *
   * @defaultValue `'Cancelar'`
   */
  cancelLabel?: string
  /** Called when the user confirms. */
  onConfirm: () => void
  /** Called when the user cancels or dismisses the dialog. */
  onCancel: () => void
}

/**
 * Renders a modal confirmation dialog.
 *
 * @remarks
 * Use the `danger` tone for destructive actions.
 *
 * @example
 * ```tsx
 * <Dialog
 *   open={isOpen}
 *   title="Finish the session?"
 *   confirmLabel="Finish"
 *   onConfirm={finish}
 *   onCancel={close}
 * />
 * ```
 */
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
