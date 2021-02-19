import fastify from 'fastify';
import dotenv from './services/dotenv';

const server = fastify({ logger: true });

server.get("/ping", async (request, reply) => {
  return 'pong\n';
});

async function start() {
  try {
    dotenv.init();
    const address = await server.listen(dotenv.get('PORT'));

    server.log.info(`Server listening at ${address}`);
  } catch (error) {
    server.log.error(error.message);
    process.exit(1);
  }
}

start();
