import { Badge, Text } from '@/components/ui'
import type { WorkoutSession } from '@/types/workout'
import { WorkoutExerciseCard } from './WorkoutExerciseCard'
import { WorkoutStatusBadge } from './WorkoutStatusBadge'

export interface WorkoutDetailViewProps {
  session: WorkoutSession
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

export function WorkoutDetailView({ session }: WorkoutDetailViewProps) {
  return (
    <div className="flex flex-col gap-xl">
      <div className="flex flex-col gap-sm">
        <Text as="h2" variant="title">
          {session.dayLabel}
        </Text>
        <Text tone="secondary">
          {formatScheduledFor(session.scheduledFor)}
          {session.finishedAt
            ? ` · ${new Date(session.finishedAt).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}`
            : ''}
          {` · ${session.totalVolumeKg.toFixed(0)} kg`}
        </Text>
        <div className="mt-sm flex flex-wrap items-center gap-md">
          <WorkoutStatusBadge status={session.status} />
          <Badge label={`Versión ${session.routineVersion}`} tone="secondary" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-xl md:grid-cols-2">
        {session.exercises.map((exercise) => (
          <WorkoutExerciseCard key={exercise.exerciseId} exercise={exercise} />
        ))}
      </div>
    </div>
  )
}
