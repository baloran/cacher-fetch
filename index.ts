const { fetch: originalFetch } = global

import Redis from 'ioredis'

const redis = new Redis()

function buildKey(
  resource: string | URL | globalThis.Request,
  config?: RequestInit,
) {
  const { method, headers } = config ?? {
    method: 'GET',
    headers: {},
  }

  const key = `${method}:${resource.toString()}:${JSON.stringify(headers)}`

  return key
}

interface Options {
  useCache?: boolean
}

interface ExtendedResponse extends Response {
  useCache: boolean
}

declare global {
  function fetch(resource: string, init?: RequestInit): Promise<Response>
  function fetch(
    resource: string,
    init?: RequestInit,
    options?: {
      useCache: false
    },
  ): Promise<Response>

  function fetch(
    resource: string | URL | globalThis.Request,
    config?: RequestInit,
    options?: {
      useCache: true
    },
  ): Promise<ExtendedResponse>
}

global.fetch = async (
  resource: string | URL | globalThis.Request,
  config?: RequestInit,
  options: Options = { useCache: true },
) => {
  if (!options.useCache) {
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
      redis.set(key, JSON.stringify(json))
      return json
    }

    response.text = async () => {
      const text = await originalText.call(response)
      redis.set(key, text)
      return text
    }
  }

  return response
}
