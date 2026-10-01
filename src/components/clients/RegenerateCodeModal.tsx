/**
 * Modal that confirms a new activation code.
 *
 * @author Melina
 * @packageDocumentation
 */

import { Button, Callout, Modal } from '@/components/ui'
import type { ClientSummary } from '@/types/client'
import { firstName } from '@/utils/format'

/**
 * Props accepted by {@link RegenerateCodeModal}.
 */
export interface RegenerateCodeModalProps {
  /** Client whose activation code expired. */
  client: ClientSummary
  /** Whether the new code is being requested. */
  isSubmitting: boolean
  /** Message of the failed request. */
  error: string | null
  /** Called when the user confirms the new code. */
  onConfirm: () => void
  /** Called when the user cancels or dismisses the modal. */
  onClose: () => void
}

/**
 * Explains that the activation code of a client expired and reports when the user asks for a new one.
 */
export function RegenerateCodeModal({ client, isSubmitting, error, onConfirm, onClose }: RegenerateCodeModalProps) {
  return (
    <Modal
      open
      onClose={onClose}
      title={`El código de ${client.fullName} venció`}
      description={`${firstName(client.fullName)} aún no activó su cuenta. Genera un nuevo código; el anterior dejará de funcionar.`}
      icon="key_off"
      actions={
        <>
          <Button label="Cancelar" variant="secondary" size="md" onClick={onClose} />
          <Button label="Generar nuevo código" icon="key" size="md" loading={isSubmitting} onClick={onConfirm} />
        </>
      }
    >
      {error && <Callout title={error} tone="warning" />}
    </Modal>
  )
}
