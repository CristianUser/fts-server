import { Sequelize } from 'sequelize';

export function model (sequelize: Sequelize, { DataTypes, UUIDV4 }: any) {
  return sequelize.define('User', {
    cid: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true
    },
    id: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4
    },
    name: {
      type: DataTypes.JSONB,
      allowNull: false
    },
    data: {
      type: DataTypes.JSONB,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    }
  });
};
