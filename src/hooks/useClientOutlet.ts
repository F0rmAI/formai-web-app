/**
 * Hook that reads the client loaded by the frame of the client pages.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

import { useOutletContext } from 'react-router-dom'
import type { ClientDetail, UpdateBodyProfileInput } from '@/types/client'
import type { ToastTone } from '@/types/ui'

/**
 * Data and actions the frame of the client pages hands to the page of the selected tab.
 */
export interface ClientOutletContext {
  /** Client being shown. */
  client: ClientDetail
  /** Saves the body profile; resolves with `true` when it succeeds. */
  saveBodyProfile: (input: UpdateBodyProfileInput) => Promise<boolean>
  /** Whether the body profile is being saved. */
  isSavingProfile: boolean
  /** Message of the failed save of the body profile. */
  profileError: string | null
  /** Clears the message of the failed save. */
  resetProfileError: () => void
  /** Shows a short message over the page. */
  showToast: (message: string, tone?: ToastTone) => void
}

/**
 * Reads the client and the actions provided by the frame of the client pages.
 *
 * @returns The `client` loaded, `saveBodyProfile` with its `isSavingProfile` and `profileError`
 * state, `resetProfileError` and `showToast`.
 *
 * @example
 * ```tsx
 * const { client, showToast } = useClientOutlet();
 * ```
 */
export function useClientOutlet(): ClientOutletContext {
  return useOutletContext<ClientOutletContext>()
}
