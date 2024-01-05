const { fetch: originalFetch } = global

import Redis from 'ioredis'

const redis = new Redis()

function buildKey(
  resource: string | URL | globalThis.Request,
  config?: RequestInit,
) {
  const { method = 'GET', headers = {} } = config ?? {
    method: 'GET',
    headers: {},
  }

  const key = `${method}:${resource.toString()}:${JSON.stringify(headers)}`

  return key
}

export interface Options {
  useCache?: boolean
  ttl?: number
}

export interface ExtendedResponse extends Response {
  useCache: boolean
}

declare global {
  function fetch(resource: string, init?: RequestInit): Promise<Response>
  function fetch(
    resource: string,
    init?: RequestInit,
    options?: Options,
  ): Promise<Response>

  function fetch(
    resource: string | URL | globalThis.Request,
    config?: RequestInit,
    options?: Options,
  ): Promise<ExtendedResponse>
}

global.fetch = async (
  resource: string | URL | globalThis.Request,
  config?: RequestInit,
  options?: Options,
) => {
  const { useCache = true, ttl = 60 * 60 * 24 } = options ?? {}

  if (!useCache) {
    return originalFetch(resource, config)
  }

  const key = buildKey(resource, config)

  const cached = await redis.get(key)

  if (cached) {
    return Object.assign(new Response(), {
      useCache: true,
      async json() {
        return JSON.parse(cached)
      },
      async text() {
        return cached
      },
    })
  }

  const response = await originalFetch(resource, config)

  if (response.ok) {
    const originalJson = response.json
    const originalText = response.text

    response.json = async () => {
      const json = await originalJson.call(response)
      redis.set(key, JSON.stringify(json), 'EX', ttl)
      return json
    }

    response.text = async () => {
      const text = await originalText.call(response)
      redis.set(key, text, 'EX', ttl)
      return text
    }
  }

  return response
}
