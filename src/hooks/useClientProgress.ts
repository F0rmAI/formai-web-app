/**
 * Hook of the progress of one client.
 *
 * @author Christian Matos
 * @packageDocumentation
 */

import { useCallback, useState } from 'react'
import { workoutsService } from '@/services/workouts.service'
import type { ProgressWeeks } from '@/types/workout'
import { toIsoDate } from '@/utils/format'
import { useAsyncData } from './useAsyncData'

/**
 * Loads the adherence of a client in a period and the evolution of one exercise.
 *
 * @remarks
 * The exercise shown is the one the trainer picks; until then, or when the pick has no records in
 * the period, it is the first exercise of the report.
 *
 * @param clientId - Identifier of the client; changing it loads the progress of another client.
 * @returns The `weeks` of the period with `setWeeks`; the `exerciseId` shown with `setExerciseId`;
 * the `report` and the `chart` loaded (`null` until they arrive); the `isLoading` and `error`
 * state of the report; and `refetch` to reload it.
 *
 * @example
 * ```tsx
 * const { report, chart, weeks, setWeeks, isLoading, error } = useClientProgress(clientId);
 * ```
 */
export function useClientProgress(clientId: string) {
  const [weeks, setWeeks] = useState<ProgressWeeks>(8)
  const [pickedExerciseId, setExerciseId] = useState('')

  const loadReport = useCallback(
    (signal: AbortSignal) => {
      const to = new Date()
      const from = new Date(to)
      from.setDate(to.getDate() - (weeks * 7 - 1))
      return workoutsService.getProgressReport(clientId, toIsoDate(from), toIsoDate(to), signal)
    },
    [clientId, weeks],
  )
  const report = useAsyncData(loadReport, 'No pudimos cargar el progreso de este cliente.')

  const exercises = report.data?.exercises ?? []
  const exerciseId = exercises.some((exercise) => exercise.exerciseId === pickedExerciseId)
    ? pickedExerciseId
    : (exercises[0]?.exerciseId ?? '')

  const loadChart = useCallback(
    (signal: AbortSignal) =>
      exerciseId ? workoutsService.getProgressChart(clientId, exerciseId, weeks, signal) : Promise.resolve(null),
    [clientId, exerciseId, weeks],
  )
  const chart = useAsyncData(loadChart, 'No pudimos cargar la evolución de este ejercicio.')

  return {
    weeks,
    setWeeks,
    exerciseId,
    setExerciseId,
    report: report.data,
    chart: chart.data,
    isLoading: report.isLoading,
    error: report.error,
    refetch: report.refetch,
  }
}
