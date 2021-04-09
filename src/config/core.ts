import fastify, { FastifyInstance } from 'fastify';
import _get from 'lodash/get';
import _merge from 'lodash/merge';
import sec, { ModelCtor, Sequelize } from 'sequelize';
// import controller from '../services/controller';
import { getFiles } from '../services/files';
import createLogger from '../services/log';
import { generatePrefix, getEntityName, parseYaml } from '../services/utils';
import { CustomModel, IModelDict } from './../services/db/index';

const log = createLogger({ file: __filename });

let models: IModelDict = {};
const configs = {};
const bootstrap = {};

type IAppService = (app: FastifyInstance, models: IModelDict, configs: any) => void;
type IRouterFileInit = (opts: ICoreOptions) => Function;
type IRouterFileRegister = (fastify: FastifyInstance, opts: any, done: any) => void;
interface ICoreOptions {
  model?: ModelCtor<CustomModel>;
  models: IModelDict;
}
interface IRouterFile extends IRouterFileRegister {
  init: IRouterFileInit;
}
export interface IContextOptions {
  [property: string]: any;
  core: ICoreOptions;
}
/**
 * Load model.js files in directory to register in sequelize instance
 *
 * Doesn't have execution dependency
 * @param {Object} sequelize
 */
async function loadModels(sequelize: Sequelize) {
  const files = getFiles('src/models/*.ts');

  await Promise.all(
    files.map(async (file) => {
      const model: ModelCtor<CustomModel> = await import(file).then((mod) =>
        mod.model(sequelize, sec)
      );
      const modelName = getEntityName(file);

      models[modelName] = model;
      log.debug(`Model "${modelName}" registered`);
    })
  );
  await Promise.all(
    files.map(async file => import(file).then((mod) => mod.onLoadedAll && mod.onLoadedAll(sequelize)))
  );
}

/**
 * Load controller.js files in directory to register in app router
 * @param {Object} app
 */
async function loadControllers(fastify: FastifyInstance) {
  return getFiles('src/api/**/index.ts', async (file) => {
    const prefix = generatePrefix(file);
    const name = prefix.split('/').reverse()[0];
    const router = await import(file).then((mod: IRouterFile) => mod);
    const options: ICoreOptions = {
      models
    };

    if (models[name]) {
      options.model = models[name];
    }

    fastify.register(router, { core: options, prefix });
    fastify.log.info({ msg: 'Route Registered', prefix });
  });
}

// function loadDefaultControllers(app) {
//   Object.entries(models).forEach(([modelKey, model]) => {
//     const schema = _get(model.getTableName(), 'schema', 'public');

//     if (schema === 'public') {
//       const router = controller.generateDefaultRoutes(Router(), model);

//       app.use(generateRouterPath(modelKey), router);
//     }
//   });
// }

/**
 * Load configs.yml files in directory to register in app router
 *
 * Doesn't have execution dependency
 */
// function loadConfigs() {
//   getFiles('app/entities/**/configs.yml', file => {
//     const entity = getEntityName(file);

//     configs[entity] = parseYaml(file);
//     log.debug(`${entity} configs.yml file loaded`);
//   });
// }

/**
 * Load bootstrap.yml files in directory to create endpoint
 *
 * Doesn't have execution dependency
 */
// function loadBootstrapFiles() {
//   getFiles('app/entities/**/bootstrap.yml', file => {
//     const entity = getEntityName(file);

//     bootstrap[entity] = parseYaml(file);
//     log.debug(`${entity} bootstrap.yml file loaded`);
//   });
// }

/**
 * Initialize entities
 * @param {Object} app
 * @param {Object} sequelize
 */
export async function init(fastify: FastifyInstance, sequelize: Sequelize, services = []) {
  /** Steps Execution in dependency order*/
  // loadConfigs();
  // loadBootstrapFiles();
  await loadModels(sequelize);
  sequelize.sync({ alter: true });

  /** start hooks before load controllers */
  services.forEach((service: IAppService) => service(fastify, models, configs));
  /** end hooks before load controllers */

  await loadControllers(fastify);
  // loadDefaultControllers(app);

  /** Needs to be moved in the future */
  fastify.get('/_bootstrap', async (request, reply) => reply.send(bootstrap));
}

/**
 * Returns models instances
 * @returns {Object}
 */
export const getModels = () => models;

export default {
  init,
  getModels
};
