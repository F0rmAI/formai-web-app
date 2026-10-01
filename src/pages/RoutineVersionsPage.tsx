/**
 * Version history page of one routine.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

import { useNavigate, useParams } from 'react-router-dom'
import { RoutineVersionsTable } from '@/components/routines'
import { PageHeader, ToastViewport } from '@/components/layout'
import { Button, Card, EmptyState, LoadingState } from '@/components/ui'
import { useRoutineVersions } from '@/hooks/useRoutineVersions'
import { useToast } from '@/hooks/useToast'
import { ROUTES } from '@/navigation/routes'

/** Renders the history of one routine; it is keyed by routine so its state never leaks to another. */
function RoutineVersions({ routineId }: { routineId: string }) {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { routine, versions, isLoading, error, refetch } = useRoutineVersions(routineId)

  return (
    <>
      <PageHeader
        breadcrumb={`Rutinas / ${routine?.name ?? '…'}`}
        title="Historial de versiones"
        subtitle="Cada cambio crea una versión nueva y conserva las anteriores."
        actions={
          <Button
            label="Volver"
            icon="arrow_back"
            variant="secondary"
            size="md"
            onClick={() => navigate(ROUTES.routines)}
          />
        }
      />

      <div className="mt-2xl">
        {routine ? (
          <RoutineVersionsTable versions={versions} currentVersion={routine.currentVersion} />
        ) : isLoading ? (
          <LoadingState label="Cargando versiones…" />
        ) : (
          <Card>
            <EmptyState
              title="No pudimos cargar el historial"
              description={error ?? 'La rutina solicitada no está disponible.'}
              icon="error"
              action={{ label: 'Reintentar', icon: 'refresh', onClick: refetch }}
            />
          </Card>
        )}
      </div>

      <ToastViewport message={toast?.message} tone={toast?.tone} />
    </>
  )
}

/**
 * Shows the saved versions of a routine with their author and date, using
 * {@link useRoutineVersions} for data.
 *
 * @remarks
 * Requires an authenticated session; the route guard redirects otherwise.
 */
export function RoutineVersionsPage() {
  const { routineId = '' } = useParams()
  return <RoutineVersions key={routineId} routineId={routineId} />
}
