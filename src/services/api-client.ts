/**
 * HTTP client shared by every service.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

import { API_URL } from './config'
import type { AuthUser } from '@/types/auth'

/**
 * Picks the most useful message from an error body in problem-detail format.
 *
 * @param body - Parsed response body.
 * @param fallback - Message used when the body carries none.
 * @returns The first non-empty value among `detail`, `message` and `title`, or the fallback.
 */
function problemDetailMessage(body: unknown, fallback: string): string {
  if (body && typeof body === 'object') {
    const record = body as Record<string, unknown>
    for (const key of ['detail', 'message', 'title'] as const) {
      const value = record[key]
      if (typeof value === 'string' && value.trim().length > 0) return value.trim()
    }
  }
  return fallback
}

/**
 * Error thrown when the backend responds with a non-success status.
 */
export class ApiError extends Error {
  /** HTTP status code of the response. */
  readonly status: number
  /** Parsed response body, when the server sent JSON. */
  readonly body: unknown

  /**
   * @param status - HTTP status code of the response.
   * @param message - Human-readable description, used for logging.
   * @param body - Parsed response body, when available.
   */
  constructor(status: number, message: string, body?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

/** Options accepted by every request. */
interface RequestOptions {
  /** Value serialized as the JSON body. */
  body?: unknown
  /** Headers added to the default ones. */
  headers?: Record<string, string>
  /** Signal used to cancel the request. */
  signal?: AbortSignal
  /** When `true`, a `401` or `403` response does not renew the session (public auth routes). */
  skipUnauthorizedHandler?: boolean
}

/**
 * Parses a response body that declares JSON but can be empty or malformed.
 *
 * @param text - Raw body of the response.
 * @returns The parsed value, or `undefined` when there is nothing valid to parse.
 */
function parseJson(text: string): unknown {
  if (!text) return undefined
  try {
    return JSON.parse(text)
  } catch {
    return undefined
  }
}

/** Callback run when a request is rejected because the session is no longer valid. */
type UnauthorizedHandler = () => void

/** Path that renews the session cookies with the refresh cookie. */
const REFRESH_PATH = '/authentication/refresh'

let onUnauthorized: UnauthorizedHandler | null = null
let refreshing: Promise<AuthUser | null> | null = null
let refreshGeneration = 0
let refreshBlocked = false

/**
 * Registers the callback run when the session expired and could not be renewed.
 *
 * @param handler - Callback to run, or `null` to remove the current one.
 */
export function setUnauthorizedHandler(handler: UnauthorizedHandler | null) {
  onUnauthorized = handler
}

/** Allows a new refresh after sign-in sets a new refresh cookie. */
export function markSessionEstablished() {
  refreshBlocked = false
  refreshGeneration += 1
}

/**
 * Restores the user and renews the session cookies. Concurrent callers share one request.
 *
 * @returns The authenticated user, or `null` when the refresh cookie is invalid or absent.
 */
export function restoreSession(): Promise<AuthUser | null> {
  if (refreshBlocked) return Promise.resolve(null)
  refreshing ??= fetch(`${API_URL}${REFRESH_PATH}`, { method: 'POST', credentials: 'include' })
    .then(async (response) => {
      if (!response.ok) return null
      const data = parseJson(await response.text())
      if (!data || typeof data !== 'object') return null
      const user = data as Partial<AuthUser>
      if (typeof user.id !== 'string' || typeof user.email !== 'string' ||
          !Array.isArray(user.roles) || typeof user.status !== 'string') return null
      return { id: user.id, email: user.email, roles: user.roles, status: user.status } as AuthUser
    })
    .catch(() => null)
    .then((user) => {
      if (user) refreshGeneration += 1
      else refreshBlocked = true
      return user
    })
    .finally(() => {
      refreshing = null
    })
  return refreshing
}

/**
 * Sends a JSON request to the backend and parses the response.
 *
 * @remarks
 * A protected route can answer `403` when the access cookie is missing or expired. On an initial
 * `401` or `403`, one shared refresh renews the cookies and the request is retried. A failed
 * refresh or a retried `401` runs the unauthorized handler; a retried `403` is forbidden and does
 * not clear the valid session. Public auth requests skip renewal.
 *
 * @typeParam T - Shape of the response body.
 * @param method - HTTP method.
 * @param path - Path appended to the base URL, starting with `/`.
 * @param options - Body, extra headers, abort signal and unauthorized handling.
 * @param retried - Whether the request is already the retry after renewing the session.
 * @returns The parsed response body, or `undefined` when the response is not JSON.
 * @throws {@link ApiError} when the response status is not in the 2xx range.
 */
async function request<T>(method: HttpMethod, path: string, options: RequestOptions = {}, retried = false): Promise<T> {
  const { body, headers, signal, skipUnauthorizedHandler } = options
  const generationAtStart = refreshGeneration

  const response = await fetch(`${API_URL}${path}`, {
    method,
    signal,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(body !== undefined && { 'Content-Type': 'application/json' }),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  // Errors arrive as `application/problem+json`.
  const isJson = /[/+]json/.test(response.headers.get('content-type') ?? '')
  const data = isJson ? parseJson(await response.text()) : undefined

  if (!response.ok) {
    if (!skipUnauthorizedHandler && (response.status === 401 || response.status === 403)) {
      if (!retried) {
        if (generationAtStart !== refreshGeneration) return request<T>(method, path, options, true)
        if (await restoreSession()) return request<T>(method, path, options, true)
        onUnauthorized?.()
      } else if (response.status === 401) {
        onUnauthorized?.()
      }
    }
    throw new ApiError(response.status, problemDetailMessage(data, `${method} ${path} → ${response.status}`), data)
  }

  return data as T
}

/**
 * Typed HTTP client. Every service reaches the backend through it.
 */
export const apiClient = {
  /**
   * Sends a `GET` request.
   *
   * @typeParam T - Shape of the response body.
   * @param path - Path appended to the base URL.
   * @param options - Extra headers and abort signal.
   * @returns The parsed response body.
   * @throws {@link ApiError} when the response status is not in the 2xx range.
   */
  get: <T>(path: string, options?: Omit<RequestOptions, 'body'>) => request<T>('GET', path, options),

  /**
   * Sends a `POST` request.
   *
   * @typeParam T - Shape of the response body.
   * @param path - Path appended to the base URL.
   * @param body - Value serialized as the JSON body.
   * @param options - Extra headers and abort signal.
   * @returns The parsed response body.
   * @throws {@link ApiError} when the response status is not in the 2xx range.
   */
  post: <T>(path: string, body?: unknown, options?: RequestOptions) => request<T>('POST', path, { ...options, body }),

  /**
   * Sends a `PUT` request.
   *
   * @typeParam T - Shape of the response body.
   * @param path - Path appended to the base URL.
   * @param body - Value serialized as the JSON body.
   * @param options - Extra headers and abort signal.
   * @returns The parsed response body.
   * @throws {@link ApiError} when the response status is not in the 2xx range.
   */
  put: <T>(path: string, body?: unknown, options?: RequestOptions) => request<T>('PUT', path, { ...options, body }),

  /**
   * Sends a `PATCH` request.
   *
   * @typeParam T - Shape of the response body.
   * @param path - Path appended to the base URL.
   * @param body - Value serialized as the JSON body.
   * @param options - Extra headers and abort signal.
   * @returns The parsed response body.
   * @throws {@link ApiError} when the response status is not in the 2xx range.
   */
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>('PATCH', path, { ...options, body }),

  /**
   * Sends a `DELETE` request.
   *
   * @typeParam T - Shape of the response body.
   * @param path - Path appended to the base URL.
   * @param options - Extra headers and abort signal.
   * @returns The parsed response body.
   * @throws {@link ApiError} when the response status is not in the 2xx range.
   */
  delete: <T>(path: string, options?: Omit<RequestOptions, 'body'>) => request<T>('DELETE', path, options),
}
