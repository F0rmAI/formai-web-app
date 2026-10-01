/**
 * Domain types of the trainer session.
 *
 * @author Christian Matos
 * @packageDocumentation
 */

/**
 * Roles an account can hold in the platform.
 */
export type AuthRole = 'REGISTERED_USER' | 'TRAINER' | 'CLIENT' | 'ADMINISTRATOR'

/**
 * Describes the signed-in user.
 */
export interface AuthUser {
  /** Unique identifier assigned by the server. */
  id: string
  /** Email used to sign in. */
  email: string
  /** Roles of the account. */
  roles: AuthRole[]
  /** Account state reported by the server, such as `ACTIVE`. */
  status: string
  /** Name shown in the interface; only known right after signing up. */
  fullName?: string
}

/**
 * Credentials sent to sign in.
 */
export interface SignInInput {
  /** Email of the account. */
  email: string
  /** Password of the account. */
  password: string
}

/**
 * Data sent to create a trainer account.
 */
export interface SignUpInput {
  /** Full name of the trainer. */
  fullName: string
  /** Email of the new account. */
  email: string
  /** Password, with at least 8 characters. */
  password: string
}

/**
 * Data sent to set a new password from an emailed link.
 */
export interface PasswordResetInput {
  /** Single-use token carried by the emailed link. */
  token: string
  /** New password, with at least 8 characters. */
  password: string
}
