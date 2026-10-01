import { ApiError } from '@/services/api-client'

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}

export function passwordLengthError(password: string): string | undefined {
  if (password.length < 8 || password.length > 128) {
    return 'Al menos 8 caracteres'
  }
  return undefined
}

export function emailFormatError(email: string): string | undefined {
  if (!email.trim()) return 'Ingresa tu correo electrónico'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return 'Ingresa un correo válido'
  }
  return undefined
}
