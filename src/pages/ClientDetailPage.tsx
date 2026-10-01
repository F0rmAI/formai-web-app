import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { EditBodyProfileModal } from '@/components/clients'
import { PageHeader } from '@/components/layout'
import { Badge, Button, Card, Dialog, EmptyState, Icon, TabItem, Text, Toast } from '@/components/ui'
import { useClientDetail } from '@/hooks/useClientDetail'

export interface ClientDetailPageProps {
  clientId: string
  onBack: () => void
}

function formatWeight(value: number) {
  return `${value.toFixed(1).replace('.', ',')} kg`
}

function statusSubtitle(client: { status: string; email: string; activeSince: string }) {
  if (client.status === 'ACTIVE' && client.activeSince) {
    return `${client.email} · Activo desde el ${client.activeSince}`
  }
  if (client.status === 'INACTIVE') {
    return `${client.email} · Inactivo`
  }
  return client.email
}

export function ClientDetailPage({ clientId, onBack }: ClientDetailPageProps) {
  const navigate = useNavigate()
  const { client, isLoading, error, updateBodyProfile, deactivate, refetch } = useClientDetail(clientId)
  const [editOpen, setEditOpen] = useState(false)
  const [confirmDeactivate, setConfirmDeactivate] = useState(false)
  const [isDeactivating, setIsDeactivating] = useState(false)
  const [deactivateError, setDeactivateError] = useState<string>()

  if (isLoading) {
    return (
      <Card className="flex min-h-[320px] items-center justify-center">
        <Text tone="muted">Cargando ficha…</Text>
      </Card>
    )
  }

  if (error || !client) {
    return (
      <Card className="flex min-h-[320px] items-center justify-center">
        <EmptyState
          title="No pudimos abrir esta ficha"
          description={error ?? 'El cliente solicitado no está disponible.'}
          icon="error"
          action={{ label: 'Reintentar', onClick: () => void refetch() }}
        />
      </Card>
    )
  }

  const handleDeactivate = async () => {
    setIsDeactivating(true)
    setDeactivateError(undefined)
    try {
      await deactivate()
      setConfirmDeactivate(false)
      navigate('/clients', { replace: true, state: { toast: `${client.fullName} fue desactivado` } })
    } catch {
      setDeactivateError('No pudimos desactivar a este cliente. Inténtalo de nuevo.')
    } finally {
      setIsDeactivating(false)
    }
  }

  return (
    <>
      <PageHeader
        breadcrumb={`Clientes / ${client.fullName}`}
        title={client.fullName}
        subtitle={statusSubtitle(client)}
        actions={
          <>
            {client.status === 'ACTIVE' && (
              <Button
                label="Desactivar"
                icon="person_off"
                variant="secondary"
                onClick={() => {
                  setDeactivateError(undefined)
                  setConfirmDeactivate(true)
                }}
              />
            )}
            <Button label="Asignar rutina" icon="event_available" />
          </>
        }
      />

      <div role="tablist" aria-label="Detalle del cliente" className="mt-2xl flex overflow-x-auto border-b border-line-subtle sm:gap-2xl">
        <TabItem label="Ficha" active />
        <TabItem label="Entrenamientos" />
        <TabItem label="Progreso" />
      </div>

      <div className="mt-2xl grid grid-cols-1 items-start gap-2xl xl:grid-cols-2">
        <Card className="p-xl sm:p-2xl">
          <div className="flex flex-wrap items-center justify-between gap-xl">
            <Text as="h2" variant="title">
              Ficha física
            </Text>
            <Button label="Editar ficha" icon="edit" variant="secondary" size="sm" onClick={() => setEditOpen(true)} />
          </div>

          <dl className="mt-xl flex flex-col gap-xl">
            <div className="flex flex-col items-start justify-between gap-xs sm:flex-row sm:items-center sm:gap-xl">
              <Text as="dt" tone="secondary">Objetivo</Text>
              <Text as="dd" variant="body-l-strong">{client.bodyProfile.goal}</Text>
            </div>
            <div className="flex flex-col items-start justify-between gap-xs sm:flex-row sm:items-center sm:gap-xl">
              <Text as="dt" tone="secondary">Peso corporal</Text>
              <Text as="dd" variant="body-l-strong">
                {formatWeight(client.bodyProfile.weight)} · actualizado el {client.bodyProfile.updatedAt}
              </Text>
            </div>
            <div className="flex flex-col items-start justify-between gap-xs sm:flex-row sm:items-center sm:gap-xl">
              <Text as="dt" tone="secondary">Estatura</Text>
              <Text as="dd" variant="body-l-strong">{client.bodyProfile.height} cm</Text>
            </div>
            <div className="flex flex-col items-start justify-between gap-xs sm:flex-row sm:gap-xl">
              <Text as="dt" tone="secondary">Lesiones o restricciones</Text>
              <Text as="dd" variant="body-l-strong" className="sm:text-right">
                {client.bodyProfile.restrictions || 'Ninguna registrada'}
              </Text>
            </div>
          </dl>

          <div className="mt-xl flex items-center gap-md">
            <Icon name="history" size={16} className="text-content-secondary" />
            <Text variant="overline" tone="secondary">Historial de peso</Text>
          </div>
          <div className="mt-lg flex flex-col gap-xl">
            {client.bodyProfile.weightHistory.map((entry, index) => (
              <div key={`${entry.date}-${index}`} className="flex items-center justify-between">
                <Text variant="body-m" tone="muted">{entry.date}</Text>
                <Text variant="body-m" tone="secondary">{formatWeight(entry.weight)}</Text>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-xl sm:p-2xl">
          <div className="flex items-center justify-between gap-xl">
            <Text as="h2" variant="title">Rutina vigente</Text>
            {client.routine && <Badge label="Vigente" tone="tertiary" />}
          </div>
          {client.routine ? (
            <>
              <Text variant="headline" className="mt-xl">{client.routine.name}</Text>
              <Text variant="body-m" tone="secondary" className="mt-xl">
                Asignada desde el {client.routine.assignedSince} · versión {client.routine.version}
              </Text>
              <div className="mt-xl flex flex-wrap gap-md">
                <Button label="Editar rutina" icon="edit_note" size="sm" />
                <Button label="Ver versiones" icon="history" variant="secondary" size="sm" />
              </div>
            </>
          ) : (
            <EmptyState title="Sin rutina vigente" icon="event_busy" className="py-2xl" />
          )}
        </Card>
      </div>

      <button type="button" onClick={onBack} className="sr-only">Volver a clientes</button>
      {editOpen && (
        <EditBodyProfileModal
          open
          profile={client.bodyProfile}
          onClose={() => setEditOpen(false)}
          onSave={updateBodyProfile}
        />
      )}
      <Dialog
        open={confirmDeactivate}
        tone="danger"
        icon="person_off"
        title={`¿Desactivar a ${client.fullName}?`}
        description="No podrá iniciar sesión y su rutina vigente se cerrará. Su historial se conserva."
        confirmLabel={isDeactivating ? 'Desactivando…' : 'Desactivar'}
        onCancel={() => {
          if (!isDeactivating) setConfirmDeactivate(false)
        }}
        onConfirm={() => {
          if (!isDeactivating) void handleDeactivate()
        }}
      />
      {deactivateError && (
        <div className="fixed bottom-xl left-1/2 z-50 w-[min(100%-2rem,420px)] -translate-x-1/2">
          <Toast message={deactivateError} tone="error" />
        </div>
      )}
    </>
  )
}
