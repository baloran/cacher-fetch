import Fastify from 'fastify'
const todos = [
  {
    id: 1,
    title: 'delectus aut autem',
  },
  {
    id: 2,
    title: 'quis ut nam facilis et officia qui',
  },
  {
    id: 3,
    title: 'fugiat veniam minus',
  },
]

const server = Fastify({
  logger: false,
})

server.get('/api/todos', async () => {
  server.log.info('fetching todos')

  return todos
})

server.listen({ port: 3000 }, function (err, address) {
  if (err) {
    server.log.error(err)
    process.exit(1)
  }
})
