/**
 * Hook that shows short messages and picks up the one left by the previous page.
 *
 * @author Christian Matos
 * @packageDocumentation
 */

import { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import type { ToastTone } from '@/types/ui'

/**
 * Describes the toast currently shown.
 */
export interface ToastMessage {
  /** Text of the message. */
  message: string
  /** Kind of message. */
  tone: ToastTone
}

/**
 * Navigation state that carries a toast to the next page.
 */
export interface ToastLocationState {
  /** Text the next page shows as a success toast. */
  toast?: string
}

/** Time a toast stays on screen, in milliseconds. */
const TOAST_DURATION_MS = 4000

/**
 * Shows short messages that hide by themselves.
 *
 * @remarks
 * A page that navigates with `{ state: { toast } }` leaves a message for the next page; this hook
 * shows it once and removes it from the history entry, so it does not come back on reload.
 *
 * @returns The current `toast` (or `null`), `showToast` to show a message and `dismissToast` to
 * hide it.
 *
 * @example
 * ```tsx
 * const { toast, showToast } = useToast();
 * showToast('Changes saved');
 * ```
 */
export function useToast() {
  const location = useLocation()
  const navigate = useNavigate()
  const carried = (location.state as ToastLocationState | null)?.toast
  const [toast, setToast] = useState<ToastMessage | null>(null)
  const [shownCarried, setShownCarried] = useState<string>()

  // The carried message can arrive after the first render (a redirect followed by a navigation),
  // so it is picked up during render whenever it changes.
  if (carried && carried !== shownCarried) {
    setShownCarried(carried)
    setToast({ message: carried, tone: 'success' })
  }

  useEffect(() => {
    if (carried) navigate(location.pathname + location.search, { replace: true, state: null })
  }, [carried, navigate, location.pathname, location.search])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(null), TOAST_DURATION_MS)
    return () => window.clearTimeout(timer)
  }, [toast])

  const showToast = useCallback((message: string, tone: ToastTone = 'success') => setToast({ message, tone }), [])
  const dismissToast = useCallback(() => setToast(null), [])

  return { toast, showToast, dismissToast }
}
