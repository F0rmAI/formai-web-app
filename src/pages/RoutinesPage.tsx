/**
 * Routines page.
 *
 * @author Johan Quiñones
 * @packageDocumentation
 */

import { useNavigate } from 'react-router-dom'
import { RoutinesTable } from '@/components/routines'
import { PageHeader, ToastViewport } from '@/components/layout'
import { Button, Card, EmptyState, LoadingState } from '@/components/ui'
import { useRoutines } from '@/hooks/useRoutines'
import { useToast } from '@/hooks/useToast'
import { ROUTES } from '@/navigation/routes'

/**
 * Shows the routines of the trainer with their status, sessions and clients, using
 * {@link useRoutines} for data.
 *
 * @remarks
 * Requires an authenticated session; the route guard redirects otherwise.
 */
export function RoutinesPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { routines, isLoading, error, refetch } = useRoutines()

  return (
    <>
      <PageHeader
        breadcrumb="Inicio / Rutinas"
        title="Rutinas"
        subtitle="Diseña planes y asígnalos a tus clientes."
        actions={<Button label="Nueva rutina" icon="add" size="md" onClick={() => navigate(ROUTES.routineNew)} />}
      />

      <div className="mt-2xl flex flex-col gap-2xl">
        {isLoading && routines.length === 0 && <LoadingState label="Cargando rutinas…" />}

        {error && (
          <Card>
            <EmptyState
              title="No pudimos cargar tus rutinas"
              description={error}
              icon="error"
              action={{ label: 'Reintentar', icon: 'refresh', onClick: refetch }}
            />
          </Card>
        )}

        {!error && routines.length > 0 && (
          <RoutinesTable routines={routines} onEdit={(routine) => navigate(ROUTES.routineEdit(routine.id))} />
        )}

        {!isLoading && !error && routines.length === 0 && (
          <Card>
            <EmptyState
              title="Aún no tienes rutinas"
              description="Crea tu primera rutina para asignarla a tus clientes."
              icon="event_note"
              action={{ label: 'Nueva rutina', icon: 'add', onClick: () => navigate(ROUTES.routineNew) }}
            />
          </Card>
        )}
      </div>

      <ToastViewport message={toast?.message} tone={toast?.tone} />
    </>
  )
}
