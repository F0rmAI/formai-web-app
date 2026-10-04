/**
 * Modal that assigns a routine to clients.
 *
 * @author Johan Quiñones
 * @packageDocumentation
 */

import { useId, useState, type FormEvent } from 'react'
import { Button, Chip, Combobox, Modal, Text, TextField } from '@/components/ui'
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

/** Explains how many training days the routine needs: one per session. */
function toDaysHint(sessionCount: number): string {
  return sessionCount === 1
    ? 'Esta rutina tiene 1 sesión: elige 1 día.'
    : `Esta rutina tiene ${sessionCount} sesiones: elige ${sessionCount} días.`
}

/**
 * Props accepted by {@link AssignRoutineModal}.
 */
export interface AssignRoutineModalProps {
  /** Name of the routine being assigned. */
  routineName: string
  /** Clients of the trainer, with every status. */
  clients: ClientSummary[]
  /** Sessions of the routine; the client trains one session per training day. */
  sessionCount: number
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
 * Lets the trainer search the clients that receive a routine, choose from when and on which days,
 * and reports the selection the user submits.
 *
 * @remarks
 * A client that is not active can be ticked, but the form explains why it cannot receive the
 * routine and blocks the submission until it is removed. The routine needs exactly one training
 * day per session. Mount it only while it is open.
 */
export function AssignRoutineModal({
  routineName,
  clients,
  sessionCount,
  isSubmitting,
  error,
  onSubmit,
  onClose,
}: AssignRoutineModalProps) {
  const formId = useId()
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [startDate, setStartDate] = useState(toIsoDate())
  const [trainingDays, setTrainingDays] = useState<TrainingDay[]>([])
  const [daysTouched, setDaysTouched] = useState(false)

  const selected = clients.filter((client) => selectedIds.includes(client.id))
  const blocked = selected.find((client) => client.status !== 'ACTIVE')
  const message = blocked ? toBlockedMessage(blocked) : error
  const daysMatch = trainingDays.length === sessionCount

  const toggleDay = (day: TrainingDay) => {
    setDaysTouched(true)
    setTrainingDays((current) => current.includes(day) ? current.filter((item) => item !== day) : [...current, day])
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    setDaysTouched(true)
    if (selected.length > 0 && !blocked && startDate && daysMatch) {
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
            disabled={selected.length === 0 || Boolean(blocked) || !startDate || !daysMatch}
          />
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit} className="flex flex-col gap-xl">
        {clients.length === 0 ? (
          <Text tone="secondary">Aún no tienes clientes. Regístralos para asignarles una rutina.</Text>
        ) : (
          <Combobox
            label="Clientes"
            placeholder="Busca por nombre"
            emptyMessage="Ningún cliente coincide con la búsqueda."
            options={clients.map((client) => ({ value: client.id, label: client.fullName, description: toNote(client) }))}
            value={selectedIds}
            onChange={setSelectedIds}
          />
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
          {(daysTouched || selected.length > 0) && !daysMatch ? (
            <Text role="alert" variant="body-m" tone="error">{toDaysHint(sessionCount)}</Text>
          ) : (
            <Text variant="body-m" tone="secondary">{toDaysHint(sessionCount)}</Text>
          )}
        </div>
      </form>
    </Modal>
  )
}
