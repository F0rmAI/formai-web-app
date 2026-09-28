import { useState } from 'react'
import { Button, Modal } from '@/components/ui'
import type { ActivationCode, ClientSummary } from '@/types/client'

export interface RegenerateCodeModalProps {
  client: ClientSummary | null
  onClose: () => void
  onRegenerate: (clientId: string) => Promise<ActivationCode>
  onRegenerated: (code: ActivationCode) => void
}

export function RegenerateCodeModal({ client, onClose, onRegenerate, onRegenerated }: RegenerateCodeModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  if (!client) return null

  const handleRegenerate = async () => {
    setIsSubmitting(true)
    try {
      onRegenerated(await onRegenerate(client.id))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={`El código de ${client.fullName} venció`}
      description={`${client.fullName.split(' ')[0]} aún no activó su cuenta. Genera un nuevo código; el anterior dejará de funcionar.`}
      icon="key_off"
    >
      <div className="mt-xl flex flex-col-reverse justify-end gap-md sm:flex-row">
        <Button label="Cancelar" variant="secondary" size="md" onClick={onClose} className="w-full sm:w-auto" />
        <Button
          label="Generar nuevo código"
          icon="key"
          size="md"
          loading={isSubmitting}
          onClick={() => void handleRegenerate()}
          className="w-full sm:w-auto"
        />
      </div>
    </Modal>
  )
}
