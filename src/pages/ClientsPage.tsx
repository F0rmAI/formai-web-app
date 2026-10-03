/**
 * Clients page.
 *
 * @author Melina
 * @packageDocumentation
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ActivationCodeModal,
  ClientFilters,
  ClientsTable,
  RegenerateCodeModal,
  RegisterClientModal,
} from '@/components/clients'
import { PageHeader, ToastViewport } from '@/components/layout'
import { Button, Card, EmptyState, LoadingState } from '@/components/ui'
import { useClients } from '@/hooks/useClients'
import { useToast } from '@/hooks/useToast'
import { ROUTES } from '@/navigation/routes'
import type { ActivationCode, ClientSummary, RegisterClientInput } from '@/types/client'

/**
 * Shows the clients of the trainer with search and status filter, and the modals that register a
 * client and regenerate an activation code, using {@link useClients} for data and actions.
 *
 * @remarks
 * Requires an authenticated session; the route guard redirects otherwise.
 */
export function ClientsPage() {
  const navigate = useNavigate()
  const { toast, showToast } = useToast()
  const {
    clients,
    query,
    status,
    hasFilters,
    isLoading,
    error,
    setQuery,
    setStatus,
    clearFilters,
    refetch,
    registerClient,
    isRegistering,
    registerError,
    resetRegisterError,
    regenerateCode,
    isRegenerating,
    regenerateError,
    resetRegenerateError,
  } = useClients()
  const [isRegisterOpen, setIsRegisterOpen] = useState(false)
  const [clientToRegenerate, setClientToRegenerate] = useState<ClientSummary | null>(null)
  const [activation, setActivation] = useState<{ code: ActivationCode; regenerated: boolean } | null>(null)

  const openRegister = () => {
    resetRegisterError()
    setIsRegisterOpen(true)
  }

  const handleRegister = async (input: RegisterClientInput) => {
    const result = await registerClient(input)
    if (!result.ok) return
    setIsRegisterOpen(false)
    setActivation({ code: result.value, regenerated: false })
  }

  const handleRegenerate = async (client: ClientSummary) => {
    const result = await regenerateCode(client.id)
    if (!result.ok) return
    setClientToRegenerate(null)
    setActivation({ code: result.value, regenerated: true })
  }

  const handleCopy = (code: string) => {
    navigator.clipboard
      .writeText(code)
      .then(() => showToast('Código copiado'))
      .catch(() => showToast('No pudimos copiar el código', 'error'))
  }

  const isEmpty = !isLoading && !error && clients.length === 0

  return (
    <>
      <PageHeader
        breadcrumb="Inicio / Clientes"
        title="Clientes"
        subtitle="Gestiona a las personas que entrenas."
        actions={<Button label="Nuevo cliente" icon="person_add" size="md" onClick={openRegister} />}
      />

      <div className="mt-2xl flex flex-col gap-2xl">
        {(clients.length > 0 || hasFilters) && (
          <ClientFilters
            query={query}
            status={status}
            onQueryChange={setQuery}
            onStatusChange={setStatus}
          />
        )}

        {isLoading && clients.length === 0 && <LoadingState label="Cargando clientes…" />}

        {error && (
          <Card>
            <EmptyState
              title="No pudimos cargar tus clientes"
              description={error}
              icon="error"
              action={{ label: 'Reintentar', icon: 'refresh', onClick: refetch }}
            />
          </Card>
        )}

        {!error && clients.length > 0 && (
          <ClientsTable
            clients={clients}
            onOpenClient={(clientId) => navigate(ROUTES.client(clientId))}
            onRegenerateCode={(client) => {
              resetRegenerateError()
              setClientToRegenerate(client)
            }}
          />
        )}

        {isEmpty && !hasFilters && (
          <Card>
            <EmptyState
              title="Aún no tienes clientes"
              description="Da de alta a tu primer cliente y comparte con él su código de activación para que use la app."
              icon="group_add"
              action={{ label: 'Nuevo cliente', icon: 'person_add', onClick: openRegister }}
            />
          </Card>
        )}

        {isEmpty && hasFilters && (
          <Card>
            <EmptyState
              title="No encontramos clientes"
              description="Prueba con otro nombre o cambia el filtro de estado."
              icon="search_off"
            />
          </Card>
        )}

        {hasFilters && (
          <Button
            label="Limpiar búsqueda y filtro"
            icon="close"
            variant="ghost"
            size="sm"
            className="self-start"
            onClick={clearFilters}
          />
        )}
      </div>

      {isRegisterOpen && (
        <RegisterClientModal
          isSubmitting={isRegistering}
          error={registerError}
          onSubmit={(input) => void handleRegister(input)}
          onClose={() => setIsRegisterOpen(false)}
        />
      )}
      {clientToRegenerate && (
        <RegenerateCodeModal
          client={clientToRegenerate}
          isSubmitting={isRegenerating}
          error={regenerateError}
          onConfirm={() => void handleRegenerate(clientToRegenerate)}
          onClose={() => setClientToRegenerate(null)}
        />
      )}
      {activation && (
        <ActivationCodeModal
          activation={activation.code}
          regenerated={activation.regenerated}
          onCopy={handleCopy}
          onClose={() => setActivation(null)}
        />
      )}
      <ToastViewport message={toast?.message} tone={toast?.tone} />
    </>
  )
}
