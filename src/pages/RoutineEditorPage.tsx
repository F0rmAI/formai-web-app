import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AddExerciseModal,
  AssignRoutineModal,
  DuplicateRoutineModal,
  RoutineSessionTabs,
  RoutineStatusBadge,
  RoutineVersionsPanel,
} from '@/components/routines'
import { PageHeader } from '@/components/layout'
import { Button, Callout, Card, EmptyState, Text, TextField, Toast } from '@/components/ui'
import { useRoutineEditor } from '@/hooks/useRoutineEditor'
import type { Exercise } from '@/types/exercise'
import { createEditorExercise } from '@/utils/routine-editor'

export interface RoutineEditorPageProps {
  routineId?: string
}

export function RoutineEditorPage({ routineId }: RoutineEditorPageProps) {
  const navigate = useNavigate()
  const {
    routine,
    editorState,
    setEditorState,
    isNew,
    isLoading,
    isSaving,
    error,
    validationError,
    setValidationError,
    save,
  } = useRoutineEditor(routineId)

  const [activeSessionId, setActiveSessionId] = useState('')
  const [addExerciseSessionId, setAddExerciseSessionId] = useState<string | null>(null)
  const [duplicateOpen, setDuplicateOpen] = useState(false)
  const [assignOpen, setAssignOpen] = useState(false)
  const [versionsOpen, setVersionsOpen] = useState(false)
  const [toast, setToast] = useState<string>()

  const resolvedActiveSessionId = activeSessionId || editorState.sessions[0]?.localId || ''

  const showToast = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(undefined), 3000)
  }

  const handleSave = async () => {
    setValidationError(null)
    try {
      const saved = await save()
      if (isNew) {
        navigate(`/routines/${saved.id}`, { replace: true, state: { toast: 'Rutina guardada.' } })
        return
      }
      showToast(`Versión v${saved.currentVersion} guardada.`)
    } catch {
      // validationError is set in the hook
    }
  }

  const handleAddExercise = (exercise: Exercise) => {
    if (!addExerciseSessionId) return
    setEditorState({
      ...editorState,
      sessions: editorState.sessions.map((session) =>
        session.localId === addExerciseSessionId
          ? {
              ...session,
              exercises: [...session.exercises, createEditorExercise(exercise.id, exercise.name)],
            }
          : session,
      ),
    })
    setAddExerciseSessionId(null)
  }

  const activeSession = editorState.sessions.find((session) => session.localId === addExerciseSessionId)
  const excludedExerciseIds = activeSession?.exercises.map((exercise) => exercise.exerciseId) ?? []

  if (isLoading) {
    return (
      <Card className="flex min-h-[320px] items-center justify-center">
        <Text tone="muted">Cargando rutina…</Text>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="flex min-h-[320px] items-center justify-center">
        <EmptyState
          title="No pudimos abrir esta rutina"
          description={error}
          icon="error"
          action={{ label: 'Volver a rutinas', onClick: () => navigate('/routines') }}
        />
      </Card>
    )
  }

  const pageTitle = isNew ? 'Nueva rutina' : editorState.name || 'Editar rutina'

  return (
    <>
      <PageHeader
        breadcrumb={isNew ? 'Inicio / Rutinas / Nueva' : 'Inicio / Rutinas / Editar'}
        title={pageTitle}
        subtitle={isNew ? 'Arma sesiones y prescribe ejercicios para tus clientes.' : `Versión v${routine?.currentVersion ?? 1}`}
        actions={
          <div className="flex flex-wrap items-center gap-md">
            {!isNew && routine && <RoutineStatusBadge status={routine.status} />}
            {!isNew && (
              <Button label="Historial" icon="history" variant="secondary" onClick={() => setVersionsOpen(true)} />
            )}
            {!isNew && (
              <Button label="Duplicar" icon="content_copy" variant="secondary" onClick={() => setDuplicateOpen(true)} />
            )}
            {!isNew && (
              <Button label="Asignar" icon="person_add" variant="secondary" onClick={() => setAssignOpen(true)} />
            )}
            <Button label="Guardar borrador" icon="save" loading={isSaving} onClick={() => void handleSave()} />
          </div>
        }
      />

      <div className="mt-2xl flex flex-col gap-2xl">
        <Button
          label="Volver a rutinas"
          icon="arrow_back"
          variant="ghost"
          onClick={() => navigate('/routines')}
          className="w-fit"
        />

        {validationError && (
          <Callout title="Revisa la rutina" description={validationError} tone="warning" />
        )}

        <Card className="flex flex-col gap-2xl p-xl sm:p-2xl">
          <TextField
            label="Nombre de la rutina"
            value={editorState.name}
            onChange={(event) => setEditorState({ ...editorState, name: event.target.value })}
            placeholder="Ej. Fuerza 12 semanas"
          />

          <RoutineSessionTabs
            editorState={editorState}
            activeSessionId={resolvedActiveSessionId}
            onActiveSessionChange={setActiveSessionId}
            onChange={setEditorState}
            onAddExercise={setAddExerciseSessionId}
          />
        </Card>
      </div>

      <AddExerciseModal
        open={Boolean(addExerciseSessionId)}
        onClose={() => setAddExerciseSessionId(null)}
        onSelect={handleAddExercise}
        excludedExerciseIds={excludedExerciseIds}
      />

      {routine && (
        <>
          <DuplicateRoutineModal
            routine={duplicateOpen ? routine : null}
            onClose={() => setDuplicateOpen(false)}
            onDuplicated={(duplicated) => {
              setDuplicateOpen(false)
              navigate(`/routines/${duplicated.id}`)
            }}
          />

          <AssignRoutineModal
            routine={assignOpen ? routine : null}
            onClose={() => setAssignOpen(false)}
            onAssigned={(routineName, count) => {
              setAssignOpen(false)
              showToast(`“${routineName}” se asignó a ${count} cliente${count === 1 ? '' : 's'}.`)
            }}
          />

          <RoutineVersionsPanel
            routineId={routine.id}
            routineName={routine.name}
            open={versionsOpen}
            onClose={() => setVersionsOpen(false)}
          />
        </>
      )}

      {toast && (
        <Toast message={toast} tone="success" className="fixed inset-x-xl bottom-xl sm:right-10 sm:left-auto sm:bottom-8" />
      )}
    </>
  )
}
