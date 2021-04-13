import { FastifyInstance } from 'fastify';
import { IContextOptions } from '../../../config/core';

export default function (fastify: FastifyInstance, opts: IContextOptions, done: any) {
  fastify.route({
    method: 'GET',
    version: '1.0.0',
    url: '/',
    handler: async () => {
      console.log('custom')
      const data = await opts.core.model?.findAndCountAll();

      return data;
    }
  });

  done();
}
