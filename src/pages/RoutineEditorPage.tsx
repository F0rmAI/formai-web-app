/**
 * Page that creates or edits a routine.
 *
 * @author Johan Quiñones
 * @packageDocumentation
 */

import { useNavigate, useParams } from 'react-router-dom'
import { RoutineBasicsCard, RoutineSessionEditor } from '@/components/routines'
import { PageHeader } from '@/components/layout'
import { Button, Callout, Card, EmptyState, LoadingState, type SelectOption } from '@/components/ui'
import { useRoutineEditor } from '@/hooks/useRoutineEditor'
import type { ToastLocationState } from '@/hooks/useToast'
import { ROUTES } from '@/navigation/routes'
import { formatCount } from '@/utils/format'
import { hasEditorErrors, MAX_SESSIONS } from '@/utils/routine-editor'

/** Renders the form of one routine; it is keyed by routine so its state never leaks to another. */
function RoutineEditor({ routineId }: { routineId?: string }) {
  const navigate = useNavigate()
  const {
    routine,
    state,
    errors,
    exercises,
    isLoading,
    loadError,
    isSaving,
    saveError,
    setName,
    setSessionCount,
    updateSession,
    updateExercise,
    addExercise,
    removeExercise,
    save,
  } = useRoutineEditor(routineId)

  if (!state) {
    if (isLoading) return <LoadingState label="Cargando rutina…" />
    return (
      <Card>
        <EmptyState
          title="No pudimos abrir esta rutina"
          description={loadError ?? 'La rutina solicitada no está disponible.'}
          icon="error"
          action={{ label: 'Volver a rutinas', icon: 'arrow_back', onClick: () => navigate(ROUTES.routines) }}
        />
      </Card>
    )
  }

  const handleSave = async () => {
    const result = await save()
    if (!result.ok) return
    const state: ToastLocationState = {
      toast: routine ? `Cambios guardados · versión ${result.value.currentVersion}` : 'Rutina guardada como borrador',
    }
    navigate(ROUTES.routines, { state })
  }

  // A routine can still prescribe an archived exercise: it stays available in its own form.
  const exerciseOptions: SelectOption<string>[] = [
    ...exercises.map((exercise) => ({ value: exercise.id, label: exercise.name })),
    ...(routine?.sessions ?? [])
      .flatMap((session) => session.exercises)
      .filter((prescribed) => !exercises.some((exercise) => exercise.id === prescribed.exerciseId))
      .map((prescribed) => ({ value: prescribed.exerciseId, label: prescribed.exerciseName })),
  ].filter((option, index, all) => all.findIndex((other) => other.value === option.value) === index)

  const clients = routine?.assignedClients.length ?? 0
  const subtitle = routine
    ? `${clients > 0 ? `Asignada a ${formatCount(clients, 'cliente', 'clientes')}` : 'Sin clientes asignados'} · versión ${routine.currentVersion}`
    : 'Define sesiones y ejercicios con su prescripción.'

  return (
    <>
      <PageHeader
        breadcrumb={`Rutinas / ${routine ? routine.name : 'Nueva rutina'}`}
        title={routine ? 'Editar rutina' : 'Nueva rutina'}
        subtitle={subtitle}
        actions={
          <>
            <Button label="Cancelar" variant="secondary" size="md" onClick={() => navigate(ROUTES.routines)} />
            <Button
              label={routine ? 'Guardar cambios' : 'Guardar borrador'}
              icon="save"
              size="md"
              loading={isSaving}
              onClick={() => void handleSave()}
            />
          </>
        }
      />

      <div className="mt-2xl flex flex-col gap-2xl">
        {hasEditorErrors(errors) && (
          <Callout
            tone="warning"
            icon="error"
            title="No pudimos guardar la rutina"
            description="Revisa los campos marcados: las series y repeticiones deben ser mayores que 0."
          />
        )}
        {saveError && <Callout tone="warning" icon="error" title="No pudimos guardar la rutina" description={saveError} />}
        {routine && (
          <Callout
            icon="info"
            title={`Se creará la versión ${routine.currentVersion + 1}`}
            description={
              clients > 0
                ? 'Tus clientes verán el cambio en su próxima sincronización. Los entrenamientos ya registrados no cambian.'
                : 'La versión actual se conserva en el historial.'
            }
          />
        )}

        <RoutineBasicsCard
          name={state.name}
          nameError={errors.name}
          sessionCount={state.sessions.length}
          maxSessions={MAX_SESSIONS}
          onNameChange={setName}
          onSessionCountChange={setSessionCount}
        />

        {state.sessions.map((session, index) => (
          <RoutineSessionEditor
            key={session.localId}
            position={index + 1}
            session={session}
            exerciseOptions={exerciseOptions}
            errors={errors.fields}
            onLabelChange={(label) => updateSession(session.localId, (current) => ({ ...current, label }))}
            onExerciseChange={(exerciseLocalId, patch) => updateExercise(session.localId, exerciseLocalId, patch)}
            onAddExercise={() => addExercise(session.localId)}
            onRemoveExercise={(exerciseLocalId) => removeExercise(session.localId, exerciseLocalId)}
          />
        ))}
      </div>
    </>
  )
}

/**
 * Shows the form that creates a routine or edits an existing one, using {@link useRoutineEditor}
 * for the form state, the exercise catalog and the save action.
 *
 * @remarks
 * Requires an authenticated session; the route guard redirects otherwise. Without a `routineId`
 * route parameter the page creates a routine.
 */
export function RoutineEditorPage() {
  const { routineId } = useParams()
  return <RoutineEditor key={routineId ?? 'new'} routineId={routineId} />
}
