/**
 * Modal that assigns a routine to clients.
 *
 * @author Johan Quiñones
 * @packageDocumentation
 */

import { useId, useState, type FormEvent } from 'react'
import { Button, Checkbox, Chip, Modal, Text, TextField } from '@/components/ui'
import type { ClientSummary } from '@/types/client'
import type { TrainingDay } from '@/types/routine'
import { toIsoDate } from '@/utils/format'
import { TRAINING_DAYS } from '@/utils/training-days'

/** Says why a client stands out in the list: its current routine or why it cannot be chosen. */
function toNote(client: ClientSummary): string {
  if (client.status === 'INACTIVE') return 'inactivo'
  if (client.status !== 'ACTIVE') return 'invitada, aún no activa su cuenta'
  return client.currentRoutine ? `tiene vigente ${client.currentRoutine}` : 'sin rutina vigente'
}

/** Says why a selected client cannot receive the routine. */
function toBlockedMessage(client: ClientSummary): string {
  const reason = client.status === 'INACTIVE' ? 'está inactivo' : 'aún no activa su cuenta'
  return `${client.fullName} ${reason} y no puede recibir rutinas. Quítalo de la selección.`
}

/**
 * Props accepted by {@link AssignRoutineModal}.
 */
export interface AssignRoutineModalProps {
  /** Name of the routine being assigned. */
  routineName: string
  /** Clients of the trainer, with every status. */
  clients: ClientSummary[]
  /** Whether the assignment is being sent. */
  isSubmitting: boolean
  /** Message of the failed assignment. */
  error: string | null
  /** Called with selected clients, start date and training days. */
  onSubmit: (clients: ClientSummary[], startDate: string, trainingDays: TrainingDay[]) => void
  /** Called when the user cancels or dismisses the modal. */
  onClose: () => void
}

/**
 * Lists the clients of the trainer to choose who receives a routine and from when, and reports
 * the selection the user submits.
 *
 * @remarks
 * A client that is not active can be ticked, but the form explains why it cannot receive the
 * routine and blocks the submission until it is removed. Mount it only while it is open.
 */
export function AssignRoutineModal({ routineName, clients, isSubmitting, error, onSubmit, onClose }: AssignRoutineModalProps) {
  const formId = useId()
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [startDate, setStartDate] = useState(toIsoDate())
  const [trainingDays, setTrainingDays] = useState<TrainingDay[]>([])
  const [daysTouched, setDaysTouched] = useState(false)

  const selected = clients.filter((client) => selectedIds.includes(client.id))
  const blocked = selected.find((client) => client.status !== 'ACTIVE')
  const message = blocked ? toBlockedMessage(blocked) : error

  const toggle = (clientId: string, checked: boolean) =>
    setSelectedIds((current) => (checked ? [...current, clientId] : current.filter((id) => id !== clientId)))

  const toggleDay = (day: TrainingDay) => {
    setDaysTouched(true)
    setTrainingDays((current) => current.includes(day) ? current.filter((item) => item !== day) : [...current, day])
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    setDaysTouched(true)
    if (selected.length > 0 && !blocked && startDate && trainingDays.length > 0) {
      onSubmit(selected, startDate, TRAINING_DAYS.map(({ day }) => day).filter((day) => trainingDays.includes(day)))
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Asignar rutina"
      description={`${routineName}. Elige a qué clientes asignarla y desde cuándo.`}
      icon="group_add"
      actions={
        <>
          <Button label="Cancelar" variant="secondary" size="md" onClick={onClose} />
          <Button
            label="Asignar"
            icon="event_available"
            size="md"
            type="submit"
            form={formId}
            loading={isSubmitting}
            disabled={selected.length === 0 || Boolean(blocked) || !startDate || trainingDays.length === 0}
          />
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit} className="flex flex-col gap-xl">
        {clients.length === 0 ? (
          <Text tone="secondary">Aún no tienes clientes. Regístralos para asignarles una rutina.</Text>
        ) : (
          <div className="flex flex-col gap-lg">
            {clients.map((client) => (
              <Checkbox
                key={client.id}
                label={`${client.fullName} · ${toNote(client)}`}
                checked={selectedIds.includes(client.id)}
                onChange={(checked) => toggle(client.id, checked)}
              />
            ))}
          </div>
        )}

        {message && (
          <Text role="alert" variant="body-m" tone="error">
            {message}
          </Text>
        )}

        <TextField
          label="Fecha de inicio"
          type="date"
          value={startDate}
          onChange={(event) => setStartDate(event.target.value)}
          leadingIcon="calendar_month"
        />
        <div role="group" aria-label="Días de entrenamiento" className="flex flex-col gap-md">
          <Text variant="label-m">Días de entrenamiento</Text>
          <div className="flex flex-wrap gap-sm">
            {TRAINING_DAYS.map(({ day, label }) => (
              <Chip key={day} label={label} selected={trainingDays.includes(day)} onClick={() => toggleDay(day)} />
            ))}
          </div>
          {(daysTouched || selected.length > 0) && trainingDays.length === 0 && (
            <Text role="alert" variant="body-m" tone="error">Selecciona al menos un día de entrenamiento.</Text>
          )}
        </div>
      </form>
    </Modal>
  )
}
