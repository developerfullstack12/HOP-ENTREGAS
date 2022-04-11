'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.hasOne(models.Notification, {
        sourceKey: 'id',
        foreignKey: 'sender_id',
      })
      User.hasOne(models.Notification, {
        sourceKey: 'id',
        foreignKey: 'receiver_id',
      })
      User.hasOne(models.Property_view, {
        sourceKey: 'id',
        foreignKey: 'user_id',
      })
    }
  }
  User.init({
    profile_image: {
      allowNull: true,
      type: DataTypes.TEXT,
    },
    user_role_type: {
      type: DataTypes.INTEGER,
      comment: '1:CUSTOMER,2:HOST,3:PARTNER',
    },
    name: {
      allowNull: true,
      type: DataTypes.STRING(100),
    },
    email: {
      type: DataTypes.STRING(200),
      unique: true,
    },
    password: {
      allowNull: true,
      type: DataTypes.STRING(250),
    },
    contact_number: {
      allowNull: true,
      type: DataTypes.STRING(20),
    },
    gender: {
      type: DataTypes.STRING,
      comment: '1:MALE,2:FEMALE,3:OTHER',
    },
    dob: {
      type: DataTypes.DATE,
      format: 'DD-MM-YYYY',
      defaultValue: null,
    },
    pin_code: {
      allowNull: true,
      type: DataTypes.TEXT,
      defaultValue: null
    },
    city: {
      type: DataTypes.STRING(20),
    },
    state: {
      type: DataTypes.STRING(50),
    },
    country: {
      type: DataTypes.STRING(20),
    },
    sign_up_type: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      comment: '1-EMAIL, 2-FACEBOOK, 3-GOOGLE',
    },
    social_id: {
      allowNull: true,
      type: DataTypes.TEXT,
    },
    otp: {
      allowNull: true,
      type: DataTypes.INTEGER,
      defaultValue: null,
    },
    reset_token: {
      defaultValue: '',
      type: DataTypes.TEXT,
    },
    reset_expiry: {
      defaultValue: null,
      type: DataTypes.DATE,
    },
    verification_link: {
      type: DataTypes.STRING,
      defaultValue: ''
    },
    password_reset_token_expire_at: {
      type: DataTypes.DATE,
      defaultValue: null,
    },
    fcm_token: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      comment: '1:ACTIVE,2:INACTIVE,3:DELETE,4:UN_VERIFY',
    },
  }, {  
    sequelize,
    timestamps:true,
    modelName: 'User',
    tableName: 'users',
  });
  return User;
};