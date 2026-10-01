/**
 * Detail page of one routine.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AssignRoutineModal, DuplicateRoutineModal, RoutineSessionCard, RoutineStatusBadge } from '@/components/routines'
import { PageHeader, ToastViewport } from '@/components/layout'
import { Badge, Button, Card, Dialog, EmptyState, LoadingState } from '@/components/ui'
import { useRoutine } from '@/hooks/useRoutine'
import { useToast, type ToastLocationState } from '@/hooks/useToast'
import { ROUTES } from '@/navigation/routes'
import type { ClientSummary } from '@/types/client'
import { firstName, formatCount, formatDate, parseDate, toIsoDate } from '@/utils/format'

/** Assignment waiting for the trainer to confirm that it replaces current routines. */
interface PendingAssignment {
  clients: ClientSummary[]
  startDate: string
}

/** Formats the day before the start date, when the replaced routines are closed. */
function toClosingDate(startDate: string): string {
  const date = parseDate(startDate) ?? new Date()
  date.setDate(date.getDate() - 1)
  return formatDate(toIsoDate(date), 'long')
}

/** Lists the names of the clients of an assignment. */
function toNames(clients: ClientSummary[]): string {
  return clients.length === 1 ? clients[0].fullName : formatCount(clients.length, 'cliente', 'clientes')
}

/** Renders the detail of one routine; it is keyed by routine so its state never leaks to another. */
function RoutineDetail({ routineId }: { routineId: string }) {
  const navigate = useNavigate()
  const { toast, showToast } = useToast()
  const {
    routine,
    isLoading,
    error,
    refetch,
    clients,
    duplicate,
    isDuplicating,
    duplicateError,
    resetDuplicateError,
    assign,
    isAssigning,
    assignError,
    resetAssignError,
  } = useRoutine(routineId)
  const [isDuplicateOpen, setIsDuplicateOpen] = useState(false)
  const [isAssignOpen, setIsAssignOpen] = useState(false)
  const [pending, setPending] = useState<PendingAssignment | null>(null)

  if (!routine) {
    if (isLoading) return <LoadingState label="Cargando rutina…" />
    return (
      <Card>
        <EmptyState
          title="No pudimos abrir esta rutina"
          description={error ?? 'La rutina solicitada no está disponible.'}
          icon="error"
          action={{ label: 'Reintentar', icon: 'refresh', onClick: refetch }}
        />
      </Card>
    )
  }

  const handleDuplicate = async (name: string) => {
    const result = await duplicate(name)
    if (!result.ok) return
    const state: ToastLocationState = { toast: 'Rutina duplicada · edítala antes de asignarla' }
    navigate(ROUTES.routine(result.value.id), { state })
  }

  const runAssignment = async ({ clients: selected, startDate }: PendingAssignment) => {
    const result = await assign(
      selected.map((client) => client.id),
      startDate,
    )
    setPending(null)
    if (!result.ok) {
      setIsAssignOpen(true)
      return
    }
    setIsAssignOpen(false)
    showToast(`Rutina asignada a ${toNames(selected)} desde el ${formatDate(startDate, 'day')}`)
  }

  const handleAssign = (selected: ClientSummary[], startDate: string) => {
    const assignment = { clients: selected, startDate }
    const replaced = selected.filter((client) => client.currentRoutine && client.currentRoutine !== routine.name)
    if (replaced.length === 0) {
      void runAssignment(assignment)
      return
    }
    setIsAssignOpen(false)
    setPending(assignment)
  }

  const replaced = pending?.clients.filter((client) => client.currentRoutine && client.currentRoutine !== routine.name) ?? []
  const assigned = routine.assignedClients
  const sessions = formatCount(routine.sessions.length, 'sesión por semana', 'sesiones por semana')

  return (
    <>
      <PageHeader
        breadcrumb={`Rutinas / ${routine.name}`}
        title={routine.name}
        subtitle={
          assigned.length > 0
            ? `${sessions} · asignada a ${formatCount(assigned.length, 'cliente', 'clientes')}`
            : `${sessions} · creada el ${routine.createdAtLabel}`
        }
        actions={
          <>
            <Button
              label="Duplicar"
              icon="content_copy"
              variant="secondary"
              size="md"
              onClick={() => {
                resetDuplicateError()
                setIsDuplicateOpen(true)
              }}
            />
            {routine.status !== 'CLOSED' && (
              <Button
                label="Asignar a clientes"
                icon="group_add"
                size="md"
                onClick={() => {
                  resetAssignError()
                  setIsAssignOpen(true)
                }}
              />
            )}
          </>
        }
      />

      <div className="mt-xl flex flex-wrap gap-md">
        <RoutineStatusBadge status={routine.status} />
        <Badge
          label={assigned.length > 0 ? assigned.join(', ') : 'Sin clientes asignados'}
          tone="neutral"
          icon="group"
        />
      </div>

      <div className="mt-2xl grid grid-cols-1 items-start gap-xl md:grid-cols-2 xl:grid-cols-3">
        {routine.sessions.map((session) => (
          <RoutineSessionCard key={session.order} session={session} />
        ))}
      </div>

      {isDuplicateOpen && (
        <DuplicateRoutineModal
          routineName={routine.name}
          isSubmitting={isDuplicating}
          error={duplicateError}
          onSubmit={(name) => void handleDuplicate(name)}
          onClose={() => setIsDuplicateOpen(false)}
        />
      )}

      {isAssignOpen && (
        <AssignRoutineModal
          routineName={routine.name}
          clients={clients}
          isSubmitting={isAssigning}
          error={assignError}
          onSubmit={handleAssign}
          onClose={() => setIsAssignOpen(false)}
        />
      )}

      <Dialog
        open={replaced.length > 0}
        icon="swap_horiz"
        title={
          replaced.length === 1
            ? `¿Reemplazar la rutina de ${firstName(replaced[0].fullName)}?`
            : `¿Reemplazar la rutina de ${replaced.length} clientes?`
        }
        description={
          replaced.length === 1
            ? `${replaced[0].fullName} tiene vigente ${replaced[0].currentRoutine}. Se cerrará el ${toClosingDate(pending?.startDate ?? '')} y quedará en su historial.`
            : `${replaced.map((client) => client.fullName).join(', ')} tienen una rutina vigente. Se cerrará el ${toClosingDate(pending?.startDate ?? '')} y quedará en su historial.`
        }
        confirmLabel={isAssigning ? 'Asignando…' : 'Reemplazar y asignar'}
        onCancel={() => setPending(null)}
        onConfirm={() => {
          if (pending && !isAssigning) void runAssignment(pending)
        }}
      />
      <ToastViewport message={toast?.message} tone={toast?.tone} />
    </>
  )
}

/**
 * Shows one routine with its sessions, its status and its clients, and the modals that duplicate
 * it and assign it, using {@link useRoutine} for data and actions.
 *
 * @remarks
 * Requires an authenticated session; the route guard redirects otherwise. Assigning to a client
 * that already follows another routine asks for confirmation first.
 */
export function RoutineDetailPage() {
  const { routineId = '' } = useParams()
  return <RoutineDetail key={routineId} routineId={routineId} />
}
