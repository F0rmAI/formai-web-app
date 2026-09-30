export type AuthRole = 'REGISTERED_USER' | 'TRAINER' | 'CLIENT' | 'ADMINISTRATOR'

export type UserStatus = string

export interface AuthUser {
  id: string
  email: string
  roles: AuthRole[]
  status: UserStatus
  /** Nombre mostrado en UI; puede no venir del API de sign-in. */
  fullName?: string
}

export interface SignInInput {
  email: string
  password: string
}

export interface SignUpInput {
  fullName: string
  email: string
  password: string
}

export interface PasswordResetRequestInput {
  email: string
}

export interface PasswordResetInput {
  token: string
  password: string
}
