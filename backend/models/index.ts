'use strict';

import * as fs from 'fs';
import * as path from 'path';
import { Sequelize, Model, DataTypes } from 'sequelize';

interface Config {
  [key: string]: any;
}

interface DB {
  [key: string]: Model<any, any>;
}

const basename: string = path.basename(__filename);
const env: string = process.env.NODE_ENV || 'development';
const config: Config = require(path.join(__dirname, '..', 'config', 'config.json'))[env];
const db: DB = {};

let sequelize: Sequelize;

if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable] as string, config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

fs
  .readdirSync(__dirname)
  .filter((file: string) => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach((file: string) => {
    const model: Model = require(path.join(__dirname, file))(sequelize, DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName: string) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
