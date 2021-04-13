import { ModelCtor, Op } from 'sequelize';
import { parseJson } from './utils';
import { CustomModel, getModelHelper } from './db';
import { FastifyInstance, FastifyRequest } from 'fastify';

/**
 * @param {import('sequelize').ModelCtor<import('sequelize').Model>} model Sequelize model
 */
export function createController(model: ModelCtor<CustomModel>) {
  const controller = getModelHelper(model);

  return {
    async get({ query }: FastifyRequest) {
      const { rows = 10, page = 1, match, search, sortBy }: any = query;
      const pagination: any =
        rows != -1
          ? {
              limit: rows,
              offset: (page - 1) * rows
            }
          : {};
      const where = parseJson(match);
      const searchEntries = Object.entries(parseJson(search) || {});
      const like = searchEntries.length
        ? {
            [Op.or]: searchEntries.map(([key, value]) => {
              return {
                [key]: {
                  [Op.iLike]: `%${value}%`
                }
              };
            })
          }
        : {};
      const order = {
        order: Object.entries(parseJson(sortBy) || {})
      };

      const results = await model.findAndCountAll({
        ...pagination,
        ...order,
        where: { ...where, ...like }
      });

      return results;
    },
    async getById({ params }: FastifyRequest) {
      const { id }: any = params;
      const result = await controller.get(id);

      return result;
    },
    post({ body }: FastifyRequest) {
      return controller.post(body);
    },
    put({ params, query, body }: FastifyRequest) {
      const { id }: any = params;
      const { upsert }: any = query;

      return controller.put(id, body, upsert);
    },
    patch({ params, body }: FastifyRequest) {
      const { id }: any = params;

      return controller.patch(id, body);
    },
    delete({ params }: FastifyRequest) {
      const { id }: any = params;

      return controller.delete(id);
    }
  };
}

export function generateDefaultEndpoints(fastify: FastifyInstance, { model }: any, done: any) {
  interface IRouterConfig {
    method: 'get' | 'post' | 'put' | 'patch' | 'delete';
    param?: string;
    func?: 'getById';
  }
  const routes: IRouterConfig[] = [
    { method: 'get' },
    { method: 'post' },
    { method: 'get', param: 'id', func: 'getById' },
    { method: 'put', param: 'id' },
    { method: 'patch', param: 'id' },
    { method: 'delete', param: 'id' }
  ];
  const toHttpMethod = (method: any): 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' =>
    method.toUpperCase();

  const controller = createController(model);

  routes.forEach((route) => {
    fastify.route({
      method: toHttpMethod(route.method),
      version: '0.9',
      url: route.param ? `/:${route.param}` : '/',
      handler: (request, reply) => {
        return controller[route.func || route.method](request)
          .then(data => data)
          .catch((err: any) => {
            reply.status(err.status || 400).send({ error: err.message });
            request.log.error({ msg: err.message, stack: err.stack });
          });
      }
    });
  });

  done();
}

export default {
  createController,
  generateDefaultEndpoints
};
