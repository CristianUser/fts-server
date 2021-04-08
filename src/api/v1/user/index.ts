import { FastifyInstance } from 'fastify';
import { IRouterInitOptions } from '../../../config/core';
let initOptions: IRouterInitOptions;

export function init(options: IRouterInitOptions) {
  initOptions = options;
}

export function register(fastify: FastifyInstance, opts: any, done: any) {
  fastify.get('/', async () => {
    const data = await initOptions.model?.findAndCountAll();

    return data;
  });
  done()
}
