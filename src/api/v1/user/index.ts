import { FastifyInstance } from 'fastify';

export function init(options: any) {
  console.log('options', options)
}

export function register(fastify: FastifyInstance, opts: any, done: any) {
  console.log(opts);
  done()
}
