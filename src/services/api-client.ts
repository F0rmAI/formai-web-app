import { API_URL } from './config'

export class ApiError extends Error {
  readonly status: number
  readonly body: unknown

  constructor(status: number, message: string, body?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

interface RequestOptions {
  body?: unknown
  headers?: Record<string, string>
  signal?: AbortSignal
}

async function request<T>(method: HttpMethod, path: string, { body, headers, signal }: RequestOptions = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    method,
    signal,
    headers: {
      Accept: 'application/json',
      ...(body !== undefined && { 'Content-Type': 'application/json' }),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  const isJson = response.headers.get('content-type')?.includes('application/json')
  const data: unknown = isJson ? await response.json() : undefined

  if (!response.ok) {
    throw new ApiError(response.status, `${method} ${path} → ${response.status}`, data)
  }

  return data as T
}

/** Cliente HTTP único: todos los services llaman al backend a través de él. */
export const apiClient = {
  get: <T>(path: string, options?: Omit<RequestOptions, 'body'>) => request<T>('GET', path, options),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) => request<T>('POST', path, { ...options, body }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) => request<T>('PUT', path, { ...options, body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>('PATCH', path, { ...options, body }),
  delete: <T>(path: string, options?: Omit<RequestOptions, 'body'>) => request<T>('DELETE', path, options),
}
