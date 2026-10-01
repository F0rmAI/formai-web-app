/**
 * Root component of the app.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthProvider'
import { AppRoutes } from '@/navigation/AppRoutes'

/**
 * Mounts the providers and the routes of the app.
 */
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}
