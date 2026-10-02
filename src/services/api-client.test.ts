/**
 * Tests for the HTTP client.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError, apiClient, markSessionEstablished, restoreSession, setUnauthorizedHandler } from './api-client'
import { API_URL } from './config'

/** Builds a JSON response with the given status. */
function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

describe('apiClient', () => {
  const fetchMock = vi.fn<typeof fetch>()
  const user = { id: 'u1', email: 'carla@formai.app', roles: ['TRAINER'], status: 'ACTIVE' }

  beforeEach(() => {
    markSessionEstablished()
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    setUnauthorizedHandler(null)
    vi.unstubAllGlobals()
    fetchMock.mockReset()
  })

  it('sends a GET request to the base URL and returns the parsed body', async () => {
    fetchMock.mockResolvedValue(jsonResponse([{ id: '1' }]))

    const result = await apiClient.get<{ id: string }[]>('/items')

    expect(result).toEqual([{ id: '1' }])
    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/items`,
      expect.objectContaining({ method: 'GET', body: undefined }),
    )
  })

  it('serializes the body and sets the JSON content type on POST', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ id: '1' }, 201))

    await apiClient.post('/items', { name: 'Item' })

    const [, init] = fetchMock.mock.calls[0]
    expect(init?.method).toBe('POST')
    expect(init?.body).toBe(JSON.stringify({ name: 'Item' }))
    expect(init?.headers).toMatchObject({ 'Content-Type': 'application/json' })
  })

  it('throws an ApiError with the status and body when the response is not successful', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ message: 'Not found' }, 404))

    const error = await apiClient.get('/items/9').catch((reason: unknown) => reason)

    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({ status: 404, body: { message: 'Not found' } })
  })

  it('returns undefined when the response has no JSON body', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }))

    await expect(apiClient.delete('/items/1')).resolves.toBeUndefined()
  })

  it('reads the detail of an error sent as problem JSON', async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ detail: 'Invalid credentials' }), {
        status: 422,
        headers: { 'content-type': 'application/problem+json' },
      }),
    )

    await expect(apiClient.get('/items')).rejects.toMatchObject({ status: 422, message: 'Invalid credentials' })
  })

  it('does not parse the plain-text body of a 500 response as JSON', async () => {
    fetchMock.mockResolvedValue(new Response('Unexpected error', { status: 500, headers: { 'content-type': 'text/plain' } }))

    await expect(apiClient.get('/items')).rejects.toMatchObject({ status: 500, body: undefined })
  })

  it.each([401, 403])('renews the session once and retries after an initial %i', async (status) => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({}, status))
      .mockResolvedValueOnce(jsonResponse(user))
      .mockResolvedValueOnce(jsonResponse([{ id: '1' }]))

    await expect(apiClient.get('/items')).resolves.toEqual([{ id: '1' }])
    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      `${API_URL}/items`,
      `${API_URL}/v1/authentication/refresh`,
      `${API_URL}/items`,
    ])
  })

  it.each([401, 403])('runs the unauthorized handler when a %i cannot be renewed', async (status) => {
    const onUnauthorized = vi.fn()
    setUnauthorizedHandler(onUnauthorized)
    fetchMock.mockResolvedValueOnce(jsonResponse({}, status)).mockResolvedValueOnce(jsonResponse({}, 401))

    await expect(apiClient.get('/items')).rejects.toMatchObject({ status })
    expect(onUnauthorized).toHaveBeenCalledOnce()
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('keeps the session when the retried request is genuinely forbidden', async () => {
    const onUnauthorized = vi.fn()
    setUnauthorizedHandler(onUnauthorized)
    fetchMock
      .mockResolvedValueOnce(jsonResponse({}, 403))
      .mockResolvedValueOnce(jsonResponse(user))
      .mockResolvedValueOnce(jsonResponse({ detail: 'Forbidden' }, 403))

    await expect(apiClient.get('/items')).rejects.toMatchObject({ status: 403, message: 'Forbidden' })
    expect(onUnauthorized).not.toHaveBeenCalled()
    expect(fetchMock).toHaveBeenCalledTimes(3)
  })

  it('clears the session when the retried request returns 401', async () => {
    const onUnauthorized = vi.fn()
    setUnauthorizedHandler(onUnauthorized)
    fetchMock
      .mockResolvedValueOnce(jsonResponse({}, 403))
      .mockResolvedValueOnce(jsonResponse(user))
      .mockResolvedValueOnce(jsonResponse({}, 401))

    await expect(apiClient.get('/items')).rejects.toMatchObject({ status: 401 })
    expect(onUnauthorized).toHaveBeenCalledOnce()
  })

  it('shares one refresh between concurrent requests and session restoration', async () => {
    let finishRefresh!: (response: Response) => void
    const pendingRefresh = new Promise<Response>((resolve) => { finishRefresh = resolve })
    fetchMock.mockImplementation(async (url) => {
      if (String(url).endsWith('/refresh')) return pendingRefresh
      const itemCalls = fetchMock.mock.calls.filter(([calledUrl]) => String(calledUrl).endsWith('/items')).length
      return itemCalls <= 2 ? jsonResponse({}, 403) : jsonResponse([{ id: '1' }])
    })

    const first = apiClient.get('/items')
    const second = apiClient.get('/items')
    await vi.waitFor(() => {
      expect(fetchMock.mock.calls.filter(([url]) => String(url).endsWith('/refresh'))).toHaveLength(1)
    })
    const restored = restoreSession()
    finishRefresh(jsonResponse(user))

    await expect(Promise.all([first, second, restored])).resolves.toEqual([
      [{ id: '1' }], [{ id: '1' }], user,
    ])
    expect(fetchMock.mock.calls.filter(([url]) => String(url).endsWith('/refresh'))).toHaveLength(1)
  })

  it('retries a late forbidden response after another request already renewed the cookie', async () => {
    let finishLate!: (response: Response) => void
    const lateResponse = new Promise<Response>((resolve) => { finishLate = resolve })
    let itemCalls = 0
    fetchMock.mockImplementation(async (url) => {
      if (String(url).endsWith('/refresh')) return jsonResponse(user)
      itemCalls += 1
      if (itemCalls === 1) return jsonResponse({}, 403)
      if (itemCalls === 2) return lateResponse
      return jsonResponse([{ id: '1' }])
    })

    const first = apiClient.get('/items')
    const second = apiClient.get('/items')
    await expect(first).resolves.toEqual([{ id: '1' }])
    finishLate(jsonResponse({}, 403))
    await expect(second).resolves.toEqual([{ id: '1' }])
    expect(fetchMock.mock.calls.filter(([url]) => String(url).endsWith('/refresh'))).toHaveLength(1)
  })

  it('does not reuse a refresh cookie after renewal fails', async () => {
    fetchMock.mockImplementation(async () => jsonResponse({}, 403))

    await expect(apiClient.get('/items')).rejects.toMatchObject({ status: 403 })
    await expect(apiClient.get('/items')).rejects.toMatchObject({ status: 403 })
    expect(fetchMock.mock.calls.filter(([url]) => String(url).endsWith('/refresh'))).toHaveLength(1)
  })

  it('handles a plain-text backend error without JSON parsing failure', async () => {
    fetchMock.mockResolvedValue(new Response('Server error', { status: 500, headers: { 'content-type': 'text/plain' } }))

    await expect(apiClient.get('/items')).rejects.toMatchObject({ status: 500, body: undefined })
  })

  it('does not renew the session for a request that skips the unauthorized handling', async () => {
    fetchMock.mockResolvedValue(jsonResponse({}, 401))

    await expect(apiClient.post('/sign-in', {}, { skipUnauthorizedHandler: true })).rejects.toMatchObject({ status: 401 })
    expect(fetchMock).toHaveBeenCalledOnce()
  })
})
