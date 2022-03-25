'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Notification extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Notification.hasOne(models.User, {
        sourceKey: 'sender_id',
        foreignKey: 'id',
      })
      Notification.hasOne(models.User, {
        sourceKey: 'receiver_id',
        foreignKey: 'id',
      })
    }
  }
  Notification.init({
    title: {
      type: DataTypes.STRING(40),
      allowNull:false
    },
    message: {
      type: DataTypes.STRING(1000),
      allowNull: false,
    },
    is_read:{
      type: DataTypes.INTEGER,
      defaultValue: 1,
      comment: '0:READ,1:NOT_READ',
    },
    sender_id:{
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'User',
        key: 'id',
      },
    },
    receiver_id:{
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'User',
        key: 'id',
      },
    },
    status: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      comment: '1:ACTIVE,2:INACTIVE,3:DELETE',
    },
  }, {
    sequelize,
    timestamps:true,
    modelName: 'Notification',
    tableName: 'notification'
  });
  return Notification;
};