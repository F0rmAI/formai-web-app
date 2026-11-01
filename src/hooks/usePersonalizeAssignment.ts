/**
 * Write action for a client's current assignment personalization.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

import { useCallback, useRef } from 'react'
import { clientsService } from '@/services/clients.service'
import type { PersonalizeAssignmentInput } from '@/types/client'
import { useAsyncAction, type ActionResult } from './useAsyncAction'

/**
 * Saves a client's note and prescription overrides, then reloads the client detail.
 *
 * @param clientId - Client whose current assignment receives the personalization.
 * @param onSaved - Reloads the detail after a successful write.
 * @returns The save action, its pending and error states, and an error reset callback.
 *
 * @example
 * ```tsx
 * const { personalizeAssignment, isPersonalizing } = usePersonalizeAssignment(clientId, refetch);
 * ```
 */
export function usePersonalizeAssignment(clientId: string, onSaved: () => void) {
  const action = useAsyncAction(clientsService.personalizeAssignment, 'No pudimos guardar la personalización. Inténtalo de nuevo.')
  const pending = useRef<Promise<ActionResult<void>> | null>(null)
  const { run } = action
  const personalizeAssignment = useCallback((input: PersonalizeAssignmentInput) => {
    if (pending.current) return pending.current
    pending.current = run(clientId, input).then((result) => {
      if (result.ok) onSaved()
      return result
    }).finally(() => { pending.current = null })
    return pending.current
  }, [run, clientId, onSaved])
  return {
    personalizeAssignment,
    isPersonalizing: action.isRunning,
    personalizeError: action.error?.message ?? null,
    resetPersonalizeError: action.reset,
  }
}
