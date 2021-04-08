import fastify from 'fastify';
import dotenv from './services/dotenv';
import core from './config/core';
import db from './config/db';

const server = fastify({ logger: { prettyPrint: true } });

server.get('/ping', async (request, reply) => {
  return 'pong\n';
});

async function start() {
  try {
    dotenv.init();
    await core.init(server, await db.init());
    const address = await server.listen(dotenv.get('PORT'));

    server.log.info(`Server listening at ${address}`);
  } catch (error) {
    server.log.error(error.message);
    process.exit(1);
  }
}

start();
