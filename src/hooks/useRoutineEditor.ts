import { useCallback, useEffect, useState } from 'react'
import { RoutinesServiceError, routinesService } from '@/services/routines.service'
import type {
  AssignRoutineInput,
  DuplicateRoutineInput,
  Routine,
  RoutineEditorState,
  RoutineVersion,
} from '@/types/routine'
import {
  createEmptyEditorState,
  editorStateToSaveInput,
  routineToEditorState,
  validateEditorState,
} from '@/utils/routine-editor'

export function useRoutineEditor(routineId?: string) {
  const isNew = !routineId
  const [routine, setRoutine] = useState<Routine | null>(null)
  const [editorState, setEditorState] = useState<RoutineEditorState>(createEmptyEditorState())
  const [versions, setVersions] = useState<RoutineVersion[]>([])
  const [isLoading, setIsLoading] = useState(!isNew)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)

  const loadRoutine = useCallback(async () => {
    if (!routineId) return
    setIsLoading(true)
    setError(null)
    try {
      const loaded = await routinesService.getById(routineId)
      setRoutine(loaded)
      setEditorState(routineToEditorState(loaded))
    } catch (err) {
      const message =
        err instanceof RoutinesServiceError
          ? err.message
          : 'No pudimos cargar esta rutina. Inténtalo nuevamente.'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [routineId])

  useEffect(() => {
    if (isNew) {
      setRoutine(null)
      setEditorState(createEmptyEditorState())
      setIsLoading(false)
      setError(null)
      return
    }
    void loadRoutine()
  }, [isNew, loadRoutine])

  const save = useCallback(async () => {
    const validation = validateEditorState(editorState)
    if (validation) {
      setValidationError(validation)
      throw new Error(validation)
    }
    setValidationError(null)
    setIsSaving(true)
    try {
      const input = editorStateToSaveInput(editorState)
      if (isNew) {
        const created = await routinesService.create(input)
        setRoutine(created)
        setEditorState(routineToEditorState(created))
        return created
      }
      if (!routineId) throw new Error('Rutina no encontrada.')
      const updated = await routinesService.update(routineId, input)
      setRoutine(updated)
      setEditorState(routineToEditorState(updated))
      return updated
    } catch (err) {
      const message =
        err instanceof RoutinesServiceError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'No pudimos guardar la rutina. Inténtalo de nuevo.'
      setValidationError(message)
      throw err
    } finally {
      setIsSaving(false)
    }
  }, [editorState, isNew, routineId])

  const duplicate = useCallback(
    async (input: DuplicateRoutineInput) => {
      if (!routineId) throw new Error('Guarda la rutina antes de duplicarla.')
      return routinesService.duplicate(routineId, input)
    },
    [routineId],
  )

  const assign = useCallback(
    async (input: AssignRoutineInput) => {
      if (!routineId) throw new Error('Guarda la rutina antes de asignarla.')
      const assignments = await routinesService.assign(routineId, input)
      await loadRoutine()
      return assignments
    },
    [routineId, loadRoutine],
  )

  const loadVersions = useCallback(async () => {
    if (!routineId) return []
    const result = await routinesService.getVersions(routineId)
    setVersions(result)
    return result
  }, [routineId])

  return {
    routine,
    editorState,
    setEditorState,
    versions,
    isNew,
    isLoading,
    isSaving,
    error,
    validationError,
    setValidationError,
    save,
    duplicate,
    assign,
    loadVersions,
    refetch: loadRoutine,
  }
}
