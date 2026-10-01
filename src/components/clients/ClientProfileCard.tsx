/**
 * Card with the body profile of a client.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

import { Button, Card, Icon, Text } from '@/components/ui'
import type { BodyProfile } from '@/types/client'
import { formatKg } from '@/utils/format'

/** Renders one label and value pair of the profile. */
function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-xs sm:flex-row sm:items-start sm:justify-between sm:gap-xl">
      <Text as="dt" tone="secondary">
        {label}
      </Text>
      <Text as="dd" variant="body-l-strong" className="sm:text-right">
        {value}
      </Text>
    </div>
  )
}

/**
 * Props accepted by {@link ClientProfileCard}.
 */
export interface ClientProfileCardProps {
  /** Body profile to show. */
  profile: BodyProfile
  /** Called when the user asks to edit the profile. */
  onEdit: () => void
}

/**
 * Shows the body profile of a client with its weight history and reports when the user edits it.
 */
export function ClientProfileCard({ profile, onEdit }: ClientProfileCardProps) {
  const weight = profile.weight
    ? `${formatKg(profile.weight)}${profile.updatedAt ? ` · actualizado el ${profile.updatedAt}` : ''}`
    : 'Sin registrar'

  return (
    <Card className="flex flex-col gap-xl p-2xl">
      <div className="flex flex-wrap items-center justify-between gap-md">
        <Text as="h2" variant="title">
          Ficha física
        </Text>
        <Button label="Editar ficha" icon="edit" variant="secondary" size="sm" onClick={onEdit} />
      </div>

      <dl className="flex flex-col gap-xl">
        <ProfileRow label="Objetivo" value={profile.goal || 'Sin registrar'} />
        <ProfileRow label="Peso corporal" value={weight} />
        <ProfileRow label="Estatura" value={profile.height ? `${profile.height} cm` : 'Sin registrar'} />
        <ProfileRow label="Lesiones o restricciones" value={profile.restrictions || 'Ninguna registrada'} />
      </dl>

      {profile.weightHistory.length > 0 && (
        <div className="flex flex-col gap-xl">
          <div className="flex items-center gap-md">
            <Icon name="history" size={16} className="text-content-secondary" />
            <Text as="h3" variant="overline" tone="secondary">
              Historial de peso
            </Text>
          </div>
          {profile.weightHistory.map((entry) => (
            <div key={entry.date} className="flex items-center justify-between gap-xl">
              <Text variant="body-m" tone="muted">
                {entry.date}
              </Text>
              <Text variant="body-m" tone="secondary">
                {formatKg(entry.weight, 1)}
              </Text>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
