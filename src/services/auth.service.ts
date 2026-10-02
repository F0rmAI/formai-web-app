/**
 * Service for the trainer session: sign up, sign in, sign out and password recovery.
 *
 * @author Christian Matos
 * @packageDocumentation
 */

import type { AuthRole, AuthUser, PasswordResetInput, SignInInput, SignUpInput } from '@/types/auth'
import { apiClient, markSessionEstablished, restoreSession } from './api-client'

interface AuthenticatedUserResource {
  id: string
  email: string
  roles: string[]
  status: string
}

// These routes are public: a 401 means wrong credentials, not an expired session.
const PUBLIC = { skipUnauthorizedHandler: true } as const

/**
 * Calls the authentication endpoints of the backend.
 *
 * @remarks
 * The session travels in `httpOnly` cookies set by the backend; no token is handled here.
 */
export const authService = {
  /**
   * Restores a session from the refresh cookie when no user is stored locally.
   *
   * @returns The authenticated user, or `null` when the refresh cookie cannot renew the session.
   */
  restoreSession(): Promise<AuthUser | null> {
    return restoreSession()
  },

  /**
   * Creates a trainer account. It does not sign the account in.
   *
   * @param input - Name, email and password of the new account.
   * @throws {@link ApiError} with status `409` when the email is taken, or `422` when the password is too weak.
   */
  async signUp(input: SignUpInput): Promise<void> {
    await apiClient.post('/v1/authentication/sign-up', input, PUBLIC)
  },

  /**
   * Signs a trainer in to the web platform.
   *
   * @param input - Email and password.
   * @param fullName - Name to show for the user, known only right after signing up.
   * @returns The signed-in user.
   * @throws {@link ApiError} with status `401` for wrong credentials, `403` when the account belongs
   * to the mobile app, or `429` when the account is locked.
   */
  async signIn(input: SignInInput, fullName?: string): Promise<AuthUser> {
    const user = await apiClient.post<AuthenticatedUserResource>(
      '/v1/authentication/sign-in',
      { ...input, application: 'WEB_PLATFORM' },
      PUBLIC,
    )
    markSessionEstablished()
    return { id: user.id, email: user.email, roles: user.roles as AuthRole[], status: user.status, fullName }
  },

  /**
   * Ends the session and clears its cookies.
   *
   * @throws {@link ApiError} when the server responds with a non-success status.
   */
  async signOut(): Promise<void> {
    await apiClient.post('/v1/authentication/sign-out', undefined, PUBLIC)
  },

  /**
   * Asks the backend to email a link to set a new password.
   *
   * @param email - Email of the account.
   * @throws {@link ApiError} when the server responds with a non-success status.
   */
  async requestPasswordReset(email: string): Promise<void> {
    await apiClient.post('/v1/password-reset-requests', { email }, PUBLIC)
  },

  /**
   * Sets a new password with the token of an emailed link.
   *
   * @param input - Token and new password.
   * @throws {@link ApiError} with status `422` when the link expired, was used or the password is too weak.
   */
  async resetPassword(input: PasswordResetInput): Promise<void> {
    await apiClient.post('/v1/password-resets', input, PUBLIC)
  },
}
