/**
 * Test helpers that fake the backend by stubbing the global `fetch`.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

import { vi } from 'vitest'
import { API_URL } from '@/services/config'

/** Response a fake route answers with: a JSON body, or a body with a status. */
type FakeReply = unknown | { status: number; body?: unknown }

/** Request received by the fake backend. */
export interface FakeRequest {
  /** HTTP method of the request. */
  method: string
  /** Path and query string, without the base URL. */
  path: string
  /** Parsed JSON body, or `undefined` when the request had none. */
  body: unknown
}

/**
 * Builds a JSON response.
 *
 * @param body - Value serialized as the body.
 * @param status - HTTP status of the response.
 * @returns The response, with the problem content type for failures, as the backend sends them.
 */
export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(body === undefined ? null : JSON.stringify(body), {
    status,
    headers: { 'content-type': status >= 400 ? 'application/problem+json' : 'application/json' },
  })
}

function isStatusReply(reply: FakeReply): reply is { status: number; body?: unknown } {
  return typeof reply === 'object' && reply !== null && 'status' in reply && typeof reply.status === 'number'
}

/**
 * Replaces the global `fetch` with a fake backend.
 *
 * @param routes - Replies keyed by `METHOD /path`; a key matches the requests whose path starts
 * with it, and the longest matching key wins. A reply can be a function of the request.
 * @returns The list of requests received, in order.
 */
export function stubBackend(routes: Record<string, FakeReply | ((request: FakeRequest) => FakeReply)>): FakeRequest[] {
  const requests: FakeRequest[] = []
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const path = String(input).replace(API_URL, '')
      const method = init?.method ?? 'GET'
      const request: FakeRequest = { method, path, body: init?.body ? JSON.parse(String(init.body)) : undefined }
      requests.push(request)
      const key = Object.keys(routes)
        .filter((candidate) => `${method} ${path}`.startsWith(candidate))
        .sort((a, b) => b.length - a.length)[0]
      if (!key) return jsonResponse({ detail: `No fake route for ${method} ${path}` }, 404)
      const route = routes[key]
      const reply = typeof route === 'function' ? route(request) : route
      return isStatusReply(reply) ? jsonResponse(reply.body, reply.status) : jsonResponse(reply)
    }),
  )
  return requests
}
