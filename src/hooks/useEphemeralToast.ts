import { useEffect, useState } from 'react'

/** Conserva un mensaje de toast aunque location.state se limpie después. */
export function useEphemeralToast(message: string | undefined) {
  const [toast, setToast] = useState<string | undefined>(message)
  const [seenMessage, setSeenMessage] = useState(message)

  if (message !== seenMessage) {
    setSeenMessage(message)
    if (message) setToast(message)
  }

  useEffect(() => {
    if (!toast) return
    const id = window.setTimeout(() => setToast(undefined), 4000)
    return () => window.clearTimeout(id)
  }, [toast])

  return toast
}
