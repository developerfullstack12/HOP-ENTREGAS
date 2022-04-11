'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Property_view extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Property_view.hasOne(models.User, {
        sourceKey: 'user_id',
        foreignKey: 'id',
      })
      Property_view.hasOne(models.Property, {
        sourceKey: 'property_id',
        foreignKey: 'id',
      })
    }
  }
  Property_view.init({
    property_id: {
      type: DataTypes.INTEGER,
      allowNull:false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull:false,
    },
    image: {
      type: DataTypes.STRING,
      allowNull:false,
    },
    status: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      comment:  '1:ACTIVE,2:INACTIVE,3:DELETE',
    },
  }, {
    sequelize,
    timestamps:true,
    modelName: 'Property_view',
    tableName: 'property_views'
  });
  return Property_view;
};