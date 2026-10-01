import { useState } from 'react'
import { Badge, Button, Dialog, Text, Toast } from '@/components/ui'
import type { RecordSetInput, WorkoutSession } from '@/types/workout'
import { WorkoutExerciseCard } from './WorkoutExerciseCard'
import { WorkoutStatusBadge } from './WorkoutStatusBadge'

export interface WorkoutDetailViewProps {
  session: WorkoutSession
  saving?: boolean
  actionError?: string | null
  onRecordSet?: (input: RecordSetInput) => Promise<void>
  onFinish?: (confirmPartial: boolean) => Promise<void>
}

function formatScheduledFor(value: string) {
  const date = new Date(`${value}T12:00:00`)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('es-PE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function hasIncompleteExercises(session: WorkoutSession) {
  return session.exercises.some((exercise) => exercise.sets.length === 0)
}

export function WorkoutDetailView({
  session,
  saving = false,
  actionError,
  onRecordSet,
  onFinish,
}: WorkoutDetailViewProps) {
  const [confirmPartialOpen, setConfirmPartialOpen] = useState(false)
  const editable = session.status === 'PENDING' && Boolean(onRecordSet && onFinish)

  const handleFinish = async () => {
    if (!onFinish) return
    if (hasIncompleteExercises(session)) {
      setConfirmPartialOpen(true)
      return
    }
    await onFinish(false)
  }

  return (
    <div className="flex flex-col gap-xl">
      <div className="flex flex-wrap items-center gap-md">
        <WorkoutStatusBadge status={session.status} />
        <Badge label={session.dayLabel} tone="neutral" />
        <Badge label={`v${session.routineVersion}`} tone="secondary" />
      </div>

      <Text tone="secondary">{formatScheduledFor(session.scheduledFor)}</Text>
      <Text variant="body-m" tone="muted">
        Volumen total · {session.totalVolumeKg.toFixed(0)} kg
      </Text>

      {editable && (
        <div className="flex flex-wrap gap-md">
          <Button
            label="Finalizar entrenamiento"
            icon="check_circle"
            size="sm"
            loading={saving}
            onClick={() => void handleFinish()}
          />
        </div>
      )}

      <div className="grid grid-cols-1 gap-xl md:grid-cols-2">
        {session.exercises.map((exercise) => (
          <WorkoutExerciseCard
            key={exercise.exerciseId}
            exercise={exercise}
            editable={editable}
            saving={saving}
            onRecordSet={onRecordSet}
          />
        ))}
      </div>

      <Dialog
        open={confirmPartialOpen}
        tone="default"
        icon="fitness_center"
        title="¿Cerrar como parcial?"
        description="Hay ejercicios sin series. Si confirmas, la sesión quedará como parcial."
        confirmLabel={saving ? 'Cerrando…' : 'Cerrar parcial'}
        onCancel={() => {
          if (!saving) setConfirmPartialOpen(false)
        }}
        onConfirm={() => {
          if (saving || !onFinish) return
          void onFinish(true).then(() => setConfirmPartialOpen(false))
        }}
      />

      {actionError && (
        <Toast
          message={actionError}
          tone="error"
          className="fixed inset-x-xl bottom-xl sm:right-10 sm:left-auto sm:bottom-8"
        />
      )}
    </div>
  )
}
