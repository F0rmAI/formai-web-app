/**
 * Field validators shared by the forms.
 *
 * @author Christian Matos
 * @packageDocumentation
 */

/**
 * Validates the format of an email.
 *
 * @param email - Text typed in the email field.
 * @returns The message to show, or `undefined` when the email is valid.
 *
 * @example
 * ```ts
 * emailFormatError('carla@formai.app'); // undefined
 * ```
 */
export function emailFormatError(email: string): string | undefined {
  if (!email.trim()) return 'Ingresa tu correo electrónico'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return 'Ingresa un correo válido'
  return undefined
}

/**
 * Validates the trainer's full name against the backend limit.
 *
 * @param fullName - Text typed in the full-name field.
 * @returns The Spanish error message, or `undefined` when the name is valid.
 */
export function fullNameError(fullName: string): string | undefined {
  const trimmed = fullName.trim()
  if (!trimmed) return 'Ingresa tu nombre completo'
  if (trimmed.length > 120) return 'El nombre completo debe tener 120 caracteres como máximo.'
  return undefined
}

/**
 * Validates that a password has at least 8 characters, with letters and numbers.
 *
 * @param password - Text typed in the password field.
 * @returns The message to show, or `undefined` when the password is valid.
 *
 * @example
 * ```ts
 * passwordError('entrena2026'); // undefined
 * ```
 */
export function passwordError(password: string): string | undefined {
  const hasValidLength = password.length >= 8 && password.length <= 128
  const hasLettersAndNumbers = /[A-Za-zÀ-ÿ]/.test(password) && /\d/.test(password)
  if (!hasValidLength || !hasLettersAndNumbers) {
    return 'Debe tener mínimo 8 caracteres e incluir letras y números.'
  }
  return undefined
}
