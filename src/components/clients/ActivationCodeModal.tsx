/**
 * Modal that shows an activation code.
 *
 * @author Melina
 * @packageDocumentation
 */

import { Button, Modal, Text } from '@/components/ui'
import type { ActivationCode } from '@/types/client'

/**
 * Props accepted by {@link ActivationCodeModal}.
 */
export interface ActivationCodeModalProps {
  /** Code to share with the client. */
  activation: ActivationCode
  /**
   * Whether the code replaces an expired one; changes the title and the description.
   *
   * @defaultValue `false`
   */
  regenerated?: boolean
  /** Called when the user asks to copy the code. */
  onCopy: (code: string) => void
  /** Called when the user closes the modal. */
  onClose: () => void
}

/**
 * Shows the activation code of a client and reports when the user copies it or closes the modal.
 */
export function ActivationCodeModal({ activation, regenerated = false, onCopy, onClose }: ActivationCodeModalProps) {
  return (
    <Modal
      open
      onClose={onClose}
      title={regenerated ? `Nuevo código para ${activation.clientName}` : `${activation.clientName} fue registrada`}
      description={
        regenerated
          ? 'El código anterior quedó invalidado. Compártelo con tu cliente.'
          : 'Comparte este código con tu cliente. Lo necesitará para activar su cuenta en la app.'
      }
      icon="key"
      actions={
        <>
          <Button
            label="Copiar código"
            icon="content_copy"
            variant="secondary"
            size="md"
            onClick={() => onCopy(activation.code)}
          />
          <Button label="Listo" size="md" onClick={onClose} />
        </>
      }
    >
      <div className="flex flex-col items-center gap-xs rounded-lg bg-primary-pale p-xl text-center">
        <Text variant="display-xl" tone="primary">
          {activation.code}
        </Text>
        <Text variant="body-m" tone="secondary">
          Vence el {activation.expiresAt} (72 horas)
        </Text>
      </div>
    </Modal>
  )
}
