## Fetch-cacher

A simple fetch interceptor that caches responses in redis.

## Usage

We surcharge the fetch function with a new parameter `useCache` and `ttl` (time to live in seconds). If `useCache` is set to true, the response will be cached in redis. If the response is already cached, it will be returned from redis. Otherwise, it will be fetched and cached in redis.

```ts
import '@baloran/fetch-cacher'

const response = await fetch(
  'https://jsonplaceholder.typicode.com/todos/1',
  {},
  {
    useCache: true,
    ttl: 60 * 60, // 1 hour
  },
)
```
