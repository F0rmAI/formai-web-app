import { useEffect, useState } from 'react'
import { Button, Card, Modal, Text } from '@/components/ui'
import { routinesService } from '@/services/routines.service'
import type { RoutineVersion } from '@/types/routine'

export interface RoutineVersionsPanelProps {
  routineId: string | null
  routineName?: string
  open: boolean
  onClose: () => void
}

export function RoutineVersionsPanel({ routineId, routineName, open, onClose }: RoutineVersionsPanelProps) {
  const [versions, setVersions] = useState<RoutineVersion[]>([])
  const [expandedVersion, setExpandedVersion] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>()

  useEffect(() => {
    if (!open || !routineId) return
    setIsLoading(true)
    setError(undefined)
    routinesService
      .getVersions(routineId)
      .then(setVersions)
      .catch(() => setError('No pudimos cargar el historial de versiones.'))
      .finally(() => setIsLoading(false))
  }, [open, routineId])

  return (
    <Modal
      open={open}
      title="Historial de versiones"
      description={routineName ? `Cambios guardados de “${routineName}”.` : undefined}
      icon="history"
      onClose={onClose}
      className="max-w-[640px]"
    >
      <div className="mt-xl flex flex-col gap-lg">
        {isLoading && <Text tone="muted">Cargando versiones…</Text>}
        {error && <Text tone="error">{error}</Text>}

        {!isLoading && !error && versions.length === 0 && (
          <Text tone="secondary">Esta rutina aún no tiene versiones guardadas.</Text>
        )}

        {versions.map((version) => {
          const expanded = expandedVersion === version.number
          return (
            <Card key={version.number} className="flex flex-col gap-md p-lg">
              <div className="flex items-center justify-between gap-md">
                <div>
                  <Text variant="body-l-strong">Versión v{version.number}</Text>
                  <Text variant="body-m" tone="muted">
                    {version.changedAtLabel}
                  </Text>
                </div>
                <Button
                  label={expanded ? 'Ocultar' : 'Ver detalle'}
                  variant="secondary"
                  size="sm"
                  onClick={() => setExpandedVersion(expanded ? null : version.number)}
                />
              </div>

              {expanded && (
                <div className="flex flex-col gap-md border-t border-line-subtle pt-md">
                  {version.sessions.map((session) => (
                    <div key={`${version.number}-${session.order}`} className="flex flex-col gap-xs">
                      <Text variant="label-m-bold">{session.label}</Text>
                      {session.exercises.map((exercise) => (
                        <Text key={`${session.order}-${exercise.exerciseId}`} variant="body-m" tone="secondary">
                          {exercise.exerciseName} · {exercise.sets}×{exercise.reps} · {exercise.targetLoadKg} kg ·{' '}
                          {exercise.restSeconds}s
                        </Text>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )
        })}

        <Button label="Cerrar" variant="secondary" onClick={onClose} />
      </div>
    </Modal>
  )
}
