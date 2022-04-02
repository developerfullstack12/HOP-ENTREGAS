'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Property extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Property.init({
    user_id: {
      type: DataTypes.INTEGER,
      allowNull:false,
    },
    address: {
      type: DataTypes.STRING(100),
    },
    category: {
      type: DataTypes.STRING(100),
    },
    latitude: {
      type: DataTypes.FLOAT,
      allowNull:false
    },
    longitude: {
      type: DataTypes.FLOAT,
      allowNull:false,
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull:false
    },
    description: {
      type: DataTypes.STRING(200),
    },
    status: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      comment:  '1:ACTIVE,2:INACTIVE,3:DELETE',
    },
  }, {
    sequelize,
    timestamps:true,
    modelName: 'Property',
    tableName:'properties'
  });
  return Property;
};