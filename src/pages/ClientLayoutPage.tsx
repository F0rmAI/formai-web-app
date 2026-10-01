/**
 * Frame shared by the pages of one client.
 *
 * @author Melina
 * @packageDocumentation
 */

import { useState } from 'react'
import { Outlet, useMatch, useNavigate, useParams } from 'react-router-dom'
import { PageHeader, TabBar, ToastViewport } from '@/components/layout'
import { Button, Card, Dialog, EmptyState, LoadingState, TabItem } from '@/components/ui'
import { useClientDetail } from '@/hooks/useClientDetail'
import type { ClientOutletContext } from '@/hooks/useClientOutlet'
import { useToast, type ToastLocationState } from '@/hooks/useToast'
import { ROUTES } from '@/navigation/routes'
import type { ClientDetail } from '@/types/client'

/** Builds the line under the name: email and how long the client has been active. */
function toSubtitle(client: ClientDetail): string {
  if (client.status === 'ACTIVE') return `${client.email} · Activo desde el ${client.activeSince}`
  if (client.status === 'INACTIVE') return `${client.email} · Inactivo`
  return `${client.email} · Aún no activa su cuenta`
}

/** Renders the frame of one client; it is keyed by client so its state never leaks to another. */
function ClientLayout({ clientId }: { clientId: string }) {
  const navigate = useNavigate()
  const { toast, showToast } = useToast()
  const {
    client,
    isLoading,
    error,
    refetch,
    saveBodyProfile,
    isSavingProfile,
    profileError,
    resetProfileError,
    deactivate,
    isDeactivating,
  } = useClientDetail(clientId)
  const [isConfirmingDeactivation, setIsConfirmingDeactivation] = useState(false)
  const isWorkouts = Boolean(useMatch(ROUTES.clientWorkouts(':clientId')))
  const isProgress = Boolean(useMatch(ROUTES.clientProgress(':clientId')))

  if (!client) {
    if (isLoading) return <LoadingState label="Cargando ficha…" />
    return (
      <Card>
        <EmptyState
          title="No pudimos abrir esta ficha"
          description={error ?? 'El cliente solicitado no está disponible.'}
          icon="error"
          action={{ label: 'Reintentar', icon: 'refresh', onClick: refetch }}
        />
      </Card>
    )
  }

  const handleDeactivate = async () => {
    const result = await deactivate()
    setIsConfirmingDeactivation(false)
    if (!result.ok) {
      showToast(result.error.message, 'error')
      return
    }
    const state: ToastLocationState = { toast: `${client.fullName} fue desactivado` }
    navigate(ROUTES.clients, { state })
  }

  const context: ClientOutletContext = {
    client,
    saveBodyProfile: async (input) => (await saveBodyProfile(input)).ok,
    isSavingProfile,
    profileError,
    resetProfileError,
    showToast,
  }

  return (
    <>
      <PageHeader
        breadcrumb={`Clientes / ${client.fullName}`}
        title={client.fullName}
        subtitle={toSubtitle(client)}
        actions={
          <>
            {client.status !== 'INACTIVE' && (
              <Button
                label="Desactivar"
                icon="person_off"
                variant="secondary"
                size="md"
                onClick={() => setIsConfirmingDeactivation(true)}
              />
            )}
            {client.status === 'ACTIVE' && (
              <Button
                label="Asignar rutina"
                icon="event_available"
                size="md"
                onClick={() => navigate(ROUTES.routines)}
              />
            )}
          </>
        }
      />

      <TabBar label="Secciones del cliente" className="mt-xl">
        <TabItem
          label="Ficha"
          active={!isWorkouts && !isProgress}
          onClick={() => navigate(ROUTES.client(clientId))}
        />
        <TabItem label="Entrenamientos" active={isWorkouts} onClick={() => navigate(ROUTES.clientWorkouts(clientId))} />
        <TabItem label="Progreso" active={isProgress} onClick={() => navigate(ROUTES.clientProgress(clientId))} />
      </TabBar>

      <div className="mt-2xl">
        <Outlet context={context} />
      </div>

      <Dialog
        open={isConfirmingDeactivation}
        tone="danger"
        icon="person_off"
        title={`¿Desactivar a ${client.fullName}?`}
        description="Ya no podrá iniciar sesión en la app. Su historial de entrenamientos se conserva para que lo consultes."
        confirmLabel={isDeactivating ? 'Desactivando…' : 'Desactivar'}
        onCancel={() => setIsConfirmingDeactivation(false)}
        onConfirm={() => {
          if (!isDeactivating) void handleDeactivate()
        }}
      />
      <ToastViewport message={toast?.message} tone={toast?.tone} />
    </>
  )
}

/**
 * Shows the header, the tabs and the deactivation dialog shared by the pages of one client, using
 * {@link useClientDetail} for data and actions; the selected tab renders inside it.
 *
 * @remarks
 * Requires an authenticated session; the route guard redirects otherwise. Child pages read the
 * client with `useClientOutlet`.
 */
export function ClientLayoutPage() {
  const { clientId = '' } = useParams()
  return <ClientLayout key={clientId} clientId={clientId} />
}
