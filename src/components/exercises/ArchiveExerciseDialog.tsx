import { Dialog } from '@/components/ui'
import type { Exercise } from '@/types/exercise'

export interface ArchiveExerciseDialogProps {
  exercise: Exercise | null
  isArchiving?: boolean
  onClose: () => void
  onConfirm: () => void
}

export function ArchiveExerciseDialog({
  exercise,
  isArchiving = false,
  onClose,
  onConfirm,
}: ArchiveExerciseDialogProps) {
  return (
    <Dialog
      open={Boolean(exercise)}
      title="¿Archivar este ejercicio?"
      description={
        exercise
          ? `${exercise.name} dejará de estar disponible para nuevas rutinas. Las rutinas que ya lo usan no cambian.`
          : undefined
      }
      icon="archive"
      confirmLabel={isArchiving ? 'Archivando…' : 'Archivar'}
      cancelLabel="Cancelar"
      onConfirm={() => {
        if (!isArchiving) onConfirm()
      }}
      onCancel={() => {
        if (!isArchiving) onClose()
      }}
    />
  )
}
