import { useEffect, useState, type FormEvent } from 'react'
import { Button, Callout, Checkbox, Modal, Text, TextField } from '@/components/ui'
import { clientsService } from '@/services/clients.service'
import { routinesService } from '@/services/routines.service'
import type { ClientSummary } from '@/types/client'
import type { Routine } from '@/types/routine'

export interface AssignRoutineModalProps {
  routine: Routine | null
  onClose: () => void
  onAssigned: (routineName: string, clientCount: number) => void
}

function todayIsoDate(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function AssignRoutineModal({ routine, onClose, onAssigned }: AssignRoutineModalProps) {
  const [clients, setClients] = useState<ClientSummary[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [startDate, setStartDate] = useState(todayIsoDate())
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string>()

  useEffect(() => {
    if (!routine) return
    setSelectedIds([])
    setStartDate(todayIsoDate())
    setError(undefined)
    setIsLoading(true)
    clientsService
      .list('', 'ACTIVE')
      .then(setClients)
      .catch(() => setError('No pudimos cargar tus clientes activos.'))
      .finally(() => setIsLoading(false))
  }, [routine])

  const toggleClient = (clientId: string, checked: boolean) => {
    setSelectedIds((current) =>
      checked ? [...current, clientId] : current.filter((id) => id !== clientId),
    )
  }

  const handleClose = () => {
    if (isSubmitting) return
    onClose()
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!routine) return
    if (selectedIds.length === 0) {
      setError('Selecciona al menos un cliente.')
      return
    }
    setIsSubmitting(true)
    setError(undefined)
    try {
      await routinesService.assign(routine.id, { clientIds: selectedIds, startDate })
      onAssigned(routine.name, selectedIds.length)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos asignar esta rutina.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      open={Boolean(routine)}
      title="Asignar rutina"
      description={routine ? `Asigna “${routine.name}” a uno o más clientes activos.` : undefined}
      icon="person_add"
      onClose={handleClose}
      className="max-w-[560px]"
    >
      <form className="mt-xl flex flex-col gap-xl" onSubmit={(event) => void handleSubmit(event)} noValidate>
        <Callout
          title="Se cerrará la rutina anterior"
          description="Cada cliente seleccionado dejará de seguir su rutina vigente a partir de la fecha de inicio."
          tone="info"
        />

        <TextField
          label="Fecha de inicio"
          type="date"
          value={startDate}
          onChange={(event) => setStartDate(event.target.value)}
        />

        {isLoading && <Text tone="muted">Cargando clientes…</Text>}

        {!isLoading && clients.length === 0 && (
          <Text tone="secondary">No tienes clientes activos para asignar.</Text>
        )}

        <div className="flex max-h-[240px] flex-col gap-lg overflow-y-auto">
          {clients.map((client) => (
            <Checkbox
              key={client.id}
              label={`${client.fullName} · ${client.email}`}
              checked={selectedIds.includes(client.id)}
              onChange={(checked) => toggleClient(client.id, checked)}
            />
          ))}
        </div>

        {error && <Text tone="error">{error}</Text>}

        <div className="flex gap-md">
          <Button label="Cancelar" variant="secondary" className="flex-1" onClick={handleClose} disabled={isSubmitting} />
          <Button
            label="Asignar"
            className="flex-1"
            type="submit"
            loading={isSubmitting}
            disabled={clients.length === 0}
          />
        </div>
      </form>
    </Modal>
  )
}
