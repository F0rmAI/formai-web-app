import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  ActivationCodeModal,
  ClientFilters,
  ClientsTable,
  RegenerateCodeModal,
  RegisterClientModal,
} from '@/components/clients'
import { PageHeader } from '@/components/layout'
import { Button, Callout, Card, EmptyState, Text, Toast } from '@/components/ui'
import { useEphemeralToast } from '@/hooks/useEphemeralToast'
import { useClients } from '@/hooks/useClients'
import type { ActivationCode, ClientSummary } from '@/types/client'

export function ClientsPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as { toast?: string } | null
  const toastFromAuth = useEphemeralToast(state?.toast)

  const {
    clients,
    query,
    status,
    isLoading,
    error,
    setQuery,
    setStatus,
    clearFilters,
    registerClient,
    regenerateCode,
    refetch,
  } = useClients()
  const [registerOpen, setRegisterOpen] = useState(false)
  const [clientToRegenerate, setClientToRegenerate] = useState<ClientSummary | null>(null)
  const [activation, setActivation] = useState<ActivationCode | null>(null)
  const [activationWasRegenerated, setActivationWasRegenerated] = useState(false)
  const [toast, setToast] = useState<string>()
  const hasFilters = Boolean(query) || status !== 'ALL'

  useEffect(() => {
    if (state?.toast) {
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [state?.toast, navigate, location.pathname])

  const showActivation = (code: ActivationCode, regenerated: boolean) => {
    setRegisterOpen(false)
    setClientToRegenerate(null)
    setActivationWasRegenerated(regenerated)
    setActivation(code)
  }

  const closeActivation = () => {
    const createdClientName = activation?.clientName
    setActivation(null)
    if (!activationWasRegenerated && createdClientName) {
      setToast(`Cuenta creada. ¡Bienvenida a FormAI, ${createdClientName.split(' ')[0]}!`)
      window.setTimeout(() => setToast(undefined), 3000)
    }
  }

  const visibleToast = toast ?? toastFromAuth

  return (
    <>
      <PageHeader
        breadcrumb="Inicio / Clientes"
        title="Clientes"
        subtitle="Gestiona a las personas que entrenas."
        actions={<Button label="Nuevo cliente" icon="person_add" onClick={() => setRegisterOpen(true)} />}
      />

      <div className="mt-2xl flex flex-col gap-2xl">
        {!isLoading && (clients.length > 0 || hasFilters) && (
          <ClientFilters
            query={query}
            status={status}
            onQueryChange={setQuery}
            onStatusChange={setStatus}
            onClear={clearFilters}
          />
        )}

        {error && (
          <div className="flex flex-col items-stretch gap-xl sm:flex-row sm:items-end">
            <Callout title="No pudimos cargar tus clientes" description={error} tone="warning" className="flex-1" />
            <Button label="Reintentar" variant="secondary" onClick={() => void refetch()} className="w-full sm:w-auto" />
          </div>
        )}

        {isLoading && (
          <Card className="flex min-h-[224px] items-center justify-center">
            <Text tone="muted">Cargando clientes…</Text>
          </Card>
        )}

        {!isLoading && !error && clients.length > 0 && (
          <ClientsTable
            clients={clients}
            onOpenClient={(clientId) => navigate(`/clients/${clientId}`)}
            onRegenerateCode={setClientToRegenerate}
          />
        )}

        {!isLoading && !error && clients.length === 0 && !hasFilters && (
          <Card className="flex min-h-[286px] items-center justify-center p-xl sm:p-2xl">
            <EmptyState
              title="Aún no tienes clientes"
              description="Da de alta a tu primer cliente y comparte con él su código de activación para que use la app."
              icon="group_add"
              action={{ label: 'Nuevo cliente', icon: 'person_add', onClick: () => setRegisterOpen(true) }}
            />
          </Card>
        )}

        {!isLoading && !error && clients.length === 0 && hasFilters && (
          <Card className="flex min-h-[220px] items-center justify-center p-xl sm:p-2xl">
            <EmptyState
              title="No encontramos clientes"
              description="Prueba con otro nombre o cambia el filtro de estado."
              icon="search_off"
              action={{ label: 'Limpiar búsqueda y filtro', icon: 'close', onClick: clearFilters }}
            />
          </Card>
        )}
      </div>

      {registerOpen && (
        <RegisterClientModal
          open
          onClose={() => setRegisterOpen(false)}
          onRegister={registerClient}
          onRegistered={(code) => showActivation(code, false)}
        />
      )}
      <RegenerateCodeModal
        client={clientToRegenerate}
        onClose={() => setClientToRegenerate(null)}
        onRegenerate={regenerateCode}
        onRegenerated={(code) => showActivation(code, true)}
      />
      <ActivationCodeModal activation={activation} regenerated={activationWasRegenerated} onClose={closeActivation} />
      {visibleToast && (
        <Toast message={visibleToast} tone="success" className="fixed inset-x-xl bottom-xl sm:right-10 sm:left-auto sm:bottom-8" />
      )}
    </>
  )
}
