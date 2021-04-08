import fastify from 'fastify';
import dotenv from './services/dotenv';
import { init } from './config/core';
import db from './config/db';

const server = fastify({ logger: true });

server.get("/ping", async (request, reply) => {
  return 'pong\n';
});

async function start() {
  try {
    dotenv.init();
    const seq = await db.init()
    init(server, seq);
    const address = await server.listen(dotenv.get('PORT'));

    server.log.info(`Server listening at ${address}`);
  } catch (error) {
    server.log.error(error.message);
    process.exit(1);
  }
}

start();
