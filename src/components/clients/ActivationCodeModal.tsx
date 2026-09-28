import { useState } from 'react'
import { Button, Modal, Text, Toast } from '@/components/ui'
import type { ActivationCode } from '@/types/client'

export interface ActivationCodeModalProps {
  activation: ActivationCode | null
  regenerated?: boolean
  onClose: () => void
}

export function ActivationCodeModal({ activation, regenerated = false, onClose }: ActivationCodeModalProps) {
  const [copied, setCopied] = useState(false)
  if (!activation) return null

  const copyCode = async () => {
    await navigator.clipboard.writeText(activation.code)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={
        regenerated
          ? `Nuevo código para ${activation.clientName}`
          : `${activation.clientName} fue registrada`
      }
      description={
        regenerated
          ? 'El código anterior quedó invalidado. Compártelo con tu cliente.'
          : 'Comparte este código con tu cliente. Lo necesitará para activar su cuenta en la app.'
      }
      icon="key"
    >
      <div className="mt-xl rounded-lg bg-primary-pale px-xl py-5 text-center">
        <Text variant="display-xl" tone="primary" className="text-[28px] leading-[34px] font-extrabold tracking-wide sm:text-display-xl">
          {activation.code}
        </Text>
        <Text variant="body-m" tone="secondary" className="mt-xs">
          Vence el {activation.expiresAt} (72 horas)
        </Text>
      </div>
      <div className="mt-xl flex flex-col-reverse justify-end gap-md sm:flex-row">
        <Button label="Copiar código" icon="content_copy" variant="secondary" size="md" onClick={() => void copyCode()} className="w-full sm:w-auto" />
        <Button label="Listo" size="md" onClick={onClose} className="w-full sm:w-auto" />
      </div>
      {copied && <Toast message="Código copiado" tone="success" className="fixed inset-x-xl bottom-xl sm:right-10 sm:left-auto sm:bottom-8" />}
    </Modal>
  )
}
