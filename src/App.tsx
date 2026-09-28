import { useEffect, useState } from 'react'
import { AppShell } from '@/components/layout'
import { ClientDetailPage } from '@/pages/ClientDetailPage'
import { ClientsPage } from '@/pages/ClientsPage'

export default function App() {
  const clientIdFromPath = () => {
    const match = window.location.pathname.match(/^\/clients\/([^/]+)$/)
    return match?.[1]
  }
  const [selectedClientId, setSelectedClientId] = useState<string | undefined>(clientIdFromPath)

  useEffect(() => {
    const onPopState = () => setSelectedClientId(clientIdFromPath())
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const showClients = () => {
    window.history.pushState(null, '', '/clients')
    setSelectedClientId(undefined)
  }

  const showClient = (clientId: string) => {
    window.history.pushState(null, '', `/clients/${clientId}`)
    setSelectedClientId(clientId)
  }

  return (
    <AppShell onNavigateToClients={showClients}>
      {selectedClientId ? (
        <ClientDetailPage clientId={selectedClientId} onBack={showClients} />
      ) : (
        <ClientsPage onOpenClient={showClient} />
      )}
    </AppShell>
  )
}
