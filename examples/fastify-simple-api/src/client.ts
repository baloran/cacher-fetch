import '@baloran/fetch-cacher'
import Fastify from 'fastify'

const server = Fastify({
  logger: false,
})

server.get('/todos', async () => {
  const request = await fetch(
    'http://127.0.0.1:3000/api/todos',
    {},
    {
      useCache: true,
      ttl: 1,
    },
  )

  if (!request.ok) {
    throw new Error('Network response was not ok')
  }

  const todos = await request.json()

  return todos
})

server.get('/todoswithoutcache', async () => {
  const request = await fetch(
    'http://127.0.0.1:3000/api/todos',
    {},
    { useCache: false },
  )

  if (!request.ok) {
    throw new Error('Network response was not ok')
  }

  const todos = await request.json()

  return todos
})

server.listen({ port: 1337 }, function (err, address) {
  if (err) {
    server.log.error(err)
    process.exit(1)
  }
})
