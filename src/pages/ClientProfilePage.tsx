/**
 * Profile tab of a client.
 *
 * @author Melina
 * @packageDocumentation
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ClientProfileCard, ClientRoutineCard, EditBodyProfileModal } from '@/components/clients'
import { useClientOutlet } from '@/hooks/useClientOutlet'
import { ROUTES } from '@/navigation/routes'
import type { UpdateBodyProfileInput } from '@/types/client'

/**
 * Shows the body profile and the current routine of a client, with the modal that edits the
 * profile, using {@link useClientOutlet} for data and actions.
 *
 * @remarks
 * Rendered inside `ClientLayoutPage`, which loads the client.
 */
export function ClientProfilePage() {
  const navigate = useNavigate()
  const { client, saveBodyProfile, isSavingProfile, profileError, resetProfileError, showToast } = useClientOutlet()
  const [isEditing, setIsEditing] = useState(false)

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
          onEdit={() => client.routine && navigate(ROUTES.routineEdit(client.routine.id))}
          onViewVersions={() => client.routine && navigate(ROUTES.routineVersions(client.routine.id))}
        />
      </div>

      {isEditing && (
        <EditBodyProfileModal
          profile={client.bodyProfile}
          isSubmitting={isSavingProfile}
          error={profileError}
          onSubmit={(input) => void handleSave(input)}
          onClose={() => setIsEditing(false)}
        />
      )}
    </>
  )
}
