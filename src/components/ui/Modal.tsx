/**
 * Modal primitive of the design system.
 *
 * @author Melina
 * @packageDocumentation
 */

import { useEffect, useId, type ReactNode } from 'react'
import type { IconName } from '@/types/ui'
import { Icon } from './Icon'
import { Text } from './Text'

/**
 * Props accepted by {@link Modal}.
 */
export interface ModalProps {
  /** Whether the modal is visible. */
  open: boolean
  /** Title of the modal. */
  title: string
  /** Supporting text shown below the title. */
  description?: string
  /** Icon shown in the tile next to the title. */
  icon: IconName
  /** Content of the modal, usually form fields. */
  children?: ReactNode
  /** Buttons shown at the bottom, aligned to the end. */
  actions?: ReactNode
  /** Called when the user dismisses the modal with `Escape` or the backdrop. */
  onClose: () => void
}

/**
 * Renders a modal for forms and results that need more room than a confirmation dialog.
 *
 * @remarks
 * Use `Dialog` to confirm an action with a yes/no answer. The modal closes with `Escape` and with
 * a click on the backdrop. Mobile-first: actions stack on small screens and line up from `sm`.
 *
 * @example
 * ```tsx
 * <Modal open={isOpen} title="New client" icon="person_add" onClose={close} actions={<Button label="Save" />}>
 *   <TextField label="Full name" />
 * </Modal>
 * ```
 */
export function Modal({ open, title, description, icon, children, actions, onClose }: ModalProps) {
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-surface-inverse/40 p-md sm:p-xl"
      onMouseDown={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        onMouseDown={(event) => event.stopPropagation()}
        className="flex max-h-full w-full max-w-[520px] flex-col gap-xl overflow-y-auto rounded-lg bg-surface-card p-xl shadow-floating sm:p-7"
      >
        <div className="flex items-start gap-xl">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-md bg-primary-container">
            <Icon name={icon} size={24} />
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-2xs">
            <Text id={titleId} as="h2" variant="headline">
              {title}
            </Text>
            {description && (
              <Text id={descriptionId} variant="body-l" tone="secondary">
                {description}
              </Text>
            )}
          </div>
        </div>
        {children}
        {actions && <div className="flex flex-col-reverse gap-md sm:flex-row sm:justify-end">{actions}</div>}
      </section>
    </div>
  )
}
