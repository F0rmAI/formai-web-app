import { useCallback, useEffect, useMemo, useState } from 'react'
import { workoutsService } from '@/services/workouts.service'
import type { ProgressChart, ProgressReport, ProgressWeeks } from '@/types/workout'

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export type ProgressPeriod = '30d' | '8w' | '12w'

function rangeForPeriod(period: ProgressPeriod): { from: string; to: string; weeks: ProgressWeeks } {
  const to = new Date()
  const from = new Date()
  if (period === '8w') {
    from.setDate(to.getDate() - 55)
    return { from: toIsoDate(from), to: toIsoDate(to), weeks: 8 }
  }
  if (period === '12w') {
    from.setDate(to.getDate() - 83)
    return { from: toIsoDate(from), to: toIsoDate(to), weeks: 12 }
  }
  from.setDate(to.getDate() - 29)
  return { from: toIsoDate(from), to: toIsoDate(to), weeks: 4 }
}

export function useClientProgress(clientId: string) {
  const [period, setPeriod] = useState<ProgressPeriod>('30d')
  const [exerciseId, setExerciseId] = useState<string>('')
  const [report, setReport] = useState<ProgressReport | null>(null)
  const [chart, setChart] = useState<ProgressChart | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const range = useMemo(() => rangeForPeriod(period), [period])

  useEffect(() => {
    let active = true

    workoutsService
      .getProgressReport(clientId, range.from, range.to)
      .then((nextReport) => {
        if (!active) return
        setReport(nextReport)
        setExerciseId((current) => {
          if (current && nextReport.exercises.some((item) => item.exerciseId === current)) {
            return current
          }
          return nextReport.exercises[0]?.exerciseId ?? ''
        })
      })
      .catch(() => {
        if (!active) return
        setError('No pudimos cargar el progreso de este cliente.')
        setReport(null)
        setExerciseId('')
        setChart(null)
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [clientId, range.from, range.to])

  useEffect(() => {
    let active = true
    if (!exerciseId) {
      return
    }

    workoutsService
      .getProgressChart(clientId, exerciseId, range.weeks)
      .then((nextChart) => {
        if (active) setChart(nextChart)
      })
      .catch(() => {
        if (active) setChart(null)
      })

    return () => {
      active = false
    }
  }, [clientId, exerciseId, range.weeks])

  const refetch = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const nextReport = await workoutsService.getProgressReport(clientId, range.from, range.to)
      setReport(nextReport)
      const nextExerciseId =
        exerciseId && nextReport.exercises.some((item) => item.exerciseId === exerciseId)
          ? exerciseId
          : (nextReport.exercises[0]?.exerciseId ?? '')
      setExerciseId(nextExerciseId)
      if (nextExerciseId) {
        setChart(await workoutsService.getProgressChart(clientId, nextExerciseId, range.weeks))
      } else {
        setChart(null)
      }
    } catch {
      setError('No pudimos cargar el progreso de este cliente.')
      setReport(null)
      setChart(null)
    } finally {
      setIsLoading(false)
    }
  }, [clientId, exerciseId, range.from, range.to, range.weeks])

  return {
    period,
    setPeriod,
    exerciseId,
    setExerciseId,
    report,
    chart,
    isLoading,
    error,
    refetch,
  }
}
