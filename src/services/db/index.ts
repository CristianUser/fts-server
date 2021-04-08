import _cloneDeep from 'lodash/cloneDeep';
import _isString from 'lodash/isString';
import { Model, ModelCtor, QueryOptionsWithType, QueryTypes, Sequelize } from 'sequelize';


interface IPopulateOptions {
  path: string;
  ref: string;
  select: string[];
  populate: IPopulateOptions
};
type IPopulateModelMethod = (options: IPopulateOptions) => Promise<CustomModel>;
type IPatchModelData = (payload: any) => CustomModel;
type IHookCallback = (payload: any, options: any) => Promise<any>;

export interface CustomModel extends Model {
  patchData: IPatchModelData;
  populate: IPopulateModelMethod;
}

export interface IModelDict {
  [property : string] : ModelCtor<CustomModel>
}

const hooks = ['afterCreate', 'afterDestroy', 'afterUpdate', 'afterSave', 'afterUpsert'];
let models: IModelDict;
let sequelize: Sequelize;

/**
 * Add a hook for services
 * @param {string} entity
 * @param {string} hook
 */
export function subscribe(entity: string, hook: string | any) {
  if (!hooks.includes(hook)) return;

  return (cb: IHookCallback) => {
    models[entity].addHook(hook, async (payload: any, options: any) => {
      await cb(_cloneDeep(payload), options);
    });
  };
}

/**
 * Create db utils over a model
 *
 * @param {CustomModel>} model Sequelize model
 */
export function getModelHelper(model: string | ModelCtor<CustomModel>) {
  const _model: ModelCtor<CustomModel> = _isString(model) ? models[model] : model;

  return {
    model: _model,

    /**
     * Get one item by ID
     * @param {string} id
     * @returns {Promise<import('sequelize').Model>}
     */
    get(id: string): Promise<any> {
      return _model.findOne({ where: { id } });
    },

    /**
     * Create a new row into model table
     * @param {string} id
     * @param {object} body
     * @returns {Promise<import('sequelize').Model>}
     */
    post(body: any): Promise<CustomModel> {
      return _model.create(body, { isNewRecord: true });
    },

    /**
     * Replace one row by id
     * @param {string} id
     * @param {object} body
     * @returns {Promise<import('sequelize').Model>}
     */
    update(id: string, body: any) {
      return _model
        .update(body, {
          where: {
            id
          },
          returning: true,
          individualHooks: true
        })
        .then(rows => rows[1][0]);
    },

    /**
     * Updates or create one row by id
     * @param {string} id
     * @param {object} body
     * @returns {Promise<import('sequelize').Model>}
     */
    async put(id: string, body: any, upsert = false): Promise<CustomModel> {
      if (upsert) {
        const obj = await _model.findOne({ where: { id } });

        if (!obj) {
          return this.post(body);
        }
      }
      return this.update(id, body);
    },

    /**
     * Update one row by id
     * @param {string} id
     * @param {object} body
     * @returns {import('sequelize').Model>}
     */
    async patch(id: string, body: any): Promise<CustomModel> {
      const currentData = await this.get(id);

      Object.entries(body).forEach(([key, value]) => {
        if (key === 'data') {
          currentData.patchData(value);
        } else {
          currentData[key] = value;
        }
      });

      await currentData.save();
      return currentData;
    },

    /**
     * Remove one item by ID from table
     * @param {string} id
     * @returns {Promise<number>} deleted items
     */
    delete(id: string): Promise<number> {
      return _model.destroy({ where: { id }, individualHooks: true });
    }
  };
}

/**
 * Starts a transaction
 * @param {Function} callback
 * @returns {Promise<import('sequelize').Model>}
 */
export function startTransaction(cb: any): Promise<any> {
  return sequelize.transaction(cb);
}

export const setInstances = (_models: IModelDict, _sequelize: Sequelize): void => {
  models = _models;
  sequelize = _sequelize;
};

export const getSequelize = (): Sequelize => sequelize;
export const raw = (query: string, options: QueryOptionsWithType<QueryTypes.SELECT>): Promise<any> => {
  return sequelize.query(query, options);
};
