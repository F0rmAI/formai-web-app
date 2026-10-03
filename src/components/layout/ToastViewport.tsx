/**
 * Toast viewport layout component.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

import { Toast } from '@/components/ui'
import type { ToastTone } from '@/types/ui'

/**
 * Props accepted by {@link ToastViewport}.
 */
export interface ToastViewportProps {
  /** Text of the message; nothing is rendered while it is empty. */
  message?: string
  /**
   * Kind of message.
   *
   * @defaultValue `'success'`
   */
  tone?: ToastTone
}

/**
 * Renders the current toast fixed over the page.
 *
 * @remarks
 * Mobile-first: the toast spans the bottom of the screen on small screens and sits at the bottom
 * right corner from the `sm` breakpoint.
 *
 * @example
 * ```tsx
 * <ToastViewport message={toast?.message} tone={toast?.tone} />
 * ```
 */
export function ToastViewport({ message, tone = 'success' }: ToastViewportProps) {
  if (!message) return null

  return (
    <div className="pointer-events-none fixed inset-x-xl bottom-xl z-[60] flex justify-end sm:right-10 sm:bottom-8 sm:left-auto">
      <Toast message={message} tone={tone} className="pointer-events-auto" />
    </div>
  )
}
