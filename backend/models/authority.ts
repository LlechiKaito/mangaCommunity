import { Sequelize, Model, DataTypes } from 'sequelize';

interface AuthorityAttributes {
  name: string;
}

module.exports = (sequelize: Sequelize, DataTypes: any) => {
  class Authority extends Model<AuthorityAttributes> {
    static associate(models: any) {
      // define association here
    }
  }

  Authority.init({
    name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Authority',
  });

  return Authority;
};
