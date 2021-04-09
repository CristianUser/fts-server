import { FastifyInstance } from 'fastify';
import { IContextOptions } from '../../../config/core';

export default function(fastify: FastifyInstance, opts: IContextOptions, done: any) {
  fastify.get('/', async () => {
    const data = await opts.core.model?.findAndCountAll();

    return data;
  });
  done()
}
