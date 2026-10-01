import { useCallback, useEffect, useState } from 'react'
import { WorkoutsServiceError } from '@/services/workouts.contract'
import { workoutsService } from '@/services/workouts.service'
import type { RecordSetInput, WorkoutSession } from '@/types/workout'

export function useWorkoutDetail(clientId: string, sessionId: string) {
  const [session, setSession] = useState<WorkoutSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const loadSession = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      setSession(await workoutsService.getById(clientId, sessionId))
    } catch {
      setError('No pudimos abrir este entrenamiento.')
    } finally {
      setIsLoading(false)
    }
  }, [clientId, sessionId])

  useEffect(() => {
    let active = true
    workoutsService
      .getById(clientId, sessionId)
      .then((result) => {
        if (active) setSession(result)
      })
      .catch(() => {
        if (active) setError('No pudimos abrir este entrenamiento.')
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })
    return () => {
      active = false
    }
  }, [clientId, sessionId])

  const recordSet = useCallback(
    async (input: RecordSetInput) => {
      setIsSaving(true)
      setActionError(null)
      try {
        const existing = session?.exercises
          .find((exercise) => exercise.exerciseId === input.exerciseId)
          ?.sets.some((set) => set.setNumber === input.setNumber)
        const updated = existing
          ? await workoutsService.correctSet(clientId, sessionId, input)
          : await workoutsService.recordSet(clientId, sessionId, input)
        setSession(updated)
        return updated
      } catch (err) {
        const message =
          err instanceof WorkoutsServiceError ? err.message : 'No pudimos guardar la serie.'
        setActionError(message)
        throw err
      } finally {
        setIsSaving(false)
      }
    },
    [clientId, session, sessionId],
  )

  const finishSession = useCallback(
    async (confirmPartial: boolean) => {
      setIsSaving(true)
      setActionError(null)
      try {
        const updated = await workoutsService.finishSession(clientId, sessionId, confirmPartial)
        setSession(updated)
        return updated
      } catch (err) {
        const message =
          err instanceof WorkoutsServiceError ? err.message : 'No pudimos cerrar el entrenamiento.'
        setActionError(message)
        throw err
      } finally {
        setIsSaving(false)
      }
    },
    [clientId, sessionId],
  )

  return {
    session,
    isLoading,
    error,
    actionError,
    isSaving,
    recordSet,
    finishSession,
    refetch: loadSession,
  }
}
