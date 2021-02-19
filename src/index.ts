import dotenv from 'dotenv';
import fastify from 'fastify'

dotenv.config();
const server = fastify({ logger: true })

server.get('/ping', async (request, reply) => {
  return 'pong\n'
})

server.listen(8080, (err, address) => {
  if (err) {
    server.log.error(err.message)
    process.exit(1)
  }
  server.log.info(`Server listening at ${address}`)
})
