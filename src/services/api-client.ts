/**
 * HTTP client shared by every service.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

import { API_URL } from './config'

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
  /** When `true`, a `401` response does not run the unauthorized handler (public auth routes). */
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
const REFRESH_PATH = '/v1/authentication/refresh'

let onUnauthorized: UnauthorizedHandler | null = null
let refreshing: Promise<boolean> | null = null

/**
 * Registers the callback run when the session expired and could not be renewed.
 *
 * @param handler - Callback to run, or `null` to remove the current one.
 */
export function setUnauthorizedHandler(handler: UnauthorizedHandler | null) {
  onUnauthorized = handler
}

/**
 * Renews the session cookies. Concurrent callers share one request.
 *
 * @returns Whether the session was renewed.
 */
function refreshSession(): Promise<boolean> {
  refreshing ??= fetch(`${API_URL}${REFRESH_PATH}`, { method: 'POST', credentials: 'include' })
    .then((response) => response.ok)
    .catch(() => false)
    .finally(() => {
      refreshing = null
    })
  return refreshing
}

/**
 * Sends a JSON request to the backend and parses the response.
 *
 * @remarks
 * When the access cookie expired (`401`), the session is renewed once and the request is sent
 * again; if the renewal fails, the unauthorized handler runs.
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
    if (response.status === 401 && !skipUnauthorizedHandler) {
      if (!retried && (await refreshSession())) return request<T>(method, path, options, true)
      onUnauthorized?.()
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
