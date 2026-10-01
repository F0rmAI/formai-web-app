/**
 * Tests for the HTTP client.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError, apiClient, setUnauthorizedHandler } from './api-client'
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

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
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

  it('renews the session once and repeats the request when the access cookie expired', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({}, 401))
      .mockResolvedValueOnce(jsonResponse({}, 200))
      .mockResolvedValueOnce(jsonResponse([{ id: '1' }]))

    await expect(apiClient.get('/items')).resolves.toEqual([{ id: '1' }])
    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      `${API_URL}/items`,
      `${API_URL}/v1/authentication/refresh`,
      `${API_URL}/items`,
    ])
  })

  it('runs the unauthorized handler when the session cannot be renewed', async () => {
    const onUnauthorized = vi.fn()
    setUnauthorizedHandler(onUnauthorized)
    fetchMock.mockResolvedValue(jsonResponse({}, 401))

    await expect(apiClient.get('/items')).rejects.toMatchObject({ status: 401 })
    expect(onUnauthorized).toHaveBeenCalledOnce()
    setUnauthorizedHandler(null)
  })

  it('does not renew the session for a request that skips the unauthorized handling', async () => {
    fetchMock.mockResolvedValue(jsonResponse({}, 401))

    await expect(apiClient.post('/sign-in', {}, { skipUnauthorizedHandler: true })).rejects.toMatchObject({ status: 401 })
    expect(fetchMock).toHaveBeenCalledOnce()
  })
})
