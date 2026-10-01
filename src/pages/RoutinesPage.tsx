import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AssignRoutineModal,
  DuplicateRoutineModal,
  RoutineFilters,
  RoutinesTable,
} from '@/components/routines'
import { PageHeader } from '@/components/layout'
import { Button, Callout, Card, EmptyState, Text, Toast } from '@/components/ui'
import { useRoutines } from '@/hooks/useRoutines'
import type { Routine } from '@/types/routine'

export function RoutinesPage() {
  const navigate = useNavigate()
  const { routines, allRoutines, status, isLoading, error, setStatus, refetch } = useRoutines()
  const [routineToDuplicate, setRoutineToDuplicate] = useState<Routine | null>(null)
  const [routineToAssign, setRoutineToAssign] = useState<Routine | null>(null)
  const [toast, setToast] = useState<string>()

  const showToast = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(undefined), 3000)
  }

  const hasFilters = status !== 'ALL'
  const emptyTitle = hasFilters ? 'No encontramos rutinas' : 'Aún no tienes rutinas'
  const emptyDescription = hasFilters
    ? 'Prueba con otro filtro de estado.'
    : 'Crea tu primera rutina para asignarla a tus clientes.'

  return (
    <>
      <PageHeader
        breadcrumb="Inicio / Rutinas"
        title="Rutinas"
        subtitle="Crea, edita y asigna planes de entrenamiento a tus clientes."
        actions={<Button label="Nueva rutina" icon="add" onClick={() => navigate('/routines/new')} />}
      />

      <div className="mt-2xl flex flex-col gap-2xl">
        {!isLoading && !error && allRoutines.length > 0 && (
          <RoutineFilters status={status} onStatusChange={setStatus} />
        )}

        {error && (
          <div className="flex flex-col items-stretch gap-xl sm:flex-row sm:items-end">
            <Callout title="No pudimos cargar tus rutinas" description={error} tone="warning" className="flex-1" />
            <Button label="Reintentar" variant="secondary" onClick={() => void refetch()} className="w-full sm:w-auto" />
          </div>
        )}

        {isLoading && (
          <Card className="flex min-h-[224px] items-center justify-center">
            <Text tone="muted">Cargando rutinas…</Text>
          </Card>
        )}

        {!isLoading && !error && routines.length > 0 && (
          <RoutinesTable
            routines={routines}
            onOpen={(routine) => navigate(`/routines/${routine.id}`)}
            onDuplicate={setRoutineToDuplicate}
            onAssign={setRoutineToAssign}
          />
        )}

        {!isLoading && !error && routines.length === 0 && (
          <Card className="flex min-h-[286px] items-center justify-center p-xl sm:p-2xl">
            <EmptyState
              title={emptyTitle}
              description={emptyDescription}
              icon={hasFilters ? 'search_off' : 'calendar_month'}
              action={
                hasFilters
                  ? { label: 'Ver todas', icon: 'filter_list', onClick: () => setStatus('ALL') }
                  : { label: 'Nueva rutina', icon: 'add', onClick: () => navigate('/routines/new') }
              }
            />
          </Card>
        )}
      </div>

      <DuplicateRoutineModal
        routine={routineToDuplicate}
        onClose={() => setRoutineToDuplicate(null)}
        onDuplicated={(routine) => {
          setRoutineToDuplicate(null)
          showToast(`“${routine.name}” se creó como borrador.`)
          void refetch()
          navigate(`/routines/${routine.id}`)
        }}
      />

      <AssignRoutineModal
        routine={routineToAssign}
        onClose={() => setRoutineToAssign(null)}
        onAssigned={(routineName, count) => {
          setRoutineToAssign(null)
          showToast(`“${routineName}” se asignó a ${count} cliente${count === 1 ? '' : 's'}.`)
          void refetch()
        }}
      />

      {toast && (
        <Toast message={toast} tone="success" className="fixed inset-x-xl bottom-xl sm:right-10 sm:left-auto sm:bottom-8" />
      )}
    </>
  )
}
