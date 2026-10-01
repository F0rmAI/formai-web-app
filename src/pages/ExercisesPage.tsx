import { useState } from 'react'
import {
  ArchiveExerciseDialog,
  CreateExerciseModal,
  ExerciseFilters,
  ExercisesTable,
} from '@/components/exercises'
import { PageHeader } from '@/components/layout'
import { Button, Callout, Card, EmptyState, Text, Toast } from '@/components/ui'
import { useExercises } from '@/hooks/useExercises'
import type { Exercise } from '@/types/exercise'

export function ExercisesPage() {
  const {
    exercises,
    status,
    isLoading,
    error,
    setStatus,
    createExercise,
    archiveExercise,
    restoreExercise,
    refetch,
  } = useExercises()

  const [createOpen, setCreateOpen] = useState(false)
  const [exerciseToArchive, setExerciseToArchive] = useState<Exercise | null>(null)
  const [isArchiving, setIsArchiving] = useState(false)
  const [archiveError, setArchiveError] = useState<string>()
  const [toast, setToast] = useState<string>()

  const showToast = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(undefined), 3000)
  }

  const handleArchive = async () => {
    if (!exerciseToArchive) return
    setIsArchiving(true)
    setArchiveError(undefined)
    try {
      const name = exerciseToArchive.name
      await archiveExercise(exerciseToArchive.id)
      setExerciseToArchive(null)
      showToast(`“${name}” se archivó.`)
    } catch {
      setArchiveError('No pudimos archivar este ejercicio. Inténtalo de nuevo.')
    } finally {
      setIsArchiving(false)
    }
  }

  const handleRestore = async (exercise: Exercise) => {
    try {
      await restoreExercise(exercise.id)
      showToast(`“${exercise.name}” se restauró.`)
    } catch {
      showToast('No pudimos restaurar este ejercicio.')
    }
  }

  const emptyTitle = status === 'ARCHIVED' ? 'No hay ejercicios archivados' : 'Aún no tienes ejercicios'
  const emptyDescription =
    status === 'ARCHIVED'
      ? 'Cuando archives un ejercicio, aparecerá aquí para que puedas restaurarlo.'
      : 'Crea tu primer ejercicio para usarlo al armar rutinas.'

  return (
    <>
      <PageHeader
        breadcrumb="Inicio / Ejercicios"
        title="Ejercicios"
        subtitle="Tu catálogo de ejercicios para armar rutinas."
        actions={
          <Button label="Nuevo ejercicio" icon="add" onClick={() => setCreateOpen(true)} />
        }
      />

      <div className="mt-2xl flex flex-col gap-2xl">
        {!isLoading && !error && (
          <ExerciseFilters status={status} onStatusChange={setStatus} />
        )}

        {error && (
          <div className="flex flex-col items-stretch gap-xl sm:flex-row sm:items-end">
            <Callout title="No pudimos cargar tus ejercicios" description={error} tone="warning" className="flex-1" />
            <Button label="Reintentar" variant="secondary" onClick={() => void refetch()} className="w-full sm:w-auto" />
          </div>
        )}

        {isLoading && (
          <Card className="flex min-h-[224px] items-center justify-center">
            <Text tone="muted">Cargando ejercicios…</Text>
          </Card>
        )}

        {!isLoading && !error && exercises.length > 0 && (
          <ExercisesTable
            exercises={exercises}
            onArchive={setExerciseToArchive}
            onRestore={(exercise) => void handleRestore(exercise)}
          />
        )}

        {!isLoading && !error && exercises.length === 0 && (
          <Card className="flex min-h-[286px] items-center justify-center p-xl sm:p-2xl">
            <EmptyState
              title={emptyTitle}
              description={emptyDescription}
              icon={status === 'ARCHIVED' ? 'inventory_2' : 'exercise'}
              action={
                status === 'ACTIVE'
                  ? { label: 'Nuevo ejercicio', icon: 'add', onClick: () => setCreateOpen(true) }
                  : { label: 'Ver activos', icon: 'filter_list', onClick: () => setStatus('ACTIVE') }
              }
            />
          </Card>
        )}
      </div>

      {createOpen && (
        <CreateExerciseModal
          open
          onClose={() => setCreateOpen(false)}
          onCreate={createExercise}
          onCreated={(exercise) => {
            setCreateOpen(false)
            if (status !== 'ACTIVE') setStatus('ACTIVE')
            showToast(`“${exercise.name}” se agregó al catálogo.`)
          }}
        />
      )}

      <ArchiveExerciseDialog
        exercise={exerciseToArchive}
        isArchiving={isArchiving}
        onClose={() => {
          setExerciseToArchive(null)
          setArchiveError(undefined)
        }}
        onConfirm={() => void handleArchive()}
      />

      {archiveError && (
        <Toast message={archiveError} tone="error" className="fixed inset-x-xl bottom-xl sm:right-10 sm:left-auto sm:bottom-8" />
      )}
      {toast && !archiveError && (
        <Toast message={toast} tone="success" className="fixed inset-x-xl bottom-xl sm:right-10 sm:left-auto sm:bottom-8" />
      )}
    </>
  )
}
