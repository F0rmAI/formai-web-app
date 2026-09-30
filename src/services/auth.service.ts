import { apiClient } from './api-client'
import type {
  AuthRole,
  AuthUser,
  PasswordResetInput,
  PasswordResetRequestInput,
  SignInInput,
  SignUpInput,
} from '@/types/auth'

interface UserDto {
  id: string
  email: string
  roles: string[]
}

interface AuthenticatedUserDto {
  id: string
  email: string
  roles: string[]
  status: string
}

interface MessageDto {
  message: string
}

function toAuthUser(dto: AuthenticatedUserDto, fullName?: string): AuthUser {
  return {
    id: dto.id,
    email: dto.email,
    roles: dto.roles as AuthRole[],
    status: dto.status,
    fullName,
  }
}

export const authService = {
  signUp: (input: SignUpInput) =>
    apiClient.post<UserDto>('/v1/authentication/sign-up', input, { skipUnauthorizedHandler: true }),

  signIn: async (input: SignInInput, fullName?: string) => {
    const dto = await apiClient.post<AuthenticatedUserDto>(
      '/v1/authentication/sign-in',
      { ...input, application: 'WEB_PLATFORM' },
      { skipUnauthorizedHandler: true },
    )
    return toAuthUser(dto, fullName)
  },

  signOut: () =>
    apiClient.post<void>('/v1/authentication/sign-out', undefined, { skipUnauthorizedHandler: true }),

  requestPasswordReset: (input: PasswordResetRequestInput) =>
    apiClient.post<MessageDto>('/v1/password-reset-requests', input, { skipUnauthorizedHandler: true }),

  resetPassword: (input: PasswordResetInput) =>
    apiClient.post<MessageDto>('/v1/password-resets', input, { skipUnauthorizedHandler: true }),
}
