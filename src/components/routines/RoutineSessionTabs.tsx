import { Button, TabItem, TextField } from '@/components/ui'
import type { EditorSession, RoutineEditorState } from '@/types/routine'
import { createLocalId, defaultSessionLabel } from '@/utils/routine-editor'
import { PrescribedExerciseRow } from './PrescribedExerciseRow'

export interface RoutineSessionTabsProps {
  editorState: RoutineEditorState
  activeSessionId: string
  onActiveSessionChange: (sessionId: string) => void
  onChange: (state: RoutineEditorState) => void
  onAddExercise: (sessionId: string) => void
}

export function RoutineSessionTabs({
  editorState,
  activeSessionId,
  onActiveSessionChange,
  onChange,
  onAddExercise,
}: RoutineSessionTabsProps) {
  const activeSession = editorState.sessions.find((session) => session.localId === activeSessionId) ?? editorState.sessions[0]

  const updateSessions = (sessions: EditorSession[]) => {
    onChange({ ...editorState, sessions })
  }

  const addSession = () => {
    const newSession: EditorSession = {
      localId: createLocalId(),
      label: defaultSessionLabel(editorState.sessions.length),
      exercises: [],
    }
    updateSessions([...editorState.sessions, newSession])
    onActiveSessionChange(newSession.localId)
  }

  const removeSession = (sessionId: string) => {
    if (editorState.sessions.length <= 1) return
    const nextSessions = editorState.sessions.filter((session) => session.localId !== sessionId)
    updateSessions(nextSessions)
    if (activeSessionId === sessionId) {
      onActiveSessionChange(nextSessions[0]?.localId ?? '')
    }
  }

  const updateSession = (sessionId: string, patch: Partial<EditorSession>) => {
    updateSessions(
      editorState.sessions.map((session) => (session.localId === sessionId ? { ...session, ...patch } : session)),
    )
  }

  if (!activeSession) return null

  return (
    <div className="flex flex-col gap-xl">
      <div className="flex items-center gap-md overflow-x-auto border-b border-line-subtle pb-xs">
        {editorState.sessions.map((session) => (
          <TabItem
            key={session.localId}
            label={session.label || 'Sin nombre'}
            active={session.localId === activeSession.localId}
            onClick={() => onActiveSessionChange(session.localId)}
          />
        ))}
        <Button label="Agregar sesión" icon="add" variant="secondary" size="sm" onClick={addSession} className="ml-md shrink-0" />
      </div>

      <div className="flex flex-col gap-xl">
        <div className="flex flex-col gap-lg sm:flex-row sm:items-end">
          <TextField
            label="Etiqueta de sesión"
            value={activeSession.label}
            onChange={(event) => updateSession(activeSession.localId, { label: event.target.value })}
            className="flex-1"
          />
          {editorState.sessions.length > 1 && (
            <Button
              label="Eliminar sesión"
              icon="delete"
              variant="secondary"
              onClick={() => removeSession(activeSession.localId)}
              className="w-full sm:w-auto"
            />
          )}
        </div>

        <div className="flex flex-col gap-lg">
          {activeSession.exercises.map((exercise) => (
            <PrescribedExerciseRow
              key={exercise.localId}
              exercise={exercise}
              onChange={(updated) =>
                updateSession(activeSession.localId, {
                  exercises: activeSession.exercises.map((item) =>
                    item.localId === updated.localId ? updated : item,
                  ),
                })
              }
              onRemove={() =>
                updateSession(activeSession.localId, {
                  exercises: activeSession.exercises.filter((item) => item.localId !== exercise.localId),
                })
              }
            />
          ))}
        </div>

        <Button
          label="Agregar ejercicio"
          icon="add"
          variant="secondary"
          onClick={() => onAddExercise(activeSession.localId)}
        />
      </div>
    </div>
  )
}
