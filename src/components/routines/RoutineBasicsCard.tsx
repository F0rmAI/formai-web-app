/**
 * Card with the name and the weekly sessions of the routine form.
 *
 * @author Johan Quiñones
 * @packageDocumentation
 */

import { Card, TextField } from '@/components/ui'

/**
 * Props accepted by {@link RoutineBasicsCard}.
 */
export interface RoutineBasicsCardProps {
  /** Name of the routine. */
  name: string
  /** Message of the name field. */
  nameError?: string
  /** Number of sessions of the routine. */
  sessionCount: number
  /** Most sessions a week can have. */
  maxSessions: number
  /** Called with the new name. */
  onNameChange: (name: string) => void
  /** Called with the number of sessions per week the user sets. */
  onSessionCountChange: (count: number) => void
}

/**
 * Shows the fields for the name of a routine and its sessions per week, and reports their changes.
 */
export function RoutineBasicsCard({
  name,
  nameError,
  sessionCount,
  maxSessions,
  onNameChange,
  onSessionCountChange,
}: RoutineBasicsCardProps) {
  return (
    <Card className="grid grid-cols-1 gap-xl p-2xl sm:grid-cols-4">
      <TextField
        label="Nombre de la rutina"
        value={name}
        onChange={(event) => onNameChange(event.target.value)}
        leadingIcon="event_note"
        error={nameError}
        maxLength={120}
        className="sm:col-span-3"
      />
      <TextField
        label="Sesiones por semana"
        type="number"
        min={1}
        max={maxSessions}
        value={String(sessionCount)}
        onChange={(event) => onSessionCountChange(Number(event.target.value))}
        leadingIcon="event_repeat"
      />
    </Card>
  )
}
