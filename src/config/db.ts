import _ from 'lodash';
import { Op, Sequelize } from 'sequelize';
import { IModelDict, setInstances } from '../services/db';
import dotenv from '../services/dotenv';
import createLogger from '../services/log';

const log = createLogger({ file: __filename, service: 'postgres' });

let sequelize: Sequelize;

export async function init() {
  sequelize = new Sequelize(dotenv.get('DATABASE_URL'), {
    logging: msg => log.silly(msg),
    dialectOptions: {
      useUTC: false
    },
    timezone: '-04:00'
  });

  try {
    await sequelize.authenticate();
    log.info('PostgreSQL Connection has been established.', {
      uri: dotenv.get('DATABASE_URL')
    });
  } catch (error) {
    log.error('Unable to connect to the database:', error);
  }

  return sequelize;
}

/**
 * Add custom methods to sequelize model instance
 * @param {object} models Object that contains all models registered
 */
function addCustomMethods(models: IModelDict) {
  Object.keys(models).forEach(key => {
    const model = models[key];

    model.prototype.populate = async function({ path, ref, select, populate }: any) {
      try {
        const values = _.get(this, path);
        const propIsArray = _.isArray(values);
        const rows = await models[ref].findAll({
          attributes: select,
          where: { id: { [Op.in]: propIsArray ? values : [values] } }
        });

        if (populate) {
          for (const row of rows) {
            await row.populate(populate);
          }
        }

        _.set(this, path, propIsArray ? rows : rows[0]);
      } catch (error) {
        log.error(error.message);
      }
      return this;
    };

    model.prototype.patchData = function(payload: any) {
      this.data = {
        ...this.data,
        ...payload
      };

      return this;
    };
  });
}

export function loadService(app: any, models: IModelDict) {
  setInstances(models, sequelize);
  addCustomMethods(models);
}

/**
 * @returns {import('sequelize').Sequelize}
 */
export const getClient = () => sequelize;
export default {
  init,
  getClient,
  loadService
}
