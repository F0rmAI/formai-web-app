/**
 * Exercises page.
 *
 * @author Christian Matos
 * @packageDocumentation
 */

import { useState } from 'react'
import { CreateExerciseModal, ExercisesTable } from '@/components/exercises'
import { FilterBar, FilterField, PageHeader, ToastViewport } from '@/components/layout'
import { Button, Card, Dialog, EmptyState, LoadingState, SelectField, type SelectOption } from '@/components/ui'
import { useExercises } from '@/hooks/useExercises'
import { useToast } from '@/hooks/useToast'
import type { CreateExerciseInput, Exercise, ExerciseStatus } from '@/types/exercise'

/** Options of the status filter. */
const statusOptions: SelectOption<ExerciseStatus>[] = [
  { value: 'ACTIVE', label: 'Activos' },
  { value: 'ARCHIVED', label: 'Archivados' },
]

/**
 * Shows the exercise catalog of the trainer by status, with the modal that adds an exercise and
 * the dialog that archives one, using {@link useExercises} for data and actions.
 *
 * @remarks
 * Requires an authenticated session; the route guard redirects otherwise.
 */
export function ExercisesPage() {
  const { toast, showToast } = useToast()
  const {
    exercises,
    status,
    setStatus,
    isLoading,
    error,
    refetch,
    createExercise,
    isCreating,
    createError,
    resetCreateError,
    archiveExercise,
    restoreExercise,
    isChangingStatus,
  } = useExercises()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [exerciseToArchive, setExerciseToArchive] = useState<Exercise | null>(null)
  const isArchivedView = status === 'ARCHIVED'

  const openCreate = () => {
    resetCreateError()
    setIsCreateOpen(true)
  }

  const handleCreate = async (input: CreateExerciseInput) => {
    const result = await createExercise(input)
    if (!result.ok) return
    setIsCreateOpen(false)
    setStatus('ACTIVE')
    showToast('Ejercicio creado y visible en el catálogo')
  }

  const handleArchive = async (exercise: Exercise) => {
    const result = await archiveExercise(exercise.id)
    setExerciseToArchive(null)
    if (result.ok) showToast('Ejercicio archivado · las rutinas no cambian')
    else showToast(result.error.message, 'error')
  }

  const handleRestore = async (exercise: Exercise) => {
    const result = await restoreExercise(exercise.id)
    if (result.ok) showToast('Ejercicio restaurado · vuelve a estar disponible')
    else showToast(result.error.message, 'error')
  }

  return (
    <>
      <PageHeader
        breadcrumb="Inicio / Ejercicios"
        title="Ejercicios"
        subtitle={
          isArchivedView
            ? 'Ejercicios archivados: no aparecen al armar rutinas, pero conservan su historial.'
            : 'Tu catálogo de ejercicios para armar rutinas.'
        }
        actions={<Button label="Nuevo ejercicio" icon="add" size="md" onClick={openCreate} />}
      />

      <div className="mt-2xl flex flex-col gap-2xl">
        <FilterBar>
          <FilterField>
            <SelectField label="Estado" value={status} options={statusOptions} onChange={setStatus} />
          </FilterField>
        </FilterBar>

        {isLoading && exercises.length === 0 && <LoadingState label="Cargando ejercicios…" />}

        {error && (
          <Card>
            <EmptyState
              title="No pudimos cargar tus ejercicios"
              description={error}
              icon="error"
              action={{ label: 'Reintentar', icon: 'refresh', onClick: refetch }}
            />
          </Card>
        )}

        {!error && exercises.length > 0 && (
          <ExercisesTable
            exercises={exercises}
            onArchive={setExerciseToArchive}
            onRestore={(exercise) => {
              if (!isChangingStatus) void handleRestore(exercise)
            }}
          />
        )}

        {!isLoading && !error && exercises.length === 0 && (
          <Card>
            {isArchivedView ? (
              <EmptyState
                title="No hay ejercicios archivados"
                description="Cuando archives un ejercicio, aparecerá aquí para que puedas restaurarlo."
                icon="inventory_2"
              />
            ) : (
              <EmptyState
                title="Aún no tienes ejercicios"
                description="Crea tu primer ejercicio para usarlo al armar rutinas."
                icon="exercise"
                action={{ label: 'Nuevo ejercicio', icon: 'add', onClick: openCreate }}
              />
            )}
          </Card>
        )}
      </div>

      {isCreateOpen && (
        <CreateExerciseModal
          isSubmitting={isCreating}
          error={createError}
          onSubmit={(input) => void handleCreate(input)}
          onClose={() => setIsCreateOpen(false)}
        />
      )}

      <Dialog
        open={Boolean(exerciseToArchive)}
        icon="inventory_2"
        title="¿Archivar este ejercicio?"
        description="Si el ejercicio se usa en alguna rutina no puede eliminarse, pero sí archivarse: dejará de aparecer al crear rutinas y las rutinas actuales no cambian. Lo verás en el filtro «Archivados»."
        cancelLabel="Cerrar"
        confirmLabel={isChangingStatus ? 'Archivando…' : 'Archivar ejercicio'}
        onCancel={() => setExerciseToArchive(null)}
        onConfirm={() => {
          if (exerciseToArchive && !isChangingStatus) void handleArchive(exerciseToArchive)
        }}
      />
      <ToastViewport message={toast?.message} tone={toast?.tone} />
    </>
  )
}
