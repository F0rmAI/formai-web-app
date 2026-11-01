/**
 * Profile tab of a client.
 *
 * @author Melina
 * @packageDocumentation
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ClientAssignmentHistory,
  ClientProfileCard,
  ClientRoutineCard,
  EditBodyProfileModal,
  PersonalizeAssignmentModal,
} from '@/components/clients'
import { useClientOutlet } from '@/hooks/useClientOutlet'
import { ROUTES } from '@/navigation/routes'
import type { PersonalizeAssignmentInput, UpdateBodyProfileInput } from '@/types/client'

/**
 * Shows the body profile and the current routine of a client, with the modal that edits the
 * profile, using {@link useClientOutlet} for data and actions.
 *
 * @remarks
 * Rendered inside `ClientLayoutPage`, which loads the client.
 */
export function ClientProfilePage() {
  const navigate = useNavigate()
  const {
    client,
    refetch,
    saveBodyProfile,
    isSavingProfile,
    profileError,
    profileErrorField,
    resetProfileError,
    personalizeAssignment,
    isPersonalizing,
    personalizeError,
    resetPersonalizeError,
    showToast,
  } = useClientOutlet()
  const [isEditing, setIsEditing] = useState(false)
  const [isPersonalizingOpen, setIsPersonalizingOpen] = useState(false)

  const handlePersonalize = async (input: PersonalizeAssignmentInput) => {
    if (!(await personalizeAssignment(input))) return
    setIsPersonalizingOpen(false)
    showToast('Personalización guardada · el cliente la verá al sincronizar su app')
  }

  const handleSave = async (input: UpdateBodyProfileInput) => {
    if (!(await saveBodyProfile(input))) return
    setIsEditing(false)
    showToast('Ficha actualizada')
  }

  return (
    <>
      <div className="grid grid-cols-1 items-start gap-2xl lg:grid-cols-2">
        <ClientProfileCard
          profile={client.bodyProfile}
          onEdit={() => {
            resetProfileError()
            setIsEditing(true)
          }}
        />
        <ClientRoutineCard
          routine={client.routine}
          onRetry={refetch}
          onEdit={() => client.routine && navigate(ROUTES.routineEdit(client.routine.id))}
          onViewVersions={() => client.routine && navigate(ROUTES.routineVersions(client.routine.id))}
          onPersonalize={() => {
            resetPersonalizeError()
            setIsPersonalizingOpen(true)
          }}
        />
      </div>
      <div className="mt-2xl"><ClientAssignmentHistory assignments={client.assignments} /></div>

      {isPersonalizingOpen && client.routine && (
        <PersonalizeAssignmentModal
          sessions={client.routine.sessions}
          note={client.routine.note}
          adjustments={client.routine.adjustments}
          isSubmitting={isPersonalizing}
          error={personalizeError}
          onSubmit={(input) => void handlePersonalize(input)}
          onClose={() => setIsPersonalizingOpen(false)}
        />
      )}

      {isEditing && (
        <EditBodyProfileModal
          profile={client.bodyProfile}
          isSubmitting={isSavingProfile}
          error={profileError}
          errorField={profileErrorField}
          onSubmit={(input) => void handleSave(input)}
          onClose={() => setIsEditing(false)}
        />
      )}
    </>
  )
}
