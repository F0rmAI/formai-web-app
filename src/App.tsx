import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { GuestOnly, RequireAuth } from '@/components/auth/RequireAuth'
import { AuthProvider } from '@/context/AuthProvider'
import { ClientsPage } from '@/pages/ClientsPage'
import { ClientWebGatePage } from '@/pages/ClientWebGatePage'
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage'
import { ForgotPasswordSentPage } from '@/pages/ForgotPasswordSentPage'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { ResetPasswordPage } from '@/pages/ResetPasswordPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<GuestOnly />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/forgot-password/sent" element={<ForgotPasswordSentPage />} />
            <Route path="/access-app" element={<ClientWebGatePage />} />
          </Route>

          <Route path="/password-reset" element={<ResetPasswordPage />} />

          <Route element={<RequireAuth />}>
            <Route path="/clients" element={<ClientsPage />} />
          </Route>

          <Route path="/" element={<Navigate to="/clients" replace />} />
          <Route path="*" element={<Navigate to="/clients" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
